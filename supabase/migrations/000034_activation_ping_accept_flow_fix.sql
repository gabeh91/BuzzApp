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
      activity_group_id,
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

revoke all on function public."respondToActivationPing"(uuid, text) from public;
revoke execute on function public."respondToActivationPing"(uuid, text) from anon;
grant execute on function public."respondToActivationPing"(uuid, text) to authenticated;
