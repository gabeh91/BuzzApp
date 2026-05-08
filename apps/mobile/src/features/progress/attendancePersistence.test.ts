import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const recordAttendancePath =
  "../../supabase/functions/record-attendance/index.ts";
const recordFeedbackPath = "../../supabase/functions/record-feedback/index.ts";

test("record-attendance edge function persists attendance and reliability for the current member", () => {
  assert.equal(
    existsSync(recordAttendancePath),
    true,
    "record-attendance Edge Function should exist",
  );

  const source = readFileSync(recordAttendancePath, "utf8");

  assert.match(source, /resolveCurrentProfile/);
  assert.match(source, /activity_group_members/);
  assert.match(source, /attendance_status:\s*"attended"/);
  assert.match(source, /rsvp_status:\s*"confirmed"/);
  assert.match(source, /attendance_confirmed_at/);
  assert.match(source, /user_reliability/);
  assert.match(source, /attended_count/);
});

test("record-feedback edge function persists post-plan feedback and reliability for the current member", () => {
  assert.equal(
    existsSync(recordFeedbackPath),
    true,
    "record-feedback Edge Function should exist",
  );

  const source = readFileSync(recordFeedbackPath, "utf8");

  assert.match(source, /resolveCurrentProfile/);
  assert.match(source, /activity_group_members/);
  assert.match(source, /feedback_completed_at/);
  assert.match(source, /user_reliability/);
  assert.match(source, /feedback_count/);
  assert.match(source, /positive_feedback_count/);
});

test("group screen calls the attendance action instead of only setting local feedback", () => {
  const groupSource = readFileSync(
    "src/features/groups/GroupScreen.tsx",
    "utf8",
  );
  const functionsSource = readFileSync("src/lib/functions.ts", "utf8");

  assert.match(functionsSource, /record-attendance/);
  assert.match(groupSource, /runAttendanceAction/);
  assert.match(groupSource, /confirmAttendance = async/);
});

test("group screen calls the feedback action and marks shared progress instead of only setting local feedback", () => {
  const groupSource = readFileSync(
    "src/features/groups/GroupScreen.tsx",
    "utf8",
  );
  const homeSource = readFileSync("src/features/home/HomeScreen.tsx", "utf8");
  const functionsSource = readFileSync("src/lib/functions.ts", "utf8");

  assert.match(functionsSource, /record-feedback/);
  assert.match(groupSource, /runFeedbackAction/);
  assert.match(groupSource, /markFeedbackCompleted/);
  assert.match(homeSource, /useSettlingProgressState/);
  assert.doesNotMatch(homeSource, /attendanceConfirmed:\s*false/);
  assert.doesNotMatch(homeSource, /feedbackCompleted:\s*false/);
});
