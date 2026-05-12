import { Redirect } from "expo-router";
import { useEffect, useState } from "react";

import { useBuzzAuth } from "@/auth/AuthProvider";
import { getInitialAppRoute } from "@/auth/authGate";
import { OnboardingScreen } from "@/features/onboarding/OnboardingScreen";
import type { AnonymousOnboardingDraft } from "@/features/onboarding/onboardingDraft";
import { anonymousOnboardingDraftStore } from "@/features/onboarding/onboardingDraftStorage";
import { routes } from "./routes";

export const AppEntry = () => {
  const { status } = useBuzzAuth();
  const [draft, setDraft] = useState<AnonymousOnboardingDraft | null>(null);

  useEffect(() => {
    let active = true;

    const loadDraft = async () => {
      const nextDraft = await anonymousOnboardingDraftStore.load();

      if (active) {
        setDraft(nextDraft);
      }
    };

    void loadDraft();

    return () => {
      active = false;
    };
  }, []);

  if (status === "loading" || !draft) {
    return null;
  }

  const initialRoute = getInitialAppRoute({
    authStatus: status,
    hasCompletedAnonymousOnboarding: draft.status === "complete",
    hasPartialAnonymousDraft: draft.status === "partial",
  });

  if (initialRoute === routes.home) {
    return <Redirect href={routes.home} />;
  }

  return <OnboardingScreen />;
};
