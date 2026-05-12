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

export type ProfileQuizOverwriteDecision = "overwrite" | "keep_existing";

export type ProfileQuizState = {
  profileExists: boolean;
  quizAnswers?: Record<string, string>;
  quizCompleted: boolean;
  quizTraits?: Record<string, unknown>;
  userId: string;
};

export type ProfileQuizOverwritePromptState = {
  userId: string;
};

export type AuthenticatedActionContext = {
  profileQuizOverwriteDecision?: ProfileQuizOverwriteDecision;
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
  profileQuizOverwritePrompt: ProfileQuizOverwritePromptState | null;
  profileQuizState: ProfileQuizState | null;
  requireAuth: (
    intent: AuthInteractionIntent,
    action: (
      user: BuzzAuthUser,
      accessToken?: string,
      context?: AuthenticatedActionContext,
    ) => Promise<void> | void,
  ) => Promise<boolean>;
  resolveProfileQuizOverwrite: (
    decision: ProfileQuizOverwriteDecision,
  ) => Promise<void>;
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
