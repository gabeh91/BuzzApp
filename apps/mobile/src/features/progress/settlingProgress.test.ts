import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

import { createSettlingProgress } from "./settlingProgress";

const migrationPath =
  "../../supabase/migrations/000017_attendance_starter_admin_backfill.sql";

test("attendance starter admin migration adds progress primitives and admin readable views", () => {
  assert.equal(
    existsSync(migrationPath),
    true,
    "attendance starter admin backfill migration should exist",
  );

  const migrationSource = readFileSync(migrationPath, "utf8");

  assert.match(migrationSource, /alter table public\.activity_group_members/);
  assert.match(
    migrationSource,
    /add column if not exists rsvp_status text not null default 'pending'/,
  );
  assert.match(
    migrationSource,
    /add column if not exists attendance_status text not null default 'unknown'/,
  );
  assert.match(
    migrationSource,
    /add column if not exists attendance_confirmed_at timestamptz/,
  );
  assert.match(migrationSource, /alter table public\.user_reliability/);
  assert.match(
    migrationSource,
    /add column if not exists feedback_count integer not null default 0/,
  );
  assert.match(
    migrationSource,
    /create table if not exists public\.starter_plans/,
  );
  assert.match(
    migrationSource,
    /create table if not exists public\.starter_plan_steps/,
  );
  assert.match(
    migrationSource,
    /create or replace view public\.admin_city_config/,
  );
  assert.match(
    migrationSource,
    /create or replace view public\.admin_safety_reports/,
  );
  assert.match(
    migrationSource,
    /create or replace view public\.admin_attendance_reliability/,
  );
  assert.match(
    migrationSource,
    /create or replace view public\.admin_starter_plans/,
  );
});

test("createSettlingProgress tracks first-city milestones in order", () => {
  const progress = createSettlingProgress({
    attendanceConfirmed: true,
    feedbackCompleted: true,
    groupJoined: true,
    interestActivated: true,
    quizCompleted: true,
    suburbFitViewed: true,
  });

  assert.equal(progress.completedCount, 6);
  assert.equal(progress.totalCount, 6);
  assert.equal(progress.percent, 100);
  assert.equal(progress.nextStep, null);
});

test("createSettlingProgress returns the next incomplete milestone", () => {
  const progress = createSettlingProgress({
    attendanceConfirmed: false,
    feedbackCompleted: false,
    groupJoined: true,
    interestActivated: true,
    quizCompleted: true,
    suburbFitViewed: true,
  });

  assert.equal(progress.percent, 67);
  assert.equal(progress.nextStep?.id, "attendance_confirmed");
});

test("mobile and admin surfaces expose attendance progress and admin visibility", () => {
  const groupSource = readFileSync(
    "src/features/groups/GroupScreen.tsx",
    "utf8",
  );
  const profileSource = readFileSync(
    "src/features/profile/ProfileScreen.tsx",
    "utf8",
  );
  const translationsSource = readFileSync("src/i18n/en.ts", "utf8");
  const adminOperationsSource = readFileSync(
    "../../apps/admin/graphql/operations.graphql",
    "utf8",
  );
  const adminPageSource = readFileSync("../../apps/admin/app/page.tsx", "utf8");

  assert.match(groupSource, /confirmAttendance/);
  assert.match(groupSource, /postPlanSafety/);
  assert.match(groupSource, /LL\.groups\.attendance/);
  assert.match(profileSource, /createSettlingProgress/);
  assert.match(profileSource, /LL\.profile\.settlingProgress/);
  assert.match(translationsSource, /settlingProgress:/);
  assert.match(adminOperationsSource, /citySettingsCollection/);
  assert.match(adminOperationsSource, /reportsCollection/);
  assert.match(adminOperationsSource, /activityGroupsCollection/);
  assert.match(adminOperationsSource, /userReliabilityCollection/);
  assert.match(adminOperationsSource, /starterPlansCollection/);
  assert.match(adminPageSource, /City config/);
  assert.match(adminPageSource, /Reports/);
  assert.match(adminPageSource, /Attendance/);
  assert.match(adminPageSource, /Starter plans/);
});
