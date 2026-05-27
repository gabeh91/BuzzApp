import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const recordAttendancePath =
  "../../supabase/functions/record-attendance/index.ts";
const recordFeedbackPath = "../../supabase/functions/record-feedback/index.ts";
const checkinMigrationPath =
  "../../supabase/migrations/000021_post_activity_checkins.sql";
const reliabilityEventsMigrationPath =
  "../../supabase/migrations/000045_reliability_events_and_streaks.sql";

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

test("post-activity check-ins persist felt-safe and meet-again signals", () => {
  assert.equal(
    existsSync(checkinMigrationPath),
    true,
    "post-activity check-in migration should exist",
  );

  const migrationSource = readFileSync(checkinMigrationPath, "utf8");
  const feedbackSource = readFileSync(recordFeedbackPath, "utf8");

  assert.match(
    migrationSource,
    /create table if not exists public\.activity_group_checkins/,
  );
  assert.match(migrationSource, /felt_safe boolean not null/);
  assert.match(migrationSource, /would_meet_again boolean not null/);
  assert.match(
    migrationSource,
    /create unique index if not exists activity_group_checkins_group_user_unique/,
  );
  assert.match(feedbackSource, /activity_group_checkins/);
  assert.match(feedbackSource, /felt_safe/);
  assert.match(feedbackSource, /would_meet_again/);
});

test("reliability ledger migration adds auditable events and streak counters", () => {
  assert.equal(
    existsSync(reliabilityEventsMigrationPath),
    true,
    "reliability event ledger migration should exist",
  );

  const migrationSource = readFileSync(reliabilityEventsMigrationPath, "utf8");

  assert.match(
    migrationSource,
    /create table if not exists public\.user_reliability_events/,
  );
  assert.match(migrationSource, /event_type text not null/);
  assert.match(migrationSource, /activity_group_id uuid references public\.activity_groups/);
  assert.match(migrationSource, /metadata_json jsonb not null default '\{\}'::jsonb/);
  assert.match(migrationSource, /add column if not exists check_in_streak integer not null default 0/);
  assert.match(migrationSource, /add column if not exists attended_plan_streak integer not null default 0/);
  assert.match(migrationSource, /add column if not exists reliable_plan_streak integer not null default 0/);
  assert.match(migrationSource, /create unique index if not exists user_reliability_events_idempotency_unique/);
  assert.match(migrationSource, /grant select on public\.user_reliability_events to authenticated/);
});

test("attendance and check-in edge functions write reliability events and streak counters idempotently", () => {
  const attendanceSource = readFileSync(recordAttendancePath, "utf8");
  const feedbackSource = readFileSync(recordFeedbackPath, "utf8");

  assert.match(attendanceSource, /user_reliability_events/);
  assert.match(attendanceSource, /event_type:\s*"attended_plan"/);
  assert.match(attendanceSource, /attended_plan_streak/);
  assert.match(attendanceSource, /onConflict:\s*"idempotency_key"/);

  assert.match(feedbackSource, /user_reliability_events/);
  assert.match(feedbackSource, /event_type:\s*"checked_in"/);
  assert.match(feedbackSource, /event_type:\s*userAttended \? "positive_feedback" : "missed_plan"/);
  assert.match(feedbackSource, /check_in_streak/);
  assert.match(feedbackSource, /reliable_plan_streak/);
  assert.match(feedbackSource, /onConflict:\s*"idempotency_key"/);
});

test("post-activity check-in prompt calls the attendance action instead of only setting local feedback", () => {
  const promptSource = readFileSync(
    "src/features/progress/PostActivityCheckInPrompt.tsx",
    "utf8",
  );
  const functionsSource = readFileSync("src/lib/functions.ts", "utf8");

  assert.match(functionsSource, /record-attendance/);
  assert.match(promptSource, /runAttendanceAction/);
  assert.match(promptSource, /submitCheckIn/);
});

test("post-activity check-in prompt calls the feedback action and marks shared progress instead of only setting local feedback", () => {
  const promptSource = readFileSync(
    "src/features/progress/PostActivityCheckInPrompt.tsx",
    "utf8",
  );
  const functionsSource = readFileSync("src/lib/functions.ts", "utf8");

  assert.match(functionsSource, /record-feedback/);
  assert.match(promptSource, /runFeedbackAction/);
  assert.match(promptSource, /wouldMeetAgain/);
  assert.match(promptSource, /markFeedbackCompleted/);
  assert.match(promptSource, /LL\.postActivityCheckIn/);
  assert.match(promptSource, /useSettlingProgressState/);
  assert.doesNotMatch(promptSource, /attendanceConfirmed:\s*false/);
  assert.doesNotMatch(promptSource, /feedbackCompleted:\s*false/);
});
