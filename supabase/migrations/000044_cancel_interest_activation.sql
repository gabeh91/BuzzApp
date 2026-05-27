create or replace function public."cancelInterestActivation"("activationId" uuid)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  target_activation public.interest_activations%rowtype;
  cancelled_ping_count integer := 0;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  select *
  into target_activation
  from public.interest_activations
  where id = "activationId"
  for update;

  if target_activation.id is null then
    raise exception 'Activation not found';
  end if;

  if target_activation.user_id <> current_user_id then
    raise exception 'Cannot cancel another profile''s activation';
  end if;

  if target_activation.status <> 'active' then
    return jsonb_build_object(
      'ok', true,
      'activationId', target_activation.id,
      'status', target_activation.status,
      'cancelledPingCount', 0
    );
  end if;

  update public.interest_activations
  set
    status = 'cancelled',
    expires_at = least(coalesce(expires_at, now()), now())
  where id = target_activation.id;

  update public.activation_pings
  set
    status = 'cancelled',
    updated_at = now()
  where activation_id = target_activation.id
    and sender_id = current_user_id
    and status = 'pending';

  get diagnostics cancelled_ping_count = row_count;

  update public.match_candidates
  set
    responded_at = now(),
    status = 'expired'
  where activation_id = target_activation.id
    and status = 'pending';

  insert into public.activation_ping_events (ping_id, actor_id, event_type, payload)
  select
    activation_pings.id,
    current_user_id,
    'cancelled',
    jsonb_build_object('activationId', target_activation.id)
  from public.activation_pings
  where activation_pings.activation_id = target_activation.id
    and activation_pings.sender_id = current_user_id
    and activation_pings.status = 'cancelled';

  return jsonb_build_object(
    'ok', true,
    'activationId', target_activation.id,
    'status', 'cancelled',
    'cancelledPingCount', cancelled_ping_count
  );
end;
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
        'interestSlug', interests.slug::text,
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

revoke all on function public."cancelInterestActivation"(uuid) from public;
revoke execute on function public."cancelInterestActivation"(uuid) from anon;
grant execute on function public."cancelInterestActivation"(uuid) to authenticated;
