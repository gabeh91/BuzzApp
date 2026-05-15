alter table public.activity_group_checkins enable row level security;
alter table public.group_invite_events enable row level security;
alter table public.group_invites enable row level security;

drop policy if exists "Users can read their group invites" on public.group_invites;
create policy "Users can read their group invites"
on public.group_invites
for select
to authenticated
using (
  inviter_id = auth.uid()
  or accepted_by = auth.uid()
  or public."isActivityGroupMember"(activity_group_id)
);

drop policy if exists "Group members can read invite events" on public.group_invite_events;
create policy "Group members can read invite events"
on public.group_invite_events
for select
to authenticated
using (
  actor_id = auth.uid()
  or public."isActivityGroupMember"(activity_group_id)
);

drop policy if exists "Users can read their check-ins" on public.activity_group_checkins;
create policy "Users can read their check-ins"
on public.activity_group_checkins
for select
to authenticated
using (user_id = auth.uid());

revoke all privileges on public.activity_group_checkins from anon, authenticated;
grant select on public.activity_group_checkins to authenticated;

revoke all privileges on public.group_invite_events from anon, authenticated;
grant select on public.group_invite_events to authenticated;

revoke all privileges on public.group_invites from anon, authenticated;
grant select on public.group_invites to authenticated;
