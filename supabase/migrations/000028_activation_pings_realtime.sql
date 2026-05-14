create table if not exists public.activation_pings (
  id uuid primary key default gen_random_uuid(),
  activation_id uuid not null references public.interest_activations(id) on delete cascade,
  match_candidate_id uuid references public.match_candidates(id) on delete set null,
  interest_id uuid not null references public.interests(id) on delete cascade,
  city_id uuid not null references public.cities(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  activity_group_id uuid references public.activity_groups(id) on delete set null,
  status text not null default 'pending',
  delivered_at timestamptz,
  responded_at timestamptz,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status in ('pending', 'yes', 'maybe', 'no', 'expired', 'cancelled')),
  check (sender_id <> recipient_id),
  unique (activation_id, recipient_id)
);

create table if not exists public.activation_ping_events (
  id uuid primary key default gen_random_uuid(),
  ping_id uuid not null references public.activation_pings(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  check (event_type in ('created', 'delivered', 'responded', 'group_created', 'group_joined', 'expired', 'cancelled'))
);

create table if not exists public.notification_outbox (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending',
  provider_message_id text,
  error text,
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  check (status in ('pending', 'sent', 'failed', 'skipped'))
);

create table if not exists public.profile_devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  platform text not null,
  expo_push_token text not null,
  push_enabled boolean not null default true,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, expo_push_token)
);

alter table public.activity_group_members
  add column if not exists source_ping_id uuid references public.activation_pings(id) on delete set null;

alter table public.group_messages
  add column if not exists metadata jsonb not null default '{}'::jsonb;

create index if not exists activation_pings_recipient_status_idx
  on public.activation_pings (recipient_id, status, created_at desc);

create index if not exists activation_pings_sender_created_idx
  on public.activation_pings (sender_id, created_at desc);

create index if not exists activation_pings_activation_status_idx
  on public.activation_pings (activation_id, status);

create index if not exists activation_pings_group_idx
  on public.activation_pings (activity_group_id);

create index if not exists activation_ping_events_ping_created_idx
  on public.activation_ping_events (ping_id, created_at desc);

create index if not exists notification_outbox_user_status_idx
  on public.notification_outbox (user_id, status, created_at desc);

create index if not exists profile_devices_user_enabled_idx
  on public.profile_devices (user_id, push_enabled, last_seen_at desc);

alter table public.activation_pings enable row level security;
alter table public.activation_ping_events enable row level security;
alter table public.notification_outbox enable row level security;
alter table public.profile_devices enable row level security;

drop policy if exists "Activation ping participants can read"
on public.activation_pings;

create policy "Activation ping participants can read"
on public.activation_pings
for select
to authenticated
using (sender_id = auth.uid() or recipient_id = auth.uid());

drop policy if exists "Activation ping events participants can read"
on public.activation_ping_events;

create policy "Activation ping events participants can read"
on public.activation_ping_events
for select
to authenticated
using (
  exists (
    select 1
    from public.activation_pings
    where activation_pings.id = activation_ping_events.ping_id
      and (
        activation_pings.sender_id = auth.uid()
        or activation_pings.recipient_id = auth.uid()
      )
  )
);

drop policy if exists "Profile devices owner can read"
on public.profile_devices;

create policy "Profile devices owner can read"
on public.profile_devices
for select
to authenticated
using (user_id = auth.uid());

revoke all on public.activation_pings from anon, authenticated;
revoke all on public.activation_ping_events from anon, authenticated;
revoke all on public.notification_outbox from anon, authenticated;
revoke all on public.profile_devices from anon, authenticated;

grant select on public.activation_pings to authenticated;
grant select on public.activation_ping_events to authenticated;
grant select on public.profile_devices to authenticated;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'activation_pings'
  ) then
    alter publication supabase_realtime add table public.activation_pings;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'group_messages'
  ) then
    alter publication supabase_realtime add table public.group_messages;
  end if;
end $$;

create or replace function public."activationPingResponseSummary"("activationId" uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'yes', count(*) filter (where status = 'yes'),
    'maybe', count(*) filter (where status = 'maybe'),
    'no', count(*) filter (where status = 'no'),
    'pending', count(*) filter (where status = 'pending')
  )
  from public.activation_pings
  where activation_id = "activationId";
$$;

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

