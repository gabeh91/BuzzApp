import { useState } from "react";
import { FontAwesome } from "@expo/vector-icons";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { routes } from "@/navigation/routes";
import { useBuzzTheme } from "@/theme/ThemeProvider";
import type { BuzzTheme } from "@/theme/tokens";
import { Button, Text as UiText } from "@/ui";
import { useBuzzAuth } from "./AuthProvider";
import { AuthModalFrame } from "./AuthModalFrame";
import type { SocialAuthProvider } from "./auth.types";
import {
  createAuthCodeRoute,
  getAuthModalIntentParam,
  useCloseAuthModal,
} from "./authNavigation";

const socialOptions: Array<{
  provider: SocialAuthProvider;
  label: string;
  icon: keyof typeof FontAwesome.glyphMap;
}> = [
  { provider: "apple", label: "Continue with Apple", icon: "apple" },
  { provider: "google", label: "Continue with Google", icon: "google" },
  { provider: "facebook", label: "Continue with Facebook", icon: "facebook" },
];

export const AuthStartScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ intent?: string | string[] }>();
  const closeAuthModal = useCloseAuthModal();
  const {
    completePendingAuthAction,
    sendEmailOtp,
    signInWithEmailPassword,
    signInWithOAuth,
    signUpWithEmailPassword,
  } = useBuzzAuth();
  const { theme } = useBuzzTheme();
  const styles = createStyles(theme);
  const authIntent = getAuthModalIntentParam(params.intent);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busyProvider, setBusyProvider] = useState<SocialAuthProvider | null>(
    null,
  );
  const [emailAction, setEmailAction] = useState<
    "code" | "signIn" | "signUp" | null
  >(null);
  const [noticeMessage, setNoticeMessage] = useState<string | undefined>();
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const normalizedEmail = email.trim();
  const emailBusy = Boolean(emailAction);
  const passwordDisabled =
    !normalizedEmail || password.length < 6 || emailBusy || Boolean(busyProvider);
  const otpDisabled = !normalizedEmail || emailBusy || Boolean(busyProvider);

  if (!authIntent) {
    return <Redirect href={routes.onboarding} />;
  }

  const handleSocial = async (provider: SocialAuthProvider) => {
    setBusyProvider(provider);
    setErrorMessage(undefined);
    setNoticeMessage(undefined);

    try {
      await signInWithOAuth(provider);
      closeAuthModal();
      await completePendingAuthAction();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to start sign in.",
      );
    } finally {
      setBusyProvider(null);
    }
  };

  const handleEmail = async () => {
    setEmailAction("code");
    setErrorMessage(undefined);
    setNoticeMessage(undefined);

    try {
      await sendEmailOtp(normalizedEmail);
      router.push(
        createAuthCodeRoute({ email: normalizedEmail, intent: authIntent }),
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to send the code.",
      );
    } finally {
      setEmailAction(null);
    }
  };

  const handleEmailPassword = async (action: "signIn" | "signUp") => {
    setEmailAction(action);
    setErrorMessage(undefined);
    setNoticeMessage(undefined);

    try {
      if (action === "signIn") {
        await signInWithEmailPassword(normalizedEmail, password);
        closeAuthModal();
        await completePendingAuthAction();
        return;
      }

      const result = await signUpWithEmailPassword(normalizedEmail, password);

      if (result.needsEmailConfirmation) {
        setNoticeMessage(
          "Account created. Check your email, then come back and sign in.",
        );
        return;
      }

      closeAuthModal();
      await completePendingAuthAction();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to sign in.",
      );
    } finally {
      setEmailAction(null);
    }
  };

  return (
    <AuthModalFrame
      body="Create an account or sign in to keep your profile, requests, and chats in sync."
      title="Save your Buzz profile"
    >
      <View style={styles.socialStack}>
        {socialOptions.map((option) => (
          <Pressable
            accessibilityRole="button"
            disabled={Boolean(busyProvider) || emailBusy}
            key={option.provider}
            onPress={() => {
              void handleSocial(option.provider);
            }}
            style={[
              styles.socialButton,
              busyProvider || emailBusy ? styles.disabledButton : null,
            ]}
          >
            <View style={styles.socialIcon}>
              <FontAwesome
                color={theme.colors.text}
                name={option.icon}
                size={18}
              />
            </View>
            <UiText style={styles.socialButtonText}>
              {busyProvider === option.provider ? "Opening..." : option.label}
            </UiText>
          </Pressable>
        ))}
      </View>

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <UiText style={styles.dividerText}>Or use email</UiText>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.emailCard}>
        <View style={styles.fieldStack}>
          <UiText style={styles.fieldLabel}>Email</UiText>
          <TextInput
            autoCapitalize="none"
            autoComplete="email"
            editable={!emailBusy && !busyProvider}
            inputMode="email"
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={theme.colors.textMuted}
            style={styles.input}
            value={email}
          />
        </View>

        <View style={styles.fieldStack}>
          <UiText style={styles.fieldLabel}>Password</UiText>
          <TextInput
            autoCapitalize="none"
            autoComplete="password"
            editable={!emailBusy && !busyProvider}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor={theme.colors.textMuted}
            secureTextEntry
            style={styles.input}
            textContentType="password"
            value={password}
          />
        </View>

        <Button
          disabled={passwordDisabled}
          label={emailAction === "signIn" ? "Signing in..." : "Sign in"}
          onPress={() => {
            void handleEmailPassword("signIn");
          }}
        />

        <Button
          disabled={passwordDisabled}
          label={
            emailAction === "signUp" ? "Creating account..." : "Create account"
          }
          onPress={() => {
            void handleEmailPassword("signUp");
          }}
          variant="tonal"
        />

        <Button
          disabled={otpDisabled}
          label={emailAction === "code" ? "Sending code..." : "Send email code"}
          onPress={() => {
            void handleEmail();
          }}
          variant="plain"
        />
      </View>

      {noticeMessage ? (
        <View style={styles.noticeCard}>
          <UiText style={styles.noticeText}>{noticeMessage}</UiText>
        </View>
      ) : null}

      {errorMessage ? (
        <UiText variant="feedback">{errorMessage}</UiText>
      ) : null}
    </AuthModalFrame>
  );
};

