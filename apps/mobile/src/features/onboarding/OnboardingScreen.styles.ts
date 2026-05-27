import { StyleSheet } from "react-native";

import {
  SCREEN_CONTENT_GUTTER_SPACING,
  type BuzzTheme,
} from "@/theme/tokens";

export const createOnboardingStyles = (
  theme: BuzzTheme,
  bottomInset: number,
  fontScale = 1,
) => {
  const {
    colors,
    fontSizes,
    lineHeights,
    radii,
    spacing,
    borderWidths,
  } = theme;
  const usesLargeTextLayout = fontScale >= 1.15;

  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    screenContent: {
      flex: 1,
      flexGrow: 1,
      gap: spacing[0],
      paddingBottom: spacing[0],
      paddingHorizontal: spacing[0],
      paddingTop: spacing[0],
    },
    scrollView: {
      flex: 1,
      overflow: "visible",
    },
    scrollContent: {
      flexGrow: 1,
      /** Match `ProfileQuizScreen` (`bottomInset + spacing[10]`) — onboarding uses `edges={["top"]}` so this is the sole bottom safe padding. */
      paddingBottom: bottomInset + spacing[10],
      paddingHorizontal: spacing[0],
      paddingTop: spacing[2],
    },
    scrollContentWithHeaderProgress: {
      paddingTop: spacing[2] + spacing[10] + spacing[5],
    },
    stage: {
      flex: 1,
      position: "relative",
    },
    layout: {
      flexGrow: 1,
      justifyContent: "space-between",
      gap: usesLargeTextLayout ? spacing[3] : spacing[4],
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
      borderRadius: radii.full,
      backgroundColor: colors.surfaceMuted,
    },
    ambientGold: {
      position: "absolute",
      bottom: 90,
      left: -95,
      width: 260,
      height: 260,
      borderRadius: radii.full,
      backgroundColor: colors.surfaceMuted,
    },
    fixedHeader: {
      borderBottomColor: colors.overlay,
      borderBottomWidth: borderWidths.hairline,
      position: "relative",
      zIndex: 2,
    },
    headerProgressFloating: {
      left: 0,
      position: "absolute",
      right: 0,
      top: "100%",
      overflow: "hidden",
      zIndex: 3,
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
      backgroundColor: colors.clear,
      borderRadius: 0,
      paddingHorizontal: spacing[SCREEN_CONTENT_GUTTER_SPACING],
      paddingVertical: spacing[0],
      gap: spacing[4],
      borderWidth: 0,
      flex: 0,
      width: "100%",
    },
    cardRail: {
      flex: 1,
      justifyContent: "center",
      overflow: "visible",
      width: "100%",
    },
    titleStack: {
      maxWidth: "92%",
    },
    contentStack: {
      gap: spacing[3],
    },
    bodyCopy: {
      color: colors.textMuted,
      fontSize: fontSizes.base,
      lineHeight: usesLargeTextLayout ? lineHeights.body : lineHeights.relaxed,
    },
    howItWorksList: {
      gap: spacing[3],
    },
    howItWorksItem: {
      backgroundColor: colors.background,
      borderRadius: radii.md,
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
      fontSize: fontSizes.lg,
      ...theme.fontStyles.display,
    },
    howItWorksText: {
      color: colors.text,
      flex: 1,
      fontSize: fontSizes.md,
      lineHeight: lineHeights.body,
      ...theme.fontStyles.body,
    },
    howItWorksFeaturedText: {
      color: colors.textInverse,
    },
    quizPrompt: {
      maxWidth: "92%",
    },
    optionsList: {
      gap: spacing[2],
    },
    optionCard: {
      borderWidth: borderWidths.hairline,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      borderRadius: radii.md,
      padding: spacing[3],
      gap: spacing[1],
    },
    optionCardSelected: {
      backgroundColor: colors.surfaceMuted,
      borderColor: colors.surfaceMuted,
    },
    optionLabel: {
      color: colors.text,
      fontSize: fontSizes.md,
      lineHeight: lineHeights.tight,
      ...theme.fontStyles.labelStrong,
    },
    optionCopy: {
      color: colors.textMuted,
      fontSize: fontSizes.sm,
      lineHeight: lineHeights.tight,
      ...theme.fontStyles.body,
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
      ...theme.fontStyles.labelStrong,
    },
    interestPillTextSelected: {
      color: colors.textInverse,
    },
    activationCard: {
      backgroundColor: colors.surfaceInverse,
      borderRadius: radii.lg,
      padding: spacing[4],
      gap: spacing[2],
    },
    activationEyebrow: {
      color: colors.warning,
      fontSize: fontSizes.sm,
      ...theme.fontStyles.display,
      letterSpacing: 1.2,
      textTransform: "uppercase",
    },
    activationTitle: {
      color: colors.textInverse,
      fontSize: fontSizes["3xl"],
      ...theme.fontStyles.display,
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
      ...theme.fontStyles.display,
      letterSpacing: 0.8,
      textTransform: "uppercase",
    },
    availabilityGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing[2],
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
      backgroundColor: colors.surface,
      borderColor: colors.brandSoft,
      borderWidth: borderWidths.focus,
    },
    availabilityPillText: {
      color: colors.text,
      fontSize: fontSizes.base,
      ...theme.fontStyles.labelStrong,
    },
    availabilityPillTextSelected: {
      color: colors.text,
    },
    matchCard: {
      backgroundColor: colors.surfaceMuted,
      borderRadius: radii.lg,
      padding: spacing[5],
      gap: spacing[3],
    },
    matchEyebrow: {
      color: colors.brand,
      fontSize: fontSizes.sm,
      ...theme.fontStyles.display,
      letterSpacing: 1.2,
      textTransform: "uppercase",
    },
    matchTitle: {
      color: colors.text,
      fontSize: fontSizes["4xl"],
      ...theme.fontStyles.display,
    },
    matchReason: {
      color: colors.brand,
      lineHeight: lineHeights.body,
    },
    suggestionCard: {
      backgroundColor: colors.background,
      borderRadius: radii.md,
      padding: spacing[4],
    },
    suggestionTitle: {
      color: colors.text,
      fontSize: fontSizes.lg,
      ...theme.fontStyles.labelStrong,
    },
    suggestionCopy: {
      color: colors.textMuted,
      marginTop: spacing[2],
      lineHeight: lineHeights.body,
    },
    buttonStack: {
      gap: spacing[2],
      paddingHorizontal: spacing[SCREEN_CONTENT_GUTTER_SPACING],
    },
    primaryAction: {
      borderRadius: radii.sm,
    },
    secondaryAction: {
      borderRadius: radii.sm,
      marginTop: spacing[2],
    },
    backActionText: {
      fontSize: fontSizes.base,
      ...theme.fontStyles.display,
    },
  });
};

export type OnboardingStyles = ReturnType<typeof createOnboardingStyles>;
