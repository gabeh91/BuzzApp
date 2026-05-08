alter table public.interest_activations
  add column if not exists availability_window text not null default 'this_week',
  add column if not exists preferred_time text not null default 'flexible',
  add column if not exists urgency text not null default 'soon',
  add column if not exists expires_at timestamptz,
  add column if not exists rate_limit_key text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'interest_activations_availability_window_check'
      and conrelid = 'public.interest_activations'::regclass
  ) then
    alter table public.interest_activations
      add constraint interest_activations_availability_window_check
      check (availability_window in ('today', 'this_week', 'weekend', 'weekdays'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'interest_activations_preferred_time_check'
      and conrelid = 'public.interest_activations'::regclass
  ) then
    alter table public.interest_activations
      add constraint interest_activations_preferred_time_check
      check (preferred_time in ('daytime', 'evening', 'flexible'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'interest_activations_urgency_check'
      and conrelid = 'public.interest_activations'::regclass
  ) then
    alter table public.interest_activations
      add constraint interest_activations_urgency_check
      check (urgency in ('low', 'soon', 'now'));
  end if;
end $$;

create index if not exists interest_activations_availability_idx
  on public.interest_activations (city_id, interest_id, status, availability_window, preferred_time, expires_at);

create index if not exists interest_activations_rate_limit_idx
  on public.interest_activations (rate_limit_key, created_at desc);

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
  activation_expiry_hours integer := 168;
  default_group_size_min integer := 3;
  default_group_size_max integer := 5;
  activation_availability_window text := 'this_week';
  activation_preferred_time text := 'flexible';
  activation_urgency text := 'soon';
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

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
    now() + (activation_expiry_hours * interval '1 hour'),
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
  )
  select coalesce(
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
  )
  into match_candidates
  from upserted_candidates
  join public.profiles
    on profiles.id = upserted_candidates.matched_user_id;

  return jsonb_build_object(
    'ok', true,
    'activationId', current_activation_id,
    'interestId', target_interest.id,
    'interestName', target_interest.name,
    'matchCandidates', match_candidates
  );
end;
$$;

revoke all on function public."activateInterest"(uuid) from public;
revoke execute on function public."activateInterest"(uuid) from anon;
grant execute on function public."activateInterest"(uuid) to authenticated;
