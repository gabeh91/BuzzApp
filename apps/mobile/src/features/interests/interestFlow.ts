import { createDemoMatchPreview, type DemoMatchPreview } from "../matching/demoMatch";
import type { ProfileTraits } from "../quiz/quizModel";

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

export const createInitialInterestFlowState = (): InterestFlowState => {
  return {
    selectedInterest: null,
    activation: {
      status: "idle",
      message: "Pick one interest to activate when you are open to doing it."
    },
    matchPreview: null
  };
};

export const selectInterest = (state: InterestFlowState, interest: BuzzInterest): InterestFlowState => {
  return {
    ...state,
    selectedInterest: interest,
    activation: {
      status: "idle",
      message: `${interest.name} is ready when you are.`
    },
    matchPreview: null
  };
};

export const markInterestActivating = (state: InterestFlowState): InterestFlowState => {
  return {
    ...state,
    activation: {
      status: "activating",
      message: "Activating your interest..."
    }
  };
};

export const activateInterestLocally = (state: InterestFlowState, traits: ProfileTraits): InterestFlowState => {
  if (!state.selectedInterest) {
    return {
      ...state,
      activation: {
        status: "error",
        message: "Choose an interest before activating."
      }
    };
  }

  return {
    ...state,
    activation: {
      status: "complete",
      message: `${state.selectedInterest.name} is active for your demo profile.`
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
