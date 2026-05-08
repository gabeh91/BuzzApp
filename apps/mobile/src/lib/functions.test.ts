import assert from "node:assert/strict";
import test from "node:test";

import {
  createAttendanceActionRequest,
  createFeedbackActionRequest,
  runAttendanceAction,
  runFeedbackAction,
} from "./functions";

test("createAttendanceActionRequest targets record-attendance with local-only bypass headers", () => {
  const request = createAttendanceActionRequest({
    activityGroupId: "00000000-0000-0000-0000-000000000701",
    appEnv: "local",
    profileId: "00000000-0000-0000-0000-000000000101",
    supabaseAnonKey: "anon-key",
    supabaseUrl: "http://localhost:54321",
  });

  assert.equal(
    request.url,
    "http://localhost:54321/functions/v1/record-attendance",
  );
  assert.equal(request.init.method, "POST");
  assert.deepEqual(JSON.parse(String(request.init.body)), {
    activityGroupId: "00000000-0000-0000-0000-000000000701",
  });
  assert.equal(
    (request.init.headers as Record<string, string>).apikey,
    "anon-key",
  );
  assert.equal(
    (request.init.headers as Record<string, string>)["x-buzz-local-bypass"],
    "true",
  );
  assert.equal(
    (request.init.headers as Record<string, string>)["x-buzz-profile-id"],
    "00000000-0000-0000-0000-000000000101",
  );
});

test("runAttendanceAction returns persisted attendance status", async () => {
  const result = await runAttendanceAction(
    {
      activityGroupId: "00000000-0000-0000-0000-000000000701",
      appEnv: "local",
      profileId: "00000000-0000-0000-0000-000000000101",
      supabaseAnonKey: "anon-key",
      supabaseUrl: "http://localhost:54321",
    },
    async () =>
      new Response(
        JSON.stringify({
          ok: true,
          activityGroupId: "00000000-0000-0000-0000-000000000701",
          attendanceStatus: "attended",
          rsvpStatus: "confirmed",
        }),
        { status: 200 },
      ),
  );

  assert.deepEqual(result, {
    ok: true,
    activityGroupId: "00000000-0000-0000-0000-000000000701",
    attendanceStatus: "attended",
    rsvpStatus: "confirmed",
  });
});

test("createFeedbackActionRequest targets record-feedback with local-only bypass headers", () => {
  const request = createFeedbackActionRequest({
    activityGroupId: "00000000-0000-0000-0000-000000000701",
    appEnv: "local",
    feltSafe: true,
    profileId: "00000000-0000-0000-0000-000000000101",
    supabaseAnonKey: "anon-key",
    supabaseUrl: "http://localhost:54321",
  });

  assert.equal(
    request.url,
    "http://localhost:54321/functions/v1/record-feedback",
  );
  assert.equal(request.init.method, "POST");
  assert.deepEqual(JSON.parse(String(request.init.body)), {
    activityGroupId: "00000000-0000-0000-0000-000000000701",
    feltSafe: true,
  });
  assert.equal(
    (request.init.headers as Record<string, string>).apikey,
    "anon-key",
  );
  assert.equal(
    (request.init.headers as Record<string, string>)["x-buzz-local-bypass"],
    "true",
  );
  assert.equal(
    (request.init.headers as Record<string, string>)["x-buzz-profile-id"],
    "00000000-0000-0000-0000-000000000101",
  );
});

test("runFeedbackAction returns persisted feedback status", async () => {
  const result = await runFeedbackAction(
    {
      activityGroupId: "00000000-0000-0000-0000-000000000701",
      appEnv: "local",
      feltSafe: true,
      profileId: "00000000-0000-0000-0000-000000000101",
      supabaseAnonKey: "anon-key",
      supabaseUrl: "http://localhost:54321",
    },
    async () =>
      new Response(
        JSON.stringify({
          ok: true,
          activityGroupId: "00000000-0000-0000-0000-000000000701",
          feedbackStatus: "completed",
          positiveFeedbackRecorded: true,
        }),
        { status: 200 },
      ),
  );

  assert.deepEqual(result, {
    ok: true,
    activityGroupId: "00000000-0000-0000-0000-000000000701",
    feedbackStatus: "completed",
    positiveFeedbackRecorded: true,
  });
});
