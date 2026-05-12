import type { AuthInteractionIntent } from "./authGate";

export type SocialAuthProvider = "apple" | "google" | "facebook";

export type BuzzAuthMode = "anonymous" | "demo" | "supabase";
export type BuzzAuthStatus =
  | "loading"
  | "anonymous"
  | "authenticated"
  | "locked";

export type BuzzAuthUser = {
  id: string;
  displayName: string;
  cityId: string;
  cityName: string;
  authSource: BuzzAuthMode;
};

export type EmailPasswordSignUpResult = {
  needsEmailConfirmation: boolean;
};

export type BuzzAuthState = {
  accessToken?: string | undefined;
  authSheetVisible: boolean;
  biometricEnabled: boolean;
  completePendingAuthAction: () => Promise<void>;
  enableBiometricLogin: () => Promise<boolean>;
  isAuthenticated: boolean;
  isLocked: boolean;
  mode: BuzzAuthMode;
  requireAuth: (
    intent: AuthInteractionIntent,
    action: (user: BuzzAuthUser, accessToken?: string) => Promise<void> | void,
  ) => Promise<boolean>;
  sendEmailOtp: (email: string) => Promise<void>;
  verifyEmailOtp: (email: string, token: string) => Promise<void>;
  signInWithEmailPassword: (email: string, password: string) => Promise<void>;
  signInWithMagicLink: (email: string) => Promise<void>;
  signInWithOAuth: (provider: SocialAuthProvider) => Promise<void>;
  signUpWithEmailPassword: (
    email: string,
    password: string,
  ) => Promise<EmailPasswordSignUpResult>;
  signOut: () => Promise<void>;
  status: BuzzAuthStatus;
  unlockWithBiometrics: () => Promise<boolean>;
  user: BuzzAuthUser;
};
