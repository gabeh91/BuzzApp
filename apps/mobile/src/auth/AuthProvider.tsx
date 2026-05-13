import * as Linking from "expo-linking";
import * as LocalAuthentication from "expo-local-authentication";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";

import { buzzSupabase } from "@/lib/supabase";
import {
  claimAnonymousOnboardingDraft,
  createAnonymousOnboardingDraft,
  type AnonymousOnboardingDraft,
  resetClaimedAnonymousOnboardingDraft,
} from "@/features/onboarding/onboardingDraft";
import { anonymousOnboardingDraftStore } from "@/features/onboarding/onboardingDraftStorage";
import { deriveProfileTraits } from "@/features/quiz/quizModel";
import { routes } from "@/navigation/routes";
import type { AuthInteractionIntent } from "./authGate";
import { getAuthGateDecision, shouldClaimAnonymousDraft } from "./authGate";
import type {
  AuthenticatedActionContext,
  BuzzAuthState,
  BuzzAuthUser,
  ProfileQuizOverwriteDecision,
  ProfileQuizState,
  SocialAuthProvider,
} from "./auth.types";
import { createAuthStartRoute } from "./authNavigation";
import { drainPostAuthPendingAction } from "./postAuthContinuation";
import { shouldPromptForProfileQuizOverwrite } from "./profileQuizOverwrite";
import {
  createAnonymousBuzzUser,
  createSupabaseBuzzUser,
  shouldLockStoredSession,
} from "./authSession";

WebBrowser.maybeCompleteAuthSession();

const BuzzAuthContext = createContext<BuzzAuthState | null>(null);

const biometricPreferenceKey = (userId: string) =>
  `buzz.biometric.enabled.${userId}`;

const createRedirectUrl = () => Linking.createURL("auth/callback");

const getBiometricPreference = async (userId: string): Promise<boolean> => {
  return (
    (await SecureStore.getItemAsync(biometricPreferenceKey(userId))) === "true"
  );
};

const setBiometricPreference = async (
  userId: string,
  enabled: boolean,
): Promise<void> => {
  if (!enabled) {
    await SecureStore.deleteItemAsync(biometricPreferenceKey(userId));
    return;
  }

  await SecureStore.setItemAsync(biometricPreferenceKey(userId), "true");
};

const createUserFromSession = (session: Session): BuzzAuthUser =>
  createSupabaseBuzzUser({
    displayName:
      typeof session.user.user_metadata?.name === "string"
        ? session.user.user_metadata.name
        : undefined,
    email: session.user.email,
    id: session.user.id,
  });

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const toStringRecord = (value: unknown): Record<string, string> | undefined => {
  if (!isRecord(value)) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string",
    ),
  );
};

const createEmptyProfileQuizState = (userId: string): ProfileQuizState => ({
  profileExists: false,
  quizCompleted: false,
  userId,
});

const normalizeProfileQuizState = (
  value: unknown,
  userId: string,
): ProfileQuizState => {
  if (!isRecord(value)) {
    return createEmptyProfileQuizState(userId);
  }

  const quizAnswers = toStringRecord(value.quizAnswers);
  const quizTraits = isRecord(value.quizTraits) ? value.quizTraits : undefined;

  return {
    profileExists: value.profileExists === true,
    ...(quizAnswers ? { quizAnswers } : {}),
    quizCompleted: value.quizCompleted === true,
    ...(quizTraits ? { quizTraits } : {}),
    userId:
      typeof value.userId === "string" && value.userId.length > 0
        ? value.userId
        : userId,
  };
};

const loadProfileQuizState = async (
  userId: string,
): Promise<ProfileQuizState | null> => {
  const { data, error } = await buzzSupabase.rpc("getBuzzProfileQuizState");

  if (error) {
    return null;
  }

  return normalizeProfileQuizState(data, userId);
};

const hasDraftQuizAnswers = (draft: AnonymousOnboardingDraft): boolean =>
  Object.keys(draft.answers).length > 0;

