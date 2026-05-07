export type OnboardingStepId =
  | "welcome"
  | "intent"
  | "howItWorks"
  | "profile"
  | "quizIntro"
  | "quiz"
  | "interests"
  | "activation"
  | "matchPreview";

export type OnboardingStep = {
  id: OnboardingStepId;
};

export type OnboardingState = {
  index: number;
  step: OnboardingStep;
  progress: {
    current: number;
    total: number;
  };
};

export const onboardingStepIds: OnboardingStepId[] = [
  "welcome",
  "intent",
  "howItWorks",
  "profile",
  "quizIntro",
  "quiz",
  "interests",
  "activation",
  "matchPreview"
];

export const onboardingSteps: OnboardingStep[] = onboardingStepIds.map((id) => ({ id }));

const createState = (index: number): OnboardingState => {
  const clampedIndex = Math.min(Math.max(index, 0), onboardingSteps.length - 1);
  const step = onboardingSteps[clampedIndex];

  if (!step) {
    throw new Error("Onboarding steps must include at least one step");
  }

  return {
    index: clampedIndex,
    step,
    progress: {
      current: clampedIndex + 1,
      total: onboardingSteps.length
    }
  };
};

export const createInitialOnboardingState = (): OnboardingState => {
  return createState(0);
};

export const goNext = (state: OnboardingState): OnboardingState => {
  return createState(state.index + 1);
};

export const goBack = (state: OnboardingState): OnboardingState => {
  return createState(state.index - 1);
};
