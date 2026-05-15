import { StyleSheet } from "react-native";

import {
  SCREEN_CONTENT_GUTTER_SPACING,
  type BuzzTheme,
} from "@/theme/tokens";

export const createOnboardingStyles = (theme: BuzzTheme, bottomInset: number) => {
  const {
    colors,
    fontSizes,
    fontStyles,
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
    screenContent: {
      flex: 1,
      flexGrow: 1,
      gap: spacing[0],
      padding: spacing[0],
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      /** Match `ProfileQuizScreen` (`bottomInset + spacing[10]`) — onboarding uses `edges={["top"]}` so this is the sole bottom safe padding. */
      paddingBottom: bottomInset + spacing[10],
      paddingHorizontal: spacing[SCREEN_CONTENT_GUTTER_SPACING],
      paddingTop: spacing[3],
    },
    stage: {
      flex: 1,
      position: "relative",
    },
    layout: {
      flexGrow: 1,
      justifyContent: "space-between",
      gap: spacing[6],
    },
    ambientRoot: {
      position: "absolute",
      inset: 0,
    },
    ambientSky: {
      position: "absolute",
      top: -80,
      right: -70,
      width: 220,
      height: 220,
      borderRadius: 110,
      backgroundColor: colors.surfaceMuted,
    },
    ambientGold: {
      position: "absolute",
      bottom: 90,
      left: -95,
      width: 260,
      height: 260,
      borderRadius: 130,
      backgroundColor: colors.warningSoft,
    },
    fixedHeader: {
      borderBottomColor: colors.overlay,
      borderBottomWidth: borderWidths.hairline,
      gap: spacing[5],
    },
    headerProgressSlot: {
      height: spacing[10],
      overflow: "hidden",
    },
    flowProgressLayer: {
      ...StyleSheet.absoluteFillObject,
    },
    quizProgressLayer: {
      ...StyleSheet.absoluteFillObject,
    },
    mainCard: {
      backgroundColor: colors.surface,
      borderRadius: radii["2xl"],
      padding: spacing[6],
      gap: spacing[6],
      borderWidth: borderWidths.hairline,
      borderColor: colors.border,
      ...shadows.card,
    },
    cardRail: {
      flex: 1,
      justifyContent: "center",
    },
    titleStack: {
      gap: spacing[3],
    },
    eyebrow: {
      color: colors.accent,
      fontSize: fontSizes.xs,
      fontWeight: "900",
      letterSpacing: 1.4,
      textTransform: "uppercase",
    },
    title: {
      color: colors.text,
      ...fontStyles.display,
      fontSize: fontSizes.hero,
      lineHeight: lineHeights.hero,
      letterSpacing: 0,
    },
    contentStack: {
      gap: spacing[4],
    },
    shortProfileFieldLabel: {
      color: colors.textMuted,
      fontSize: fontSizes.xs,
      fontWeight: "900",
      letterSpacing: 0.8,
      textTransform: "uppercase",
    },
    shortProfileTextInput: {
      borderWidth: borderWidths.hairline,
      borderColor: colors.border,
      borderRadius: radii.lg,
      color: colors.text,
      fontSize: fontSizes.lg,
      lineHeight: lineHeights.body,
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[3],
    },
    shortProfileCityCard: {
      alignItems: "center",
      backgroundColor: colors.surfaceMuted,
      borderColor: colors.border,
      borderRadius: radii.xl,
      borderWidth: borderWidths.hairline,
      gap: spacing[2],
      paddingHorizontal: spacing[5],
      paddingVertical: spacing[5],
    },
    shortProfileCityHint: {
      color: colors.textMuted,
      fontSize: fontSizes.sm,
      fontWeight: "800",
      letterSpacing: 0.6,
      textTransform: "uppercase",
    },
    shortProfileCityName: {
      color: colors.text,
      fontSize: fontSizes["3xl"],
      fontWeight: "900",
      textAlign: "center",
    },
    bodyCopy: {
      color: colors.textMuted,
      fontSize: fontSizes.lg,
      lineHeight: lineHeights.relaxed,
    },
    howItWorksList: {
      gap: spacing[3],
    },
    howItWorksItem: {
      backgroundColor: colors.background,
      borderRadius: radii.lg,
      padding: spacing[4],
      flexDirection: "row",
      gap: spacing[4],
      alignItems: "center",
    },
    howItWorksItemFeatured: {
      backgroundColor: colors.surfaceInverse,
    },
    howItWorksNumber: {
      color: colors.accent,
      fontWeight: "900",
    },
    howItWorksText: {
      color: colors.text,
      flex: 1,
      fontSize: fontSizes.md,
    },
    howItWorksFeaturedText: {
      color: colors.textInverse,
    },
    quizPrompt: {
      color: colors.text,
      fontSize: fontSizes["3xl"],
      fontWeight: "800",
      lineHeight: lineHeights.title,
    },
    optionsList: {
      gap: spacing[3],
    },
    optionCard: {
      borderWidth: borderWidths.hairline,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      borderRadius: radii.lg,
      padding: spacing[4],
      gap: spacing[1],
    },
    optionCardSelected: {
      borderColor: colors.accent,
      backgroundColor: colors.accentSoft,
    },
    optionLabel: {
      color: colors.text,
      fontSize: fontSizes.md,
      fontWeight: "800",
    },
    optionCopy: {
      color: colors.textMuted,
      lineHeight: lineHeights.tight,
    },
    inlineStatus: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing[2],
    },
    statusCopy: {
      color: colors.textMuted,
    },
    interestGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing[3],
    },
    interestPill: {
      paddingVertical: spacing[3],
      paddingHorizontal: spacing[4],
      borderRadius: radii.full,
      backgroundColor: colors.background,
      borderWidth: borderWidths.hairline,
      borderColor: colors.border,
    },
    interestPillSelected: {
      backgroundColor: colors.surfaceInverse,
      borderColor: colors.surfaceInverse,
    },
    interestPillText: {
      color: colors.text,
      fontWeight: "800",
    },
    interestPillTextSelected: {
      color: colors.textInverse,
    },
    activationCard: {
      backgroundColor: colors.surfaceInverse,
      borderRadius: radii.xl,
      padding: spacing[5],
      gap: spacing[3],
    },
    activationEyebrow: {
      color: colors.warning,
      fontSize: fontSizes.sm,
      fontWeight: "900",
      letterSpacing: 1.2,
      textTransform: "uppercase",
    },
    activationTitle: {
      color: colors.textInverse,
      fontSize: fontSizes["4xl"],
      fontWeight: "900",
    },
    activationCopy: {
      color: colors.textInverse,
      lineHeight: lineHeights.body,
    },
    availabilityStack: {
      gap: spacing[3],
    },
    activationOptionLabel: {
      color: colors.textMuted,
      fontSize: fontSizes.xs,
      fontWeight: "900",
      letterSpacing: 0.8,
      textTransform: "uppercase",
    },
    availabilityGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing[3],
    },
    availabilityPill: {
      backgroundColor: colors.background,
      borderColor: colors.border,
      borderRadius: radii.sm,
      borderWidth: borderWidths.hairline,
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[3],
    },
    availabilityPillSelected: {
      backgroundColor: colors.accentSoft,
      borderColor: colors.accent,
    },
    availabilityPillText: {
      color: colors.text,
      fontSize: fontSizes.base,
      fontWeight: "800",
    },
    availabilityPillTextSelected: {
      color: colors.accent,
    },
    matchCard: {
      backgroundColor: colors.surfaceMuted,
      borderRadius: radii.xl,
      padding: spacing[6],
      gap: spacing[3],
    },
    matchEyebrow: {
      color: colors.brand,
      fontSize: fontSizes.sm,
      fontWeight: "900",
      letterSpacing: 1.2,
      textTransform: "uppercase",
    },
    matchTitle: {
      color: colors.text,
      fontSize: fontSizes["5xl"],
      fontWeight: "900",
    },
    matchReason: {
      color: colors.brand,
      lineHeight: lineHeights.body,
    },
    suggestionCard: {
      backgroundColor: colors.background,
      borderRadius: radii.lg,
      padding: spacing[5],
    },
    suggestionTitle: {
      color: colors.text,
      fontSize: fontSizes.lg,
      fontWeight: "800",
    },
    suggestionCopy: {
      color: colors.textMuted,
      marginTop: spacing[2],
      lineHeight: lineHeights.body,
    },
    buttonStack: {
      gap: spacing[1],
    },
    primaryAction: {
      borderRadius: radii.lg,
    },
    secondaryAction: {
      borderRadius: radii.lg,
      marginTop: spacing[2],
    },
    backActionText: {
      fontSize: fontSizes.base,
      fontWeight: "700",
    },
  });
};

export type OnboardingStyles = ReturnType<typeof createOnboardingStyles>;
