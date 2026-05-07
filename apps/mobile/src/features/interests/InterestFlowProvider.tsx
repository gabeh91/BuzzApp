import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import { useI18n } from "@/i18n/I18nProvider";
import type { ProfileTraits } from "@/features/quiz/quizModel";
import {
  activateInterestLocally,
  completeBackendActivation,
  createInterestFlowCopy,
  createInitialInterestFlowState,
  markInterestActivating,
  markInterestActivationError,
  selectInterest,
  type BackendActivationResult,
  type BuzzInterest,
  type InterestFlowState
} from "./interestFlow";

type InterestFlowContextValue = {
  state: InterestFlowState;
  select: (interest: BuzzInterest) => void;
  markActivating: () => void;
  completeLocalActivation: (traits: ProfileTraits) => void;
  completeBackendActivation: (result: BackendActivationResult) => void;
  failActivation: (message: string) => void;
};

const InterestFlowContext = createContext<InterestFlowContextValue | null>(null);

export const InterestFlowProvider = ({ children }: { children: ReactNode }) => {
  const { LL } = useI18n();
  const copy = useMemo(() => createInterestFlowCopy(LL), [LL]);
  const [state, setState] = useState(() => createInitialInterestFlowState(copy));

  const value: InterestFlowContextValue = {
    state,
    select: (interest) => {
      setState((current) => selectInterest(current, interest, copy));
    },
    markActivating: () => {
      setState((current) => markInterestActivating(current, copy));
    },
    completeLocalActivation: (traits) => {
      setState((current) => activateInterestLocally(current, traits, copy));
    },
    completeBackendActivation: (result) => {
      setState((current) => completeBackendActivation(current, result, copy));
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
