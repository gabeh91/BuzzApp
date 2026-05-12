import type { BuzzAuthState } from "./auth.types";
import { createDemoBuzzUser, type DemoAuthEnv } from "./demoAuth";

export const createBuzzAuthState = (
  env: DemoAuthEnv = process.env,
): BuzzAuthState => {
  const user = createDemoBuzzUser(env);

  return {
    accessToken: undefined,
    authSheetVisible: false,
    biometricEnabled: false,
    enableBiometricLogin: async () => false,
    isAuthenticated: user.authSource === "supabase",
    isLocked: false,
    mode: user.authSource,
    requireAuth: async (_intent, action) => {
      await action(user);
      return true;
    },
    sendEmailOtp: async () => undefined,
    verifyEmailOtp: async () => undefined,
    signInWithMagicLink: async () => undefined,
    signInWithOAuth: async () => undefined,
    signOut: async () => undefined,
    status: user.authSource === "supabase" ? "authenticated" : "anonymous",
    unlockWithBiometrics: async () => true,
    user,
  };
};
