import { useMemo, useState } from "react";
import { FontAwesome } from "@expo/vector-icons";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { getAuthModalStartCopy } from "@/auth/getAuthModalStartCopy";
import { useI18n } from "@/i18n/I18nProvider";
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

export const AuthStartScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ intent?: string | string[] }>();
  const closeAuthModal = useCloseAuthModal();
  const { LL } = useI18n();
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

  const socialOptions = useMemo(
    () =>
      [
        {
          provider: "apple" as const,
          label: LL.authModal.start.continueWithApple(),
          icon: "apple" as const,
        },
        {
          provider: "google" as const,
          label: LL.authModal.start.continueWithGoogle(),
          icon: "google" as const,
        },
        {
          provider: "facebook" as const,
          label: LL.authModal.start.continueWithFacebook(),
          icon: "facebook" as const,
        },
      ] as const,
    [LL],
  );

  if (!authIntent) {
    return <Redirect href={routes.onboarding} />;
  }

  const frame = getAuthModalStartCopy(LL, authIntent);

  const handleSocial = async (provider: SocialAuthProvider) => {
    setBusyProvider(provider);
    setErrorMessage(undefined);
    setNoticeMessage(undefined);

    try {
      await signInWithOAuth(provider);
      closeAuthModal();
      await completePendingAuthAction();
    } catch {
      setErrorMessage(LL.authModal.errors.unableStartSignIn());
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
    } catch {
      setErrorMessage(LL.authModal.errors.unableSendCode());
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
        setNoticeMessage(LL.authModal.noticeEmailConfirmation());
        return;
      }

      closeAuthModal();
      await completePendingAuthAction();
    } catch {
      setErrorMessage(LL.authModal.errors.unableSignIn());
    } finally {
      setEmailAction(null);
    }
  };

  return (
    <AuthModalFrame
      body={frame.body}
      closeAccessibilityLabel={LL.authModal.close()}
      eyebrow={frame.eyebrow}
      title={frame.title}
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
              {busyProvider === option.provider
                ? LL.authModal.start.openingProvider()
                : option.label}
            </UiText>
          </Pressable>
        ))}
      </View>

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <UiText style={styles.dividerText}>
          {LL.authModal.start.dividerEmail()}
        </UiText>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.emailCard}>
        <View style={styles.fieldStack}>
          <UiText style={styles.fieldLabel}>
            {LL.authModal.start.emailLabel()}
          </UiText>
          <TextInput
            autoCapitalize="none"
            autoComplete="email"
            editable={!emailBusy && !busyProvider}
            inputMode="email"
            onChangeText={setEmail}
            placeholder={LL.authModal.start.emailPlaceholder()}
            placeholderTextColor={theme.colors.textMuted}
            style={styles.input}
            value={email}
          />
        </View>

        <View style={styles.fieldStack}>
          <UiText style={styles.fieldLabel}>
            {LL.authModal.start.passwordLabel()}
          </UiText>
          <TextInput
            autoCapitalize="none"
            autoComplete="password"
            editable={!emailBusy && !busyProvider}
            onChangeText={setPassword}
            placeholder={LL.authModal.start.passwordPlaceholder()}
            placeholderTextColor={theme.colors.textMuted}
            secureTextEntry
            style={styles.input}
            textContentType="password"
            value={password}
          />
        </View>

        <Button
          disabled={passwordDisabled}
          label={
            emailAction === "signIn"
              ? LL.authModal.start.signingIn()
              : LL.authModal.start.signInCta()
          }
          onPress={() => {
            void handleEmailPassword("signIn");
          }}
        />

        <Button
          disabled={passwordDisabled}
          label={
            emailAction === "signUp"
              ? LL.authModal.start.creatingAccount()
              : LL.authModal.start.createAccount()
          }
          onPress={() => {
            void handleEmailPassword("signUp");
          }}
          variant="tonal"
        />

        <Button
          disabled={otpDisabled}
          label={
            emailAction === "code"
              ? LL.authModal.start.sendingEmailCode()
              : LL.authModal.start.sendEmailCode()
          }
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
