import { routes, type BuzzRoute } from "@/navigation/routes";

export type AuthInteractionIntent =
  | "browse"
  | "existing_account_sign_in"
  | "activate_interest"
  | "attend_activity"
  | "save_profile"
  | "invite_friend"
  | "chat"
  | "safety_action"
  | "post_activity_feedback";

export type AuthGateState = {
  status: "anonymous" | "authenticated" | "locked" | "loading";
  hasStoredSupabaseSession: boolean;
  biometricEnabled: boolean;
};

export type AuthGateDecision =
  | { type: "allow" }
  | { type: "show_auth"; intent: Exclude<AuthInteractionIntent, "browse"> }
  | {
      type: "biometric_unlock";
      intent: Exclude<AuthInteractionIntent, "browse">;
    }
  | { type: "wait" };

export type InitialAppRouteState = {
  authStatus: AuthGateState["status"];
  hasCompletedAnonymousOnboarding: boolean;
  hasPartialAnonymousDraft: boolean;
};

export type ClaimableAnonymousDraft = {
  answers: Record<string, string>;
  claimedUserId?: string;
  selectedInterest: { id: string; name: string } | null;
};

const isInteractionIntent = (
  intent: AuthInteractionIntent,
): intent is Exclude<AuthInteractionIntent, "browse"> => intent !== "browse";

export const getAuthGateDecision = (
  state: AuthGateState,
  intent: AuthInteractionIntent,
): AuthGateDecision => {
  if (intent === "browse") {
    return { type: "allow" };
  }

  if (state.status === "loading") {
    return { type: "wait" };
  }

  if (state.status === "authenticated") {
    return { type: "allow" };
  }

  if (
    isInteractionIntent(intent) &&
    state.status === "locked" &&
    state.hasStoredSupabaseSession &&
    state.biometricEnabled
  ) {
    return { type: "biometric_unlock", intent };
  }

  if (isInteractionIntent(intent)) {
    return { type: "show_auth", intent };
  }

  return { type: "allow" };
};

export const getInitialAppRoute = ({
  authStatus,
  hasCompletedAnonymousOnboarding,
}: InitialAppRouteState): BuzzRoute => {
  if (authStatus === "authenticated" || authStatus === "locked") {
    return routes.home;
  }

  if (hasCompletedAnonymousOnboarding) {
    return routes.home;
  }

  return routes.onboarding;
};

export const shouldClaimAnonymousDraft = (
  draft: ClaimableAnonymousDraft,
): boolean => {
  if (draft.claimedUserId) {
    return false;
  }

  return (
    Object.keys(draft.answers).length > 0 || Boolean(draft.selectedInterest?.id)
  );
};
