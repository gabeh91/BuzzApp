alter table public.cities enable row level security;
alter table public.suburbs enable row level security;
alter table public.suburb_tags enable row level security;
alter table public.city_interests enable row level security;
alter table public.city_settings enable row level security;
alter table public.city_feature_flags enable row level security;
alter table public.feature_flags enable row level security;
alter table public.business_categories enable row level security;
alter table public.businesses enable row level security;
alter table public.events enable row level security;
alter table public.event_interests enable row level security;
alter table public.activity_groups enable row level security;
alter table public.activity_group_members enable row level security;
alter table public.activity_plans enable row level security;
alter table public.group_messages enable row level security;

drop policy if exists "Public cities are readable" on public.cities;
create policy "Public cities are readable"
on public.cities
for select
to anon, authenticated
using (true);

drop policy if exists "Public suburbs are readable" on public.suburbs;
create policy "Public suburbs are readable"
on public.suburbs
for select
to anon, authenticated
using (true);

drop policy if exists "Public suburb tags are readable" on public.suburb_tags;
create policy "Public suburb tags are readable"
on public.suburb_tags
for select
to anon, authenticated
using (true);

drop policy if exists "Public city interests are readable" on public.city_interests;
create policy "Public city interests are readable"
on public.city_interests
for select
to anon, authenticated
using (true);

drop policy if exists "Public city settings are readable" on public.city_settings;
create policy "Public city settings are readable"
on public.city_settings
for select
to anon, authenticated
using (true);

drop policy if exists "Public city feature flags are readable" on public.city_feature_flags;
create policy "Public city feature flags are readable"
on public.city_feature_flags
for select
to anon, authenticated
using (true);

drop policy if exists "Public feature flags are readable" on public.feature_flags;
create policy "Public feature flags are readable"
on public.feature_flags
for select
to anon, authenticated
using (true);

drop policy if exists "Public business categories are readable" on public.business_categories;
create policy "Public business categories are readable"
on public.business_categories
for select
to anon, authenticated
using (true);

drop policy if exists "Public businesses are readable" on public.businesses;
create policy "Public businesses are readable"
on public.businesses
for select
to anon, authenticated
using (true);

drop policy if exists "Public events are readable" on public.events;
create policy "Public events are readable"
on public.events
for select
to anon, authenticated
using (true);

drop policy if exists "Public event interests are readable" on public.event_interests;
create policy "Public event interests are readable"
on public.event_interests
for select
to anon, authenticated
using (true);

create or replace function public."isActivityGroupMember"(
  "activityGroupId" uuid,
  "profileId" uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    exists (
      select 1
      from public.activity_group_members
      where activity_group_members.activity_group_id = "activityGroupId"
        and activity_group_members.user_id = "profileId"
    ),
    false
  );
$$;

revoke all on function public."isActivityGroupMember"(uuid, uuid) from public;
grant execute on function public."isActivityGroupMember"(uuid, uuid) to authenticated;

drop policy if exists "Activity group members can read their groups" on public.activity_groups;
create policy "Activity group members can read their groups"
on public.activity_groups
for select
to authenticated
using (public."isActivityGroupMember"(id));

drop policy if exists "Activity group members can read membership" on public.activity_group_members;
create policy "Activity group members can read membership"
on public.activity_group_members
for select
to authenticated
using (public."isActivityGroupMember"(activity_group_id));

drop policy if exists "Activity group members can read plans" on public.activity_plans;
create policy "Activity group members can read plans"
on public.activity_plans
for select
to authenticated
using (public."isActivityGroupMember"(activity_group_id));

drop policy if exists "Activity group members can read messages" on public.group_messages;
create policy "Activity group members can read messages"
on public.group_messages
for select
to authenticated
using (public."isActivityGroupMember"(activity_group_id));

create or replace function public."sendGroupMessage"(
  "activityGroupId" uuid,
  "body" text,
  "moderationStatus" text default 'clean'
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  normalized_body text := trim(coalesce("body", ''));
  normalized_moderation_status text := coalesce("moderationStatus", 'clean');
  saved_message public.group_messages%rowtype;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  if normalized_body = '' then
    raise exception 'Message body is required';
  end if;

  if normalized_moderation_status not in ('clean', 'flagged', 'blocked') then
    raise exception 'Invalid moderation status';
  end if;

  if not exists (
    select 1
    from public.activity_group_members
    where activity_group_members.activity_group_id = "activityGroupId"
      and activity_group_members.user_id = current_user_id
  ) then
    raise exception 'Activity group unavailable';
  end if;

  insert into public.group_messages (
    activity_group_id,
    sender_id,
    body,
    message_type,
    moderation_status
  )
  values (
    "activityGroupId",
    current_user_id,
    left(normalized_body, 1000),
    'text',
    normalized_moderation_status
  )
  returning * into saved_message;

  return jsonb_build_object(
    'id', saved_message.id,
    'activityGroupId', saved_message.activity_group_id,
    'senderId', saved_message.sender_id,
    'body', saved_message.body,
    'messageType', saved_message.message_type,
    'moderationStatus', saved_message.moderation_status,
    'createdAt', saved_message.created_at
  );
end;
$$;

revoke all on function public."sendGroupMessage"(uuid, text, text) from public;
revoke execute on function public."sendGroupMessage"(uuid, text, text) from anon;
grant execute on function public."sendGroupMessage"(uuid, text, text) to authenticated;

revoke insert, update, delete on public.cities from anon, authenticated;
revoke insert, update, delete on public.suburbs from anon, authenticated;
revoke insert, update, delete on public.suburb_tags from anon, authenticated;
revoke insert, update, delete on public.city_interests from anon, authenticated;
revoke insert, update, delete on public.city_settings from anon, authenticated;
revoke insert, update, delete on public.city_feature_flags from anon, authenticated;
revoke insert, update, delete on public.feature_flags from anon, authenticated;
revoke insert, update, delete on public.business_categories from anon, authenticated;
revoke insert, update, delete on public.businesses from anon, authenticated;
revoke insert, update, delete on public.events from anon, authenticated;
revoke insert, update, delete on public.event_interests from anon, authenticated;
revoke insert, update, delete on public.activity_groups from anon, authenticated;
revoke insert, update, delete on public.activity_group_members from anon, authenticated;
revoke insert, update, delete on public.activity_plans from anon, authenticated;
revoke insert, update, delete on public.group_messages from anon, authenticated;
