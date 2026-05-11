import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useBuzzAuth } from "@/auth/AuthProvider";
import { createCityContextFallback } from "@/features/city/cityContext";
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
import { runSettledAction } from "@/lib/functions";
import { useBuzzTheme } from "@/theme/ThemeProvider";
import type { BuzzTheme } from "@/theme/tokens";
import { Button, Header, HeroPanel, Panel, Screen, Text as UiText } from "@/ui";

type SettledActionStatus = "idle" | "saving" | "error";

export const ProfileScreen = () => {
  const { theme } = useBuzzTheme();
  const styles = createStyles(theme);
  const { LL } = useI18n();
  const { user } = useBuzzAuth();
  const { traits } = useQuiz();
  const { state: interestState } = useInterestFlow();
  const { state: settlingProgressState } = useSettlingProgressState();
  const cityContext = createCityContextFallback({
    cityId: user.cityId,
    cityName: user.cityName,
  });
  const topSuburbMatches = getTopSuburbMatchesForTraits({
    fallbackNames: cityContext.activeSuburbs,
    traits,
  });
  const topSuburbs = topSuburbMatches.map((suburb) => suburb.name);
  const landingPlan = createLandingPlan({
    cityContext,
    selectedInterests: interestState.selectedInterest
      ? [interestState.selectedInterest.name]
      : [],
    topSuburbs,
    traits,
  });
  const settlingProgress = createSettlingProgress({
    attendanceConfirmed: settlingProgressState.attendanceConfirmed,
    feedbackCompleted: settlingProgressState.feedbackCompleted,
    groupJoined: settlingProgressState.groupJoined,
    interestActivated: interestState.activation.status === "complete",
    quizCompleted: traits.quizCompleted,
    suburbFitViewed: cityContext.activeSuburbs.length > 0,
  });
  const [isSettled, setIsSettled] = useState(false);
  const [settledActionStatus, setSettledActionStatus] =
    useState<SettledActionStatus>("idle");

  const getLandingPlanStatusLabel = (status: LandingPlanItemStatus) => {
    if (status === "completed") {
      return LL.profile.landingPlan.done();
    }

    if (status === "active") {
      return LL.profile.landingPlan.next();
    }

    return LL.profile.landingPlan.pending();
  };

  const handleToggleSettled = async () => {
    const nextSettled = !isSettled;
    setSettledActionStatus("saving");

    if (user.authSource === "demo") {
      setIsSettled(nextSettled);
      setSettledActionStatus("idle");
      return;
    }

    try {
      const result = await runSettledAction({
        profileId: user.id,
        settled: nextSettled,
      });
      setIsSettled(result.settled);
      setSettledActionStatus("idle");
    } catch {
      setSettledActionStatus("error");
    }
  };

  return (
    <Screen contentStyle={styles.content}>
      <Header
        left={<UiText variant="logo">{LL.brand.name()}</UiText>}
        right={<UiText variant="city">{cityContext.city.name}</UiText>}
      />

      <HeroPanel
        body={LL.profile.subtitle()}
        eyebrow={cityContext.city.name}
        title={LL.profile.title()}
      />

      <Panel variant="muted" style={styles.panel}>
        <UiText variant="panelTitle">{LL.profile.settled.title()}</UiText>
        <UiText variant="panelBody">{LL.profile.settled.body()}</UiText>
        <UiText variant="feedback">
          {isSettled
            ? LL.profile.settled.paused()
            : LL.profile.settled.active()}
        </UiText>
        <Button
          disabled={settledActionStatus === "saving"}
          label={
            settledActionStatus === "saving"
              ? LL.profile.settled.saving()
              : isSettled
                ? LL.profile.settled.markAvailable()
                : LL.profile.settled.markSettled()
          }
          onPress={handleToggleSettled}
          variant={isSettled ? "secondary" : "primary"}
        />
        {settledActionStatus === "error" ? (
          <UiText variant="feedback">{LL.profile.settled.failed()}</UiText>
        ) : null}
      </Panel>

      <Panel variant="plain" style={styles.panel}>
        <UiText variant="eyebrow">{LL.profile.landingPlan.eyebrow()}</UiText>
        <UiText variant="panelTitle">
          {LL.profile.landingPlan.first30Days({
            city: cityContext.city.name,
          })}
        </UiText>
        <View style={styles.suburbFitBlock}>
          <Text style={styles.suburbFitTitle}>
            {LL.profile.suburbFit.title()}
          </Text>
          <Text style={styles.suburbFitBody}>
            {LL.profile.suburbFit.body()}
          </Text>
          <View style={styles.suburbFitList}>
            {topSuburbMatches.map((suburb, index) => (
              <View key={suburb.id} style={styles.suburbFitRow}>
                <Text style={styles.suburbFitRank}>{index + 1}</Text>
                <View style={styles.suburbFitCopy}>
                  <Text style={styles.suburbFitName}>{suburb.name}</Text>
                  <Text style={styles.suburbFitReason}>
                    {suburb.reasons[0] ?? LL.profile.suburbFit.fallbackReason()}
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

      <Panel variant="muted" style={styles.panel}>
        <UiText variant="eyebrow">
          {LL.profile.settlingProgress.eyebrow()}
        </UiText>
        <UiText variant="panelTitle">
          {LL.profile.settlingProgress.title({
            percent: settlingProgress.percent,
          })}
        </UiText>
        <UiText variant="panelBody">
          {settlingProgress.nextStep
            ? LL.profile.settlingProgress.nextStep({
                step: settlingProgress.nextStep.label,
              })
            : LL.profile.settlingProgress.complete()}
        </UiText>
      </Panel>
    </Screen>
  );
};

const createStyles = (theme: BuzzTheme) => {
  const { colors, fontSizes, lineHeights, spacing, radii } = theme;

  return StyleSheet.create({
    content: {
      flexGrow: 1,
      gap: spacing[5],
      padding: spacing[6],
    },
    panel: {
      gap: spacing[3],
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
