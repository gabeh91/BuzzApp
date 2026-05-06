import { LL, type I18n } from "@/i18n";

import { createDemoMatchPreview, type DemoMatchPreview } from "@/features/matching/demoMatch";
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
};

export type InterestFlowState = {
  selectedInterest: BuzzInterest | null;
  activation: InterestActivationState;
  matchPreview: DemoMatchPreview | null;
};

export type InterestFlowCopy = {
  initialMessage: string;
  selectedMessage: (interest: string) => string;
  activatingMessage: string;
  completeMessage: (interest: string) => string;
  chooseBeforeActivatingMessage: string;
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

export const createInitialInterestFlowState = (copy: InterestFlowCopy = defaultInterestFlowCopy): InterestFlowState => {
  return {
    selectedInterest: null,
    activation: {
      status: "idle",
      message: copy.initialMessage
    },
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
      message: copy.completeMessage(state.selectedInterest.name)
    },
    matchPreview: createDemoMatchPreview({
      interestName: state.selectedInterest.name,
      traits
    })
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
