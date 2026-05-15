alter table public.activity_risk_levels enable row level security;
alter table public.business_leads enable row level security;
alter table public.moderation_actions enable row level security;
alter table public.plan_recipes enable row level security;
alter table public.plan_safety_checks enable row level security;
alter table public.reports enable row level security;
alter table public.starter_plan_steps enable row level security;
alter table public.starter_plans enable row level security;
alter table public.user_reliability enable row level security;

drop policy if exists "Reports are readable by involved users" on public.reports;
create policy "Reports are readable by involved users"
on public.reports
for select
to authenticated
using (
  reporter_id = auth.uid()
  or target_user_id = auth.uid()
);

drop policy if exists "Moderation actions are readable by involved users" on public.moderation_actions;
create policy "Moderation actions are readable by involved users"
on public.moderation_actions
for select
to authenticated
using (
  actor_id = auth.uid()
  or target_user_id = auth.uid()
);

drop policy if exists "Users can read their reliability" on public.user_reliability;
create policy "Users can read their reliability"
on public.user_reliability
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Activity group members can read plan safety checks" on public.plan_safety_checks;
create policy "Activity group members can read plan safety checks"
on public.plan_safety_checks
for select
to authenticated
using (
  activity_group_id is not null
  and public."isActivityGroupMember"(activity_group_id)
);

drop policy if exists "Public activity risk levels are readable" on public.activity_risk_levels;
create policy "Public activity risk levels are readable"
on public.activity_risk_levels
for select
to anon, authenticated
using (true);

drop policy if exists "Public plan recipes are readable" on public.plan_recipes;
create policy "Public plan recipes are readable"
on public.plan_recipes
for select
to anon, authenticated
using (true);

drop policy if exists "Public starter plans are readable" on public.starter_plans;
create policy "Public starter plans are readable"
on public.starter_plans
for select
to anon, authenticated
using (true);

drop policy if exists "Public starter plan steps are readable" on public.starter_plan_steps;
create policy "Public starter plan steps are readable"
on public.starter_plan_steps
for select
to anon, authenticated
using (true);

revoke all privileges on public.activity_risk_levels from anon, authenticated;
grant select on public.activity_risk_levels to anon, authenticated;

revoke all privileges on public.business_leads from anon, authenticated;

revoke all privileges on public.moderation_actions from anon, authenticated;
grant select on public.moderation_actions to authenticated;

revoke all privileges on public.plan_recipes from anon, authenticated;
grant select on public.plan_recipes to anon, authenticated;

revoke all privileges on public.plan_safety_checks from anon, authenticated;
grant select on public.plan_safety_checks to authenticated;

revoke all privileges on public.reports from anon, authenticated;
grant select on public.reports to authenticated;

revoke all privileges on public.starter_plan_steps from anon, authenticated;
grant select on public.starter_plan_steps to anon, authenticated;

revoke all privileges on public.starter_plans from anon, authenticated;
grant select on public.starter_plans to anon, authenticated;

revoke all privileges on public.user_reliability from anon, authenticated;
grant select on public.user_reliability to authenticated;
