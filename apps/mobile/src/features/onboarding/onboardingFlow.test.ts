import assert from "node:assert/strict";
import test from "node:test";

import { createInitialOnboardingState, goBack, goNext, onboardingSteps } from "./onboardingFlow";

test("onboarding includes warm intro steps before the quiz starts", () => {
  assert.deepEqual(
    onboardingSteps.map((step) => step.id),
    ["welcome", "intent", "howItWorks", "profile", "quizIntro", "quiz", "interests", "activation", "matchPreview"]
  );

  assert.ok(onboardingSteps.findIndex((step) => step.id === "quizIntro") < onboardingSteps.findIndex((step) => step.id === "quiz"));
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
  const completed = onboardingSteps.reduce((state) => goNext(state), createInitialOnboardingState());

  assert.equal(completed.step.id, "matchPreview");
  assert.equal(goNext(completed).step.id, "matchPreview");
  assert.equal(completed.progress.current, onboardingSteps.length);
  assert.equal(completed.progress.total, onboardingSteps.length);
});
