alter table public.profiles
  add column if not exists first_name text,
  add column if not exists date_of_birth date,
  add column if not exists profile_photo_url text,
  add column if not exists city_arrived_at date;

create index if not exists profiles_people_feed_idx
  on public.profiles (city_id, visible, settled, last_active_at desc);

create index if not exists user_interests_interest_user_idx
  on public.user_interests (interest_id, user_id);

create table if not exists public.connection_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  city_id uuid references public.cities(id) on delete set null,
  message text,
  status text not null default 'pending',
  source text not null default 'people_feed',
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  updated_at timestamptz not null default now(),
  check (requester_id <> recipient_id),
  check (status in ('pending', 'accepted', 'declined', 'cancelled')),
  check (source in ('people_feed', 'invite', 'manual'))
);

create unique index if not exists connection_requests_pending_unique_idx
  on public.connection_requests (requester_id, recipient_id)
  where status = 'pending';

create index if not exists connection_requests_recipient_status_idx
  on public.connection_requests (recipient_id, status, created_at desc);

create index if not exists connection_requests_requester_status_idx
  on public.connection_requests (requester_id, status, created_at desc);

alter table public.connection_requests enable row level security;

drop policy if exists "Connection request participants can read"
on public.connection_requests;

create policy "Connection request participants can read"
on public.connection_requests
for select
to authenticated
using (
  requester_id = auth.uid()
  or recipient_id = auth.uid()
);

revoke all on public.connection_requests from anon, authenticated;
grant select on public.connection_requests to authenticated;