create or replace function public."respondToActivationPing"("pingId" uuid, response text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  normalized_response text := lower(trim(response));
  target_ping public.activation_pings%rowtype;
  target_interest public.interests%rowtype;
  resolved_activity_group_id uuid;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  if normalized_response not in ('yes', 'maybe', 'no') then
    raise exception 'Invalid ping response';
  end if;

  select *
  into target_ping
  from public.activation_pings
  where id = "pingId"
  for update;

  if target_ping.id is null then
    raise exception 'Activation ping not found';
  end if;

  if target_ping.recipient_id <> current_user_id then
    raise exception 'Cannot respond to another profile''s ping';
  end if;

  if target_ping.status = normalized_response then
    return jsonb_build_object(
      'ok', true,
      'pingId', target_ping.id,
      'status', target_ping.status,
      'activityGroupId', target_ping.activity_group_id
    );
  end if;

  if target_ping.status <> 'pending' then
    raise exception 'Activation ping is no longer pending';
  end if;

  if target_ping.expires_at <= now() then
    update public.activation_pings
    set status = 'expired', updated_at = now()
    where id = target_ping.id;

    raise exception 'Activation ping has expired';
  end if;

  select *
  into target_interest
  from public.interests
  where id = target_ping.interest_id;

  if normalized_response = 'yes' then
    resolved_activity_group_id := target_ping.activity_group_id;

    if resolved_activity_group_id is null then
      select activation_pings.activity_group_id
      into resolved_activity_group_id
      from public.activation_pings
      where activation_id = target_ping.activation_id
        and activation_pings.activity_group_id is not null
      order by created_at
      limit 1;
    end if;

    if resolved_activity_group_id is null then
      insert into public.activity_groups (
        city_id,
        created_by,
        interest_id,
        status,
        title
      )
      values (
        target_ping.city_id,
        target_ping.sender_id,
        target_ping.interest_id,
        'forming',
        coalesce(target_interest.name, 'Activity') || ' plan'
      )
      returning id into resolved_activity_group_id;

      insert into public.activation_ping_events (ping_id, actor_id, event_type, payload)
      values (
        target_ping.id,
        current_user_id,
        'group_created',
        jsonb_build_object('activityGroupId', resolved_activity_group_id)
      );
    end if;

    insert into public.activity_group_members (
      activity_group_id,
      user_id,
      source_ping_id
    )
    values
      (resolved_activity_group_id, target_ping.sender_id, target_ping.id),
      (resolved_activity_group_id, target_ping.recipient_id, target_ping.id)
    on conflict (activity_group_id, user_id)
    do update
    set source_ping_id = coalesce(public.activity_group_members.source_ping_id, excluded.source_ping_id);

    update public.activation_pings
    set
      activity_group_id = resolved_activity_group_id,
      status = 'yes',
      responded_at = now(),
      updated_at = now()
    where id = target_ping.id;

    update public.match_candidates
    set
      activity_group_id = resolved_activity_group_id,
      responded_at = now(),
      status = 'accepted'
    where id = target_ping.match_candidate_id;

    insert into public.group_messages (
      resolved_activity_group_id,
      sender_id,
      body,
      message_type,
      moderation_status,
      metadata
    )
    values (
      resolved_activity_group_id,
      target_ping.recipient_id,
      'Joined for ' || coalesce(target_interest.name, 'this activity') || '.',
      'system',
      'clean',
      jsonb_build_object(
        'pingId', target_ping.id,
        'activationId', target_ping.activation_id,
        'interestId', target_ping.interest_id
      )
    );
  else
    update public.activation_pings
    set
      status = normalized_response,
      responded_at = now(),
      updated_at = now()
    where id = target_ping.id;

    update public.match_candidates
    set
      responded_at = now(),
      status = case normalized_response when 'no' then 'declined' else 'pending' end
    where id = target_ping.match_candidate_id;
  end if;

  insert into public.activation_ping_events (ping_id, actor_id, event_type, payload)
  values (
    target_ping.id,
    current_user_id,
    'responded',
    jsonb_build_object('response', normalized_response, 'activityGroupId', resolved_activity_group_id)
  );

  return jsonb_build_object(
    'ok', true,
    'pingId', target_ping.id,
    'status', normalized_response,
    'activityGroupId', resolved_activity_group_id,
    'responseSummary', public."activationPingResponseSummary"(target_ping.activation_id)
  );
end;
$$;

create or replace function public."getIncomingActivationPings"()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', activation_pings.id,
        'activationId', activation_pings.activation_id,
        'interestId', activation_pings.interest_id,
        'interestName', interests.name,
        'senderId', activation_pings.sender_id,
        'senderName', coalesce(profiles.display_name, 'Buzz Member'),
        'senderPhotoUrl', profiles.profile_photo_url,
        'cityId', activation_pings.city_id,
        'status', activation_pings.status,
        'expiresAt', activation_pings.expires_at,
        'createdAt', activation_pings.created_at
      )
      order by activation_pings.created_at desc
    ),
    '[]'::jsonb
  )
  from public.activation_pings
  join public.interests
    on interests.id = activation_pings.interest_id
  join public.profiles
    on profiles.id = activation_pings.sender_id
  where activation_pings.recipient_id = auth.uid()
    and activation_pings.status = 'pending'
    and activation_pings.expires_at > now();
