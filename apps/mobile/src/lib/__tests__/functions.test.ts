import assert from "node:assert/strict";
import test from "node:test";

import {
  createAttendanceActionRequest,
  createAcceptInviteActionRequest,
  createBlockActionRequest,
  createInviteActionRequest,
  createFeedbackActionRequest,
  createLeaveGroupActionRequest,
  createReportActionRequest,
  createResolveInviteActionRequest,
  createSettledActionRequest,
  runAcceptInviteAction,
  runAttendanceAction,
  runBlockAction,
  runCreateInviteAction,
  runFeedbackAction,
  runLeaveGroupAction,
  runReportAction,
  runResolveInviteAction,
  runSettledAction,
} from "../functions";

test("createInviteActionRequest targets create-invite with local-only bypass headers", () => {
  const request = createInviteActionRequest({
    activityGroupId: "00000000-0000-0000-0000-000000000701",
    appEnv: "local",
    profileId: "00000000-0000-0000-0000-000000000101",
    supabaseAnonKey: "anon-key",
    supabaseUrl: "http://localhost:54321",
  });

  assert.equal(
    request.url,
    "http://localhost:54321/functions/v1/create-invite",
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

test("runCreateInviteAction returns a shareable token", async () => {
  const result = await runCreateInviteAction(
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
          inviteId: "invite-1",
          token: "token-123",
          tokenPreview: "token-12",
          expiresAt: "2026-05-14T00:00:00.000Z",
        }),
      ),
  );

  assert.deepEqual(result, {
    ok: true,
    inviteId: "invite-1",
    token: "token-123",
    tokenPreview: "token-12",
    expiresAt: "2026-05-14T00:00:00.000Z",
  });
});

test("resolve and accept invite requests preserve invite tokens through the backend", () => {
  const resolveRequest = createResolveInviteActionRequest({
    token: "token-123",
    supabaseAnonKey: "anon-key",
    supabaseUrl: "http://localhost:54321",
  });
  const acceptRequest = createAcceptInviteActionRequest({
    appEnv: "local",
    profileId: "00000000-0000-0000-0000-000000000102",
    supabaseAnonKey: "anon-key",
    supabaseUrl: "http://localhost:54321",
    token: "token-123",
  });

  assert.equal(
    resolveRequest.url,
    "http://localhost:54321/functions/v1/resolve-invite",
  );
  assert.deepEqual(JSON.parse(String(resolveRequest.init.body)), {
    token: "token-123",
  });
  assert.equal(
    acceptRequest.url,
    "http://localhost:54321/functions/v1/accept-invite",
  );
  assert.deepEqual(JSON.parse(String(acceptRequest.init.body)), {
    token: "token-123",
  });
  assert.equal(
    (acceptRequest.init.headers as Record<string, string>)[
      "x-buzz-local-bypass"
    ],
    "true",
  );
});

test("runResolveInviteAction and runAcceptInviteAction return invite group context", async () => {
  const resolved = await runResolveInviteAction(
    {
      supabaseUrl: "http://localhost:54321",
      token: "token-123",
    },
    async () =>
      new Response(
        JSON.stringify({
          ok: true,
          inviteId: "invite-1",
          activityGroupId: "group-1",
          inviterId: "user-1",
          status: "active",
          expiresAt: "2026-05-14T00:00:00.000Z",
        }),
      ),
  );
  const accepted = await runAcceptInviteAction(
    {
      appEnv: "local",
      profileId: "00000000-0000-0000-0000-000000000102",
      supabaseUrl: "http://localhost:54321",
      token: "token-123",
    },
    async () =>
      new Response(
        JSON.stringify({
          ok: true,
          inviteId: "invite-1",
          activityGroupId: "group-1",
          status: "accepted",
        }),
      ),
  );

  assert.deepEqual(resolved, {
    ok: true,
    inviteId: "invite-1",
    activityGroupId: "group-1",
    inviterId: "user-1",
    status: "active",
    expiresAt: "2026-05-14T00:00:00.000Z",
  });
  assert.deepEqual(accepted, {
    ok: true,
    inviteId: "invite-1",
    activityGroupId: "group-1",
    status: "accepted",
  });
});

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
    wouldMeetAgain: false,
  });

  assert.equal(
    request.url,
    "http://localhost:54321/functions/v1/record-feedback",
  );
  assert.equal(request.init.method, "POST");
  assert.deepEqual(JSON.parse(String(request.init.body)), {
    activityGroupId: "00000000-0000-0000-0000-000000000701",
    feltSafe: true,
    userAttended: true,
    wouldMeetAgain: false,
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
          wouldMeetAgain: true,
        }),
        { status: 200 },
      ),
  );

  assert.deepEqual(result, {
    ok: true,
    activityGroupId: "00000000-0000-0000-0000-000000000701",
    feedbackStatus: "completed",
    positiveFeedbackRecorded: true,
    wouldMeetAgain: true,
  });
});

