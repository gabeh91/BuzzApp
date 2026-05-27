import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

import {
  canShowExactLocation,
  createBlockPayload,
  createReportDraft,
} from "../safetyActions";

test("createReportDraft trims report copy and keeps group context", () => {
  const draft = createReportDraft({
    activityGroupId: "group-1",
    category: "unsafe",
    details: "  Kept pushing for a private venue. ",
    reason: "  Unsafe plan  ",
    reporterId: "user-1",
    targetUserId: "user-2",
  });

  assert.deepEqual(draft, {
    activityGroupId: "group-1",
    canSubmit: true,
    category: "unsafe",
    details: "Kept pushing for a private venue.",
    reason: "Unsafe plan",
    reporterId: "user-1",
    status: "draft",
    targetUserId: "user-2",
  });
});

test("createBlockPayload builds a deterministic block action payload", () => {
  assert.deepEqual(
    createBlockPayload({
      activityGroupId: "group-1",
      blockedId: "user-2",
      blockerId: "user-1",
    }),
    {
      activityGroupId: "group-1",
      blockedId: "user-2",
      blockerId: "user-1",
      source: "group",
    },
  );
});

test("canShowExactLocation requires explicit sharing and a confirmed plan", () => {
  assert.equal(canShowExactLocation(false), false);
  assert.equal(canShowExactLocation(true), false);
  assert.equal(canShowExactLocation(true, true), true);
});

const reportSafetyFunctionPath =
  "../../supabase/functions/report-safety/index.ts";
const blockUserFunctionPath = "../../supabase/functions/block-user/index.ts";
const leaveGroupFunctionPath = "../../supabase/functions/leave-group/index.ts";

test("group screen persists safety actions instead of only preparing local placeholders", () => {
  const groupSource = readFileSync(
    "src/features/groups/GroupScreen.tsx",
    "utf8",
  );
  const translationsSource = readFileSync("src/i18n/en.ts", "utf8");

  assert.match(groupSource, /createReportDraft/);
  assert.match(groupSource, /createBlockPayload/);
  assert.match(groupSource, /runReportAction/);
  assert.match(groupSource, /runBlockAction/);
  assert.match(groupSource, /runLeaveGroupAction/);
  assert.match(groupSource, /canShowExactLocation\(false\)/);
  assert.match(groupSource, /LL\.groups\.safety/);
  assert.match(translationsSource, /safety:/);
  assert.match(translationsSource, /report:/);
  assert.match(translationsSource, /block:/);
  assert.match(translationsSource, /reportSubmitted:/);
  assert.match(translationsSource, /blockSaved:/);
  assert.match(translationsSource, /leaveConfirmed:/);
});

test("safety Edge Functions persist reports, blocks, and group exits", () => {
  assert.equal(
    existsSync(reportSafetyFunctionPath),
    true,
    "report-safety Edge Function should exist",
  );
  assert.equal(
    existsSync(blockUserFunctionPath),
    true,
    "block-user Edge Function should exist",
  );
  assert.equal(
    existsSync(leaveGroupFunctionPath),
    true,
    "leave-group Edge Function should exist",
  );

  const reportSource = readFileSync(reportSafetyFunctionPath, "utf8");
  const blockSource = readFileSync(blockUserFunctionPath, "utf8");
  const leaveSource = readFileSync(leaveGroupFunctionPath, "utf8");

  assert.match(reportSource, /resolveCurrentProfile/);
  assert.match(reportSource, /\.from\("reports"\)/);
  assert.match(reportSource, /status:\s*"open"/);
  assert.match(blockSource, /resolveCurrentProfile/);
  assert.match(blockSource, /\.from\("blocks"\)/);
  assert.match(blockSource, /blocked_id/);
  assert.match(leaveSource, /resolveCurrentProfile/);
  assert.match(leaveSource, /\.from\("activity_group_members"\)/);
  assert.match(leaveSource, /\.delete\(\)/);
});
