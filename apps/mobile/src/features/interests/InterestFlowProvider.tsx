import { createContext, useContext, useState, type ReactNode } from "react";

import type { ProfileTraits } from "../quiz/quizModel";
import {
  activateInterestLocally,
  createInitialInterestFlowState,
  markInterestActivating,
  markInterestActivationError,
  selectInterest,
  type BuzzInterest,
  type InterestFlowState
} from "./interestFlow";

type InterestFlowContextValue = {
  state: InterestFlowState;
  select: (interest: BuzzInterest) => void;
  markActivating: () => void;
  completeLocalActivation: (traits: ProfileTraits) => void;
  failActivation: (message: string) => void;
};

const InterestFlowContext = createContext<InterestFlowContextValue | null>(null);

export const InterestFlowProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState(createInitialInterestFlowState);

  const value: InterestFlowContextValue = {
    state,
    select: (interest) => {
      setState((current) => selectInterest(current, interest));
    },
    markActivating: () => {
      setState((current) => markInterestActivating(current));
    },
    completeLocalActivation: (traits) => {
      setState((current) => activateInterestLocally(current, traits));
    },
    failActivation: (message) => {
      setState((current) => markInterestActivationError(current, message));
    }
  };

  return <InterestFlowContext.Provider value={value}>{children}</InterestFlowContext.Provider>;
};

export const useInterestFlow = (): InterestFlowContextValue => {
  const value = useContext(InterestFlowContext);

  if (!value) {
    throw new Error("useInterestFlow must be used within InterestFlowProvider");
  }

  return value;
};
