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
} from "../onboardingFlow";

test("onboarding keeps a compact intro before the quiz starts", () => {
  assert.deepEqual(
    onboardingSteps.map((step) => step.id),
    [
      "welcome",
      "howItWorks",
      "shortProfile",
      "quizIntro",
      "quiz",
      "interests",
      "activation",
      "matchPreview",
    ],
  );

  assert.ok(
    onboardingSteps.findIndex((step) => step.id === "shortProfile") <
      onboardingSteps.findIndex((step) => step.id === "quizIntro"),
  );
  assert.ok(
    onboardingSteps.findIndex((step) => step.id === "quizIntro") <
      onboardingSteps.findIndex((step) => step.id === "quiz"),
  );
});

test("onboarding state advances and retreats without leaking step indexes into screens", () => {
  const initial = createInitialOnboardingState();
  const afterWelcome = goNext(initial);
  const afterHowItWorks = goNext(afterWelcome);
  const afterShortProfile = goNext(afterHowItWorks);
  const afterQuizIntro = goNext(afterShortProfile);

  assert.equal(initial.step.id, "welcome");
  assert.equal(afterWelcome.step.id, "howItWorks");
  assert.equal(afterHowItWorks.step.id, "shortProfile");
  assert.equal(afterShortProfile.step.id, "quizIntro");
  assert.equal(afterQuizIntro.step.id, "quiz");
  assert.equal(goBack(afterQuizIntro).step.id, "quizIntro");
  assert.equal(goBack(afterShortProfile).step.id, "shortProfile");
  assert.equal(goBack(afterHowItWorks).step.id, "howItWorks");
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

test("onboarding resumes at short profile when a draft has profile fields but no quiz", () => {
  const resumed = createOnboardingStateForAnonymousDraft({
    answers: {},
    profileDisplayName: "Sam",
    selectedInterest: null,
    status: "partial",
  });

  assert.equal(resumed.step.id, "shortProfile");
});

test("onboarding resumes at quiz intro when short profile is complete without quiz answers", () => {
  const resumed = createOnboardingStateForAnonymousDraft({
    answers: {},
    selectedInterest: null,
    shortProfileComplete: true,
    status: "partial",
  });

  assert.equal(resumed.step.id, "quizIntro");
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
  assert.match(source, /await requireAuth\("existing_account_sign_in"/);
  assert.match(source, /createAnonymousOnboardingDraft/);
  assert.match(source, /anonymousOnboardingDraftStore\.update\(\(\) =>/);
  assert.match(source, /onboarding\.reset\(\)/);
  assert.match(source, /context\?\.profileQuizState\?\.quizCompleted/);
  assert.match(source, /routes\.profileQuiz/);
  assert.match(source, /const showBackAction = !onboarding\.isFirstStep/);
  assert.match(source, /variant="tonal"/);
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
