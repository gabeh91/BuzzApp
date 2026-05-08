import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import { useBuzzAuth } from "@/auth/AuthProvider";
import { createCityContextFallback, isCityFeatureEnabled } from "@/features/city/cityContext";
import { getTopSuburbMatchesForTraits } from "@/features/city/suburbMatching";
import { useInterestFlow } from "@/features/interests/InterestFlowProvider";
import { createLandingPlan, type LandingPlanItemStatus } from "@/features/landingPlan/landingPlan";
import { createSettlingProgress } from "@/features/progress/settlingProgress";
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
  const cityContext = createCityContextFallback({ cityId: user.cityId, cityName: user.cityName });
  const { traits } = useQuiz();
  const { state } = useInterestFlow();
  const [matchActionStatus, setMatchActionStatus] = useState<MatchActionStatus>("idle");
  const selectedInterestName = state.selectedInterest?.name ?? LL.home.fallbackInterest();
  const match = state.matchPreview;
  const topSuburbMatches = getTopSuburbMatchesForTraits({
    fallbackNames: cityContext.activeSuburbs,
    traits
  });
  const topSuburbs = topSuburbMatches.map((suburb) => suburb.name);
  const landingPlan = createLandingPlan({
    cityContext,
    traits,
    selectedInterests: state.selectedInterest ? [state.selectedInterest.name] : [],
    topSuburbs
  });
  const settlingProgress = createSettlingProgress({
    attendanceConfirmed: false,
    feedbackCompleted: false,
    groupJoined: matchActionStatus === "accepting",
    interestActivated: state.activation.status === "complete",
    quizCompleted: traits.quizCompleted,
    suburbFitViewed: cityContext.activeSuburbs.length > 0
  });
  const shouldShowLandingPlan = isCityFeatureEnabled(cityContext, "landing_plan");
  const isAccepting = matchActionStatus === "accepting";
  const isDeclining = matchActionStatus === "declining";

  const getLandingPlanStatusLabel = (status: LandingPlanItemStatus) => {
    if (status === "completed") {
      return LL.home.landingPlan.done();
    }

    if (status === "active") {
      return LL.home.landingPlan.next();
    }

    return LL.home.landingPlan.pending();
  };

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
          <Text style={styles.city}>{cityContext.city.name}</Text>
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

        {shouldShowLandingPlan ? (
          <View style={styles.landingPanel}>
            <Text style={styles.eyebrow}>{LL.home.landingPlan.eyebrow()}</Text>
            <Text style={styles.panelTitle}>{LL.home.landingPlan.first30Days({ city: cityContext.city.name })}</Text>
            <View style={styles.suburbFitBlock}>
              <Text style={styles.suburbFitTitle}>{LL.home.suburbFit.title()}</Text>
              <Text style={styles.suburbFitBody}>{LL.home.suburbFit.body()}</Text>
              <View style={styles.suburbFitList}>
                {topSuburbMatches.map((suburb, index) => (
                  <View key={suburb.id} style={styles.suburbFitRow}>
                    <Text style={styles.suburbFitRank}>{index + 1}</Text>
                    <View style={styles.suburbFitCopy}>
                      <Text style={styles.suburbFitName}>{suburb.name}</Text>
                      <Text style={styles.suburbFitReason}>
                        {suburb.reasons[0] ?? LL.home.suburbFit.fallbackReason()}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
            <View style={styles.planList}>
              {landingPlan.items.slice(0, 6).map((item) => (
                <View key={`${item.weekNumber}-${item.sortOrder}-${item.itemType}`} style={styles.planItem}>
                  <Text
                    style={[
                      styles.planStatus,
                      item.status === "completed"
                        ? styles.planStatusCompleted
                        : item.status === "active"
                          ? styles.planStatusActive
                          : styles.planStatusPending
                    ]}
                  >
                    {getLandingPlanStatusLabel(item.status)}
                  </Text>
                  <View style={styles.planItemCopy}>
                    <Text style={styles.planItemTitle}>{item.title}</Text>
                    <Text style={styles.planItemBody}>{item.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.progressPanel}>
          <Text style={styles.eyebrow}>{LL.home.settlingProgress.eyebrow()}</Text>
          <Text style={styles.panelTitle}>{LL.home.settlingProgress.title({ percent: settlingProgress.percent })}</Text>
          <Text style={styles.panelBody}>
            {settlingProgress.nextStep
              ? LL.home.settlingProgress.nextStep({ step: settlingProgress.nextStep.label })
              : LL.home.settlingProgress.complete()}
          </Text>
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
      ...theme.fontStyles.display,
      fontSize: fontSizes["5xl"],
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
      ...theme.fontStyles.display,
      fontSize: fontSizes.hero,
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
    landingPanel: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: radii.xl,
      borderWidth: borderWidths.hairline,
      gap: spacing[3],
      padding: spacing[5]
    },
    progressPanel: {
      backgroundColor: colors.surfaceMuted,
      borderRadius: radii.xl,
      gap: spacing[3],
      padding: spacing[5]
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
    suburbFitBlock: {
      gap: spacing[3],
      paddingTop: spacing[1]
    },
    suburbFitTitle: {
      color: colors.text,
      fontSize: fontSizes.lg,
      fontWeight: "900"
    },
    suburbFitBody: {
      color: colors.textMuted,
      fontSize: fontSizes.sm,
      lineHeight: lineHeights.tight
    },
    suburbFitList: {
      gap: spacing[2]
    },
    suburbFitRow: {
      alignItems: "flex-start",
      flexDirection: "row",
      gap: spacing[3]
    },
    suburbFitRank: {
      backgroundColor: colors.surfaceMuted,
      borderRadius: radii.full,
      color: colors.brand,
      fontSize: fontSizes.xs,
      fontWeight: "900",
      height: 28,
      lineHeight: 28,
      overflow: "hidden",
      textAlign: "center",
      width: 28
    },
    suburbFitCopy: {
      flex: 1,
      gap: spacing[1]
    },
    suburbFitName: {
      color: colors.text,
      fontSize: fontSizes.base,
      fontWeight: "900",
      lineHeight: lineHeights.tight
    },
    suburbFitReason: {
      color: colors.textMuted,
      fontSize: fontSizes.sm,
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
    },
    planList: {
      gap: spacing[3]
    },
    planItem: {
      alignItems: "flex-start",
      flexDirection: "row",
      gap: spacing[3]
    },
    planStatus: {
      borderRadius: radii.sm,
      fontSize: fontSizes.xs,
      fontWeight: "900",
      minWidth: 48,
      overflow: "hidden",
      paddingHorizontal: spacing[2],
      paddingVertical: spacing[1],
      textAlign: "center"
    },
    planStatusActive: {
      backgroundColor: colors.surfaceInverse,
      color: colors.textInverse
    },
    planStatusCompleted: {
      backgroundColor: colors.surfaceMuted,
      color: colors.brand
    },
    planStatusPending: {
      backgroundColor: colors.background,
      color: colors.textMuted
    },
    planItemCopy: {
      flex: 1,
      gap: spacing[1]
    },
    planItemTitle: {
      color: colors.text,
      fontSize: fontSizes.base,
      fontWeight: "900",
      lineHeight: lineHeights.tight
    },
    planItemBody: {
      color: colors.textMuted,
      fontSize: fontSizes.sm,
      lineHeight: lineHeights.tight
    }
  });
};
