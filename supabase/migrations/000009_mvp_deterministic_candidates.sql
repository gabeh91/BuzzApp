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

  update public.profiles
  set
    city_id = coalesce(current_profile.city_id, target_city_id),
    last_active_at = now(),
    updated_at = now()
  where id = current_user_id;

  insert into public.interest_activations (user_id, interest_id, city_id, status)
  values (current_user_id, "interestId", target_city_id, 'active')
  on conflict (user_id, interest_id) where status = 'active'
  do update
  set city_id = excluded.city_id
  returning id into current_activation_id;

  with matched_profile as (
    select
      matched_profile.id,
      coalesce(matched_profile.display_name, 'Buzz Member') as display_name,
      matched_profile.quiz_traits,
      least(
        0.94,
        0.72
          + case
              when current_profile.quiz_traits->>'socialStyle' is not null
                and current_profile.quiz_traits->>'socialStyle' = matched_profile.quiz_traits->>'socialStyle'
              then 0.08
              else 0
            end
          + case
              when current_profile.quiz_traits->>'energy' is not null
                and current_profile.quiz_traits->>'energy' = matched_profile.quiz_traits->>'energy'
              then 0.06
              else 0
            end
          + case
              when current_profile.quiz_traits->>'planning' is not null
                and current_profile.quiz_traits->>'planning' = matched_profile.quiz_traits->>'planning'
              then 0.04
              else 0
            end
          + case
              when current_profile.quiz_traits->>'availability' is not null
                and current_profile.quiz_traits->>'availability' = matched_profile.quiz_traits->>'availability'
              then 0.04
              else 0
            end
      ) as match_score
    from public.profiles matched_profile
    join public.interest_activations matched_activation
      on matched_activation.user_id = matched_profile.id
      and matched_activation.interest_id = "interestId"
      and matched_activation.status = 'active'
    where matched_profile.id <> current_user_id
      and matched_profile.city_id = target_city_id
      and matched_profile.visible is true
      and matched_profile.settled is false
      and not exists (
        select 1
        from public.blocks
        where (blocker_id = current_user_id and blocked_id = matched_profile.id)
          or (blocker_id = matched_profile.id and blocked_id = current_user_id)
      )
    order by match_score desc, matched_profile.last_active_at desc
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
            when current_profile.quiz_traits->>'planning' = 'spontaneous'
            then 'Suggest a low-pressure ' || target_interest.name || ' session this week.'
            when current_profile.quiz_traits->>'availability' = 'weekend'
            then 'Suggest a clear ' || target_interest.name || ' plan for the next weekend.'
            else 'Suggest a clear ' || target_interest.name || ' plan for the next few days.'
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