create or replace function public."getPeopleMatches"(
  "cityId" uuid default null,
  "cityName" text default 'Melbourne',
  "quizTraits" jsonb default '{}'::jsonb,
  "interestIds" uuid[] default null,
  "limitCount" integer default 20
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  current_profile public.profiles%rowtype;
  target_city_id uuid;
  target_city_name text;
  effective_quiz_traits jsonb := coalesce("quizTraits", '{}'::jsonb);
  effective_interest_ids uuid[] := coalesce("interestIds", '{}'::uuid[]);
  safe_limit integer := least(greatest(coalesce("limitCount", 20), 1), 50);
  matches jsonb := '[]'::jsonb;
begin
  if current_user_id is not null then
    select *
    into current_profile
    from public.profiles
    where id = current_user_id;

    if current_profile.id is not null then
      if current_profile.quiz_traits <> '{}'::jsonb then
        effective_quiz_traits := current_profile.quiz_traits;
      end if;

      if current_profile.city_id is not null and "cityId" is null then
        target_city_id := current_profile.city_id;
      end if;

      select coalesce(
        array_agg(distinct profile_interest.interest_id),
        effective_interest_ids,
        '{}'::uuid[]
      )
      into effective_interest_ids
      from (
        select user_interests.interest_id
        from public.user_interests
        where user_interests.user_id = current_user_id

        union

        select interest_activations.interest_id
        from public.interest_activations
        where interest_activations.user_id = current_user_id
          and interest_activations.status = 'active'
          and (
            interest_activations.expires_at is null
            or interest_activations.expires_at > now()
          )
      ) profile_interest;
    end if;
  end if;

  if target_city_id is null and "cityId" is not null then
    select cities.id, cities.name
    into target_city_id, target_city_name
    from public.cities
    where cities.id = "cityId"
    limit 1;
  end if;

  if target_city_id is null then
    select cities.id, cities.name
    into target_city_id, target_city_name
    from public.cities
    where lower(cities.name) = lower(coalesce(nullif(trim("cityName"), ''), 'Melbourne'))
    order by cities.created_at
    limit 1;
  end if;

  if target_city_id is null then
    select cities.id, cities.name
    into target_city_id, target_city_name
    from public.cities
    order by cities.created_at
    limit 1;
  end if;

  if target_city_id is null then
    return jsonb_build_object(
      'ok', true,
      'cityId', null,
      'cityName', null,
      'peopleMatches', '[]'::jsonb
    );
  end if;

  if target_city_name is null then
    select cities.name
    into target_city_name
    from public.cities
    where cities.id = target_city_id;
  end if;

  with candidate_interest as (
    select
      user_interests.user_id,
      user_interests.interest_id
    from public.user_interests

    union

    select
      interest_activations.user_id,
      interest_activations.interest_id
    from public.interest_activations
    where interest_activations.status = 'active'
      and (
        interest_activations.expires_at is null
        or interest_activations.expires_at > now()
      )
  ),
  candidate_shared_interest as (
    select
      candidate_interest.user_id,
      interests.id,
      interests.name,
      interests.slug::text as slug,
      interests.category
    from candidate_interest
    join public.interests
      on interests.id = candidate_interest.interest_id
    where array_length(effective_interest_ids, 1) is not null
      and candidate_interest.interest_id = any(effective_interest_ids)
  ),
  ranked_shared_interest as (
    select
      candidate_shared_interest.*,
      row_number() over (
        partition by candidate_shared_interest.user_id
        order by candidate_shared_interest.name
      ) as interest_rank
    from candidate_shared_interest
  ),
  candidate_interest_summary as (
    select
      ranked_shared_interest.user_id,
      count(*)::integer as shared_interests_count,
      array_agg(ranked_shared_interest.name order by ranked_shared_interest.name)
        filter (where ranked_shared_interest.interest_rank <= 3) as shared_interest_names,
      coalesce(
        jsonb_agg(
          jsonb_build_object(
            'id', ranked_shared_interest.id,
            'name', ranked_shared_interest.name,
            'slug', ranked_shared_interest.slug,
            'category', ranked_shared_interest.category
          )
          order by ranked_shared_interest.name
        ) filter (where ranked_shared_interest.interest_rank <= 3),
        '[]'::jsonb
      ) as shared_interests
    from ranked_shared_interest
    group by ranked_shared_interest.user_id
  ),
  candidate as (
    select
      profile.id,
      coalesce(
        nullif(trim(profile.first_name), ''),
        nullif(split_part(coalesce(profile.display_name, ''), ' ', 1), ''),
        'Buzz Member'
      ) as first_name,
      profile.display_name,
      profile.profile_photo_url,
      profile.bio,
      case
        when profile.date_of_birth is not null
        then date_part('year', age(profile.date_of_birth))::integer
        else null
      end as age,
      profile.city_arrived_at,
      profile.quiz_traits,
      profile.last_active_at,
      coalesce(candidate_interest_summary.shared_interests_count, 0) as shared_interests_count,
      coalesce(candidate_interest_summary.shared_interest_names, '{}'::text[]) as shared_interest_names,
      coalesce(candidate_interest_summary.shared_interests, '[]'::jsonb) as shared_interests
    from public.profiles profile
    left join candidate_interest_summary
      on candidate_interest_summary.user_id = profile.id
    where profile.city_id = target_city_id
      and profile.visible is true
      and profile.settled is false
      and profile.id <> coalesce(current_user_id, '00000000-0000-0000-0000-000000000000'::uuid)
      and (
        profile.date_of_birth is null
        or profile.date_of_birth <= (current_date - interval '18 years')::date
      )
      and (
        array_length(effective_interest_ids, 1) is null
        or coalesce(candidate_interest_summary.shared_interests_count, 0) > 0
      )
      and (
        current_user_id is null
        or not exists (
          select 1
          from public.blocks
          where (blocks.blocker_id = current_user_id and blocks.blocked_id = profile.id)
            or (blocks.blocker_id = profile.id and blocks.blocked_id = current_user_id)
        )
      )
      and (
        current_user_id is null
        or not exists (
          select 1
          from public.reports
          where reports.status in ('open', 'reviewing')
            and (
              (reports.reporter_id = current_user_id and reports.target_user_id = profile.id)
              or (reports.reporter_id = profile.id and reports.target_user_id = current_user_id)
            )
        )
      )
      and not exists (
        select 1
        from public.moderation_actions
        where moderation_actions.target_user_id = profile.id
          and moderation_actions.action_type in ('limit', 'suspend', 'ban')
          and (
            moderation_actions.expires_at is null
            or moderation_actions.expires_at > now()
          )
      )
  ),
  scored as (
    select
      candidate.*,
      least(
        0.99,
        0.45
          + (candidate.shared_interests_count * 0.12)
          + case
              when effective_quiz_traits->>'socialStyle' is not null
                and effective_quiz_traits->>'socialStyle' = candidate.quiz_traits->>'socialStyle'
              then 0.10
              else 0
            end
          + case
              when effective_quiz_traits->>'energy' is not null
                and effective_quiz_traits->>'energy' = candidate.quiz_traits->>'energy'
              then 0.08
              else 0
            end
          + case
              when effective_quiz_traits->>'planning' is not null
                and effective_quiz_traits->>'planning' = candidate.quiz_traits->>'planning'
              then 0.06
              else 0
            end
          + case
              when effective_quiz_traits->>'availability' is not null
                and effective_quiz_traits->>'availability' = candidate.quiz_traits->>'availability'
              then 0.05
              else 0
            end
          + case
              when candidate.last_active_at > now() - interval '7 days'
              then 0.05
              else 0
            end
      ) as match_score
    from candidate
  ),
  ranked as (
    select *
    from scored
    order by match_score desc, last_active_at desc
    limit safe_limit
  )
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', ranked.id,
        'profileId', ranked.id,
        'firstName', ranked.first_name,
        'displayName', coalesce(ranked.display_name, ranked.first_name),
        'age', ranked.age,
        'profilePhotoUrl', ranked.profile_photo_url,
        'bio', ranked.bio,
        'inCityDurationLabel',
          case
            when ranked.city_arrived_at is null then null
            when ranked.city_arrived_at > (current_date - interval '6 months')::date
              then 'New to ' || target_city_name
            when ranked.city_arrived_at > (current_date - interval '12 months')::date
              then 'In ' || target_city_name || ' for 6-12 months'
            else 'Settling into ' || target_city_name
          end,
        'sharedInterests', ranked.shared_interests,
        'compatibilityLine',
          case
            when ranked.shared_interests_count >= 2
              then 'You both want to try ' || ranked.shared_interest_names[1] || ' and ' || ranked.shared_interest_names[2]
            when ranked.shared_interests_count = 1
              then 'You both want to try ' || ranked.shared_interest_names[1]
            else 'Similar pace and availability in ' || target_city_name
          end,
        'compatibilityHighlights',
          jsonb_build_array(
            case
              when effective_quiz_traits->>'socialStyle' is not null
                and effective_quiz_traits->>'socialStyle' = ranked.quiz_traits->>'socialStyle'
              then 'Similar group size'
              else 'Compatible social pace'
            end,
            case
              when effective_quiz_traits->>'availability' is not null
                and effective_quiz_traits->>'availability' = ranked.quiz_traits->>'availability'
              then 'Overlapping availability'
              else 'Flexible timing'
            end
          ),
        'score', ranked.match_score
      )
      order by ranked.match_score desc, ranked.last_active_at desc
    ),
    '[]'::jsonb
  )
  into matches
  from ranked;

  return jsonb_build_object(
    'ok', true,
    'cityId', target_city_id,
    'cityName', target_city_name,
    'peopleMatches', matches
  );
