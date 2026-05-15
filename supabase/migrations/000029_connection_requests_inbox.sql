do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
    and not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'connection_requests'
    )
  then
    alter publication supabase_realtime add table public.connection_requests;
  end if;
end;
$$;

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
    and connection_requests.status = 'pending';
$$;

revoke all on function public."getConnectionRequests"() from public;
revoke execute on function public."getConnectionRequests"() from anon;
grant execute on function public."getConnectionRequests"() to authenticated;