test("createSettledActionRequest targets update-profile-settled with local-only bypass headers", () => {
  const request = createSettledActionRequest({
    appEnv: "local",
    profileId: "00000000-0000-0000-0000-000000000101",
    settled: true,
    supabaseAnonKey: "anon-key",
    supabaseUrl: "http://localhost:54321",
  });

  assert.equal(
    request.url,
    "http://localhost:54321/functions/v1/update-profile-settled",
  );
  assert.equal(request.init.method, "POST");
  assert.deepEqual(JSON.parse(String(request.init.body)), {
    settled: true,
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

test("runSettledAction returns persisted settled status", async () => {
  const result = await runSettledAction(
    {
      appEnv: "local",
      profileId: "00000000-0000-0000-0000-000000000101",
      settled: true,
      supabaseAnonKey: "anon-key",
      supabaseUrl: "http://localhost:54321",
    },
    async () =>
      new Response(
        JSON.stringify({
          ok: true,
          profileId: "00000000-0000-0000-0000-000000000101",
          settled: true,
        }),
        { status: 200 },
      ),
  );

  assert.deepEqual(result, {
    ok: true,
    profileId: "00000000-0000-0000-0000-000000000101",
    settled: true,
  });
});

test("createReportActionRequest targets report-safety with group context and local-only bypass headers", () => {
  const request = createReportActionRequest({
    activityGroupId: "00000000-0000-0000-0000-000000000701",
    appEnv: "local",
    category: "unsafe",
    details: "Kept pushing for a private venue.",
    profileId: "00000000-0000-0000-0000-000000000101",
    reason: "Group safety check",
    supabaseAnonKey: "anon-key",
    supabaseUrl: "http://localhost:54321",
    targetUserId: "00000000-0000-0000-0000-000000000102",
  });

  assert.equal(
    request.url,
    "http://localhost:54321/functions/v1/report-safety",
  );
  assert.equal(request.init.method, "POST");
  assert.deepEqual(JSON.parse(String(request.init.body)), {
    activityGroupId: "00000000-0000-0000-0000-000000000701",
    category: "unsafe",
    details: "Kept pushing for a private venue.",
    reason: "Group safety check",
    targetUserId: "00000000-0000-0000-0000-000000000102",
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

test("runReportAction returns the persisted report status", async () => {
  const result = await runReportAction(
    {
      activityGroupId: "00000000-0000-0000-0000-000000000701",
      appEnv: "local",
      category: "unsafe",
      profileId: "00000000-0000-0000-0000-000000000101",
      reason: "Group safety check",
      supabaseUrl: "http://localhost:54321",
      targetUserId: "00000000-0000-0000-0000-000000000102",
    },
    async () =>
      new Response(
        JSON.stringify({
          ok: true,
          reportId: "00000000-0000-0000-0000-000000000901",
          status: "open",
        }),
      ),
  );

  assert.deepEqual(result, {
    ok: true,
    reportId: "00000000-0000-0000-0000-000000000901",
    status: "open",
  });
});

test("createBlockActionRequest targets block-user with local-only bypass headers", () => {
  const request = createBlockActionRequest({
    activityGroupId: "00000000-0000-0000-0000-000000000701",
    appEnv: "local",
    blockedId: "00000000-0000-0000-0000-000000000102",
    profileId: "00000000-0000-0000-0000-000000000101",
    supabaseAnonKey: "anon-key",
    supabaseUrl: "http://localhost:54321",
  });

  assert.equal(request.url, "http://localhost:54321/functions/v1/block-user");
  assert.deepEqual(JSON.parse(String(request.init.body)), {
    activityGroupId: "00000000-0000-0000-0000-000000000701",
    blockedId: "00000000-0000-0000-0000-000000000102",
  });
  assert.equal(
    (request.init.headers as Record<string, string>)["x-buzz-local-bypass"],
    "true",
  );
});

test("runBlockAction returns the persisted block id", async () => {
  const result = await runBlockAction(
    {
      appEnv: "local",
      blockedId: "00000000-0000-0000-0000-000000000102",
      profileId: "00000000-0000-0000-0000-000000000101",
      supabaseUrl: "http://localhost:54321",
    },
    async () =>
      new Response(
        JSON.stringify({
          ok: true,
          blockId: "00000000-0000-0000-0000-000000000902",
          blockedId: "00000000-0000-0000-0000-000000000102",
        }),
      ),
  );

  assert.deepEqual(result, {
    ok: true,
    blockId: "00000000-0000-0000-0000-000000000902",
    blockedId: "00000000-0000-0000-0000-000000000102",
  });
});

test("createLeaveGroupActionRequest targets leave-group with local-only bypass headers", () => {
  const request = createLeaveGroupActionRequest({
    activityGroupId: "00000000-0000-0000-0000-000000000701",
    appEnv: "local",
    profileId: "00000000-0000-0000-0000-000000000101",
    supabaseAnonKey: "anon-key",
    supabaseUrl: "http://localhost:54321",
  });

  assert.equal(request.url, "http://localhost:54321/functions/v1/leave-group");
  assert.deepEqual(JSON.parse(String(request.init.body)), {
    activityGroupId: "00000000-0000-0000-0000-000000000701",
  });
  assert.equal(
    (request.init.headers as Record<string, string>)["x-buzz-local-bypass"],
    "true",
  );
});

test("runLeaveGroupAction returns the left group status", async () => {
  const result = await runLeaveGroupAction(
    {
      activityGroupId: "00000000-0000-0000-0000-000000000701",
      appEnv: "local",
      profileId: "00000000-0000-0000-0000-000000000101",
      supabaseUrl: "http://localhost:54321",
    },
    async () =>
      new Response(
        JSON.stringify({
          ok: true,
          activityGroupId: "00000000-0000-0000-0000-000000000701",
          status: "left",
        }),
      ),
  );

  assert.deepEqual(result, {
    ok: true,
    activityGroupId: "00000000-0000-0000-0000-000000000701",
    status: "left",
  });
});
