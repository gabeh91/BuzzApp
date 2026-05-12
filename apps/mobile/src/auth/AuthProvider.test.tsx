import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import type { ReactElement } from "react";
import { Pressable, Text as NativeText } from "react-native";

import { routes } from "@/navigation/routes";
import { I18nProvider } from "@/i18n/I18nProvider";
import { ThemeProvider } from "@/theme/ThemeProvider";
import { AuthCodeScreen } from "./AuthCodeScreen";
import { BuzzAuthProvider, useBuzzAuth } from "./AuthProvider";
import { AuthStartScreen } from "./AuthStartScreen";

const mockRouterDismiss = jest.fn();
const mockRouterPush = jest.fn();
const mockRouterReplace = jest.fn();
const mockRootNavigationCanGoBack = jest.fn();
const mockRootNavigationGoBack = jest.fn();
const mockAnonymousDraftLoad = jest.fn();
const mockAnonymousDraftUpdate = jest.fn();
const mockGetSession = jest.fn();
const mockPendingAuthAction = jest.fn();
const mockRpc = jest.fn();
const mockSignInWithPassword = jest.fn();
const mockSignInWithOtp = jest.fn();
const mockSignOut = jest.fn();
const mockSignUp = jest.fn();
const mockUseLocalSearchParams = jest.fn();
const mockVerifyOtp = jest.fn();

jest.mock("expo-router", () => {
  const React = require("react");
  const { Text } = require("react-native");

  return {
    Redirect: ({ href }: { href: string }) =>
      React.createElement(Text, null, `Redirect ${href}`),
    router: {
      push: (...args: unknown[]) => mockRouterPush(...args),
      replace: (...args: unknown[]) => mockRouterReplace(...args),
    },
    useLocalSearchParams: () => mockUseLocalSearchParams(),
    useNavigation: jest.fn(() => ({
      canGoBack: (...args: unknown[]) => mockRootNavigationCanGoBack(...args),
      goBack: (...args: unknown[]) => mockRootNavigationGoBack(...args),
    })),
    useRouter: jest.fn(() => ({
      dismiss: (...args: unknown[]) => mockRouterDismiss(...args),
      push: (...args: unknown[]) => mockRouterPush(...args),
      replace: (...args: unknown[]) => mockRouterReplace(...args),
    })),
  };
});

jest.mock("@/lib/supabase", () => ({
  buzzSupabase: {
    auth: {
      exchangeCodeForSession: jest.fn(),
      getSession: (...args: unknown[]) => mockGetSession(...args),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
      signInWithOAuth: jest.fn(),
      signInWithPassword: (...args: unknown[]) =>
        mockSignInWithPassword(...args),
      signInWithOtp: (...args: unknown[]) => mockSignInWithOtp(...args),
      signOut: (...args: unknown[]) => mockSignOut(...args),
      signUp: (...args: unknown[]) => mockSignUp(...args),
      verifyOtp: (...args: unknown[]) => mockVerifyOtp(...args),
    },
    rpc: (...args: unknown[]) => mockRpc(...args),
  },
}));

jest.mock("@/features/onboarding/onboardingDraftStorage", () => ({
  anonymousOnboardingDraftStore: {
    load: (...args: unknown[]) => mockAnonymousDraftLoad(...args),
    update: (...args: unknown[]) => mockAnonymousDraftUpdate(...args),
  },
}));

jest.mock("expo-linking", () => ({
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  createURL: jest.fn(() => "buzz://auth/callback"),
  getInitialURL: jest.fn(async () => null),
}));

jest.mock("expo-local-authentication", () => ({
  authenticateAsync: jest.fn(),
  hasHardwareAsync: jest.fn(async () => false),
  isEnrolledAsync: jest.fn(async () => false),
}));

jest.mock("expo-secure-store", () => ({
  deleteItemAsync: jest.fn(),
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(),
}));

jest.mock("expo-web-browser", () => ({
  maybeCompleteAuthSession: jest.fn(),
  openAuthSessionAsync: jest.fn(),
}));

const renderWithProviders = (ui: ReactElement) => {
  return render(
    <ThemeProvider>
      <I18nProvider>
        <BuzzAuthProvider>{ui}</BuzzAuthProvider>
      </I18nProvider>
    </ThemeProvider>,
  );
};

