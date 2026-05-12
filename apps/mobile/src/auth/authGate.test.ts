import assert from "node:assert/strict";
import test from "node:test";

import {
  getAuthGateDecision,
  getInitialAppRoute,
  shouldClaimAnonymousDraft,
  type AuthGateState,
} from "./authGate";

const authenticated: AuthGateState = {
  biometricEnabled: false,
  hasStoredSupabaseSession: true,
  status: "authenticated",
};

test("anonymous users can browse but interaction intents open auth", () => {
  const anonymous: AuthGateState = {
    biometricEnabled: false,
    hasStoredSupabaseSession: false,
    status: "anonymous",
  };

  assert.equal(getAuthGateDecision(anonymous, "browse").type, "allow");
  assert.deepEqual(getAuthGateDecision(anonymous, "activate_interest"), {
    intent: "activate_interest",
    type: "show_auth",
  });
  assert.equal(
    getAuthGateDecision(authenticated, "activate_interest").type,
    "allow",
  );
});

test("stored Supabase sessions use biometric unlock before authenticated actions", () => {
  const locked: AuthGateState = {
    biometricEnabled: true,
    hasStoredSupabaseSession: true,
    status: "locked",
  };

  assert.deepEqual(getAuthGateDecision(locked, "attend_activity"), {
    intent: "attend_activity",
    type: "biometric_unlock",
  });
});

test("initial route only shows onboarding for first anonymous starts or partial anonymous drafts", () => {
  assert.equal(
    getInitialAppRoute({
      authStatus: "authenticated",
      hasCompletedAnonymousOnboarding: false,
      hasPartialAnonymousDraft: false,
    }),
    "/home",
  );
  assert.equal(
    getInitialAppRoute({
      authStatus: "anonymous",
      hasCompletedAnonymousOnboarding: true,
      hasPartialAnonymousDraft: false,
    }),
    "/home",
  );
  assert.equal(
    getInitialAppRoute({
      authStatus: "anonymous",
      hasCompletedAnonymousOnboarding: false,
      hasPartialAnonymousDraft: true,
    }),
    "/",
  );
});

test("partly filled anonymous quiz drafts are claimable after auth", () => {
  assert.equal(
    shouldClaimAnonymousDraft({
      answers: {},
      selectedInterest: null,
    }),
    false,
  );
  assert.equal(
    shouldClaimAnonymousDraft({
      answers: { pace: "low" },
      selectedInterest: null,
    }),
    true,
  );
  assert.equal(
    shouldClaimAnonymousDraft({
      answers: {},
      selectedInterest: { id: "interest-1", name: "Golf" },
    }),
    true,
  );
});
