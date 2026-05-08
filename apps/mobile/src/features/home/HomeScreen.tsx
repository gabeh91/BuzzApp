import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useBuzzAuth } from "@/auth/AuthProvider";
import {
  createCityContextFallback,
  isCityFeatureEnabled,
} from "@/features/city/cityContext";
import { getTopSuburbMatchesForTraits } from "@/features/city/suburbMatching";
import { useInterestFlow } from "@/features/interests/InterestFlowProvider";
import {
  createLandingPlan,
  type LandingPlanItemStatus,
} from "@/features/landingPlan/landingPlan";
import { useSettlingProgressState } from "@/features/progress/SettlingProgressProvider";
import { createSettlingProgress } from "@/features/progress/settlingProgress";
import { useQuiz } from "@/features/quiz/QuizProvider";
import { useI18n } from "@/i18n/I18nProvider";
import { runMatchAction } from "@/lib/functions";
import { routes } from "@/navigation/routes";
import { useBuzzTheme } from "@/theme/ThemeProvider";
import type { BuzzTheme } from "@/theme/tokens";
import { Button, Header, Panel, Screen, Text as UiText } from "@/ui";
import { createHomePlanCopy } from "./homePlanCopy";

type MatchActionStatus =
  | "idle"
  | "accepting"
  | "declining"
  | "declined"
  | "error";

