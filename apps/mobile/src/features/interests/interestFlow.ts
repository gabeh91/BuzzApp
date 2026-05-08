import { LL, type I18n } from "@/i18n";

import { createDemoMatchPreview } from "@/features/matching/demoMatch";
import type { MatchCandidatePreview } from "@/features/matching/matchCandidate.types";
import type { BuzzAuthUser } from "@/auth/auth.types";
import type { ProfileTraits } from "@/features/quiz/quizModel";

export type BuzzInterest = {
  id: string;
  name: string;
  slug: string;
  category: string;
};

export type InterestActivationState = {
  status: "idle" | "activating" | "complete" | "error";
  message: string;
  activationId?: string;
  source?: "local" | "supabase";
};

export type ActivationAvailabilityIntent = {
  availabilityWindow: "today" | "this_week" | "weekend" | "weekdays";
  preferredTime: "daytime" | "evening" | "flexible";
  urgency: "low" | "soon" | "now";
};

export type InterestFlowState = {
  selectedInterest: BuzzInterest | null;
  activation: InterestActivationState;
  activationAvailability: ActivationAvailabilityIntent;
  matchPreview: MatchCandidatePreview | null;
};

export type InterestFlowCopy = {
  initialMessage: string;
  selectedMessage: (interest: string) => string;
  activatingMessage: string;
  completeMessage: (interest: string) => string;
  chooseBeforeActivatingMessage: string;
};

export type BackendMatchCandidate = {
  id: string;
  displayName: string;
  reason: string;
  suggestedPlan: string;
  score: number;
};

export type BackendActivationResult = {
  ok: boolean;
  activationId: string;
  interestId: string;
  interestName: string;
  matchCandidates: BackendMatchCandidate[];
};

export const createInterestFlowCopy = (translations: I18n = LL): InterestFlowCopy => {
  return {
    initialMessage: translations.interests.activation.initial(),
    selectedMessage: (interest) => translations.interests.activation.selected({ interest }),
    activatingMessage: translations.interests.activation.activating(),
    completeMessage: (interest) => translations.interests.activation.complete({ interest }),
    chooseBeforeActivatingMessage: translations.interests.activation.chooseBeforeActivating()
  };
};

const defaultInterestFlowCopy = createInterestFlowCopy();

export const defaultActivationAvailabilityIntent: ActivationAvailabilityIntent = {
  availabilityWindow: "this_week",
  preferredTime: "flexible",
  urgency: "soon"
};

export const createInitialInterestFlowState = (copy: InterestFlowCopy = defaultInterestFlowCopy): InterestFlowState => {
  return {
    selectedInterest: null,
    activation: {
      status: "idle",
      message: copy.initialMessage
    },
    activationAvailability: defaultActivationAvailabilityIntent,
    matchPreview: null
  };
};

export const selectInterest = (
  state: InterestFlowState,
  interest: BuzzInterest,
  copy: InterestFlowCopy = defaultInterestFlowCopy
): InterestFlowState => {
  return {
    ...state,
    selectedInterest: interest,
    activation: {
      status: "idle",
      message: copy.selectedMessage(interest.name)
    },
    matchPreview: null
  };
};

export const setActivationAvailabilityIntent = (
  state: InterestFlowState,
  intent: ActivationAvailabilityIntent
): InterestFlowState => {
  return {
    ...state,
    activationAvailability: intent
  };
};

export const markInterestActivating = (
  state: InterestFlowState,
  copy: InterestFlowCopy = defaultInterestFlowCopy
): InterestFlowState => {
  return {
    ...state,
    activation: {
      status: "activating",
      message: copy.activatingMessage
    }
  };
};

export const activateInterestLocally = (
  state: InterestFlowState,
  traits: ProfileTraits,
  copy: InterestFlowCopy = defaultInterestFlowCopy
): InterestFlowState => {
  if (!state.selectedInterest) {
    return {
      ...state,
      activation: {
        status: "error",
        message: copy.chooseBeforeActivatingMessage
      }
    };
  }

  return {
    ...state,
    activation: {
      status: "complete",
      message: copy.completeMessage(state.selectedInterest.name),
      source: "local"
    },
    matchPreview: createDemoMatchPreview({
      interestName: state.selectedInterest.name,
      traits
    })
  };
};

export const shouldActivateInterestThroughSupabase = (user: BuzzAuthUser): boolean => {
  return user.authSource === "supabase";
};

export const isBackendActivationResult = (value: unknown): value is BackendActivationResult => {
  const result = value as Partial<BackendActivationResult>;

  return Boolean(result.ok && result.activationId && result.interestId && result.interestName && Array.isArray(result.matchCandidates));
};

export const completeBackendActivation = (
  state: InterestFlowState,
  result: BackendActivationResult,
  copy: InterestFlowCopy = defaultInterestFlowCopy
): InterestFlowState => {
  if (!state.selectedInterest) {
    return {
      ...state,
      activation: {
        status: "error",
        message: copy.chooseBeforeActivatingMessage
      }
    };
  }

  const firstCandidate = result.matchCandidates[0];

  return {
    ...state,
    activation: {
      status: "complete",
      message: copy.completeMessage(state.selectedInterest.name),
      activationId: result.activationId,
      source: "supabase"
    },
    matchPreview: firstCandidate
      ? {
          displayName: firstCandidate.displayName,
          interestName: result.interestName,
          headline: `${firstCandidate.displayName} is also open to ${result.interestName}`,
          reason: firstCandidate.reason,
          suggestedPlan: firstCandidate.suggestedPlan,
          score: firstCandidate.score,
          id: firstCandidate.id,
          isDemo: false,
          source: "supabase"
        }
      : null
  };
};

export const markInterestActivationError = (state: InterestFlowState, message: string): InterestFlowState => {
  return {
    ...state,
    activation: {
      status: "error",
      message
    }
  };
};