const AuthGateButton = () => {
  const { requireAuth } = useBuzzAuth();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        void requireAuth("save_profile", async () => undefined);
      }}
    >
      <NativeText>Open auth</NativeText>
    </Pressable>
  );
};

const AuthGateButtonWithPendingAction = () => {
  const { requireAuth } = useBuzzAuth();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        void requireAuth("chat", async (_user, _accessToken, context) => {
          mockPendingAuthAction(context);
        });
      }}
    >
      <NativeText>Say hi</NativeText>
    </Pressable>
  );
};

const AuthSignOutButton = () => {
  const { signOut, user } = useBuzzAuth();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        void signOut();
      }}
    >
      <NativeText>Sign out {user.id}</NativeText>
    </Pressable>
  );
};

const AuthConflictControls = () => {
  const { profileQuizOverwritePrompt, resolveProfileQuizOverwrite } =
    useBuzzAuth();

  return (
    <>
      <NativeText>
        {profileQuizOverwritePrompt ? "Overwrite prompt visible" : "No prompt"}
      </NativeText>
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          void resolveProfileQuizOverwrite("keep_existing");
        }}
      >
        <NativeText>Keep previous answers</NativeText>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          void resolveProfileQuizOverwrite("overwrite");
        }}
      >
        <NativeText>Use new answers</NativeText>
      </Pressable>
    </>
  );
};

