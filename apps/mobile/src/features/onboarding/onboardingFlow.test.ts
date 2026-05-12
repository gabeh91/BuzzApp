import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  canBrowseFromOnboardingStep,
  createInitialOnboardingState,
  createOnboardingStateForAnonymousDraft,
  goBack,
  goNext,
  onboardingSteps,
} from "./onboardingFlow";

test("onboarding includes warm intro steps before the quiz starts", () => {
  assert.deepEqual(
    onboardingSteps.map((step) => step.id),
    [
      "welcome",
      "intent",
      "howItWorks",
      "profile",
      "quizIntro",
      "quiz",
      "interests",
      "activation",
      "matchPreview",
    ],
  );

  assert.ok(
    onboardingSteps.findIndex((step) => step.id === "quizIntro") <
      onboardingSteps.findIndex((step) => step.id === "quiz"),
  );
});

test("onboarding state advances and retreats without leaking step indexes into screens", () => {
  const initial = createInitialOnboardingState();
  const afterWelcome = goNext(initial);
  const afterIntent = goNext(afterWelcome);

  assert.equal(initial.step.id, "welcome");
  assert.equal(afterWelcome.step.id, "intent");
  assert.equal(afterIntent.step.id, "howItWorks");
  assert.equal(goBack(afterIntent).step.id, "intent");
  assert.equal(goBack(initial).step.id, "welcome");
});

test("onboarding progress is clamped at completion", () => {
  const completed = onboardingSteps.reduce(
    (state) => goNext(state),
    createInitialOnboardingState(),
  );

  assert.equal(completed.step.id, "matchPreview");
  assert.equal(goNext(completed).step.id, "matchPreview");
  assert.equal(completed.progress.current, onboardingSteps.length);
  assert.equal(completed.progress.total, onboardingSteps.length);
});

test("onboarding resumes at quiz when an anonymous quiz draft exists", () => {
  const resumed = createOnboardingStateForAnonymousDraft({
    answers: { pace: "low" },
    selectedInterest: null,
    status: "partial",
  });

  assert.equal(resumed.step.id, "quiz");
});

test("onboarding allows anonymous browsing from the activation step", () => {
  const activation = onboardingSteps.reduce((state) => {
    if (state.step.id === "activation") {
      return state;
    }

    return goNext(state);
  }, createInitialOnboardingState());

  assert.equal(activation.step.id, "activation");
  assert.equal(canBrowseFromOnboardingStep(activation), true);
  assert.equal(
    canBrowseFromOnboardingStep(createInitialOnboardingState()),
    false,
  );
  assert.equal(canBrowseFromOnboardingStep(goNext(activation)), false);
});

test("onboarding start exposes sign in for existing accounts", () => {
  const source = readFileSync(
    "src/features/onboarding/OnboardingScreen.tsx",
    "utf8",
  );
  const translationsSource = readFileSync("src/i18n/en.ts", "utf8");

  assert.match(source, /handleExistingAccountSignIn/);
  assert.match(source, /LL\.onboarding\.actions\.signInExisting/);
  assert.match(source, /await requireAuth\("save_profile"/);
  assert.match(translationsSource, /signInExisting:/);
});

test("onboarding provider reloads local state when auth returns to anonymous", () => {
  const source = readFileSync(
    "src/features/onboarding/OnboardingProvider.tsx",
    "utf8",
  );

  assert.match(source, /useBuzzAuth/);
  assert.match(source, /status !== "anonymous"/);
  assert.match(source, /\[status\]/);
  assert.match(source, /createInitialOnboardingState\(\)/);
});