const persistAnonymousDraftProfile = async (
  user: BuzzAuthUser,
  draft: AnonymousOnboardingDraft,
): Promise<void> => {
  if (!hasDraftQuizAnswers(draft)) {
    return;
  }

  const { error } = await buzzSupabase.rpc("upsertBuzzProfile", {
    cityId: user.cityId,
    displayName: user.displayName,
    quizAnswers: draft.answers,
    quizTraits: deriveProfileTraits(draft.answers),
    userId: user.id,
  });

  if (error) {
    throw error;
  }
};

const claimAnonymousDraftForUser = async (
  user: BuzzAuthUser,
  options: { persistProfile?: boolean } = {},
): Promise<void> => {
  const draft = await anonymousOnboardingDraftStore.load();

  if (!shouldClaimAnonymousDraft(draft)) {
    return;
  }

  if (options.persistProfile !== false) {
    await persistAnonymousDraftProfile(user, draft);
  }

  await anonymousOnboardingDraftStore.update((draft) => {
    if (!shouldClaimAnonymousDraft(draft)) {
      return draft;
    }

    return claimAnonymousOnboardingDraft(draft, user.id);
  });
};

export const BuzzAuthProvider = ({ children }: { children: ReactNode }) => {
  const initialUserRef = useRef(createAnonymousBuzzUser());
  const currentSessionRef = useRef<Session | null>(null);
  const currentUserRef = useRef<BuzzAuthUser>(initialUserRef.current);
  const pendingActionRef = useRef<
    | ((
        user: BuzzAuthUser,
        accessToken?: string,
        context?: AuthenticatedActionContext,
      ) => Promise<void> | void)
    | null
  >(null);
  const pendingProfileQuizOverwriteRef = useRef<{
    session: Session;
    user: BuzzAuthUser;
  } | null>(null);
  const [user, setUser] = useState<BuzzAuthUser>(initialUserRef.current);
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<BuzzAuthState["status"]>("loading");
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [profileQuizState, setProfileQuizState] =
    useState<ProfileQuizState | null>(null);
  const [profileQuizOverwritePrompt, setProfileQuizOverwritePrompt] =
    useState<BuzzAuthState["profileQuizOverwritePrompt"]>(null);

  const completeSession = useCallback(async (nextSession: Session | null) => {
    if (!nextSession) {
      const anonymousUser = createAnonymousBuzzUser();
      currentSessionRef.current = null;
      currentUserRef.current = anonymousUser;
      setSession(null);
      setUser(anonymousUser);
      setBiometricEnabled(false);
      setProfileQuizOverwritePrompt(null);
      setProfileQuizState(null);
      setStatus("anonymous");
      return;
    }

    const nextUser = createUserFromSession(nextSession);
    const nextBiometricEnabled = await getBiometricPreference(nextUser.id);
    const [nextProfileQuizState, anonymousDraft] = await Promise.all([
      loadProfileQuizState(nextUser.id),
      anonymousOnboardingDraftStore.load(),
    ]);

    if (
      shouldPromptForProfileQuizOverwrite({
        draft: anonymousDraft,
        profileQuizState: nextProfileQuizState,
      })
    ) {
      pendingProfileQuizOverwriteRef.current = {
        session: nextSession,
        user: nextUser,
      };
      setProfileQuizOverwritePrompt({ userId: nextUser.id });
    } else {
      pendingProfileQuizOverwriteRef.current = null;
      setProfileQuizOverwritePrompt(null);

      if (nextProfileQuizState) {
        await claimAnonymousDraftForUser(nextUser);
      }
    }

    currentSessionRef.current = nextSession;
    currentUserRef.current = nextUser;
    setSession(nextSession);
    setUser(nextUser);
    setBiometricEnabled(nextBiometricEnabled);
    setProfileQuizState(nextProfileQuizState);
    setStatus(
      shouldLockStoredSession({
        biometricEnabled: nextBiometricEnabled,
        hasStoredSupabaseSession: true,
      })
        ? "locked"
        : "authenticated",
    );
  }, []);

  const runPendingAction = useCallback(
    async (
      nextUser: BuzzAuthUser,
      accessToken?: string,
      context?: AuthenticatedActionContext,
    ): Promise<boolean> => {
      const pendingAction = pendingActionRef.current;
      pendingActionRef.current = null;

      if (pendingAction) {
        await pendingAction(nextUser, accessToken, context);
        return true;
      }

      return false;
    },
    [],
  );

  useEffect(() => {
    let active = true;

    const restoreStoredSession = async () => {
      const { data } = await buzzSupabase.auth.getSession();

      if (active) {
        void completeSession(data.session);
      }
    };

    void restoreStoredSession();

    const { data } = buzzSupabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        const handleAuthStateChange = async () => {
          await completeSession(nextSession);
        };

        void handleAuthStateChange();
      },
    );

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [completeSession]);

  const unlockWithBiometrics = useCallback(async () => {
    if (!session) {
      return false;
    }

    const [hasHardware, enrolled] = await Promise.all([
      LocalAuthentication.hasHardwareAsync(),
      LocalAuthentication.isEnrolledAsync(),
    ]);

    if (!hasHardware || !enrolled) {
      return false;
    }

    const result = await LocalAuthentication.authenticateAsync({
      cancelLabel: "Use another sign in",
      promptMessage: "Unlock Buzz",
    });

    if (!result.success) {
      return false;
    }

    setStatus("authenticated");
    return true;
  }, [session]);

  const enableBiometricLogin = useCallback(async () => {
    if (user.authSource !== "supabase") {
      return false;
    }

    const [hasHardware, enrolled] = await Promise.all([
      LocalAuthentication.hasHardwareAsync(),
      LocalAuthentication.isEnrolledAsync(),
    ]);

    if (!hasHardware || !enrolled) {
      return false;
    }

    await setBiometricPreference(user.id, true);
    setBiometricEnabled(true);
    return true;
  }, [user]);

  const sendEmailOtp = useCallback(async (email: string) => {
    const { error } = await buzzSupabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: createRedirectUrl(),
        shouldCreateUser: true,
      },
    });

    if (error) {
      throw error;
    }
  }, []);

  const signInWithMagicLink = sendEmailOtp;

  const completeSignedInSession = useCallback(
    async (nextSession: Session) => {
      await completeSession(nextSession);
    },
    [completeSession],
  );

  const completePendingAuthAction = useCallback(async () => {
    const session = currentSessionRef.current;
    await drainPostAuthPendingAction({
      user: currentUserRef.current,
      accessToken: session?.access_token ?? undefined,
      isProfileQuizOverwritePending:
        pendingProfileQuizOverwriteRef.current !== null,
      runPendingAction,
    });
  }, [runPendingAction]);

  const resolveProfileQuizOverwrite = useCallback(
    async (decision: ProfileQuizOverwriteDecision) => {
      const pendingConflict = pendingProfileQuizOverwriteRef.current;

      if (!pendingConflict) {
        setProfileQuizOverwritePrompt(null);
        return;
      }

      pendingProfileQuizOverwriteRef.current = null;

      if (decision === "overwrite") {
        await claimAnonymousDraftForUser(pendingConflict.user, {
          persistProfile: false,
        });
        setProfileQuizState(null);
      } else {
        await anonymousOnboardingDraftStore.update(() =>
          createAnonymousOnboardingDraft(),
        );
      }

      setProfileQuizOverwritePrompt(null);
      await drainPostAuthPendingAction({
        user: pendingConflict.user,
        accessToken: pendingConflict.session.access_token ?? undefined,
        isProfileQuizOverwritePending: false,
        profileQuizOverwriteResolution: decision,
        runPendingAction,
      });
    },
    [runPendingAction],
  );

  const signInWithEmailPassword = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await buzzSupabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (!data.session) {
        throw new Error("Check your email before signing in.");
      }

      await completeSignedInSession(data.session);
    },
    [completeSignedInSession],
  );

  const signUpWithEmailPassword = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await buzzSupabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: createRedirectUrl(),
        },
      });

      if (error) {
        throw error;
      }

      if (!data.session) {
        return { needsEmailConfirmation: true };
      }

      await completeSignedInSession(data.session);
      return { needsEmailConfirmation: false };
    },
    [completeSignedInSession],
  );

  const exchangeAuthCode = useCallback(
    async (code: string) => {
      const exchanged = await buzzSupabase.auth.exchangeCodeForSession(code);

      if (exchanged.error) {
        throw exchanged.error;
      }

      if (exchanged.data.session) {
        await completeSignedInSession(exchanged.data.session);
      }
    },
    [completeSignedInSession],
  );

  const verifyEmailOtp = useCallback(
    async (email: string, token: string) => {
      const { data, error } = await buzzSupabase.auth.verifyOtp({
        email,
        token,
        type: "email",
      });

      if (error) {
        throw error;
      }

      if (data.session) {
        await completeSignedInSession(data.session);
      }
    },
    [completeSignedInSession],
  );

  const completeAuthUrl = useCallback(
    async (url: string) => {
      const code = (() => {
        try {
          return new URL(url).searchParams.get("code");
        } catch {
          return null;
        }
      })();

      if (code) {
        await exchangeAuthCode(code);
      }
    },
    [exchangeAuthCode],
  );

  useEffect(() => {
    const handleInitialUrl = async () => {
      const url = await Linking.getInitialURL();

      if (url) {
        await completeAuthUrl(url);
      }
    };

    void handleInitialUrl();

    const subscription = Linking.addEventListener("url", ({ url }) => {
      void completeAuthUrl(url);
    });

    return () => {
      subscription.remove();
    };
  }, [completeAuthUrl]);

  const signInWithOAuth = useCallback(
    async (provider: SocialAuthProvider) => {
      const redirectTo = createRedirectUrl();
      const { data, error } = await buzzSupabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });

      if (error || !data.url) {
        if (error) throw error;
        throw new Error("Unable to start sign in.");
      }

      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectTo,
      );

      if (result.type === "success") {
        const url = new URL(result.url);
        const code = url.searchParams.get("code");

        if (code) {
          await exchangeAuthCode(code);
        }
      }
    },
    [exchangeAuthCode],
  );

  const signOut = useCallback(async () => {
    const signedOutUserId = user.authSource === "supabase" ? user.id : null;

    await buzzSupabase.auth.signOut({ scope: "local" });

    if (signedOutUserId) {
      await anonymousOnboardingDraftStore.update((draft) =>
        resetClaimedAnonymousOnboardingDraft(draft, signedOutUserId),
      );
    }

    await completeSession(null);
    router.replace(routes.onboarding);
  }, [completeSession, user]);

  const requireAuth = useCallback<BuzzAuthState["requireAuth"]>(
    async (intent, action) => {
      const decision = getAuthGateDecision(
        {
          biometricEnabled,
          hasStoredSupabaseSession: Boolean(session),
          status,
        },
        intent,
      );

      if (decision.type === "allow") {
        await action(user, session?.access_token);
        return true;
      }

      if (decision.type === "biometric_unlock") {
        const unlocked = await unlockWithBiometrics();
        if (unlocked) {
          await action(user, session?.access_token);
        }
        return unlocked;
      }

      if (decision.type === "show_auth") {
        pendingActionRef.current = action;
        router.push(createAuthStartRoute(decision.intent));
      }

      return false;
    },
    [biometricEnabled, session, status, unlockWithBiometrics, user],
  );

  const value: BuzzAuthState = {
    accessToken: session?.access_token,
    authSheetVisible: false,
    biometricEnabled,
    completePendingAuthAction,
    enableBiometricLogin,
    isAuthenticated: status !== "loading" && user.authSource === "supabase",
    isLocked: status === "locked",
    mode: user.authSource,
    profileQuizOverwritePrompt,
    profileQuizState,
    requireAuth,
    resolveProfileQuizOverwrite,
    sendEmailOtp,
    verifyEmailOtp,
    signInWithEmailPassword,
    signInWithMagicLink,
    signInWithOAuth,
    signUpWithEmailPassword,
    signOut,
    status,
    unlockWithBiometrics,
    user,
  };

  return (
    <BuzzAuthContext.Provider value={value}>
      {children}
    </BuzzAuthContext.Provider>
  );
};

export const useBuzzAuth = (): BuzzAuthState => {
  const state = useContext(BuzzAuthContext);

  if (!state) {
    throw new Error("useBuzzAuth must be used within BuzzAuthProvider");
  }

  return state;
};
