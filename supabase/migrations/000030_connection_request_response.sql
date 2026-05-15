create or replace function public."respondConnectionRequest"(
  "requestId" uuid,
  "response" text
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  normalized_response text := lower(trim(coalesce("response", '')));
  saved_request public.connection_requests%rowtype;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  if normalized_response not in ('accepted', 'declined') then
    raise exception 'Unsupported response';
  end if;

  update public.connection_requests
  set
    status = normalized_response,
    responded_at = now(),
    updated_at = now()
  where id = "requestId"
    and recipient_id = current_user_id
    and status = 'pending'
  returning * into saved_request;

  if saved_request.id is null then
    raise exception 'Connection request unavailable';
  end if;

  return jsonb_build_object(
    'ok', true,
    'connectionRequestId', saved_request.id,
    'requesterId', saved_request.requester_id,
    'recipientId', saved_request.recipient_id,
    'status', saved_request.status
  );
end;
$$;

revoke all on function public."respondConnectionRequest"(uuid, text) from public;
revoke execute on function public."respondConnectionRequest"(uuid, text) from anon;
grant execute on function public."respondConnectionRequest"(uuid, text) to authenticated;
