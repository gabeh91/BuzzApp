do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'reports_status_check'
      and conrelid = 'public.reports'::regclass
  ) then
    alter table public.reports
      drop constraint reports_status_check;
  end if;

  alter table public.reports
    add constraint reports_status_check
    check (status in ('needs_review', 'open', 'reviewing', 'resolved', 'dismissed'));
end $$;

drop function if exists public."reportDirectConversation"(uuid, text, text);

create or replace function public."reportDirectConversation"(
  "conversationId" uuid,
  "reason" text default 'Direct chat safety concern',
  "category" text default 'other',
  "details" text default null
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
  normalized_details text := nullif(trim(coalesce("details", '')), '');
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
    details,
    source,
    status,
    metadata_json
  )
  values (
    current_user_id,
    other_user_id,
    left(normalized_reason, 500),
    normalized_category,
    left(normalized_details, 2000),
    'user_report',
    'needs_review',
    jsonb_build_object(
      'directConversationId', target_conversation.id,
      'requestedAction', 'admin_review_for_block',
      'automaticMatchExclusion', false
    )
  )
  returning * into saved_report;

  return jsonb_build_object(
    'ok', true,
    'reportId', saved_report.id,
    'status', saved_report.status
  );
end;
$$;

revoke all on function public."reportDirectConversation"(uuid, text, text, text) from public;
revoke execute on function public."reportDirectConversation"(uuid, text, text, text) from anon;
grant execute on function public."reportDirectConversation"(uuid, text, text, text) to authenticated;

create or replace view public.admin_safety_reports as
select
  reports.id,
  reports.reporter_id,
  reports.target_user_id,
  reports.activity_group_id,
  reports.category,
  reports.status,
  reports.reason,
  reports.created_at,
  reports.details,
  reports.source,
  reports.metadata_json,
  reports.reviewed_at,
  reports.resolved_at
from public.reports;