describe("Buzz auth modal flow", () => {
  beforeEach(() => {
    mockRouterDismiss.mockReset();
    mockRouterPush.mockReset();
    mockRouterReplace.mockReset();
    mockAnonymousDraftLoad.mockReset();
    mockAnonymousDraftLoad.mockResolvedValue({
      activeQuestionIndex: 0,
      answers: {},
      selectedInterest: null,
      status: "empty",
    });
    mockAnonymousDraftUpdate.mockReset();
    mockAnonymousDraftUpdate.mockResolvedValue(undefined);
    mockGetSession.mockReset();
    mockGetSession.mockResolvedValue({ data: { session: null } });
    mockPendingAuthAction.mockReset();
    mockRpc.mockReset();
    mockRpc.mockResolvedValue({
      data: {
        profileExists: false,
        quizAnswers: {},
        quizCompleted: false,
        quizTraits: {},
        userId: "user-1",
      },
      error: null,
    });
    mockRootNavigationCanGoBack.mockReset();
    mockRootNavigationCanGoBack.mockReturnValue(true);
    mockRootNavigationGoBack.mockReset();
    mockSignInWithPassword.mockReset();
    mockSignInWithOtp.mockReset();
    mockSignOut.mockReset();
    mockSignOut.mockResolvedValue({ error: null });
    mockSignUp.mockReset();
    mockUseLocalSearchParams.mockReset();
    mockUseLocalSearchParams.mockReturnValue({
      email: "sam@example.com",
      intent: "save_profile",
    });
    mockVerifyOtp.mockReset();
  });

  it("opens the native auth modal route for authenticated interactions", async () => {
    renderWithProviders(<AuthGateButton />);

    fireEvent.press(await screen.findByRole("button", { name: "Open auth" }));

    expect(mockRouterPush).toHaveBeenCalledWith({
      pathname: routes.auth,
      params: { intent: "save_profile" },
    });
  });

  it("redirects away from restored auth route launches without an auth intent", async () => {
    mockUseLocalSearchParams.mockReturnValue({});

    renderWithProviders(<AuthStartScreen />);

    expect(
      await screen.findByText(`Redirect ${routes.onboarding}`),
    ).toBeTruthy();
  });

  it("sends an email OTP and pushes the code screen inside the auth modal", async () => {
    mockSignInWithOtp.mockResolvedValue({ error: null });

    renderWithProviders(<AuthStartScreen />);

    fireEvent.changeText(
      await screen.findByPlaceholderText("you@example.com"),
      "sam@example.com",
    );
    fireEvent.press(screen.getByRole("button", { name: "Email me a code" }));

    await waitFor(() => {
      expect(mockSignInWithOtp).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "sam@example.com",
        }),
      );
      expect(mockRouterPush).toHaveBeenCalledWith({
        pathname: routes.authCode,
        params: { email: "sam@example.com", intent: "save_profile" },
      });
    });
  });

  it("creates an email password account and closes auth when a session is returned", async () => {
    mockSignUp.mockResolvedValue({
      data: {
        session: {
          access_token: "access-token",
          user: {
            email: "sam@example.com",
            id: "user-1",
            user_metadata: {},
          },
        },
      },
      error: null,
    });

    renderWithProviders(<AuthStartScreen />);

    fireEvent.changeText(
      await screen.findByPlaceholderText("you@example.com"),
      "sam@example.com",
    );
    fireEvent.changeText(screen.getByPlaceholderText("Password"), "password1");
    fireEvent.press(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "sam@example.com",
          password: "password1",
        }),
      );
      expect(mockRootNavigationGoBack).toHaveBeenCalled();
    });
  });

  it("runs the pending auth action after closing the auth modal on account creation", async () => {
    mockSignUp.mockResolvedValue({
      data: {
        session: {
          access_token: "access-token",
          user: {
            email: "sam@example.com",
            id: "user-1",
            user_metadata: {},
          },
        },
      },
      error: null,
    });

    renderWithProviders(
      <>
        <AuthGateButtonWithPendingAction />
        <AuthStartScreen />
      </>,
    );

    fireEvent.press(await screen.findByRole("button", { name: "Say hi" }));

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith({
        pathname: routes.auth,
        params: { intent: "chat" },
      });
    });

    fireEvent.changeText(
      screen.getByPlaceholderText("you@example.com"),
      "sam@example.com",
    );
    fireEvent.changeText(screen.getByPlaceholderText("Password"), "password1");
    fireEvent.press(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => {
      expect(mockRootNavigationGoBack).toHaveBeenCalled();
      expect(mockPendingAuthAction).toHaveBeenCalledTimes(1);
    });

    const closeCallOrder = mockRootNavigationGoBack.mock.invocationCallOrder[0];
    const pendingCallOrder = mockPendingAuthAction.mock.invocationCallOrder[0];

    expect(closeCallOrder).toBeDefined();
    expect(pendingCallOrder).toBeDefined();
    expect(closeCallOrder ?? 0).toBeLessThan(pendingCallOrder ?? 0);
  });

  it("interrupts pending auth actions when local quiz answers would overwrite an existing completed profile", async () => {
    mockAnonymousDraftLoad.mockResolvedValue({
      activeQuestionIndex: 19,
      answers: { pace: "low" },
      selectedInterest: null,
      status: "complete",
    });
    mockRpc.mockResolvedValue({
      data: {
        profileExists: true,
        quizAnswers: { pace: "balanced" },
        quizCompleted: true,
        quizTraits: { quizCompleted: true },
        userId: "user-1",
      },
      error: null,
    });
    mockSignInWithPassword.mockResolvedValue({
      data: {
        session: {
          access_token: "access-token",
          user: {
            email: "sam@example.com",
            id: "user-1",
            user_metadata: {},
          },
        },
      },
      error: null,
    });

    renderWithProviders(
      <>
        <AuthGateButtonWithPendingAction />
        <AuthStartScreen />
        <AuthConflictControls />
      </>,
    );

    fireEvent.press(await screen.findByRole("button", { name: "Say hi" }));
    fireEvent.changeText(
      await screen.findByPlaceholderText("you@example.com"),
      "sam@example.com",
    );
    fireEvent.changeText(screen.getByPlaceholderText("Password"), "password1");
    fireEvent.press(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByText("Overwrite prompt visible")).toBeTruthy();
    expect(mockPendingAuthAction).not.toHaveBeenCalled();

    fireEvent.press(
      screen.getByRole("button", { name: "Keep previous answers" }),
    );

    await waitFor(() => {
      expect(mockPendingAuthAction).toHaveBeenCalledWith({
        profileQuizOverwriteDecision: "keep_existing",
      });
    });
  });

  it("persists a local anonymous quiz draft when signing into an account without saved answers", async () => {
    mockAnonymousDraftLoad.mockResolvedValue({
      activeQuestionIndex: 1,
      answers: { "energy-after-work": "quiet-reset" },
      selectedInterest: null,
      status: "partial",
    });
    mockRpc.mockImplementation(async (functionName: string) => {
      if (functionName === "getBuzzProfileQuizState") {
        return {
          data: {
            profileExists: true,
            quizAnswers: {},
            quizCompleted: false,
            quizTraits: {},
            userId: "user-1",
          },
          error: null,
        };
      }

      return {
        data: { ok: true, profileId: "user-1", quizCompleted: false },
        error: null,
      };
    });
    mockSignInWithPassword.mockResolvedValue({
      data: {
        session: {
          access_token: "access-token",
          user: {
            email: "sam@example.com",
            id: "user-1",
            user_metadata: {},
          },
        },
      },
      error: null,
    });

    renderWithProviders(<AuthStartScreen />);

    fireEvent.changeText(
      await screen.findByPlaceholderText("you@example.com"),
      "sam@example.com",
    );
    fireEvent.changeText(screen.getByPlaceholderText("Password"), "password1");
    fireEvent.press(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(mockRpc).toHaveBeenCalledWith(
        "upsertBuzzProfile",
        expect.objectContaining({
          quizAnswers: { "energy-after-work": "quiet-reset" },
          userId: "user-1",
        }),
      );
      expect(mockAnonymousDraftUpdate).toHaveBeenCalledWith(
        expect.any(Function),
      );
    });
  });

  it("signs in an existing email password account and closes auth", async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: {
        session: {
          access_token: "access-token",
          user: {
            email: "sam@example.com",
            id: "user-1",
            user_metadata: {},
          },
        },
      },
      error: null,
    });

    renderWithProviders(<AuthStartScreen />);

    fireEvent.changeText(
      await screen.findByPlaceholderText("you@example.com"),
      "sam@example.com",
    );
    fireEvent.changeText(screen.getByPlaceholderText("Password"), "password1");
    fireEvent.press(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: "sam@example.com",
        password: "password1",
      });
      expect(mockRootNavigationGoBack).toHaveBeenCalled();
    });
  });

  it("signs out, clears the claimed onboarding draft, and returns to onboarding", async () => {
    mockGetSession.mockResolvedValueOnce({
      data: {
        session: {
          access_token: "access-token",
          user: {
            email: "sam@example.com",
            id: "user-1",
            user_metadata: {},
          },
        },
      },
    });

    renderWithProviders(<AuthSignOutButton />);

    const signOutButton = await screen.findByRole("button", {
      name: "Sign out user-1",
    });
    mockAnonymousDraftUpdate.mockClear();

    fireEvent.press(signOutButton);

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledWith({ scope: "local" });
      expect(mockAnonymousDraftUpdate).toHaveBeenCalledWith(
        expect.any(Function),
      );
      expect(mockRouterReplace).toHaveBeenCalledWith(routes.onboarding);
    });
  });

  it("verifies an email OTP and closes the parent auth modal", async () => {
    mockVerifyOtp.mockResolvedValue({
      data: {
        session: {
          access_token: "access-token",
          user: {
            email: "sam@example.com",
            id: "user-1",
            user_metadata: {},
          },
        },
      },
      error: null,
    });

    renderWithProviders(<AuthCodeScreen />);

    fireEvent.changeText(
      await screen.findByPlaceholderText("123456"),
      "123456",
    );
    fireEvent.press(screen.getByRole("button", { name: "Continue" }));

    await waitFor(() => {
      expect(mockVerifyOtp).toHaveBeenCalledWith({
        email: "sam@example.com",
        token: "123456",
        type: "email",
      });
      expect(mockRootNavigationGoBack).toHaveBeenCalled();
      expect(mockRouterDismiss).not.toHaveBeenCalled();
    });
  });

  it("replaces to home after email OTP verification when the auth route has no parent stack", async () => {
    mockRootNavigationCanGoBack.mockReturnValue(false);
    mockVerifyOtp.mockResolvedValue({
      data: {
        session: {
          access_token: "access-token",
          user: {
            email: "sam@example.com",
            id: "user-1",
            user_metadata: {},
          },
        },
      },
      error: null,
    });

    renderWithProviders(<AuthCodeScreen />);

    fireEvent.changeText(
      await screen.findByPlaceholderText("123456"),
      "123456",
    );
    fireEvent.press(screen.getByRole("button", { name: "Continue" }));

    await waitFor(() => {
      expect(mockVerifyOtp).toHaveBeenCalledWith({
        email: "sam@example.com",
        token: "123456",
        type: "email",
      });
      expect(mockRouterDismiss).not.toHaveBeenCalled();
      expect(mockRouterReplace).toHaveBeenCalledWith(routes.home);
    });
  });
});
