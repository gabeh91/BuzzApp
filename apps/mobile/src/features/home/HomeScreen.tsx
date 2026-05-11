import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useBuzzAuth } from "@/auth/AuthProvider";
import { createCityContextFallback } from "@/features/city/cityContext";
import { getTopSuburbMatchesForTraits } from "@/features/city/suburbMatching";
import { useInterestFlow } from "@/features/interests/InterestFlowProvider";
import { useSettlingProgressState } from "@/features/progress/SettlingProgressProvider";
import { useQuiz } from "@/features/quiz/QuizProvider";
import { useI18n } from "@/i18n/I18nProvider";
import { runMatchAction } from "@/lib/functions";
import { routes } from "@/navigation/routes";
import { useBuzzTheme } from "@/theme/ThemeProvider";
import type { BuzzTheme } from "@/theme/tokens";
import { Button, Header, HeroPanel, Panel, Screen, Text as UiText } from "@/ui";
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
  const { markGroupJoined } = useSettlingProgressState();
  const [matchActionStatus, setMatchActionStatus] =
    useState<MatchActionStatus>("idle");
  const selectedInterestName =
    state.selectedInterest?.name ?? LL.home.fallbackInterest();
  const match = state.matchPreview;
  const topSuburbMatches = getTopSuburbMatchesForTraits({
    fallbackNames: cityContext.activeSuburbs,
    traits,
  });
  const isAccepting = matchActionStatus === "accepting";
  const isDeclining = matchActionStatus === "declining";
  const planCopy = createHomePlanCopy({
    activationComplete: state.activation.status === "complete",
    interestName: selectedInterestName,
    match,
    traitsSummary: traits.summary,
    copy: LL.home,
  });

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

      <HeroPanel
        body={planCopy.body}
        eyebrow={LL.home.firstPlan()}
        title={planCopy.title}
      />

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

      <Panel variant="plain" style={styles.suburbPanel}>
        <UiText variant="eyebrow">{LL.home.suburbFit.title()}</UiText>
        <UiText variant="panelBody">{LL.home.suburbFit.body()}</UiText>
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
      </Panel>
    </Screen>
  );
};

const createStyles = (theme: BuzzTheme) => {
  const { colors, fontSizes, lineHeights, radii, spacing } = theme;

  return StyleSheet.create({
    content: {
      flexGrow: 1,
      padding: spacing[6],
      gap: spacing[5],
    },
    panel: {
      backgroundColor: colors.surfaceMuted,
      borderRadius: radii.xl,
      padding: spacing[5],
      gap: spacing[3],
    },
    suburbPanel: {
      gap: spacing[3],
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
  });
};
