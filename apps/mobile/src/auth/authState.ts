import type { BuzzAuthState } from "./auth.types";
import { createDemoBuzzUser, type DemoAuthEnv } from "./demoAuth";

export const createBuzzAuthState = (
  env: DemoAuthEnv = process.env,
): BuzzAuthState => {
  const user = createDemoBuzzUser(env);

  return {
    accessToken: undefined,
    applyLocalProfileUpdate: () => undefined,
    authSheetVisible: false,
    biometricEnabled: false,
    completePendingAuthAction: async () => undefined,
    enableBiometricLogin: async () => false,
    isAuthenticated: user.authSource === "supabase",
    isLocked: false,
    mode: user.authSource,
    profileQuizOverwritePrompt: null,
    profileQuizState: null,
    requireAuth: async (_intent, action) => {
      await action(user);
      return true;
    },
    resolveProfileQuizOverwrite: async () => undefined,
    sendEmailOtp: async () => undefined,
    verifyEmailOtp: async () => undefined,
    signInWithEmailPassword: async () => undefined,
    signInWithMagicLink: async () => undefined,
    signInWithOAuth: async () => undefined,
    signUpWithEmailPassword: async () => ({
      needsEmailConfirmation: false,
    }),
    signOut: async () => undefined,
    status: user.authSource === "supabase" ? "authenticated" : "anonymous",
    unlockWithBiometrics: async () => true,
    user,
  };
};
