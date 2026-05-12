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
import { claimAnonymousOnboardingDraft } from "@/features/onboarding/onboardingDraft";
import { anonymousOnboardingDraftStore } from "@/features/onboarding/onboardingDraftStorage";
import type { AuthInteractionIntent } from "./authGate";
import { getAuthGateDecision, shouldClaimAnonymousDraft } from "./authGate";
import type {
  BuzzAuthState,
  BuzzAuthUser,
  SocialAuthProvider,
} from "./auth.types";
import { createAuthStartRoute } from "./authNavigation";
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

const claimAnonymousDraftForUser = async (userId: string): Promise<void> => {
  await anonymousOnboardingDraftStore.update((draft) => {
    if (!shouldClaimAnonymousDraft(draft)) {
      return draft;
    }

    return claimAnonymousOnboardingDraft(draft, userId);
  });
};

export const BuzzAuthProvider = ({ children }: { children: ReactNode }) => {
  const pendingActionRef = useRef<
    ((user: BuzzAuthUser, accessToken?: string) => Promise<void> | void) | null
  >(null);
  const [user, setUser] = useState<BuzzAuthUser>(() =>
    createAnonymousBuzzUser(),
  );
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<BuzzAuthState["status"]>("loading");
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  const completeSession = useCallback(async (nextSession: Session | null) => {
    if (!nextSession) {
      setSession(null);
      setUser(createAnonymousBuzzUser());
      setBiometricEnabled(false);
      setStatus("anonymous");
      return;
    }

    const nextUser = createUserFromSession(nextSession);
    const nextBiometricEnabled = await getBiometricPreference(nextUser.id);

    await claimAnonymousDraftForUser(nextUser.id);

    setSession(nextSession);
    setUser(nextUser);
    setBiometricEnabled(nextBiometricEnabled);
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
    async (nextUser: BuzzAuthUser, accessToken?: string) => {
      const pendingAction = pendingActionRef.current;
      pendingActionRef.current = null;

      if (pendingAction) {
        await pendingAction(nextUser, accessToken);
      }
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

          if (nextSession) {
            await runPendingAction(
              createUserFromSession(nextSession),
              nextSession.access_token,
            );
          }
        };

        void handleAuthStateChange();
      },
    );

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [completeSession, runPendingAction]);

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
      await runPendingAction(
        createUserFromSession(nextSession),
        nextSession.access_token,
      );
    },
    [completeSession, runPendingAction],
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
    await buzzSupabase.auth.signOut({ scope: "local" });
    await completeSession(null);
  }, [completeSession]);

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
    enableBiometricLogin,
    isAuthenticated: status !== "loading" && user.authSource === "supabase",
    isLocked: status === "locked",
    mode: user.authSource,
    requireAuth,
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
