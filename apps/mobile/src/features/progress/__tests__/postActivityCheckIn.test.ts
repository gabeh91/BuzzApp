import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

import {
  findNextPostActivityCheckIn,
  getPostActivityCheckInExpiryDays,
  getPostActivityCheckInSnoozeHours,
  postActivityCheckInDelayMs,
  type PostActivityCheckInCandidate,
} from "../postActivityCheckIn";

const createCandidate = (
  patch: Partial<PostActivityCheckInCandidate>,
): PostActivityCheckInCandidate => ({
  activityGroupId: "group-1",
  attendanceConfirmedAt: null,
  attendanceStatus: "unknown",
  feedbackCompletedAt: null,
  groupCreatedAt: "2026-05-01T10:00:00.000Z",
  groupTitle: "Coffee in Carlton",
  interestName: "Coffee",
  planStartsAt: "2026-05-10T10:00:00.000Z",
  ...patch,
});

test("post-activity check-in waits until the configured delay after a plan before prompting", () => {
  const now = new Date("2026-05-13T11:00:00.000Z");
  const delayMs = postActivityCheckInDelayMs(2);
  const candidates = [
    createCandidate({
      activityGroupId: "already-done",
      feedbackCompletedAt: "2026-05-12T12:00:00.000Z",
      planStartsAt: "2026-05-09T10:00:00.000Z",
    }),
    createCandidate({
      activityGroupId: "not-ready",
      planStartsAt: "2026-05-12T10:00:00.000Z",
    }),
    createCandidate({
      activityGroupId: "ready",
      planStartsAt: "2026-05-10T10:00:00.000Z",
    }),
  ];

  assert.equal(
    findNextPostActivityCheckIn(candidates, now, delayMs)?.activityGroupId,
    "ready",
  );
});

test("post-activity check-in falls back to group creation date when no plan time exists", () => {
  const now = new Date("2026-05-13T11:00:00.000Z");
  const delayMs = postActivityCheckInDelayMs(2);
  const candidate = createCandidate({
    activityGroupId: "created-only",
    groupCreatedAt: "2026-05-10T09:00:00.000Z",
    planStartsAt: null,
  });

  assert.equal(
    findNextPostActivityCheckIn([candidate], now, delayMs)?.activityGroupId,
    "created-only",
  );
});

test("post-activity check-in expires stale plans and respects local snoozes", () => {
  const now = new Date("2026-05-30T11:00:00.000Z");
  const delayMs = postActivityCheckInDelayMs(2);
  const expiryMs = postActivityCheckInDelayMs(14);
  const candidates = [
    createCandidate({
      activityGroupId: "expired",
      planStartsAt: "2026-05-01T10:00:00.000Z",
    }),
    createCandidate({
      activityGroupId: "snoozed",
      planStartsAt: "2026-05-25T10:00:00.000Z",
    }),
    createCandidate({
      activityGroupId: "ready",
      planStartsAt: "2026-05-26T10:00:00.000Z",
    }),
  ];

  assert.equal(
    findNextPostActivityCheckIn(candidates, now, delayMs, expiryMs, {
      snoozed: "2026-05-31T10:00:00.000Z",
    })?.activityGroupId,
    "ready",
  );
});

test("post-activity check-in lifecycle timing can be configured by environment", () => {
  assert.equal(
    getPostActivityCheckInExpiryDays({
      EXPO_PUBLIC_POST_ACTIVITY_CHECKIN_EXPIRY_DAYS: "10",
    }),
    10,
  );
  assert.equal(
    getPostActivityCheckInSnoozeHours({
      EXPO_PUBLIC_POST_ACTIVITY_CHECKIN_SNOOZE_HOURS: "12",
    }),
    12,
  );
});

test("post-activity check-in dismissals are persisted so reloads do not nag", () => {
  const promptSource = readFileSync(
    "src/features/progress/PostActivityCheckInPrompt.tsx",
    "utf8",
  );
  const dismissalStoreSource = readFileSync(
    "src/features/progress/postActivityCheckInDismissals.ts",
    "utf8",
  );

  assert.match(promptSource, /createPostActivityCheckInDismissalStore/);
  assert.match(promptSource, /snoozeActive/);
  assert.match(dismissalStoreSource, /postActivityCheckInDismissalsStorageKey/);
  assert.match(dismissalStoreSource, /prunePostActivityCheckInDismissals/);
});

test("post-activity check-in is rendered globally instead of as a group detail attendance section", () => {
  const appProvidersSource = readFileSync("src/providers/AppProviders.tsx", "utf8");
  const groupSource = readFileSync("src/features/groups/GroupScreen.tsx", "utf8");
  const promptPath = "src/features/progress/PostActivityCheckInPrompt.tsx";

  assert.equal(existsSync(promptPath), true);
  assert.match(appProvidersSource, /PostActivityCheckInPrompt/);
  assert.doesNotMatch(groupSource, /\|\s*\{\s*type:\s*"attendance"\s*\}/);
  assert.doesNotMatch(groupSource, /LL\.groups\.attendance\.title/);
});

test("post-activity check-in prompt owns attendance and feedback submission", () => {
  const promptSource = readFileSync(
    "src/features/progress/PostActivityCheckInPrompt.tsx",
    "utf8",
  );
  const functionsSource = readFileSync("src/lib/functions.ts", "utf8");
  const feedbackSource = readFileSync(
    "../../supabase/functions/record-feedback/index.ts",
    "utf8",
  );

  assert.match(promptSource, /runAttendanceAction/);
  assert.match(promptSource, /runFeedbackAction/);
  assert.match(promptSource, /userAttended/);
  assert.match(functionsSource, /userAttended/);
  assert.match(feedbackSource, /did_happen:\s*userAttended/);
  assert.match(feedbackSource, /attendance_status:\s*userAttended \? "attended" : "missed"/);
});
