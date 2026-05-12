import { useCallback } from "react";
import { useNavigation, useRouter, type Router } from "expo-router";

import { routes } from "@/navigation/routes";
import type { AuthInteractionIntent } from "./authGate";

export type AuthModalIntent = Exclude<AuthInteractionIntent, "browse">;

const authModalIntents: readonly AuthModalIntent[] = [
  "activate_interest",
  "attend_activity",
  "save_profile",
  "invite_friend",
  "chat",
  "safety_action",
  "post_activity_feedback",
];

type AuthModalRouter = Pick<Router, "replace">;

type AuthRootNavigation = {
  canGoBack: () => boolean;
  goBack: () => void;
};

export const getAuthModalIntentParam = (
  value: string | string[] | undefined,
): AuthModalIntent | null => {
  const intent = Array.isArray(value) ? value[0] : value;

  return authModalIntents.includes(intent as AuthModalIntent)
    ? (intent as AuthModalIntent)
    : null;
};

export const createAuthStartRoute = (intent: AuthModalIntent) => ({
  pathname: routes.auth,
  params: { intent },
});

export const createAuthCodeRoute = ({
  email,
  intent,
}: {
  email: string;
  intent: AuthModalIntent;
}) => ({
  pathname: routes.authCode,
  params: { email, intent },
});

export const closeAuthModal = (
  router: AuthModalRouter,
  rootNavigation: AuthRootNavigation,
) => {
  if (rootNavigation.canGoBack()) {
    rootNavigation.goBack();
    return;
  }

  router.replace(routes.home);
};

export const useCloseAuthModal = () => {
  const router = useRouter();
  const rootNavigation = useNavigation<AuthRootNavigation>("/");

  return useCallback(() => {
    closeAuthModal(router, rootNavigation);
  }, [rootNavigation, router]);
};
