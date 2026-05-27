import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useBuzzAuth } from "@/auth/AuthProvider";
import {
  createCityContextFallback,
  isCityFeatureEnabled,
} from "@/features/city/cityContext";
import { getTopSuburbMatchesForTraits } from "@/features/city/suburbMatching";
import { InterestPill, InterestPillRow } from "@/features/interests/InterestPill";
import { useInterestFlow } from "@/features/interests/InterestFlowProvider";
import {
  createLandingPlan,
  type LandingPlanItemStatus,
} from "@/features/landingPlan/landingPlan";
import { useSettlingProgressState } from "@/features/progress/SettlingProgressProvider";
import { useReliabilitySummary } from "@/features/progress/useReliabilitySummary";
import { createSettlingProgress } from "@/features/progress/settlingProgress";
import { useQuiz } from "@/features/quiz/QuizProvider";
import { useI18n } from "@/i18n/I18nProvider";
import { runSettledAction } from "@/lib/functions";
import { routes } from "@/navigation/routes";
import { tabBarTotalHeight } from "@/navigation/tabBarLayout";
import { useBuzzTheme } from "@/theme/ThemeProvider";
import type { BuzzTheme } from "@/theme/tokens";
import {
  AppBrandedCityHeader,
  Button,
  CompactIntro,
  Panel,
  Screen,
  Text as UiText,
} from "@/ui";

type SettledActionStatus = "idle" | "saving" | "error";

type StartingPointInterest = {
  id: string;
  name: string;
  slug: string;
};

const interestNameFromSlug = (slug: string) =>
  slug
    .split("-")
    .map((part) => (part ? `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}` : ""))
    .join(" ");

