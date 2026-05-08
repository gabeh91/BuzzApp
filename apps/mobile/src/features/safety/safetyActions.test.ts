import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { canShowExactLocation, createBlockPayload, createReportDraft } from "./safetyActions";

test("createReportDraft trims report copy and keeps group context", () => {
  const draft = createReportDraft({
    activityGroupId: "group-1",
    category: "unsafe",
    details: "  Kept pushing for a private venue. ",
    reason: "  Unsafe plan  ",
    reporterId: "user-1",
    targetUserId: "user-2"
  });

  assert.deepEqual(draft, {
    activityGroupId: "group-1",
    canSubmit: true,
    category: "unsafe",
    details: "Kept pushing for a private venue.",
    reason: "Unsafe plan",
    reporterId: "user-1",
    status: "draft",
    targetUserId: "user-2"
  });
});

test("createBlockPayload builds a deterministic block action payload", () => {
  assert.deepEqual(
    createBlockPayload({
      activityGroupId: "group-1",
      blockedId: "user-2",
      blockerId: "user-1"
    }),
    {
      activityGroupId: "group-1",
      blockedId: "user-2",
      blockerId: "user-1",
      source: "group"
    }
  );
});

test("canShowExactLocation requires explicit sharing and a confirmed plan", () => {
  assert.equal(canShowExactLocation(false), false);
  assert.equal(canShowExactLocation(true), false);
  assert.equal(canShowExactLocation(true, true), true);
});

test("group screen exposes safety action placeholders", () => {
  const groupSource = readFileSync("src/features/groups/GroupScreen.tsx", "utf8");
  const translationsSource = readFileSync("src/i18n/en.ts", "utf8");

  assert.match(groupSource, /createReportDraft/);
  assert.match(groupSource, /createBlockPayload/);
  assert.match(groupSource, /canShowExactLocation\(false\)/);
  assert.match(groupSource, /LL\.groups\.safety/);
  assert.match(translationsSource, /safety:/);
  assert.match(translationsSource, /report:/);
  assert.match(translationsSource, /block:/);
});
