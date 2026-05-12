import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { useBuzzAuth } from "@/auth/AuthProvider";
import {
  createInitialOnboardingState,
  createOnboardingStateForAnonymousDraft,
  goBack,
  goNext,
  type OnboardingState,
} from "./onboardingFlow";
import { shouldRestoreAnonymousOnboardingDraft } from "./onboardingDraft";
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
  const { status } = useBuzzAuth();
  const [state, setState] = useState(createInitialOnboardingState);

  useEffect(() => {
    if (status !== "anonymous") {
      return;
    }

    let active = true;

    const restoreOnboardingDraft = async () => {
      const draft = await anonymousOnboardingDraftStore.load();

      if (active) {
        setState(
          shouldRestoreAnonymousOnboardingDraft(draft)
            ? createOnboardingStateForAnonymousDraft(draft)
            : createInitialOnboardingState(),
        );
      }
    };

    void restoreOnboardingDraft();

    return () => {
      active = false;
    };
  }, [status]);

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
    isLastStep: state.progress.current === state.progress.total,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = (): OnboardingContextValue => {
  const value = useContext(OnboardingContext);

  if (!value) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }

  return value;
};