$$;

create or replace function public."getOutgoingActivationSummary"()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'activationId', interest_activations.id,
        'interestId', interest_activations.interest_id,
        'interestName', interests.name,
        'status', interest_activations.status,
        'expiresAt', interest_activations.expires_at,
        'responseSummary', public."activationPingResponseSummary"(interest_activations.id),
        'activityGroupId', (
          select activation_pings.activity_group_id
          from public.activation_pings
          where activation_pings.activation_id = interest_activations.id
            and activation_pings.activity_group_id is not null
          order by activation_pings.responded_at desc nulls last
          limit 1
        )
      )
      order by interest_activations.created_at desc
    ),
    '[]'::jsonb
  )
  from public.interest_activations
  join public.interests
    on interests.id = interest_activations.interest_id
  where interest_activations.user_id = auth.uid()
    and interest_activations.status = 'active'
    and (
      interest_activations.expires_at is null
      or interest_activations.expires_at > now()
    );
$$;

create or replace function public."getChatSummaries"()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with member_groups as (
    select activity_group_members.activity_group_id
    from public.activity_group_members
    where activity_group_members.user_id = auth.uid()
  ),
  last_message as (
    select distinct on (group_messages.activity_group_id)
      group_messages.activity_group_id,
      group_messages.body,
      group_messages.created_at,
      group_messages.message_type
    from public.group_messages
    join member_groups
      on member_groups.activity_group_id = group_messages.activity_group_id
    order by group_messages.activity_group_id, group_messages.created_at desc
  )
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'activityGroupId', activity_groups.id,
        'title', activity_groups.title,
        'status', activity_groups.status,
        'interestName', interests.name,
        'lastMessageBody', last_message.body,
        'lastMessageAt', last_message.created_at,
        'lastMessageType', last_message.message_type,
        'unreadCount', 0,
        'memberCount', (
          select count(*)::integer
          from public.activity_group_members
          where activity_group_members.activity_group_id = activity_groups.id
        )
      )
      order by coalesce(last_message.created_at, activity_groups.created_at) desc
    ),
    '[]'::jsonb
  )
  from public.activity_groups
  join member_groups
    on member_groups.activity_group_id = activity_groups.id
  left join public.interests
    on interests.id = activity_groups.interest_id
  left join last_message
    on last_message.activity_group_id = activity_groups.id;
$$;

revoke all on function public."activationPingResponseSummary"(uuid) from public;
revoke all on function public."activateInterest"(uuid) from public;
revoke all on function public."respondToActivationPing"(uuid, text) from public;
revoke all on function public."getIncomingActivationPings"() from public;
revoke all on function public."getOutgoingActivationSummary"() from public;
revoke all on function public."getChatSummaries"() from public;

revoke execute on function public."activateInterest"(uuid) from anon;
revoke execute on function public."respondToActivationPing"(uuid, text) from anon;
revoke execute on function public."getIncomingActivationPings"() from anon;
revoke execute on function public."getOutgoingActivationSummary"() from anon;
revoke execute on function public."getChatSummaries"() from anon;

grant execute on function public."activateInterest"(uuid) to authenticated;
grant execute on function public."respondToActivationPing"(uuid, text) to authenticated;
grant execute on function public."getIncomingActivationPings"() to authenticated;
grant execute on function public."getOutgoingActivationSummary"() to authenticated;
grant execute on function public."getChatSummaries"() to authenticated;
