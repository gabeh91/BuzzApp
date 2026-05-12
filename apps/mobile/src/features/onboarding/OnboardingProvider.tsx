import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  createInitialOnboardingState,
  createOnboardingStateForAnonymousDraft,
  goBack,
  goNext,
  type OnboardingState
} from "./onboardingFlow";
import { anonymousOnboardingDraftStore } from "./onboardingDraftStorage";

type OnboardingContextValue = {
  state: OnboardingState;
  next: () => void;
  back: () => void;
  reset: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState(createInitialOnboardingState);

  useEffect(() => {
    let active = true;

    const restoreOnboardingDraft = async () => {
      const draft = await anonymousOnboardingDraftStore.load();

      if (active) {
        setState(createOnboardingStateForAnonymousDraft(draft));
      }
    };

    void restoreOnboardingDraft();

    return () => {
      active = false;
    };
  }, []);

  const value: OnboardingContextValue = {
    state,
    next: () => {
      setState((current) => goNext(current));
    },
    back: () => {
      setState((current) => goBack(current));
    },
    reset: () => {
      setState(createInitialOnboardingState());
    },
    isFirstStep: state.index === 0,
    isLastStep: state.progress.current === state.progress.total
  };

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
};

export const useOnboarding = (): OnboardingContextValue => {
  const value = useContext(OnboardingContext);

  if (!value) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }

  return value;
};
