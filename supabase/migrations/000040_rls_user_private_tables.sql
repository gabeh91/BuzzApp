alter table public.ai_profile_summaries enable row level security;
alter table public.blocks enable row level security;
alter table public.business_impressions enable row level security;
alter table public.landing_plan_items enable row level security;
alter table public.landing_plans enable row level security;
alter table public.match_candidates enable row level security;
alter table public.repeat_connection_preferences enable row level security;
alter table public.user_safety_settings enable row level security;
alter table public.user_social_preferences enable row level security;
alter table public.user_suburb_matches enable row level security;
alter table public.user_verifications enable row level security;

create or replace function public."isLandingPlanOwner"(
  "landingPlanId" uuid,
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
      from public.landing_plans
      where landing_plans.id = "landingPlanId"
        and landing_plans.user_id = "profileId"
    ),
    false
  );
$$;

revoke all on function public."isLandingPlanOwner"(uuid, uuid) from public;
grant execute on function public."isLandingPlanOwner"(uuid, uuid) to authenticated;

create or replace function public."isMatchCandidateParticipant"(
  "activationId" uuid,
  "matchedUserId" uuid,
  "profileId" uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    "matchedUserId" = "profileId"
    or exists (
      select 1
      from public.interest_activations
      where interest_activations.id = "activationId"
        and interest_activations.user_id = "profileId"
    ),
    false
  );
$$;

revoke all on function public."isMatchCandidateParticipant"(uuid, uuid, uuid) from public;
grant execute on function public."isMatchCandidateParticipant"(uuid, uuid, uuid) to authenticated;

drop policy if exists "Users can read their safety settings" on public.user_safety_settings;
create policy "Users can read their safety settings"
on public.user_safety_settings
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can read their social preferences" on public.user_social_preferences;
create policy "Users can read their social preferences"
on public.user_social_preferences
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can read their suburb matches" on public.user_suburb_matches;
create policy "Users can read their suburb matches"
on public.user_suburb_matches
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can read their verifications" on public.user_verifications;
create policy "Users can read their verifications"
on public.user_verifications
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can read their AI profile summaries" on public.ai_profile_summaries;
create policy "Users can read their AI profile summaries"
on public.ai_profile_summaries
for select
to authenticated
using (profile_id = auth.uid());

drop policy if exists "Blockers can read their blocks" on public.blocks;
create policy "Blockers can read their blocks"
on public.blocks
for select
to authenticated
using (blocker_id = auth.uid());

drop policy if exists "Users can read their business impressions" on public.business_impressions;
create policy "Users can read their business impressions"
on public.business_impressions
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can read their landing plans" on public.landing_plans;
create policy "Users can read their landing plans"
on public.landing_plans
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can read their landing plan items" on public.landing_plan_items;
create policy "Users can read their landing plan items"
on public.landing_plan_items
for select
to authenticated
using (public."isLandingPlanOwner"(landing_plan_id));

drop policy if exists "Users can read their repeat connection preferences" on public.repeat_connection_preferences;
create policy "Users can read their repeat connection preferences"
on public.repeat_connection_preferences
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Match candidate participants can read" on public.match_candidates;
create policy "Match candidate participants can read"
on public.match_candidates
for select
to authenticated
using (public."isMatchCandidateParticipant"(activation_id, matched_user_id));

revoke all privileges on public.ai_profile_summaries from anon, authenticated;
grant select on public.ai_profile_summaries to authenticated;

revoke all privileges on public.blocks from anon, authenticated;
grant select on public.blocks to authenticated;

revoke all privileges on public.business_impressions from anon, authenticated;
grant select on public.business_impressions to authenticated;

revoke all privileges on public.landing_plan_items from anon, authenticated;
grant select on public.landing_plan_items to authenticated;

revoke all privileges on public.landing_plans from anon, authenticated;
grant select on public.landing_plans to authenticated;

revoke all privileges on public.match_candidates from anon, authenticated;
grant select on public.match_candidates to authenticated;

revoke all privileges on public.repeat_connection_preferences from anon, authenticated;
grant select on public.repeat_connection_preferences to authenticated;

revoke all privileges on public.user_safety_settings from anon, authenticated;
grant select on public.user_safety_settings to authenticated;

revoke all privileges on public.user_social_preferences from anon, authenticated;
grant select on public.user_social_preferences to authenticated;

revoke all privileges on public.user_suburb_matches from anon, authenticated;
grant select on public.user_suburb_matches to authenticated;

revoke all privileges on public.user_verifications from anon, authenticated;
grant select on public.user_verifications to authenticated;
