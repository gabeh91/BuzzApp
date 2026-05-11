import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

import { useBuzzAuth } from "@/auth/AuthProvider";
import { normalizeInviteToken } from "@/features/invites/inviteModel";
import { useI18n } from "@/i18n/I18nProvider";
import { runAcceptInviteAction, runResolveInviteAction } from "@/lib/functions";
import { routes } from "@/navigation/routes";
import { useBuzzTheme } from "@/theme/ThemeProvider";
import type { BuzzTheme } from "@/theme/tokens";

type InviteRouteStatus =
  | "idle"
  | "resolving"
  | "ready"
  | "error"
  | "accepting"
  | "accepted";

const JoinGroupInviteRoute = () => {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token?: string | string[] }>();
  const { user } = useBuzzAuth();
  const { LL } = useI18n();
  const { theme } = useBuzzTheme();
  const styles = createStyles(theme);
  const rawToken = Array.isArray(token) ? token[0] : token;
  const inviteToken = normalizeInviteToken(rawToken ?? "");
  const [status, setStatus] = useState<InviteRouteStatus>(
    inviteToken ? "resolving" : "idle",
  );
  const [resolvedGroupId, setResolvedGroupId] = useState<string | null>(null);

  useEffect(() => {
    if (!inviteToken) {
      setStatus("idle");
      return;
    }

    let active = true;

    const resolveInvite = async () => {
      setStatus("resolving");

      try {
        const result = await runResolveInviteAction({ token: inviteToken });

        if (active) {
          setResolvedGroupId(result.activityGroupId);
          setStatus("ready");
        }
      } catch {
        if (active) {
          setStatus("error");
        }
      }
    };

    void resolveInvite();

    return () => {
      active = false;
    };
  }, [inviteToken]);

  const handleAcceptInvite = async () => {
    if (!inviteToken) {
      router.replace(routes.home);
      return;
    }

    setStatus("accepting");

    try {
      const result = await runAcceptInviteAction({
        profileId: user.id,
        token: inviteToken,
      });

      setStatus("accepted");
      router.replace(routes.group(result.activityGroupId));
    } catch {
      setStatus("error");
    }
  };

  const bodyCopy = !inviteToken
    ? LL.groups.invites.missingToken()
    : status === "resolving"
      ? LL.groups.invites.resolving()
      : status === "error"
        ? LL.groups.invites.resolveFailed()
        : status === "accepted"
          ? LL.groups.invites.accepted()
          : LL.groups.invites.joinBody();
  const buttonLabel =
    status === "accepting"
      ? LL.groups.invites.accepting()
      : inviteToken && resolvedGroupId
        ? LL.groups.invites.accept()
        : LL.groups.backHome();

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>{LL.groups.invites.bringFriend()}</Text>
        <Text style={styles.title}>{LL.groups.invites.joinTitle()}</Text>
        <Text style={styles.body}>{bodyCopy}</Text>
        <Pressable
          accessibilityRole="button"
          disabled={status === "resolving" || status === "accepting"}
          onPress={
            inviteToken && resolvedGroupId
              ? handleAcceptInvite
              : () => {
                  router.replace(routes.home);
                }
          }
          style={[
            styles.button,
            status === "resolving" || status === "accepting"
              ? styles.buttonDisabled
              : null,
          ]}
        >
          <Text style={styles.buttonText}>{buttonLabel}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const createStyles = (theme: BuzzTheme) => {
  const { colors, fontSizes, lineHeights, radii, spacing } = theme;

  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      gap: spacing[4],
      justifyContent: "center",
      padding: spacing[6],
    },
    eyebrow: {
      color: colors.accent,
      fontSize: fontSizes.xs,
      fontWeight: "900",
      letterSpacing: 1,
      textTransform: "uppercase",
    },
    title: {
      color: colors.text,
      fontSize: fontSizes["3xl"],
      fontWeight: "900",
      lineHeight: lineHeights.title,
    },
    body: {
      color: colors.textMuted,
      fontSize: fontSizes.base,
      lineHeight: lineHeights.body,
    },
    button: {
      alignItems: "center",
      backgroundColor: colors.surfaceInverse,
      borderRadius: radii.sm,
      paddingHorizontal: spacing[5],
      paddingVertical: spacing[4],
    },
    buttonDisabled: {
      opacity: 0.72,
    },
    buttonText: {
      color: colors.textInverse,
      fontSize: fontSizes.base,
      fontWeight: "900",
    },
  });
};

export default JoinGroupInviteRoute;