export const HomeScreen = () => {
  const router = useRouter();
  const { theme } = useBuzzTheme();
  const styles = createStyles(theme);
  const { LL } = useI18n();
  const { user } = useBuzzAuth();
  const cityContext = createCityContextFallback({
    cityId: user.cityId,
    cityName: user.cityName,
  });
  const { traits } = useQuiz();
  const { state } = useInterestFlow();
  const { markGroupJoined, state: settlingProgressState } =
    useSettlingProgressState();
  const [matchActionStatus, setMatchActionStatus] =
    useState<MatchActionStatus>("idle");
  const selectedInterestName =
    state.selectedInterest?.name ?? LL.home.fallbackInterest();
  const match = state.matchPreview;
  const topSuburbMatches = getTopSuburbMatchesForTraits({
    fallbackNames: cityContext.activeSuburbs,
    traits,
  });
  const topSuburbs = topSuburbMatches.map((suburb) => suburb.name);
  const landingPlan = createLandingPlan({
    cityContext,
    traits,
    selectedInterests: state.selectedInterest
      ? [state.selectedInterest.name]
      : [],
    topSuburbs,
  });
  const settlingProgress = createSettlingProgress({
    attendanceConfirmed: settlingProgressState.attendanceConfirmed,
    feedbackCompleted: settlingProgressState.feedbackCompleted,
    groupJoined:
      settlingProgressState.groupJoined || matchActionStatus === "accepting",
    interestActivated: state.activation.status === "complete",
    quizCompleted: traits.quizCompleted,
    suburbFitViewed: cityContext.activeSuburbs.length > 0,
  });
  const shouldShowLandingPlan = isCityFeatureEnabled(
    cityContext,
    "landing_plan",
  );
  const isAccepting = matchActionStatus === "accepting";
  const isDeclining = matchActionStatus === "declining";
  const planCopy = createHomePlanCopy({
    activationComplete: state.activation.status === "complete",
    interestName: selectedInterestName,
    match,
    traitsSummary: traits.summary,
    copy: LL.home,
  });

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
    markGroupJoined();

    if (match.source === "local") {
      router.push(routes.group(`local-${match.id}`));
      return;
    }

    try {
      const result = await runMatchAction({
        action: "accept",
        matchCandidateId: match.id,
        profileId: user.id,
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
        profileId: user.id,
      });
      setMatchActionStatus("declined");
    } catch {
      setMatchActionStatus("error");
    }
  };

  return (
    <Screen contentStyle={styles.content}>
      <Header
        left={<UiText variant="logo">{LL.brand.name()}</UiText>}
        right={<UiText variant="city">{cityContext.city.name}</UiText>}
      />

      <Panel style={styles.heroCard}>
        <UiText variant="eyebrow">{LL.home.firstPlan()}</UiText>
        <UiText variant="title">{planCopy.title}</UiText>
        <UiText variant="body">{planCopy.body}</UiText>
      </Panel>

      <Panel variant="muted" style={styles.panel}>
        <UiText variant="panelTitle">{LL.home.suggestedNextStep()}</UiText>
        <UiText variant="panelBody">{planCopy.suggestedTitle}</UiText>
        <UiText variant="panelBody">{planCopy.suggestedBody}</UiText>
        {planCopy.canActOnMatch ? (
          <View style={styles.actionRow}>
            <Button
              disabled={isAccepting || isDeclining}
              label={
                isAccepting ? LL.home.acceptingPlan() : LL.home.acceptPlan()
              }
              onPress={handleAcceptPlan}
              style={styles.actionButton}
            />
            <Button
              disabled={isAccepting || isDeclining}
              label={LL.home.declinePlan()}
              onPress={handleDeclinePlan}
              style={styles.actionButton}
              variant="secondary"
            />
          </View>
        ) : null}
        {matchActionStatus === "declined" ? (
          <UiText variant="feedback">{LL.home.declinedPlan()}</UiText>
        ) : null}
        {matchActionStatus === "error" ? (
          <UiText variant="feedback">{LL.home.matchActionFailed()}</UiText>
        ) : null}
      </Panel>

      {shouldShowLandingPlan ? (
        <Panel variant="plain" style={styles.landingPanel}>
          <UiText variant="eyebrow">{LL.home.landingPlan.eyebrow()}</UiText>
          <UiText variant="panelTitle">
            {LL.home.landingPlan.first30Days({ city: cityContext.city.name })}
          </UiText>
          <View style={styles.suburbFitBlock}>
            <Text style={styles.suburbFitTitle}>
              {LL.home.suburbFit.title()}
            </Text>
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
              <View
                key={`${item.weekNumber}-${item.sortOrder}-${item.itemType}`}
                style={styles.planItem}
              >
                <Text
                  style={[
                    styles.planStatus,
                    item.status === "completed"
                      ? styles.planStatusCompleted
                      : item.status === "active"
                        ? styles.planStatusActive
                        : styles.planStatusPending,
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
        </Panel>
      ) : null}

      <Panel variant="muted" style={styles.progressPanel}>
        <UiText variant="eyebrow">{LL.home.settlingProgress.eyebrow()}</UiText>
        <UiText variant="panelTitle">
          {LL.home.settlingProgress.title({
            percent: settlingProgress.percent,
          })}
        </UiText>
        <UiText variant="panelBody">
          {settlingProgress.nextStep
            ? LL.home.settlingProgress.nextStep({
                step: settlingProgress.nextStep.label,
              })
            : LL.home.settlingProgress.complete()}
        </UiText>
      </Panel>
    </Screen>
  );
};

const createStyles = (theme: BuzzTheme) => {
  const {
    colors,
    fontSizes,
    lineHeights,
    radii,
    spacing,
    borderWidths,
    shadows,
  } = theme;

  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flexGrow: 1,
      padding: spacing[6],
      gap: spacing[5],
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    logo: {
      color: colors.text,
      ...theme.fontStyles.display,
      fontSize: fontSizes["5xl"],
      letterSpacing: -1,
    },
    city: {
      color: colors.textMuted,
      fontSize: fontSizes.sm,
      fontWeight: "800",
      letterSpacing: 1.1,
      textTransform: "uppercase",
    },
    heroCard: {
      backgroundColor: colors.surface,
      borderRadius: radii["2xl"],
      padding: spacing[6],
      borderWidth: borderWidths.hairline,
      borderColor: colors.border,
      gap: spacing[3],
      ...shadows.card,
    },
    eyebrow: {
      color: colors.accent,
      fontSize: fontSizes.xs,
      fontWeight: "900",
      letterSpacing: 1.3,
      textTransform: "uppercase",
    },
    title: {
      color: colors.text,
      ...theme.fontStyles.display,
      fontSize: fontSizes.hero,
      lineHeight: lineHeights.hero,
      letterSpacing: -1.1,
    },
    body: {
      color: colors.textMuted,
      fontSize: fontSizes.md,
      lineHeight: lineHeights.body,
    },
    panel: {
      backgroundColor: colors.surfaceMuted,
      borderRadius: radii.xl,
      padding: spacing[5],
      gap: spacing[3],
    },
    landingPanel: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: radii.xl,
      borderWidth: borderWidths.hairline,
      gap: spacing[3],
      padding: spacing[5],
    },
    progressPanel: {
      backgroundColor: colors.surfaceMuted,
      borderRadius: radii.xl,
      gap: spacing[3],
      padding: spacing[5],
    },
    panelTitle: {
      color: colors.brand,
      fontSize: fontSizes.xl,
      fontWeight: "900",
    },
    panelBody: {
      color: colors.brand,
      fontSize: fontSizes.base,
      lineHeight: lineHeights.tight,
    },
    suburbFitBlock: {
      gap: spacing[3],
      paddingTop: spacing[1],
    },
    suburbFitTitle: {
      color: colors.text,
      fontSize: fontSizes.lg,
      fontWeight: "900",
    },
    suburbFitBody: {
      color: colors.textMuted,
      fontSize: fontSizes.sm,
      lineHeight: lineHeights.tight,
    },
    suburbFitList: {
      gap: spacing[2],
    },
    suburbFitRow: {
      alignItems: "flex-start",
      flexDirection: "row",
      gap: spacing[3],
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
      width: 28,
    },
    suburbFitCopy: {
      flex: 1,
      gap: spacing[1],
    },
    suburbFitName: {
      color: colors.text,
      fontSize: fontSizes.base,
      fontWeight: "900",
      lineHeight: lineHeights.tight,
    },
    suburbFitReason: {
      color: colors.textMuted,
      fontSize: fontSizes.sm,
      lineHeight: lineHeights.tight,
    },
    actionRow: {
      flexDirection: "row",
      gap: spacing[3],
    },
    actionButton: {
      flex: 1,
    },
    primaryAction: {
      alignItems: "center",
      backgroundColor: colors.surfaceInverse,
      borderRadius: radii.full,
      flex: 1,
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[3],
    },
    primaryActionText: {
      color: colors.textInverse,
      fontSize: fontSizes.sm,
      fontWeight: "900",
    },
    secondaryAction: {
      alignItems: "center",
      borderColor: colors.brand,
      borderRadius: radii.full,
      borderWidth: borderWidths.hairline,
      flex: 1,
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[3],
    },
    secondaryActionText: {
      color: colors.brand,
      fontSize: fontSizes.sm,
      fontWeight: "900",
    },
    feedback: {
      color: colors.brand,
      fontSize: fontSizes.sm,
      fontWeight: "800",
      lineHeight: lineHeights.tight,
    },
    planList: {
      gap: spacing[3],
    },
    planItem: {
      alignItems: "flex-start",
      flexDirection: "row",
      gap: spacing[3],
    },
    planStatus: {
      borderRadius: radii.sm,
      fontSize: fontSizes.xs,
      fontWeight: "900",
      minWidth: 48,
      overflow: "hidden",
      paddingHorizontal: spacing[2],
      paddingVertical: spacing[1],
      textAlign: "center",
    },
    planStatusActive: {
      backgroundColor: colors.surfaceInverse,
      color: colors.textInverse,
    },
    planStatusCompleted: {
      backgroundColor: colors.surfaceMuted,
      color: colors.brand,
    },
    planStatusPending: {
      backgroundColor: colors.background,
      color: colors.textMuted,
    },
    planItemCopy: {
      flex: 1,
      gap: spacing[1],
    },
    planItemTitle: {
      color: colors.text,
      fontSize: fontSizes.base,
      fontWeight: "900",
      lineHeight: lineHeights.tight,
    },
    planItemBody: {
      color: colors.textMuted,
      fontSize: fontSizes.sm,
      lineHeight: lineHeights.tight,
    },
  });
};
