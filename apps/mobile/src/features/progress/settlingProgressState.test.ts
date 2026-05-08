import assert from "node:assert/strict";
import test from "node:test";

import {
  createInitialSettlingProgressState,
  markAttendanceConfirmed,
  markFeedbackCompleted,
  markGroupJoined,
} from "./settlingProgressState";

test("settling progress state starts with real-world milestones incomplete", () => {
  const state = createInitialSettlingProgressState();

  assert.deepEqual(state, {
    attendanceConfirmed: false,
    feedbackCompleted: false,
    groupJoined: false,
  });
});

test("settling progress state records group, attendance, and feedback milestones without clearing earlier progress", () => {
  const state = markFeedbackCompleted(
    markAttendanceConfirmed(
      markGroupJoined(createInitialSettlingProgressState()),
    ),
  );

  assert.deepEqual(state, {
    attendanceConfirmed: true,
    feedbackCompleted: true,
    groupJoined: true,
  });
});
