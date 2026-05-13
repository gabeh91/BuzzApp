import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { BuzzAuthUser } from "./auth.types";
import { drainPostAuthPendingAction } from "./postAuthContinuation";

const supabaseUser = (): BuzzAuthUser => ({
  id: "u1",
  displayName: "Test",
  cityId: "c1",
  cityName: "City",
  authSource: "supabase",
});

const anonymousUser = (): BuzzAuthUser => ({
  id: "anon",
  displayName: "Guest",
  cityId: "c1",
  cityName: "City",
  authSource: "anonymous",
});

describe("drainPostAuthPendingAction", () => {
  it("defers when profile quiz overwrite is pending and not yet resolved", async () => {
    const outcome = await drainPostAuthPendingAction({
      user: supabaseUser(),
      accessToken: "t",
      isProfileQuizOverwritePending: true,
      runPendingAction: async () => {
        throw new Error("should not run");
      },
    });

    assert.equal(outcome, "deferred_for_profile_quiz_overwrite");
  });

  it("runs pending action after overwrite resolution is provided", async () => {
    let ran = false;

    const outcome = await drainPostAuthPendingAction({
      user: supabaseUser(),
      accessToken: "t",
      isProfileQuizOverwritePending: true,
      profileQuizOverwriteResolution: "keep_existing",
      runPendingAction: async (_user, _token, context) => {
        assert.equal(context?.profileQuizOverwriteDecision, "keep_existing");
        ran = true;
        return true;
      },
    });

    assert.equal(outcome, "completed_pending_action");
    assert.equal(ran, true);
  });

  it("skips for non-supabase user", async () => {
    const outcome = await drainPostAuthPendingAction({
      user: anonymousUser(),
      accessToken: undefined,
      isProfileQuizOverwritePending: false,
      runPendingAction: async () => {
        throw new Error("should not run");
      },
    });

    assert.equal(outcome, "skipped_not_supabase_user");
  });

  it("returns no_pending_action when runner reports false", async () => {
    const outcome = await drainPostAuthPendingAction({
      user: supabaseUser(),
      accessToken: undefined,
      isProfileQuizOverwritePending: false,
      runPendingAction: async () => false,
    });

    assert.equal(outcome, "no_pending_action");
  });
});