const createStyles = (theme: BuzzTheme) => {
  const { colors, radii, spacing, fontSizes, lineHeights, borderWidths } =
    theme;

  return StyleSheet.create({
    socialStack: {
      gap: spacing[3],
    },
    socialButton: {
      alignItems: "center",
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: radii.lg,
      borderWidth: borderWidths.hairline,
      flexDirection: "row",
      gap: spacing[3],
      minHeight: 56,
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[3],
    },
    socialIcon: {
      alignItems: "center",
      backgroundColor: colors.background,
      borderRadius: radii.full,
      height: 34,
      justifyContent: "center",
      width: 34,
    },
    socialButtonText: {
      color: colors.text,
      flex: 1,
      fontSize: fontSizes.base,
      fontWeight: "900",
      lineHeight: lineHeights.tight,
    },
    dividerRow: {
      alignItems: "center",
      flexDirection: "row",
      gap: spacing[3],
    },
    dividerLine: {
      backgroundColor: colors.border,
      flex: 1,
      height: StyleSheet.hairlineWidth,
    },
    dividerText: {
      color: colors.textMuted,
      fontSize: fontSizes.xs,
      fontWeight: "900",
      letterSpacing: 0.9,
      textTransform: "uppercase",
    },
    emailCard: {
      backgroundColor: colors.surface,
      borderRadius: radii.xl,
      gap: spacing[4],
      padding: spacing[4],
    },
    fieldStack: {
      gap: spacing[2],
    },
    fieldLabel: {
      color: colors.text,
      fontSize: fontSizes.sm,
      fontWeight: "900",
    },
    input: {
      backgroundColor: colors.background,
      borderColor: colors.border,
      borderRadius: radii.lg,
      borderWidth: borderWidths.hairline,
      color: colors.text,
      fontSize: fontSizes.base,
      minHeight: 56,
      paddingHorizontal: spacing[4],
    },
    disabledButton: {
      opacity: 0.55,
    },
    noticeCard: {
      backgroundColor: colors.warningSoft,
      borderRadius: radii.lg,
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[3],
    },
    noticeText: {
      color: colors.text,
      fontSize: fontSizes.sm,
      fontWeight: "800",
      lineHeight: lineHeights.tight,
    },
  });
};
