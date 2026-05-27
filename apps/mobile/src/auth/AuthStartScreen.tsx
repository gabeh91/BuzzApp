import { useMemo, useState } from "react";
import { FontAwesome } from "@expo/vector-icons";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

import { getAuthModalStartCopy } from "@/auth/getAuthModalStartCopy";
import { useI18n } from "@/i18n/I18nProvider";
import { routes } from "@/navigation/routes";
import { useBuzzTheme } from "@/theme/ThemeProvider";
import type { BuzzTheme } from "@/theme/tokens";
import { Button, Text as UiText, TextInputGroup } from "@/ui";
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
  const isExistingAccountSignIn =
    authIntent === "existing_account_sign_in";
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
      await sendEmailOtp(normalizedEmail, {
        shouldCreateUser: !isExistingAccountSignIn,
      });
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
            accessibilityState={{
              disabled: Boolean(busyProvider) || emailBusy,
            }}
            disabled={Boolean(busyProvider) || emailBusy}
            key={option.provider}
            onPress={() => {
              void handleSocial(option.provider);
            }}
            style={({ pressed }) => [
              styles.socialButton,
              pressed ? styles.socialButtonPressed : null,
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
            <View style={styles.socialAffordance}>
              <FontAwesome
                color={theme.colors.textMuted}
                name="angle-right"
                size={18}
              />
            </View>
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
        <TextInputGroup
          autoCapitalize="none"
          autoComplete="email"
          editable={!emailBusy && !busyProvider}
          inputMode="email"
          label={LL.authModal.start.emailLabel()}
          labelBackdropColor={theme.colors.surface}
          onChangeText={setEmail}
          value={email}
        />

        <TextInputGroup
          autoCapitalize="none"
          autoComplete="password"
          editable={!emailBusy && !busyProvider}
          label={LL.authModal.start.passwordLabel()}
          labelBackdropColor={theme.colors.surface}
          onChangeText={setPassword}
          secureTextEntry
          textContentType="password"
          value={password}
        />

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

        {isExistingAccountSignIn ? null : (
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
        )}

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
      gap: spacing[2],
    },
    socialButton: {
      alignItems: "center",
      backgroundColor: colors.surface,
      borderColor: colors.overlay,
      borderRadius: radii.sm,
      borderWidth: borderWidths.hairline,
      flexDirection: "row",
      gap: spacing[3],
      minHeight: 58,
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[2],
    },
    socialButtonPressed: {
      opacity: 0.84,
      transform: [{ scale: 0.99 }],
    },
    socialIcon: {
      alignItems: "center",
      backgroundColor: colors.warningSoft,
      borderRadius: radii.full,
      height: 38,
      justifyContent: "center",
      width: 38,
    },
    socialButtonText: {
      color: colors.text,
      flex: 1,
      fontSize: fontSizes.md,
      ...theme.fontStyles.heavy,
      lineHeight: lineHeights.tight,
    },
    socialAffordance: {
      alignItems: "center",
      backgroundColor: colors.background,
      borderRadius: radii.full,
      height: 30,
      justifyContent: "center",
      width: 30,
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
      ...theme.fontStyles.black,
      letterSpacing: 0.9,
      textTransform: "uppercase",
    },
    emailCard: {
      backgroundColor: colors.surface,
      borderRadius: radii.xl,
      gap: spacing[4],
      padding: spacing[4],
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
      ...theme.fontStyles.heavy,
      lineHeight: lineHeights.tight,
    },
  });
};
