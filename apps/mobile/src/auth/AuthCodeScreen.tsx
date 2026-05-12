import { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { useBuzzTheme } from "@/theme/ThemeProvider";
import type { BuzzTheme } from "@/theme/tokens";
import { Button, Text as UiText } from "@/ui";
import { useBuzzAuth } from "./AuthProvider";
import { AuthModalFrame } from "./AuthModalFrame";
import {
  createAuthStartRoute,
  getAuthModalIntentParam,
  useCloseAuthModal,
} from "./authNavigation";

const getEmailParam = (value: string | string[] | undefined): string => {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
};

export const AuthCodeScreen = () => {
  const router = useRouter();
  const closeAuthModal = useCloseAuthModal();
  const params = useLocalSearchParams<{
    email?: string | string[];
    intent?: string | string[];
  }>();
  const { sendEmailOtp, verifyEmailOtp } = useBuzzAuth();
  const { theme } = useBuzzTheme();
  const styles = createStyles(theme);
  const email = getEmailParam(params.email).trim();
  const authIntent = getAuthModalIntentParam(params.intent) ?? "save_profile";
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState<string | undefined>();
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const normalizedCode = code.replace(/\D/g, "").slice(0, 6);
  const canVerify = Boolean(email) && normalizedCode.length >= 6 && !busy;

  const handleVerify = async () => {
    setBusy(true);
    setErrorMessage(undefined);
    setNoticeMessage(undefined);

    try {
      await verifyEmailOtp(email, normalizedCode);
      closeAuthModal();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "That code did not work.",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleResend = async () => {
    setBusy(true);
    setErrorMessage(undefined);
    setNoticeMessage(undefined);

    try {
      await sendEmailOtp(email);
      setNoticeMessage("We sent a new code.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to resend the code.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthModalFrame
      body={
        email
          ? `Enter the 6-digit code sent to ${email}.`
          : "Enter your email first so Buzz can send a sign-in code."
      }
      eyebrow="Check your email"
      title="Enter your code"
    >
      <View style={styles.codeCard}>
        <View style={styles.fieldStack}>
          <UiText style={styles.fieldLabel}>Email code</UiText>
          <TextInput
            autoComplete="one-time-code"
            editable={!busy && Boolean(email)}
            inputMode="numeric"
            keyboardType="number-pad"
            maxLength={6}
            onChangeText={(value) => {
              setCode(value.replace(/\D/g, "").slice(0, 6));
            }}
            placeholder="123456"
            placeholderTextColor={theme.colors.textMuted}
            style={styles.codeInput}
            textContentType="oneTimeCode"
            value={normalizedCode}
          />
        </View>

        <Button
          disabled={!canVerify}
          label={busy ? "Checking..." : "Continue"}
          onPress={() => {
            void handleVerify();
          }}
        />

        <View style={styles.secondaryActions}>
          <Pressable
            accessibilityRole="button"
            disabled={busy || !email}
            onPress={() => {
              void handleResend();
            }}
            style={styles.textAction}
          >
            <UiText style={styles.textActionLabel}>Send a new code</UiText>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace(createAuthStartRoute(authIntent))}
            style={styles.textAction}
          >
            <UiText style={styles.textActionLabel}>Use a different email</UiText>
          </Pressable>
        </View>
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
    codeCard: {
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
    codeInput: {
      backgroundColor: colors.background,
      borderColor: colors.border,
      borderRadius: radii.lg,
      borderWidth: borderWidths.hairline,
      color: colors.text,
      fontSize: 30,
      fontWeight: "900",
      letterSpacing: 8,
      minHeight: 64,
      paddingHorizontal: spacing[4],
      textAlign: "center",
    },
    secondaryActions: {
      alignItems: "center",
      gap: spacing[2],
    },
    textAction: {
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[2],
    },
    textActionLabel: {
      color: colors.brand,
      fontSize: fontSizes.sm,
      fontWeight: "900",
      lineHeight: lineHeights.tight,
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
