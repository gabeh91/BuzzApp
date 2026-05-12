import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { useI18n } from "@/i18n/I18nProvider";
import { selectDraftInterest } from "@/features/onboarding/onboardingDraft";
import { anonymousOnboardingDraftStore } from "@/features/onboarding/onboardingDraftStorage";
import {
  activateInterestLocally,
  completeBackendActivation,
  createInterestFlowCopy,
  createInitialInterestFlowState,
  markInterestActivating,
  markInterestActivationError,
  selectInterest,
  setActivationAvailabilityIntent,
  type ActivationAvailabilityIntent,
  type BackendActivationResult,
  type BuzzInterest,
  type InterestFlowState,
} from "./interestFlow";

type InterestFlowContextValue = {
  state: InterestFlowState;
  select: (interest: BuzzInterest) => void;
  markActivating: () => void;
  completeLocalActivation: () => void;
  completeBackendActivation: (result: BackendActivationResult) => void;
  setAvailabilityIntent: (intent: ActivationAvailabilityIntent) => void;
  failActivation: (message: string) => void;
};

const InterestFlowContext = createContext<InterestFlowContextValue | null>(
  null,
);

export const InterestFlowProvider = ({ children }: { children: ReactNode }) => {
  const { LL } = useI18n();
  const copy = useMemo(() => createInterestFlowCopy(LL), [LL]);
  const [state, setState] = useState(() =>
    createInitialInterestFlowState(copy),
  );

  useEffect(() => {
    let active = true;

    const restoreSelectedInterest = async () => {
      const draft = await anonymousOnboardingDraftStore.load();

      if (!active || !draft.selectedInterest) {
        return;
      }

      setState((current) =>
        selectInterest(current, draft.selectedInterest!, copy),
      );
    };

    void restoreSelectedInterest();

    return () => {
      active = false;
    };
  }, [copy]);

  const value: InterestFlowContextValue = {
    state,
    select: (interest) => {
      setState((current) => selectInterest(current, interest, copy));
      void anonymousOnboardingDraftStore.update((draft) =>
        selectDraftInterest(draft, interest),
      );
    },
    markActivating: () => {
      setState((current) => markInterestActivating(current, copy));
    },
    completeLocalActivation: () => {
      setState((current) => activateInterestLocally(current, copy));
    },
    completeBackendActivation: (result) => {
      setState((current) => completeBackendActivation(current, result, copy));
    },
    setAvailabilityIntent: (intent) => {
      setState((current) => setActivationAvailabilityIntent(current, intent));
    },
    failActivation: (message) => {
      setState((current) => markInterestActivationError(current, message));
    },
  };

  return (
    <InterestFlowContext.Provider value={value}>
      {children}
    </InterestFlowContext.Provider>
  );
};

export const useInterestFlow = (): InterestFlowContextValue => {
  const value = useContext(InterestFlowContext);

  if (!value) {
    throw new Error("useInterestFlow must be used within InterestFlowProvider");
  }

  return value;
};
