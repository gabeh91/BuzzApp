export type OnboardingStepId =
  | "welcome"
  | "city"
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
  eyebrow: string;
  title: string;
  body: string;
};

export type OnboardingState = {
  index: number;
  step: OnboardingStep;
  progress: {
    current: number;
    total: number;
  };
};

export const onboardingSteps: OnboardingStep[] = [
  {
    id: "welcome",
    eyebrow: "Welcome to Buzz",
    title: "A softer way to find your people in a new city.",
    body: "Start with what you actually want to do. Buzz turns interests into low-pressure reasons to meet."
  },
  {
    id: "city",
    eyebrow: "Launch city",
    title: "Melbourne first, city-by-city after that.",
    body: "Keeping the first launch focused makes matching more relevant and keeps the local experience intentional."
  },
  {
    id: "intent",
    eyebrow: "Your intent",
    title: "Tell Buzz why you are here.",
    body: "New to town, returning after time away, or just widening your circle. The activity comes first."
  },
  {
    id: "howItWorks",
    eyebrow: "How it works",
    title: "Pick interests, activate one, then meet around a plan.",
    body: "Buzz avoids cold friend-swiping. You match around shared momentum: tennis, coffee, climbing, singing, or whatever feels right."
  },
  {
    id: "profile",
    eyebrow: "Profile basics",
    title: "Create a lightweight local profile.",
    body: "For now this uses a demo profile behind a replaceable auth boundary. Supabase Auth can take over this step later."
  },
  {
    id: "quizIntro",
    eyebrow: "Discovery quiz",
    title: "A few quick questions so matches feel less random.",
    body: "The quiz captures practical signals like energy, availability, planning style, and group comfort."
  },
  {
    id: "quiz",
    eyebrow: "Quiz",
    title: "Answer as you are, not as you think you should be.",
    body: "This first pass derives deterministic matching traits. AI can enrich the interpretation later without owning eligibility."
  },
  {
    id: "interests",
    eyebrow: "Interests",
    title: "Choose what you would genuinely do this week.",
    body: "Interests come from Supabase GraphQL with local fallback data so development stays plug-and-play."
  },
  {
    id: "activation",
    eyebrow: "Activation",
    title: "Activate one interest when you are open to doing it.",
    body: "Activation is the core behaviour: a clear signal that you are ready for a plan, not just browsing."
  },
  {
    id: "matchPreview",
    eyebrow: "First match",
    title: "Buzz forms a practical next step.",
    body: "The first local preview is deterministic and transparent. Later, AI can write warmer explanations."
  }
];

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
