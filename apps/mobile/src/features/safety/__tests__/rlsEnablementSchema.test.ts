import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const migrationPath =
  "../../supabase/migrations/000038_rls_public_and_group_messages.sql";
const grantHardeningMigrationPath =
  "../../supabase/migrations/000039_rls_first_slice_grant_hardening.sql";
const userPrivateMigrationPath =
  "../../supabase/migrations/000040_rls_user_private_tables.sql";
const safetyAdminMigrationPath =
  "../../supabase/migrations/000041_rls_safety_admin_tables.sql";
const remainingRlsMigrationPath =
  "../../supabase/migrations/000042_rls_invites_and_checkins.sql";

test("RLS enablement migration protects public reference data and group messages", () => {
  assert.equal(
    existsSync(migrationPath),
    true,
    "expected first RLS enablement migration to exist",
  );

  const source = readFileSync(migrationPath, "utf8");

  for (const table of [
    "cities",
    "suburbs",
    "suburb_tags",
    "city_interests",
    "city_settings",
    "city_feature_flags",
    "feature_flags",
    "business_categories",
    "events",
    "event_interests",
    "activity_groups",
    "activity_group_members",
    "activity_plans",
    "group_messages",
  ]) {
    assert.match(
      source,
      new RegExp(
        `alter table public\\.${table}\\s+enable row level security`,
        "i",
      ),
      `${table} should have RLS enabled`,
    );
  }

  assert.match(source, /create policy "Public cities are readable"/);
  assert.match(
    source,
    /create policy "Activity group members can read their groups"/,
  );
  assert.match(
    source,
    /create policy "Activity group members can read messages"/,
  );
  assert.match(source, /create or replace function public\."sendGroupMessage"/);
  assert.match(source, /security definer/);
  assert.match(
    source,
    /exists \(\s*select 1\s*from public\.activity_group_members/,
  );
  assert.match(
    source,
    /revoke all on function public\."sendGroupMessage"\(uuid, text, text\) from public/,
  );
  assert.match(
    source,
    /grant execute on function public\."sendGroupMessage"\(uuid, text, text\) to authenticated/,
  );
  assert.match(
    source,
    /revoke insert, update, delete on public\.group_messages from anon, authenticated/,
  );
});

test("first RLS slice removes broad direct grants after policies are installed", () => {
  assert.equal(
    existsSync(grantHardeningMigrationPath),
    true,
    "expected first RLS grant hardening migration to exist",
  );

  const source = readFileSync(grantHardeningMigrationPath, "utf8");

  for (const table of [
    "cities",
    "suburbs",
    "suburb_tags",
    "interests",
    "city_interests",
    "city_settings",
    "city_feature_flags",
    "feature_flags",
    "business_categories",
    "businesses",
    "events",
    "event_interests",
    "activity_groups",
    "activity_group_members",
    "activity_plans",
    "group_messages",
  ]) {
    assert.match(
      source,
      new RegExp(
        `revoke all privileges on public\\.${table} from anon, authenticated`,
        "i",
      ),
      `${table} should remove broad anon/authenticated grants`,
    );
    assert.match(
      source,
      new RegExp(
        `grant select on public\\.${table} to anon, authenticated`,
        "i",
      ),
      `${table} should restore only select access for policy-gated reads`,
    );
  }

  assert.doesNotMatch(
    source,
    /grant insert on public\.group_messages to authenticated/,
  );
});

test("user private RLS migration protects owner-only and participant-only tables", () => {
  assert.equal(
    existsSync(userPrivateMigrationPath),
    true,
    "expected user private RLS migration to exist",
  );

  const source = readFileSync(userPrivateMigrationPath, "utf8");

  for (const table of [
    "ai_profile_summaries",
    "blocks",
    "business_impressions",
    "landing_plan_items",
    "landing_plans",
    "match_candidates",
    "repeat_connection_preferences",
    "user_safety_settings",
    "user_social_preferences",
    "user_suburb_matches",
    "user_verifications",
  ]) {
    assert.match(
      source,
      new RegExp(
        `alter table public\\.${table}\\s+enable row level security`,
        "i",
      ),
      `${table} should have RLS enabled`,
    );
    assert.match(
      source,
      new RegExp(
        `revoke all privileges on public\\.${table} from anon, authenticated`,
        "i",
      ),
      `${table} should remove broad anon/authenticated grants`,
    );
  }

  assert.match(source, /create policy "Users can read their safety settings"/);
  assert.match(
    source,
    /create policy "Users can read their social preferences"/,
  );
  assert.match(source, /create policy "Users can read their suburb matches"/);
  assert.match(source, /create policy "Users can read their verifications"/);
  assert.match(
    source,
    /create policy "Users can read their AI profile summaries"/,
  );
  assert.match(source, /create policy "Blockers can read their blocks"/);
  assert.match(
    source,
    /create policy "Users can read their business impressions"/,
  );
  assert.match(source, /create policy "Users can read their landing plans"/);
  assert.match(
    source,
    /create policy "Users can read their landing plan items"/,
  );
  assert.match(
    source,
    /create policy "Users can read their repeat connection preferences"/,
  );
  assert.match(source, /create policy "Match candidate participants can read"/);
  assert.match(
    source,
    /create or replace function public\."isLandingPlanOwner"/,
  );
  assert.match(
    source,
    /create or replace function public\."isMatchCandidateParticipant"/,
  );
  assert.match(source, /grant select on public\.blocks to authenticated/);
  assert.doesNotMatch(source, /grant select on public\.blocks to anon/);
});

test("safety admin RLS migration protects review queues and public safety reference data", () => {
  assert.equal(
    existsSync(safetyAdminMigrationPath),
    true,
    "expected safety/admin RLS migration to exist",
  );

  const source = readFileSync(safetyAdminMigrationPath, "utf8");

  for (const table of [
    "activity_risk_levels",
    "business_leads",
    "moderation_actions",
    "plan_recipes",
    "plan_safety_checks",
    "reports",
    "starter_plan_steps",
    "starter_plans",
    "user_reliability",
  ]) {
    assert.match(
      source,
      new RegExp(
        `alter table public\\.${table}\\s+enable row level security`,
        "i",
      ),
      `${table} should have RLS enabled`,
    );
    assert.match(
      source,
      new RegExp(
        `revoke all privileges on public\\.${table} from anon, authenticated`,
        "i",
      ),
      `${table} should remove broad anon/authenticated grants`,
    );
  }

  assert.match(source, /create policy "Reports are readable by involved users"/);
  assert.match(
    source,
    /create policy "Moderation actions are readable by involved users"/,
  );
  assert.match(source, /create policy "Users can read their reliability"/);
  assert.match(
    source,
    /create policy "Activity group members can read plan safety checks"/,
  );
  assert.match(
    source,
    /create policy "Public activity risk levels are readable"/,
  );
  assert.match(source, /create policy "Public plan recipes are readable"/);
  assert.match(source, /create policy "Public starter plans are readable"/);
  assert.match(
    source,
    /create policy "Public starter plan steps are readable"/,
  );
  assert.match(source, /public\."isActivityGroupMember"\(activity_group_id\)/);
  assert.match(source, /grant select on public\.reports to authenticated/);
  assert.match(
    source,
    /grant select on public\.moderation_actions to authenticated/,
  );
  assert.match(source, /grant select on public\.user_reliability to authenticated/);
  assert.match(
    source,
    /grant select on public\.plan_safety_checks to authenticated/,
  );
  assert.match(
    source,
    /grant select on public\.activity_risk_levels to anon, authenticated/,
  );
  assert.match(source, /grant select on public\.plan_recipes to anon, authenticated/);
  assert.match(source, /grant select on public\.starter_plans to anon, authenticated/);
  assert.match(
    source,
    /grant select on public\.starter_plan_steps to anon, authenticated/,
  );
  assert.doesNotMatch(source, /grant select on public\.business_leads/);
  assert.doesNotMatch(source, /grant select on public\.reports to anon/);
});

test("remaining RLS migration protects invites and check-ins", () => {
  assert.equal(
    existsSync(remainingRlsMigrationPath),
    true,
    "expected remaining RLS migration to exist",
  );

  const source = readFileSync(remainingRlsMigrationPath, "utf8");

  for (const table of [
    "activity_group_checkins",
    "group_invite_events",
    "group_invites",
  ]) {
    assert.match(
      source,
      new RegExp(
        `alter table public\\.${table}\\s+enable row level security`,
        "i",
      ),
      `${table} should have RLS enabled`,
    );
    assert.match(
      source,
      new RegExp(
        `revoke all privileges on public\\.${table} from anon, authenticated`,
        "i",
      ),
      `${table} should remove broad anon/authenticated grants`,
    );
  }

  assert.match(source, /create policy "Users can read their group invites"/);
  assert.match(
    source,
    /create policy "Group members can read invite events"/,
  );
  assert.match(source, /create policy "Users can read their check-ins"/);
  assert.match(source, /public\."isActivityGroupMember"\(activity_group_id\)/);
  assert.match(source, /grant select on public\.group_invites to authenticated/);
  assert.match(
    source,
    /grant select on public\.group_invite_events to authenticated/,
  );
  assert.match(
    source,
    /grant select on public\.activity_group_checkins to authenticated/,
  );
  assert.doesNotMatch(source, /grant insert on public\.group_invites/);
  assert.doesNotMatch(source, /grant update on public\.activity_group_checkins/);
});
