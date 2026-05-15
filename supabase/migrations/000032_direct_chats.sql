create table if not exists public.direct_conversations (
  id uuid primary key default gen_random_uuid(),
  user_low_id uuid not null references public.profiles(id) on delete cascade,
  user_high_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_message_at timestamptz,
  check (user_low_id <> user_high_id)
);

create unique index if not exists direct_conversations_pair_unique_idx
  on public.direct_conversations (user_low_id, user_high_id);

create index if not exists direct_conversations_low_idx
  on public.direct_conversations (user_low_id, updated_at desc);

create index if not exists direct_conversations_high_idx
  on public.direct_conversations (user_high_id, updated_at desc);

create table if not exists public.direct_messages (
  id uuid primary key default gen_random_uuid(),
  direct_conversation_id uuid not null references public.direct_conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  message_type text not null default 'text',
  moderation_status text not null default 'pending',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  check (message_type in ('text', 'system')),
  check (moderation_status in ('pending', 'approved', 'blocked'))
);

create index if not exists direct_messages_conversation_created_idx
  on public.direct_messages (direct_conversation_id, created_at);

alter table public.direct_conversations enable row level security;
alter table public.direct_messages enable row level security;

drop policy if exists "Direct conversation participants can read"
on public.direct_conversations;

create policy "Direct conversation participants can read"
on public.direct_conversations
for select
to authenticated
using (user_low_id = auth.uid() or user_high_id = auth.uid());

drop policy if exists "Direct message participants can read"
on public.direct_messages;

create policy "Direct message participants can read"
on public.direct_messages
for select
to authenticated
using (
  exists (
    select 1
    from public.direct_conversations
    where direct_conversations.id = direct_messages.direct_conversation_id
      and (
        direct_conversations.user_low_id = auth.uid()
        or direct_conversations.user_high_id = auth.uid()
      )
  )
);

revoke all on public.direct_conversations from anon, authenticated;
revoke all on public.direct_messages from anon, authenticated;
grant select on public.direct_conversations to authenticated;
grant select on public.direct_messages to authenticated;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'direct_messages'
  ) then
    alter publication supabase_realtime add table public.direct_messages;
  end if;
end $$;

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
  direct_conversation_id uuid;
  initial_message_body text;
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

  if normalized_response = 'accepted' then
    insert into public.direct_conversations (
      user_low_id,
      user_high_id,
      updated_at,
      last_message_at
    )
    values (
      least(saved_request.requester_id, saved_request.recipient_id),
      greatest(saved_request.requester_id, saved_request.recipient_id),
      now(),
      now()
    )
    on conflict (user_low_id, user_high_id)
    do update set updated_at = now()
    returning id into direct_conversation_id;

    initial_message_body := coalesce(nullif(trim(saved_request.message), ''), 'Hi');

    insert into public.direct_messages (
      direct_conversation_id,
      sender_id,
      body,
      message_type,
      moderation_status,
      metadata
    )
    values (
      direct_conversation_id,
      saved_request.requester_id,
      initial_message_body,
      'text',
      'pending',
      jsonb_build_object('connectionRequestId', saved_request.id)
    );

    update public.direct_conversations
    set
      updated_at = now(),
      last_message_at = now()
    where id = direct_conversation_id;
  end if;

  return jsonb_build_object(
    'ok', true,
    'connectionRequestId', saved_request.id,
    'requesterId', saved_request.requester_id,
    'recipientId', saved_request.recipient_id,
    'status', saved_request.status,
    'directConversationId', direct_conversation_id
  );
end;
$$;

