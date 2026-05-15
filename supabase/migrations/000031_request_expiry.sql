alter table public.connection_requests
  add column if not exists expires_at timestamptz;

update public.connection_requests
set expires_at = created_at + interval '14 days'
where expires_at is null;

alter table public.connection_requests
  alter column expires_at set default (now() + interval '14 days'),
  alter column expires_at set not null;

create index if not exists connection_requests_recipient_pending_expiry_idx
  on public.connection_requests (recipient_id, status, expires_at, created_at desc);

create or replace function public."getConnectionRequests"()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', connection_requests.id,
        'requesterId', connection_requests.requester_id,
        'recipientId', connection_requests.recipient_id,
        'otherUserId', requester_profile.id,
        'otherName', coalesce(
          nullif(requester_profile.first_name, ''),
          nullif(split_part(requester_profile.display_name, ' ', 1), ''),
          nullif(requester_profile.display_name, ''),
          'Buzz Member'
        ),
        'otherPhotoUrl', requester_profile.profile_photo_url,
        'message', connection_requests.message,
        'status', connection_requests.status,
        'expiresAt', connection_requests.expires_at,
        'createdAt', connection_requests.created_at
      )
      order by connection_requests.created_at desc
    ),
    '[]'::jsonb
  )
  from public.connection_requests
  join public.profiles requester_profile
    on requester_profile.id = connection_requests.requester_id
  where connection_requests.recipient_id = auth.uid()
    and connection_requests.status = 'pending'
    and connection_requests.expires_at > now();
$$;

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
    and expires_at > now()
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

revoke all on function public."getConnectionRequests"() from public;
revoke execute on function public."getConnectionRequests"() from anon;
grant execute on function public."getConnectionRequests"() to authenticated;

revoke all on function public."respondConnectionRequest"(uuid, text) from public;
revoke execute on function public."respondConnectionRequest"(uuid, text) from anon;
grant execute on function public."respondConnectionRequest"(uuid, text) to authenticated;
