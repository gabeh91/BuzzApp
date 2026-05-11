import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

import {
  createGroupInviteLink,
  createInviteDraft,
  normalizeInviteToken,
} from "./inviteModel";

const migrationPath = "../../supabase/migrations/000016_invites_backfill.sql";
const inviteCapacityAnalyticsPath =
  "../../supabase/migrations/000020_invite_capacity_analytics.sql";

test("invite migration and Edge Functions add contextual group invite tokens", () => {
  assert.equal(
    existsSync(migrationPath),
    true,
    "invites backfill migration should exist",
  );

  const migrationSource = readFileSync(migrationPath, "utf8");
  const createInviteSource = readFileSync(
    "../../supabase/functions/create-invite/index.ts",
    "utf8",
  );
  const resolveInviteSource = readFileSync(
    "../../supabase/functions/resolve-invite/index.ts",
    "utf8",
  );
  const acceptInviteSource = readFileSync(
    "../../supabase/functions/accept-invite/index.ts",
    "utf8",
  );

  assert.match(
    migrationSource,
    /create table if not exists public\.group_invites/,
  );
  assert.match(migrationSource, /token_hash text not null unique/);
  assert.match(
    migrationSource,
    /activity_group_id uuid not null references public\.activity_groups\(id\)/,
  );
  assert.match(
    migrationSource,
    /activity_plan_id uuid references public\.activity_plans\(id\)/,
  );
  assert.match(migrationSource, /max_uses integer not null default 1/);
  assert.match(migrationSource, /status text not null default 'active'/);
  assert.match(
    migrationSource,
    /create index if not exists group_invites_group_status_idx/,
  );
  assert.match(createInviteSource, /group_invites/);
  assert.match(createInviteSource, /crypto\.randomUUID/);
  assert.match(resolveInviteSource, /group_invites/);
  assert.match(resolveInviteSource, /expires_at/);
  assert.match(acceptInviteSource, /activity_group_members/);
  assert.match(acceptInviteSource, /use_count/);
});

test("invite acceptance checks group capacity and records lightweight invite analytics", () => {
  assert.equal(
    existsSync(inviteCapacityAnalyticsPath),
    true,
    "invite capacity and analytics migration should exist",
  );

  const migrationSource = readFileSync(inviteCapacityAnalyticsPath, "utf8");
  const createInviteSource = readFileSync(
    "../../supabase/functions/create-invite/index.ts",
    "utf8",
  );
  const resolveInviteSource = readFileSync(
    "../../supabase/functions/resolve-invite/index.ts",
    "utf8",
  );
  const acceptInviteSource = readFileSync(
    "../../supabase/functions/accept-invite/index.ts",
    "utf8",
  );

  assert.match(
    migrationSource,
    /create unique index if not exists activity_group_members_group_user_unique/,
  );
  assert.match(
    migrationSource,
    /create table if not exists public\.group_invite_events/,
  );
  assert.match(migrationSource, /event_type text not null/);
  assert.match(createInviteSource, /\.from\("group_invite_events"\)/);
  assert.match(createInviteSource, /event_type:\s*"created"/);
  assert.match(resolveInviteSource, /\.from\("group_invite_events"\)/);
  assert.match(resolveInviteSource, /event_type:\s*"resolved"/);
  assert.match(acceptInviteSource, /capacity_max/);
  assert.match(acceptInviteSource, /count:\s*"exact"/);
  assert.match(acceptInviteSource, /Group is full/);
  assert.match(acceptInviteSource, /\.from\("group_invite_events"\)/);
  assert.match(acceptInviteSource, /recordInviteEvent\("accepted"/);
  assert.match(acceptInviteSource, /recordInviteEvent\("rejected_full"/);
});

test("invite model builds safe group invite drafts and deep links", () => {
  const draft = createInviteDraft({
    activityGroupId: "group-1",
    activityPlanId: "plan-1",
    inviterId: "user-1",
  });

  assert.deepEqual(draft, {
    activityGroupId: "group-1",
    activityPlanId: "plan-1",
    contextType: "group",
    expiresInHours: 72,
    inviterId: "user-1",
    maxUses: 1,
  });
  assert.equal(
    createGroupInviteLink({ origin: "https://buzz.test/", token: "abc 123" }),
    "https://buzz.test/join/group/abc%20123",
  );
  assert.equal(normalizeInviteToken("  ABC-123  "), "ABC-123");
});

test("mobile exposes a join route and group invite action", () => {
  assert.equal(existsSync("app/join/group/[token].tsx"), true);

  const routeSource = readFileSync("app/join/group/[token].tsx", "utf8");
  const groupSource = readFileSync(
    "src/features/groups/GroupScreen.tsx",
    "utf8",
  );
  const translationsSource = readFileSync("src/i18n/en.ts", "utf8");

  assert.match(routeSource, /normalizeInviteToken/);
  assert.match(routeSource, /useLocalSearchParams/);
  assert.match(routeSource, /runResolveInviteAction/);
  assert.match(routeSource, /runAcceptInviteAction/);
  assert.match(groupSource, /createInviteDraft/);
  assert.match(groupSource, /createGroupInviteLink/);
  assert.match(groupSource, /runCreateInviteAction/);
  assert.match(groupSource, /Share\.share/);
  assert.match(groupSource, /LL\.groups\.invites/);
  assert.match(translationsSource, /invites:/);
  assert.match(translationsSource, /bringFriend:/);
});
