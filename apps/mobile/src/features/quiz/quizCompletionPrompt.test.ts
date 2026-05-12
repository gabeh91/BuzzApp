import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { shouldShowQuizCompletionPrompt } from "./quizCompletionPromptLogic";

test("quiz completion prompt appears on app surfaces for authenticated users with incomplete quiz context", () => {
  assert.equal(
    shouldShowQuizCompletionPrompt({
      dismissedForSession: false,
      isAuthenticated: true,
      isInviteAcceptRoute: false,
      isOnboardingRoute: false,
      quizCompleted: false,
    }),
    true,
  );
  assert.equal(
    shouldShowQuizCompletionPrompt({
      dismissedForSession: false,
      isAuthenticated: true,
      isInviteAcceptRoute: false,
      isOnboardingRoute: false,
      quizCompleted: true,
    }),
    false,
  );
});

test("quiz completion prompt is mounted globally inside app providers", () => {
  const providersSource = readFileSync(
    "src/providers/AppProviders.tsx",
    "utf8",
  );
  const promptSource = readFileSync(
    "src/features/quiz/QuizCompletionPrompt.tsx",
    "utf8",
  );

  assert.match(providersSource, /QuizCompletionPrompt/);
  assert.match(promptSource, /shouldShowQuizCompletionPrompt/);
  assert.match(promptSource, /routes\.onboardingQuiz/);
});

test("quiz completion prompt does not cover onboarding, invite acceptance, anonymous browsing, or a dismissed session", () => {
  assert.equal(
    shouldShowQuizCompletionPrompt({
      dismissedForSession: false,
      isAuthenticated: true,
      isInviteAcceptRoute: false,
      isOnboardingRoute: true,
      quizCompleted: false,
    }),
    false,
  );
  assert.equal(
    shouldShowQuizCompletionPrompt({
      dismissedForSession: false,
      isAuthenticated: true,
      isInviteAcceptRoute: true,
      isOnboardingRoute: false,
      quizCompleted: false,
    }),
    false,
  );
  assert.equal(
    shouldShowQuizCompletionPrompt({
      dismissedForSession: false,
      isAuthenticated: false,
      isInviteAcceptRoute: false,
      isOnboardingRoute: false,
      quizCompleted: false,
    }),
    false,
  );
  assert.equal(
    shouldShowQuizCompletionPrompt({
      dismissedForSession: true,
      isAuthenticated: true,
      isInviteAcceptRoute: false,
      isOnboardingRoute: false,
      quizCompleted: false,
    }),
    false,
  );
});
