import assert from "node:assert/strict";
import test from "node:test";

import { normalizeReliabilitySummary } from "../reliabilitySummary";

test("normalizeReliabilitySummary exposes streaks and attendance rate for profile UI", () => {
  const summary = normalizeReliabilitySummary({
    attended_count: 3,
    attended_plan_streak: 2,
    check_in_streak: 4,
    feedback_count: 4,
    no_show_count: 1,
    positive_feedback_count: 3,
    reliable_plan_streak: 2,
  });

  assert.equal(summary.attendedCount, 3);
  assert.equal(summary.attendedPlanStreak, 2);
  assert.equal(summary.checkInStreak, 4);
  assert.equal(summary.reliablePlanStreak, 2);
  assert.equal(summary.attendanceRate, 0.75);
  assert.equal(summary.hasActivityHistory, true);
});

test("normalizeReliabilitySummary keeps empty reliability data calm", () => {
  const summary = normalizeReliabilitySummary(null);

  assert.equal(summary.attendedPlanStreak, 0);
  assert.equal(summary.checkInStreak, 0);
  assert.equal(summary.reliablePlanStreak, 0);
  assert.equal(summary.attendanceRate, null);
  assert.equal(summary.hasActivityHistory, false);
});
