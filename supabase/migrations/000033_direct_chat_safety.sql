alter table public.direct_conversations
  add column if not exists status text not null default 'active',
  add column if not exists closed_by uuid references public.profiles(id) on delete set null,
  add column if not exists closed_at timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'direct_conversations_status_check'
      and conrelid = 'public.direct_conversations'::regclass
  ) then
    alter table public.direct_conversations
      add constraint direct_conversations_status_check
      check (status in ('active', 'closed'));
  end if;
end $$;

create index if not exists direct_conversations_member_status_idx
  on public.direct_conversations (status, user_low_id, user_high_id, updated_at desc);

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
        'status', target_conversation.status,
        'closedBy', target_conversation.closed_by,
        'closedAt', target_conversation.closed_at,
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
    and status = 'active'
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

create or replace function public."leaveDirectConversation"("conversationId" uuid)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  updated_conversation public.direct_conversations%rowtype;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  update public.direct_conversations
  set
    status = 'closed',
    closed_by = current_user_id,
    closed_at = now(),
    updated_at = now()
  where id = "conversationId"
    and status = 'active'
    and (user_low_id = current_user_id or user_high_id = current_user_id)
  returning * into updated_conversation;

  if updated_conversation.id is null then
    raise exception 'Conversation unavailable';
  end if;

  return jsonb_build_object(
    'ok', true,
    'directConversationId', updated_conversation.id,
    'status', updated_conversation.status,
    'closedBy', updated_conversation.closed_by,
    'closedAt', updated_conversation.closed_at
  );
end;
$$;

create or replace function public."reportDirectConversation"(
  "conversationId" uuid,
  "reason" text default 'Direct chat safety concern',
  "category" text default 'other'
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
  other_user_id uuid;
  normalized_reason text := trim(coalesce("reason", 'Direct chat safety concern'));
  normalized_category text := coalesce(nullif(trim("category"), ''), 'other');
  saved_report public.reports%rowtype;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
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

  if normalized_category not in ('unsafe', 'harassment', 'spam', 'no_show', 'other') then
    normalized_category := 'other';
  end if;

  if normalized_reason = '' then
    normalized_reason := 'Direct chat safety concern';
  end if;

  other_user_id := case
    when target_conversation.user_low_id = current_user_id
      then target_conversation.user_high_id
    else target_conversation.user_low_id
  end;

  insert into public.reports (
    reporter_id,
    target_user_id,
    reason,
    category,
    source,
    status,
    metadata_json
  )
  values (
    current_user_id,
    other_user_id,
    left(normalized_reason, 500),
    normalized_category,
    'user_report',
    'open',
    jsonb_build_object('directConversationId', target_conversation.id)
  )
  returning * into saved_report;

  return jsonb_build_object(
    'ok', true,
    'reportId', saved_report.id,
    'status', saved_report.status
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
    where direct_conversations.status = 'active'
      and (
        direct_conversations.user_low_id = auth.uid()
        or direct_conversations.user_high_id = auth.uid()
      )
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
        'status', member_direct_conversations.status,
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

revoke all on function public."getDirectMessages"(uuid) from public;
revoke execute on function public."getDirectMessages"(uuid) from anon;
grant execute on function public."getDirectMessages"(uuid) to authenticated;

revoke all on function public."sendDirectMessage"(uuid, text) from public;
revoke execute on function public."sendDirectMessage"(uuid, text) from anon;
grant execute on function public."sendDirectMessage"(uuid, text) to authenticated;

revoke all on function public."leaveDirectConversation"(uuid) from public;
revoke execute on function public."leaveDirectConversation"(uuid) from anon;
grant execute on function public."leaveDirectConversation"(uuid) to authenticated;

revoke all on function public."reportDirectConversation"(uuid, text, text) from public;
revoke execute on function public."reportDirectConversation"(uuid, text, text) from anon;
grant execute on function public."reportDirectConversation"(uuid, text, text) to authenticated;

revoke all on function public."getChatSummaries"() from public;
revoke execute on function public."getChatSummaries"() from anon;
grant execute on function public."getChatSummaries"() to authenticated;