create or replace function public."getDirectMessages"("conversationId" uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with target_conversation as (
    select direct_conversations.*
    from public.direct_conversations
    where direct_conversations.id = "conversationId"
      and (
        direct_conversations.user_low_id = auth.uid()
        or direct_conversations.user_high_id = auth.uid()
      )
    limit 1
  ),
  other_profile as (
    select profiles.*
    from public.profiles
    join target_conversation
      on profiles.id = case
        when target_conversation.user_low_id = auth.uid()
          then target_conversation.user_high_id
        else target_conversation.user_low_id
      end
    limit 1
  )
  select coalesce(
    jsonb_build_object(
      'conversation', jsonb_build_object(
        'id', target_conversation.id,
        'otherUserId', other_profile.id,
        'otherName', coalesce(
          nullif(other_profile.first_name, ''),
          nullif(split_part(other_profile.display_name, ' ', 1), ''),
          nullif(other_profile.display_name, ''),
          'Buzz Member'
        ),
        'otherPhotoUrl', other_profile.profile_photo_url
      ),
      'messages', coalesce(
        (
          select jsonb_agg(
            jsonb_build_object(
              'id', direct_messages.id,
              'directConversationId', direct_messages.direct_conversation_id,
              'senderId', direct_messages.sender_id,
              'body', direct_messages.body,
              'messageType', direct_messages.message_type,
              'moderationStatus', direct_messages.moderation_status,
              'createdAt', direct_messages.created_at
            )
            order by direct_messages.created_at asc
          )
          from public.direct_messages
          where direct_messages.direct_conversation_id = target_conversation.id
        ),
        '[]'::jsonb
      )
    ),
    jsonb_build_object('conversation', null, 'messages', '[]'::jsonb)
  )
  from target_conversation
  left join other_profile on true;
$$;

create or replace function public."sendDirectMessage"(
  "conversationId" uuid,
  "body" text
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  target_conversation public.direct_conversations%rowtype;
  normalized_body text := trim(coalesce("body", ''));
  saved_message public.direct_messages%rowtype;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  if normalized_body = '' then
    raise exception 'Message body is required';
  end if;

  select *
  into target_conversation
  from public.direct_conversations
  where id = "conversationId"
    and (user_low_id = current_user_id or user_high_id = current_user_id)
  limit 1;

  if target_conversation.id is null then
    raise exception 'Conversation unavailable';
  end if;

  insert into public.direct_messages (
    direct_conversation_id,
    sender_id,
    body,
    message_type,
    moderation_status
  )
  values (
    target_conversation.id,
    current_user_id,
    left(normalized_body, 1000),
    'text',
    'pending'
  )
  returning * into saved_message;

  update public.direct_conversations
  set
    updated_at = now(),
    last_message_at = saved_message.created_at
  where id = target_conversation.id;

  return jsonb_build_object(
    'id', saved_message.id,
    'directConversationId', saved_message.direct_conversation_id,
    'senderId', saved_message.sender_id,
    'body', saved_message.body,
    'messageType', saved_message.message_type,
    'moderationStatus', saved_message.moderation_status,
    'createdAt', saved_message.created_at
  );
end;
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
  last_group_message as (
    select distinct on (group_messages.activity_group_id)
      group_messages.activity_group_id,
      group_messages.body,
      group_messages.created_at,
      group_messages.message_type
    from public.group_messages
    join member_groups
      on member_groups.activity_group_id = group_messages.activity_group_id
    order by group_messages.activity_group_id, group_messages.created_at desc
  ),
  group_summaries as (
    select
      jsonb_build_object(
        'kind', 'group',
        'id', activity_groups.id,
        'activityGroupId', activity_groups.id,
        'title', activity_groups.title,
        'status', activity_groups.status,
        'interestName', interests.name,
        'lastMessageBody', last_group_message.body,
        'lastMessageAt', last_group_message.created_at,
        'lastMessageType', last_group_message.message_type,
        'unreadCount', 0,
        'memberCount', (
          select count(*)::integer
          from public.activity_group_members
          where activity_group_members.activity_group_id = activity_groups.id
        )
      ) as summary,
      coalesce(last_group_message.created_at, activity_groups.created_at) as sort_at
    from public.activity_groups
    join member_groups
      on member_groups.activity_group_id = activity_groups.id
    left join public.interests
      on interests.id = activity_groups.interest_id
    left join last_group_message
      on last_group_message.activity_group_id = activity_groups.id
  ),
  member_direct_conversations as (
    select direct_conversations.*
    from public.direct_conversations
    where direct_conversations.user_low_id = auth.uid()
      or direct_conversations.user_high_id = auth.uid()
  ),
  last_direct_message as (
    select distinct on (direct_messages.direct_conversation_id)
      direct_messages.direct_conversation_id,
      direct_messages.body,
      direct_messages.created_at,
      direct_messages.message_type
    from public.direct_messages
    join member_direct_conversations
      on member_direct_conversations.id = direct_messages.direct_conversation_id
    order by direct_messages.direct_conversation_id, direct_messages.created_at desc
  ),
  direct_summaries as (
    select
      jsonb_build_object(
        'kind', 'direct',
        'id', member_direct_conversations.id,
        'directConversationId', member_direct_conversations.id,
        'otherUserId', other_profile.id,
        'title', coalesce(
          nullif(other_profile.first_name, ''),
          nullif(split_part(other_profile.display_name, ' ', 1), ''),
          nullif(other_profile.display_name, ''),
          'Buzz Member'
        ),
        'status', 'active',
        'interestName', null,
        'lastMessageBody', last_direct_message.body,
        'lastMessageAt', last_direct_message.created_at,
        'lastMessageType', last_direct_message.message_type,
        'unreadCount', 0,
        'memberCount', 2
      ) as summary,
      coalesce(
        last_direct_message.created_at,
        member_direct_conversations.last_message_at,
        member_direct_conversations.created_at
      ) as sort_at
    from member_direct_conversations
    join public.profiles other_profile
      on other_profile.id = case
        when member_direct_conversations.user_low_id = auth.uid()
          then member_direct_conversations.user_high_id
        else member_direct_conversations.user_low_id
      end
    left join last_direct_message
      on last_direct_message.direct_conversation_id = member_direct_conversations.id
  ),
  all_summaries as (
    select summary, sort_at from group_summaries
    union all
    select summary, sort_at from direct_summaries
  )
  select coalesce(
    jsonb_agg(summary order by sort_at desc),
    '[]'::jsonb
  )
  from all_summaries;
$$;

revoke all on function public."respondConnectionRequest"(uuid, text) from public;
revoke execute on function public."respondConnectionRequest"(uuid, text) from anon;
grant execute on function public."respondConnectionRequest"(uuid, text) to authenticated;

revoke all on function public."getDirectMessages"(uuid) from public;
revoke execute on function public."getDirectMessages"(uuid) from anon;
grant execute on function public."getDirectMessages"(uuid) to authenticated;

revoke all on function public."sendDirectMessage"(uuid, text) from public;
revoke execute on function public."sendDirectMessage"(uuid, text) from anon;
grant execute on function public."sendDirectMessage"(uuid, text) to authenticated;

revoke all on function public."getChatSummaries"() from public;
revoke execute on function public."getChatSummaries"() from anon;
grant execute on function public."getChatSummaries"() to authenticated;