export const ProfileScreen = () => {
  const router = useRouter();
  const { theme } = useBuzzTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(
    () => createStyles(theme, insets.bottom),
    [theme, insets.bottom],
  );
  const { LL } = useI18n();
  const {
    biometricEnabled,
    enableBiometricLogin,
    isAuthenticated,
    requireAuth,
    signOut,
    user,
  } = useBuzzAuth();
  const { traits } = useQuiz();
  const { state: interestState } = useInterestFlow();
  const { state: settlingProgressState } = useSettlingProgressState();
  const {
    loading: reliabilityLoading,
    summary: reliabilitySummary,
  } = useReliabilitySummary({
    enabled: isAuthenticated,
    userId: user.id,
  });
  const cityContext = createCityContextFallback({
    cityId: user.cityId,
    cityName: user.cityName,
  });
  const topSuburbMatches = getTopSuburbMatchesForTraits({
    fallbackNames: cityContext.activeSuburbs,
    traits,
  });
  const topSuburbs = topSuburbMatches.map((suburb) => suburb.name);
  const showFullLandingPlan = isCityFeatureEnabled(
    cityContext,
    "landing_plan_enabled",
  );
  const showCityStartingPoint = isCityFeatureEnabled(
    cityContext,
    "city_starting_point_enabled",
  );
  const startingPointInterests = useMemo(() => {
    const interests: StartingPointInterest[] = [];
    const seenSlugs = new Set<string>();

    if (interestState.selectedInterest) {
      const { id, name, slug } = interestState.selectedInterest;
      interests.push({ id, name, slug });
      seenSlugs.add(slug);
    }

    for (const slug of cityContext.defaultInterests) {
      if (interests.length >= 3) {
        break;
      }

      if (seenSlugs.has(slug)) {
        continue;
      }

      interests.push({
        id: slug,
        name: interestNameFromSlug(slug),
        slug,
      });
      seenSlugs.add(slug);
    }

    return interests;
  }, [cityContext.defaultInterests, interestState.selectedInterest]);
  const suggestedFirstAction =
    interestState.activation.status === "complete"
      ? LL.profile.cityStartingPoint.actionAfterActivation()
      : interestState.selectedInterest
        ? LL.profile.cityStartingPoint.actionActivateSelected({
            interest: interestState.selectedInterest.name,
          })
        : LL.profile.cityStartingPoint.actionPickInterest();
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
  const [biometricStatus, setBiometricStatus] = useState<
    "idle" | "saving" | "failed"
  >("idle");
  const [signOutStatus, setSignOutStatus] = useState<
    "idle" | "saving" | "failed"
  >("idle");

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
    await requireAuth("save_profile", async (authUser, accessToken) => {
      const nextSettled = !isSettled;
      setSettledActionStatus("saving");

      try {
        const result = await runSettledAction({
          accessToken,
          profileId: authUser.id,
          settled: nextSettled,
        });
        setIsSettled(result.settled);
        setSettledActionStatus("idle");
      } catch {
        setSettledActionStatus("error");
      }
    });
  };

  const handleEnableBiometrics = async () => {
    setBiometricStatus("saving");
    const enabled = await enableBiometricLogin();

    if (enabled) {
      setBiometricStatus("idle");
      return;
    }

    setBiometricStatus("failed");
  };

  const handleSaveProfile = async () => {
    await requireAuth("save_profile", async () => undefined);
  };

  const handleSignOut = async () => {
    setSignOutStatus("saving");

    try {
      await signOut();
      setSignOutStatus("idle");
    } catch {
      setSignOutStatus("failed");
    }
  };

  const showCityPlanPanel =
    showCityStartingPoint || showFullLandingPlan || settlingProgress.percent > 0;
  const attendanceRateLabel = reliabilitySummary.attendanceRate === null
    ? LL.profile.reliability.notEnoughData()
    : LL.profile.reliability.attendanceRateValue({
        percent: Math.round(reliabilitySummary.attendanceRate * 100),
      });

  return (
    <Screen
      contentStyle={styles.content}
      edges={["top"]}
      stickyHeader={
        <AppBrandedCityHeader cityName={cityContext.city.name} />
      }
    >
      <CompactIntro
        body={LL.profile.subtitle()}
        eyebrow={cityContext.city.name}
        title={LL.profile.title()}
      />

      {isAuthenticated ? (
        <Panel variant="surface" style={styles.groupPanel}>
          <UiText variant="eyebrow">{LL.profile.aboutYou()}</UiText>

          <View style={styles.groupSection}>
            <UiText variant="panelTitle">{LL.profile.personalInfo.title()}</UiText>
            <UiText variant="panelBody">{LL.profile.personalInfo.body()}</UiText>
            <Button
              label={LL.profile.personalInfo.cta()}
              onPress={() => {
                router.push(routes.profilePersonalInfo);
              }}
              variant="secondary"
            />
          </View>

          <View style={styles.groupDivider} />

          <View style={styles.groupSection}>
            <UiText variant="panelTitle">{LL.profile.matchingQuiz.title()}</UiText>
            <UiText variant="panelBody">{LL.profile.matchingQuiz.body()}</UiText>
            <Button
              label={LL.profile.matchingQuiz.retakeCta()}
              onPress={() => {
                router.push(routes.profileQuiz);
              }}
              variant="secondary"
            />
          </View>
        </Panel>
      ) : null}

      {isAuthenticated ? (
        <Panel variant="muted" style={styles.groupPanel}>
          <UiText variant="eyebrow">{LL.profile.reliability.eyebrow()}</UiText>
          <View style={styles.groupSection}>
            <UiText variant="panelTitle">
              {LL.profile.reliability.title()}
            </UiText>
            <UiText variant="panelBody">
              {reliabilitySummary.hasActivityHistory
                ? LL.profile.reliability.body()
                : LL.profile.reliability.emptyBody()}
            </UiText>
          </View>

          <View style={styles.reliabilityGrid}>
            <View style={styles.reliabilityMetric}>
              <UiText style={styles.reliabilityValue}>
                {reliabilityLoading
                  ? LL.profile.reliability.loadingValue()
                  : String(reliabilitySummary.attendedPlanStreak)}
              </UiText>
              <UiText style={styles.reliabilityLabel}>
                {LL.profile.reliability.planStreak()}
              </UiText>
            </View>
            <View style={styles.reliabilityMetric}>
              <UiText style={styles.reliabilityValue}>
                {reliabilityLoading
                  ? LL.profile.reliability.loadingValue()
                  : String(reliabilitySummary.checkInStreak)}
              </UiText>
              <UiText style={styles.reliabilityLabel}>
                {LL.profile.reliability.checkInStreak()}
              </UiText>
            </View>
            <View style={styles.reliabilityMetric}>
              <UiText style={styles.reliabilityValue}>
                {reliabilityLoading
                  ? LL.profile.reliability.loadingValue()
                  : String(reliabilitySummary.reliablePlanStreak)}
              </UiText>
              <UiText style={styles.reliabilityLabel}>
                {LL.profile.reliability.goodPlanStreak()}
              </UiText>
            </View>
          </View>

          <View style={styles.reliabilityFooter}>
            <UiText style={styles.reliabilityFooterLabel}>
              {LL.profile.reliability.attendanceRate()}
            </UiText>
            <UiText style={styles.reliabilityFooterValue}>
              {reliabilityLoading
                ? LL.profile.reliability.loadingValue()
                : attendanceRateLabel}
            </UiText>
          </View>
        </Panel>
      ) : null}

      <Panel variant="surface" style={styles.groupPanel}>
        <UiText variant="eyebrow">
          {isAuthenticated
            ? LL.profile.auth.signOutTitle()
            : LL.profile.auth.title()}
        </UiText>

        {!isAuthenticated ? (
          <View style={styles.groupSection}>
            <UiText variant="panelBody">{LL.profile.auth.body()}</UiText>
            <Button label={LL.profile.auth.signIn()} onPress={handleSaveProfile} />
          </View>
        ) : (
          <View style={styles.groupStack}>
            {!biometricEnabled ? (
              <View style={styles.groupSection}>
                <UiText style={styles.sectionTitle}>
                  {LL.profile.auth.biometricTitle()}
                </UiText>
                <UiText variant="panelBody">
                  {LL.profile.auth.biometricBody()}
                </UiText>
                <Button
                  disabled={biometricStatus === "saving"}
                  label={
                    biometricStatus === "saving"
                      ? LL.profile.auth.biometricSaving()
                      : LL.profile.auth.enableBiometric()
                  }
                  onPress={handleEnableBiometrics}
                  variant="secondary"
                />
                {biometricStatus === "failed" ? (
                  <UiText variant="feedback">
                    {LL.profile.auth.biometricFailed()}
                  </UiText>
                ) : null}
              </View>
            ) : null}

            <View style={styles.groupDivider} />

            <View style={styles.groupSection}>
              <UiText style={styles.sectionTitle}>
                {LL.profile.settled.title()}
              </UiText>
              <UiText variant="panelBody">{LL.profile.settled.body()}</UiText>
              <UiText variant="feedback">
                {isSettled ? LL.profile.settled.paused() : LL.profile.settled.active()}
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
            </View>

            <View style={styles.groupDivider} />

            <View style={styles.groupSection}>
              <UiText variant="panelBody">{LL.profile.auth.signOutBody()}</UiText>
              <Button
                disabled={signOutStatus === "saving"}
                label={
                  signOutStatus === "saving"
                    ? LL.profile.auth.signingOut()
                    : LL.profile.auth.signOut()
                }
                onPress={handleSignOut}
                variant="bordered"
              />
              {signOutStatus === "failed" ? (
                <UiText variant="feedback">{LL.profile.auth.signOutFailed()}</UiText>
              ) : null}
            </View>
          </View>
        )}
      </Panel>

      {showCityPlanPanel ? (
        <Panel variant="plain" style={styles.groupPanel}>
          <UiText variant="eyebrow">
            {showFullLandingPlan
              ? LL.profile.landingPlan.eyebrow()
              : LL.profile.cityStartingPoint.eyebrow()}
          </UiText>
          <UiText variant="panelTitle">
            {showFullLandingPlan
              ? LL.profile.landingPlan.first30Days({ city: cityContext.city.name })
              : LL.profile.cityStartingPoint.title({ city: cityContext.city.name })}
          </UiText>

          {showCityStartingPoint ? (
            <View style={styles.groupSection}>
              <UiText variant="panelBody">{LL.profile.cityStartingPoint.body()}</UiText>
              <View style={styles.suburbFitBlock}>
                <UiText style={styles.suburbFitTitle}>
                  {LL.profile.cityStartingPoint.areasTitle()}
                </UiText>
                <View style={styles.suburbFitList}>
                  {topSuburbMatches.map((suburb, index) => (
                    <View key={suburb.id} style={styles.suburbFitRow}>
                      <UiText style={styles.suburbFitRank}>{index + 1}</UiText>
                      <View style={styles.suburbFitCopy}>
                        <UiText style={styles.suburbFitName}>{suburb.name}</UiText>
                        <UiText style={styles.suburbFitReason}>
                          {suburb.reasons[0] ?? LL.profile.suburbFit.fallbackReason()}
                        </UiText>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.suburbFitBlock}>
                <UiText style={styles.suburbFitTitle}>
                  {LL.profile.cityStartingPoint.interestsTitle()}
                </UiText>
                <InterestPillRow>
                  {startingPointInterests.map((interest) => (
                    <InterestPill key={interest.id} interest={interest} />
                  ))}
                </InterestPillRow>
              </View>

              <View style={styles.suburbFitBlock}>
                <UiText style={styles.suburbFitTitle}>
                  {LL.profile.cityStartingPoint.firstActionTitle()}
                </UiText>
                <UiText style={styles.suburbFitBody}>{suggestedFirstAction}</UiText>
              </View>
            </View>
          ) : null}

          {showCityStartingPoint && showFullLandingPlan ? (
            <View style={styles.groupDivider} />
          ) : null}

          {showFullLandingPlan ? (
            <View style={styles.groupSection}>
              <View style={styles.suburbFitBlock}>
                <UiText style={styles.suburbFitTitle}>{LL.profile.suburbFit.title()}</UiText>
                <UiText style={styles.suburbFitBody}>{LL.profile.suburbFit.body()}</UiText>
              </View>

              <View style={styles.planList}>
                {landingPlan.items.slice(0, 6).map((item) => (
                  <View
                    key={`${item.weekNumber}-${item.sortOrder}-${item.itemType}`}
                    style={styles.planItem}
                  >
                    <UiText
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
                    </UiText>
                    <View style={styles.planItemCopy}>
                      <UiText style={styles.planItemTitle}>{item.title}</UiText>
                      <UiText style={styles.planItemBody}>{item.description}</UiText>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {showFullLandingPlan ? (
            <>
              <View style={styles.groupDivider} />
              <View style={styles.groupSection}>
                <UiText style={styles.sectionTitle}>
                  {LL.profile.settlingProgress.title({ percent: settlingProgress.percent })}
                </UiText>
                <UiText variant="panelBody">
                  {settlingProgress.nextStep
                    ? LL.profile.settlingProgress.nextStep({
                        step: settlingProgress.nextStep.label,
                      })
                    : LL.profile.settlingProgress.complete()}
                </UiText>
              </View>
            </>
          ) : null}
        </Panel>
      ) : null}
    </Screen>
  );
};

const createStyles = (theme: BuzzTheme, bottomInset: number) => {
  const { colors, fontSizes, lineHeights, spacing, radii, borderWidths } = theme;

  return StyleSheet.create({
    content: {
      flexGrow: 1,
      gap: spacing[5],
      paddingBottom: tabBarTotalHeight(theme, bottomInset) + spacing[4],
      paddingTop: spacing[5],
    },
    groupPanel: {
      gap: spacing[4],
    },
    groupStack: {
      gap: spacing[4],
    },
    groupSection: {
      gap: spacing[3],
    },
    groupDivider: {
      backgroundColor: colors.border,
      height: borderWidths.hairline,
      width: "100%",
    },
    sectionTitle: {
      color: colors.text,
      fontSize: fontSizes.lg,
      ...theme.fontStyles.display,
      lineHeight: lineHeights.tight,
    },
    suburbFitBlock: {
      gap: spacing[3],
      paddingTop: spacing[1],
    },
    suburbFitTitle: {
      color: colors.text,
      fontSize: fontSizes.lg,
      ...theme.fontStyles.display,
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
      ...theme.fontStyles.display,
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
      ...theme.fontStyles.display,
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
      ...theme.fontStyles.display,
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
      ...theme.fontStyles.display,
      lineHeight: lineHeights.tight,
    },
    planItemBody: {
      color: colors.textMuted,
      fontSize: fontSizes.sm,
      lineHeight: lineHeights.tight,
    },
    reliabilityGrid: {
      flexDirection: "row",
      gap: spacing[2],
    },
    reliabilityMetric: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: radii.lg,
      borderWidth: borderWidths.hairline,
      flex: 1,
      gap: spacing[1],
      minHeight: 92,
      padding: spacing[3],
    },
    reliabilityValue: {
      color: colors.text,
      fontSize: fontSizes["3xl"],
      ...theme.fontStyles.black,
      lineHeight: lineHeights.title,
    },
    reliabilityLabel: {
      color: colors.textMuted,
      fontSize: fontSizes.xs,
      ...theme.fontStyles.display,
      lineHeight: lineHeights.tight,
    },
    reliabilityFooter: {
      alignItems: "center",
      backgroundColor: colors.warningSoft,
      borderRadius: radii.lg,
      flexDirection: "row",
      gap: spacing[3],
      justifyContent: "space-between",
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[3],
    },
    reliabilityFooterLabel: {
      color: colors.text,
      flex: 1,
      fontSize: fontSizes.sm,
      ...theme.fontStyles.display,
      lineHeight: lineHeights.tight,
    },
    reliabilityFooterValue: {
      color: colors.text,
      fontSize: fontSizes.base,
      ...theme.fontStyles.black,
      lineHeight: lineHeights.tight,
    },
  });
};
