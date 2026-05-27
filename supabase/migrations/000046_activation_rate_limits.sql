create table if not exists public.interest_activation_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  interest_id uuid not null references public.interests(id) on delete cascade,
  activation_id uuid references public.interest_activations(id) on delete set null,
  city_id uuid references public.cities(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists interest_activation_attempts_user_interest_created_idx
  on public.interest_activation_attempts (user_id, interest_id, created_at desc);

create index if not exists interest_activation_attempts_user_created_idx
  on public.interest_activation_attempts (user_id, created_at desc);

alter table public.interest_activation_attempts enable row level security;

drop policy if exists "Interest activation attempts are readable by owner"
  on public.interest_activation_attempts;

create policy "Interest activation attempts are readable by owner"
  on public.interest_activation_attempts
  for select
  to authenticated
  using (user_id = auth.uid());

grant select on table public.interest_activation_attempts to authenticated;

create or replace function public."activateInterest"("interestId" uuid)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  current_profile public.profiles%rowtype;
  target_city_id uuid;
  target_interest public.interests%rowtype;
  current_activation_id uuid;
  match_candidates jsonb := '[]'::jsonb;
  ping_count integer := 0;
  activation_expiry_hours integer := 168;
  default_group_size_min integer := 3;
  default_group_size_max integer := 5;
  activation_availability_window text := 'this_week';
  activation_preferred_time text := 'flexible';
  activation_urgency text := 'soon';
  activation_expires_at timestamptz;
  activity_cooldown interval := interval '10 minutes';
  daily_window interval := interval '24 hours';
  daily_limit integer := 20;
  last_activity_activation_at timestamptz;
  oldest_daily_activation_at timestamptz;
  daily_activation_count integer := 0;
  retry_after_seconds integer := 0;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  perform pg_advisory_xact_lock(hashtext(current_user_id::text));

  select *
  into current_profile
  from public.profiles
  where id = current_user_id;

  if current_profile.id is null then
    raise exception 'Profile required';
  end if;

  select *
  into target_interest
  from public.interests
  where id = "interestId";

  if target_interest.id is null then
    raise exception 'Interest not found';
  end if;

  select max(created_at)
  into last_activity_activation_at
  from public.interest_activation_attempts
  where user_id = current_user_id
    and interest_id = "interestId"
    and created_at > now() - activity_cooldown;

  if last_activity_activation_at is not null then
    retry_after_seconds := greatest(
      1,
      ceil(extract(epoch from (last_activity_activation_at + activity_cooldown - now())))::integer
    );

    return jsonb_build_object(
      'ok', false,
      'code', 'rate_limited_activity',
      'retryAfterSeconds', retry_after_seconds,
      'interestId', target_interest.id,
      'interestName', target_interest.name
    );
  end if;

  select
    count(*)::integer,
    min(created_at)
  into
    daily_activation_count,
    oldest_daily_activation_at
  from public.interest_activation_attempts
  where user_id = current_user_id
    and created_at > now() - daily_window;

  if daily_activation_count >= daily_limit then
    retry_after_seconds := greatest(
      1,
      ceil(extract(epoch from (oldest_daily_activation_at + daily_window - now())))::integer
    );

    return jsonb_build_object(
      'ok', false,
      'code', 'rate_limited_daily',
      'retryAfterSeconds', retry_after_seconds,
      'limit', daily_limit,
      'interestId', target_interest.id,
      'interestName', target_interest.name
    );
  end if;

  select coalesce(
    current_profile.city_id,
    (select id from public.cities where name = 'Melbourne' limit 1),
    (select id from public.cities order by created_at limit 1)
  )
  into target_city_id;

  select
    coalesce(
      (select city_settings.activation_expiry_hours from public.city_settings where city_settings.city_id = target_city_id),
      168
    ),
    coalesce(
      (select city_settings.default_group_size_min from public.city_settings where city_settings.city_id = target_city_id),
      3
    ),
    coalesce(
      (select city_settings.default_group_size_max from public.city_settings where city_settings.city_id = target_city_id),
      5
    )
  into
    activation_expiry_hours,
    default_group_size_min,
    default_group_size_max;

  activation_expires_at := now() + (activation_expiry_hours * interval '1 hour');

  activation_availability_window :=
    case current_profile.quiz_traits->>'availability'
      when 'weekend' then 'weekend'
      when 'weekday' then 'weekdays'
      else 'this_week'
    end;

  activation_preferred_time :=
    case current_profile.quiz_traits->>'availability'
      when 'weekday' then 'evening'
      when 'weekend' then 'daytime'
      else 'flexible'
    end;

  activation_urgency :=
    case current_profile.quiz_traits->>'planning'
      when 'spontaneous' then 'now'
      when 'planned' then 'soon'
      else 'low'
    end;

  update public.profiles
  set
    city_id = coalesce(current_profile.city_id, target_city_id),
    last_active_at = now(),
    updated_at = now()
  where id = current_user_id;

  insert into public.interest_activations (
    user_id,
    interest_id,
    city_id,
    status,
    availability_window,
    preferred_time,
    urgency,
    expires_at,
    rate_limit_key
  )
  values (
    current_user_id,
    "interestId",
    target_city_id,
    'active',
    activation_availability_window,
    activation_preferred_time,
    activation_urgency,
    activation_expires_at,
    current_user_id::text || ':' || "interestId"::text
  )
  on conflict (user_id, interest_id) where status = 'active'
  do update
  set
    city_id = excluded.city_id,
    availability_window = excluded.availability_window,
    preferred_time = excluded.preferred_time,
    urgency = excluded.urgency,
    expires_at = excluded.expires_at,
    rate_limit_key = excluded.rate_limit_key
  returning id into current_activation_id;

  insert into public.interest_activation_attempts (
    user_id,
    interest_id,
    activation_id,
    city_id
  )
  values (
    current_user_id,
    "interestId",
    current_activation_id,
    target_city_id
  );

  update public.activation_pings
  set
    status = 'expired',
    updated_at = now()
  where sender_id = current_user_id
    and interest_id = "interestId"
    and activation_id <> current_activation_id
    and status = 'pending';

  with eligible_profile as (
    select
      matched_profile.id,
      coalesce(matched_profile.display_name, 'Buzz Member') as display_name,
      matched_profile.quiz_traits,
      (
        case
          when matched_activation.availability_window = activation_availability_window then 1
          else 0
        end
        + case
          when matched_activation.preferred_time in (activation_preferred_time, 'flexible') then 1
          else 0
        end
        + case
          when matched_activation.urgency = activation_urgency then 1
          else 0
        end
      ) as availability_overlap
    from public.profiles matched_profile
    join public.interest_activations matched_activation
      on matched_activation.user_id = matched_profile.id
      and matched_activation.interest_id = "interestId"
      and matched_activation.status = 'active'
    left join public.activity_risk_levels activity_risk
      on activity_risk.activity_key = target_interest.slug
    where matched_profile.id <> current_user_id
      and matched_profile.city_id = target_city_id
      and matched_profile.visible is true
      and matched_profile.settled is false
      and (matched_activation.expires_at is null or matched_activation.expires_at > now())
      and (
        coalesce(activity_risk.requires_daytime, false) is false
        or activation_preferred_time in ('daytime', 'flexible')
      )
      and not exists (
        select 1
        from public.blocks
        where (blocker_id = current_user_id and blocked_id = matched_profile.id)
          or (blocker_id = matched_profile.id and blocked_id = current_user_id)
      )
      and not exists (
        select 1
        from public.reports
        where status in ('open', 'reviewing')
          and (
            (reporter_id = current_user_id and target_user_id = matched_profile.id)
            or (reporter_id = matched_profile.id and target_user_id = current_user_id)
          )
      )
      and not exists (
        select 1
        from public.moderation_actions
        where target_user_id = matched_profile.id
          and action_type in ('limit', 'suspend', 'ban')
          and (expires_at is null or expires_at > now())
      )
  ),
  matched_profile as (
    select
      eligible_profile.id,
      eligible_profile.display_name,
      eligible_profile.quiz_traits,
      eligible_profile.availability_overlap,
      least(
        0.97,
        0.70
          + case
              when current_profile.quiz_traits->>'socialStyle' is not null
                and current_profile.quiz_traits->>'socialStyle' = eligible_profile.quiz_traits->>'socialStyle'
              then 0.08
              else 0
            end
          + case
              when current_profile.quiz_traits->>'energy' is not null
                and current_profile.quiz_traits->>'energy' = eligible_profile.quiz_traits->>'energy'
              then 0.06
              else 0
            end
          + case
              when current_profile.quiz_traits->>'planning' is not null
                and current_profile.quiz_traits->>'planning' = eligible_profile.quiz_traits->>'planning'
              then 0.04
              else 0
            end
          + case
              when current_profile.quiz_traits->>'availability' is not null
                and current_profile.quiz_traits->>'availability' = eligible_profile.quiz_traits->>'availability'
              then 0.04
              else 0
            end
          + eligible_profile.availability_overlap * 0.03
      ) as match_score
    from eligible_profile
    order by match_score desc
    limit 5
  ),
  upserted_candidates as (
    insert into public.match_candidates (
      activation_id,
      matched_user_id,
      score,
      reason,
      status,
      source
    )
    select
      current_activation_id,
      matched_profile.id,
      matched_profile.match_score,
      case
        when matched_profile.availability_overlap > 0
        then matched_profile.display_name || ' has overlapping availability for ' || target_interest.name || '.'
        when current_profile.quiz_traits->>'socialStyle' = matched_profile.quiz_traits->>'socialStyle'
          or current_profile.quiz_traits->>'energy' = matched_profile.quiz_traits->>'energy'
        then matched_profile.display_name || ' has a similar pace for ' || target_interest.name || '.'
        else matched_profile.display_name || ' also activated ' || target_interest.name || '.'
      end,
      'pending',
      'deterministic'
    from matched_profile
    order by matched_profile.match_score desc
    on conflict (activation_id, matched_user_id)
    do update
    set
      score = excluded.score,
      reason = excluded.reason,
      status = 'pending',
      source = 'deterministic'
    returning id, matched_user_id, score, reason
  ),
  upserted_pings as (
    insert into public.activation_pings (
      activation_id,
      match_candidate_id,
      interest_id,
      city_id,
      sender_id,
      recipient_id,
      status,
      expires_at
    )
    select
      current_activation_id,
      upserted_candidates.id,
      target_interest.id,
      target_city_id,
      current_user_id,
      upserted_candidates.matched_user_id,
      'pending',
      activation_expires_at
    from upserted_candidates
    on conflict (activation_id, recipient_id)
    do update
    set
      match_candidate_id = excluded.match_candidate_id,
      status = 'pending',
      expires_at = excluded.expires_at,
      updated_at = now()
    returning id, recipient_id
  ),
  queued_notifications as (
    insert into public.notification_outbox (user_id, type, payload)
    select
      upserted_pings.recipient_id,
      'activation_ping',
      jsonb_build_object(
        'pingId', upserted_pings.id,
        'activationId', current_activation_id,
        'interestId', target_interest.id,
        'interestName', target_interest.name,
        'senderId', current_user_id
      )
    from upserted_pings
    on conflict do nothing
    returning id
  ),
  created_events as (
    insert into public.activation_ping_events (ping_id, actor_id, event_type, payload)
    select
      upserted_pings.id,
      current_user_id,
      'created',
      jsonb_build_object('interestId', target_interest.id)
    from upserted_pings
    returning id
  )
  select
    coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', upserted_candidates.id,
          'displayName', coalesce(profiles.display_name, 'Buzz Member'),
          'reason', upserted_candidates.reason,
          'suggestedPlan',
            case
              when activation_urgency = 'now'
              then 'Suggest a low-pressure ' || target_interest.name || ' plan for today with ' || default_group_size_min || '-' || default_group_size_max || ' people.'
              when activation_availability_window = 'weekend'
              then 'Suggest a clear ' || target_interest.name || ' plan for the next weekend with ' || default_group_size_min || '-' || default_group_size_max || ' people.'
              else 'Suggest a clear ' || target_interest.name || ' plan this week with ' || default_group_size_min || '-' || default_group_size_max || ' people.'
            end,
          'score', upserted_candidates.score
        )
        order by upserted_candidates.score desc
      ),
      '[]'::jsonb
    ),
    count(upserted_pings.id)::integer
  into match_candidates, ping_count
  from upserted_candidates
  join public.profiles
    on profiles.id = upserted_candidates.matched_user_id
  left join upserted_pings
    on upserted_pings.recipient_id = upserted_candidates.matched_user_id;

  return jsonb_build_object(
    'ok', true,
    'activationId', current_activation_id,
    'interestId', target_interest.id,
    'interestName', target_interest.name,
    'matchCandidates', match_candidates,
    'pingCount', coalesce(ping_count, 0),
    'expiresAt', activation_expires_at,
    'responseSummary', public."activationPingResponseSummary"(current_activation_id)
  );
end;
$$;

grant execute on function public."activateInterest"(uuid) to authenticated;
