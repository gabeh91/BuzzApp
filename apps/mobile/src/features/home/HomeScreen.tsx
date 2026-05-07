import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import { useBuzzAuth } from "@/auth/AuthProvider";
import { useInterestFlow } from "@/features/interests/InterestFlowProvider";
import { useQuiz } from "@/features/quiz/QuizProvider";
import { useI18n } from "@/i18n/I18nProvider";
import { runMatchAction } from "@/lib/functions";
import { routes } from "@/navigation/routes";
import { useBuzzTheme } from "@/theme/ThemeProvider";
import type { BuzzTheme } from "@/theme/tokens";

type MatchActionStatus = "idle" | "accepting" | "declining" | "declined" | "error";

export const HomeScreen = () => {
  const router = useRouter();
  const { theme } = useBuzzTheme();
  const styles = createStyles(theme);
  const { LL } = useI18n();
  const { user } = useBuzzAuth();
  const { traits } = useQuiz();
  const { state } = useInterestFlow();
  const [matchActionStatus, setMatchActionStatus] = useState<MatchActionStatus>("idle");
  const selectedInterestName = state.selectedInterest?.name ?? LL.home.fallbackInterest();
  const match = state.matchPreview;
  const isAccepting = matchActionStatus === "accepting";
  const isDeclining = matchActionStatus === "declining";

  const handleAcceptPlan = async () => {
    if (!match) return;

    setMatchActionStatus("accepting");

    if (match.source === "local") {
      router.push(routes.group(`local-${match.id}`));
      return;
    }

    try {
      const result = await runMatchAction({
        action: "accept",
        matchCandidateId: match.id,
        profileId: user.id
      });
      router.push(routes.group(result.activityGroupId ?? match.id));
    } catch {
      setMatchActionStatus("error");
    }
  };

  const handleDeclinePlan = async () => {
    if (!match) return;

    setMatchActionStatus("declining");

    if (match.source === "local") {
      setMatchActionStatus("declined");
      return;
    }

    try {
      await runMatchAction({
        action: "decline",
        matchCandidateId: match.id,
        profileId: user.id
      });
      setMatchActionStatus("declined");
    } catch {
      setMatchActionStatus("error");
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.logo}>{LL.brand.name()}</Text>
          <Text style={styles.city}>{user.cityName}</Text>
        </View>

        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>{LL.home.firstPlan()}</Text>
          <Text style={styles.title}>
            {match ? LL.home.titleActivated({ interest: selectedInterestName }) : LL.home.titleReady()}
          </Text>
          <Text style={styles.body}>
            {match
              ? LL.home.activatedBody()
              : LL.home.readyBody()}
          </Text>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>{LL.home.suggestedNextStep()}</Text>
          <Text style={styles.panelBody}>{match?.headline ?? LL.home.emptyPlan()}</Text>
          <Text style={styles.panelBody}>{match?.reason ?? traits.summary}</Text>
          {match ? (
            <View style={styles.actionRow}>
              <Pressable accessibilityRole="button" disabled={isAccepting || isDeclining} onPress={handleAcceptPlan} style={styles.primaryAction}>
                <Text style={styles.primaryActionText}>{isAccepting ? LL.home.acceptingPlan() : LL.home.acceptPlan()}</Text>
              </Pressable>
              <Pressable accessibilityRole="button" disabled={isAccepting || isDeclining} onPress={handleDeclinePlan} style={styles.secondaryAction}>
                <Text style={styles.secondaryActionText}>{LL.home.declinePlan()}</Text>
              </Pressable>
            </View>
          ) : null}
          {matchActionStatus === "declined" ? <Text style={styles.feedback}>{LL.home.declinedPlan()}</Text> : null}
          {matchActionStatus === "error" ? <Text style={styles.feedback}>{LL.home.matchActionFailed()}</Text> : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: BuzzTheme) => {
  const { colors, fontSizes, lineHeights, radii, spacing, borderWidths, shadows } = theme;

  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background
    },
    content: {
      flexGrow: 1,
      padding: spacing[6],
      gap: spacing[5]
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center"
    },
    logo: {
      color: colors.text,
      fontFamily: theme.fontFamilies.display,
      fontSize: fontSizes["5xl"],
      fontWeight: "900",
      letterSpacing: -1
    },
    city: {
      color: colors.textMuted,
      fontSize: fontSizes.sm,
      fontWeight: "800",
      letterSpacing: 1.1,
      textTransform: "uppercase"
    },
    heroCard: {
      backgroundColor: colors.surface,
      borderRadius: radii["2xl"],
      padding: spacing[6],
      borderWidth: borderWidths.hairline,
      borderColor: colors.border,
      gap: spacing[3],
      ...shadows.card
    },
    eyebrow: {
      color: colors.accent,
      fontSize: fontSizes.xs,
      fontWeight: "900",
      letterSpacing: 1.3,
      textTransform: "uppercase"
    },
    title: {
      color: colors.text,
      fontFamily: theme.fontFamilies.display,
      fontSize: fontSizes.hero,
      fontWeight: "900",
      lineHeight: lineHeights.hero,
      letterSpacing: -1.1
    },
    body: {
      color: colors.textMuted,
      fontSize: fontSizes.md,
      lineHeight: lineHeights.body
    },
    panel: {
      backgroundColor: colors.surfaceMuted,
      borderRadius: radii.xl,
      padding: spacing[5],
      gap: spacing[3]
    },
    panelTitle: {
      color: colors.brand,
      fontSize: fontSizes.xl,
      fontWeight: "900"
    },
    panelBody: {
      color: colors.brand,
      fontSize: fontSizes.base,
      lineHeight: lineHeights.tight
    },
    actionRow: {
      flexDirection: "row",
      gap: spacing[3]
    },
    primaryAction: {
      alignItems: "center",
      backgroundColor: colors.surfaceInverse,
      borderRadius: radii.full,
      flex: 1,
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[3]
    },
    primaryActionText: {
      color: colors.textInverse,
      fontSize: fontSizes.sm,
      fontWeight: "900"
    },
    secondaryAction: {
      alignItems: "center",
      borderColor: colors.brand,
      borderRadius: radii.full,
      borderWidth: borderWidths.hairline,
      flex: 1,
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[3]
    },
    secondaryActionText: {
      color: colors.brand,
      fontSize: fontSizes.sm,
      fontWeight: "900"
    },
    feedback: {
      color: colors.brand,
      fontSize: fontSizes.sm,
      fontWeight: "800",
      lineHeight: lineHeights.tight
    }
  });
};