end;
$$;

revoke all on function public."getPeopleMatches"(uuid, text, jsonb, uuid[], integer) from public;
grant execute on function public."getPeopleMatches"(uuid, text, jsonb, uuid[], integer) to anon, authenticated;

create or replace function public."getPeopleProfile"("profileId" uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  profile_payload jsonb;
begin
  with profile_interest as (
    select
      user_interests.user_id,
      user_interests.interest_id
    from public.user_interests
    where user_interests.user_id = "profileId"

    union

    select
      interest_activations.user_id,
      interest_activations.interest_id
    from public.interest_activations
    where interest_activations.user_id = "profileId"
      and interest_activations.status = 'active'
      and (
        interest_activations.expires_at is null
        or interest_activations.expires_at > now()
      )
  ),
  interest_summary as (
    select
      profile_interest.user_id,
      coalesce(
        jsonb_agg(
          jsonb_build_object(
            'id', interests.id,
            'name', interests.name,
            'slug', interests.slug::text,
            'category', interests.category
          )
          order by interests.name
        ),
        '[]'::jsonb
      ) as interests
    from profile_interest
    join public.interests
      on interests.id = profile_interest.interest_id
    group by profile_interest.user_id
  )
  select jsonb_build_object(
    'id', profile.id,
    'profileId', profile.id,
    'firstName',
      coalesce(
        nullif(trim(profile.first_name), ''),
        nullif(split_part(coalesce(profile.display_name, ''), ' ', 1), ''),
        'Buzz Member'
      ),
    'displayName',
      coalesce(
        profile.display_name,
        nullif(trim(profile.first_name), ''),
        'Buzz Member'
      ),
    'age',
      case
        when profile.date_of_birth is not null
        then date_part('year', age(profile.date_of_birth))::integer
        else null
      end,
    'profilePhotoUrl', profile.profile_photo_url,
    'bio', profile.bio,
    'cityId', cities.id,
    'cityName', cities.name,
    'inCityDurationLabel',
      case
        when profile.city_arrived_at is null then null
        when profile.city_arrived_at > (current_date - interval '6 months')::date
          then 'New to ' || cities.name
        when profile.city_arrived_at > (current_date - interval '12 months')::date
          then 'In ' || cities.name || ' for 6-12 months'
        else 'Settling into ' || cities.name
      end,
    'interests', coalesce(interest_summary.interests, '[]'::jsonb)
  )
  into profile_payload
  from public.profiles profile
  join public.cities
    on cities.id = profile.city_id
  left join interest_summary
    on interest_summary.user_id = profile.id
  where profile.id = "profileId"
    and profile.visible is true
    and profile.settled is false
    and (
      profile.date_of_birth is null
      or profile.date_of_birth <= (current_date - interval '18 years')::date
    )
    and (
      current_user_id is null
      or profile.id <> current_user_id
    )
    and (
      current_user_id is null
      or not exists (
        select 1
        from public.blocks
        where (blocks.blocker_id = current_user_id and blocks.blocked_id = profile.id)
          or (blocks.blocker_id = profile.id and blocks.blocked_id = current_user_id)
      )
    )
    and (
      current_user_id is null
      or not exists (
        select 1
        from public.reports
        where reports.status in ('open', 'reviewing')
          and (
            (reports.reporter_id = current_user_id and reports.target_user_id = profile.id)
            or (reports.reporter_id = profile.id and reports.target_user_id = current_user_id)
          )
      )
    )
    and not exists (
      select 1
      from public.moderation_actions
      where moderation_actions.target_user_id = profile.id
        and moderation_actions.action_type in ('limit', 'suspend', 'ban')
        and (
          moderation_actions.expires_at is null
          or moderation_actions.expires_at > now()
        )
    );

  if profile_payload is null then
    return jsonb_build_object(
      'ok', false,
      'reason', 'not_found',
      'peopleProfile', null
    );
  end if;

  return jsonb_build_object(
    'ok', true,
    'peopleProfile', profile_payload
  );
end;
$$;

revoke all on function public."getPeopleProfile"(uuid) from public;
grant execute on function public."getPeopleProfile"(uuid) to anon, authenticated;

create or replace function public."sendConnectionRequest"(
  "recipientId" uuid,
  "message" text default null
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  requester_profile public.profiles%rowtype;
  recipient_profile public.profiles%rowtype;
  saved_request public.connection_requests%rowtype;
  safe_message text := nullif(left(trim(coalesce("message", '')), 280), '');
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  if current_user_id = "recipientId" then
    raise exception 'Cannot message yourself';
  end if;

  select *
  into requester_profile
  from public.profiles
  where id = current_user_id;

  if requester_profile.id is null then
    raise exception 'Profile required';
  end if;

  select *
  into recipient_profile
  from public.profiles profile
  where profile.id = "recipientId"
    and profile.visible is true
    and profile.settled is false
    and (
      profile.date_of_birth is null
      or profile.date_of_birth <= (current_date - interval '18 years')::date
    );

  if recipient_profile.id is null then
    raise exception 'Profile unavailable';
  end if;

  if exists (
    select 1
    from public.blocks
    where (blocks.blocker_id = current_user_id and blocks.blocked_id = recipient_profile.id)
      or (blocks.blocker_id = recipient_profile.id and blocks.blocked_id = current_user_id)
  ) then
    raise exception 'Profile unavailable';
  end if;

  if exists (
    select 1
    from public.reports
    where reports.status in ('open', 'reviewing')
      and (
        (reports.reporter_id = current_user_id and reports.target_user_id = recipient_profile.id)
        or (reports.reporter_id = recipient_profile.id and reports.target_user_id = current_user_id)
      )
  ) then
    raise exception 'Profile unavailable';
  end if;

  if exists (
    select 1
    from public.moderation_actions
    where moderation_actions.target_user_id in (current_user_id, recipient_profile.id)
      and moderation_actions.action_type in ('limit', 'suspend', 'ban')
      and (
        moderation_actions.expires_at is null
        or moderation_actions.expires_at > now()
      )
  ) then
    raise exception 'Profile unavailable';
  end if;

  insert into public.connection_requests (
    requester_id,
    recipient_id,
    city_id,
    message,
    status,
    source
  )
  values (
    current_user_id,
    recipient_profile.id,
    coalesce(requester_profile.city_id, recipient_profile.city_id),
    safe_message,
    'pending',
    'people_feed'
  )
  on conflict (requester_id, recipient_id) where status = 'pending'
  do update
  set
    message = coalesce(excluded.message, connection_requests.message),
    updated_at = now()
  returning * into saved_request;

  return jsonb_build_object(
    'ok', true,
    'connectionRequestId', saved_request.id,
    'recipientId', saved_request.recipient_id,
    'status', saved_request.status
  );
end;
$$;

revoke all on function public."sendConnectionRequest"(uuid, text) from public;
revoke execute on function public."sendConnectionRequest"(uuid, text) from anon;
grant execute on function public."sendConnectionRequest"(uuid, text) to authenticated;
