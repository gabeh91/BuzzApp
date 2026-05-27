import assert from "node:assert/strict";
import test from "node:test";

import {
  getAuthGateDecision,
  getInitialAppRoute,
  shouldClaimAnonymousDraft,
  type AuthGateState,
} from "../authGate";
import { shouldPromptForProfileQuizOverwrite } from "../profileQuizOverwrite";

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
  assert.deepEqual(getAuthGateDecision(anonymous, "existing_account_sign_in"), {
    intent: "existing_account_sign_in",
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
  assert.equal(
    shouldClaimAnonymousDraft({
      answers: { pace: "low" },
      claimedUserId: "user-1",
      selectedInterest: null,
    }),
    false,
  );
});

test("profile quiz overwrite prompt appears only when local answers conflict with previous saved answers", () => {
  const draft = {
    activeQuestionIndex: 4,
    answers: { pace: "low" },
    selectedInterest: null,
    shortProfileComplete: false,
    shortProfileSubIndex: 0,
    status: "partial" as const,
  };
  const completedProfile = {
    profileExists: true,
    quizCompleted: true,
    userId: "user-1",
  };

  assert.equal(
    shouldPromptForProfileQuizOverwrite({
      draft,
      profileQuizState: completedProfile,
    }),
    true,
  );
  assert.equal(
    shouldPromptForProfileQuizOverwrite({
      draft: { ...draft, claimedUserId: "user-1" },
      profileQuizState: completedProfile,
    }),
    false,
  );
  assert.equal(
    shouldPromptForProfileQuizOverwrite({
      draft: { ...draft, answers: {} },
      profileQuizState: completedProfile,
    }),
    false,
  );
  assert.equal(
    shouldPromptForProfileQuizOverwrite({
      draft,
      profileQuizState: { ...completedProfile, quizCompleted: false },
    }),
    false,
  );
  assert.equal(
    shouldPromptForProfileQuizOverwrite({
      draft,
      profileQuizState: {
        ...completedProfile,
        quizAnswers: { pace: "balanced" },
        quizCompleted: false,
      },
    }),
    true,
  );
  assert.equal(
    shouldPromptForProfileQuizOverwrite({
      draft,
      profileQuizState: {
        ...completedProfile,
        quizAnswers: {},
        quizCompleted: false,
      },
    }),
    false,
  );
});
