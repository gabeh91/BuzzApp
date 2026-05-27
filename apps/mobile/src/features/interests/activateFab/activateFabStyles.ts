import { Platform, StyleSheet } from "react-native";

import type { BuzzTheme } from "@/theme/tokens";

import type { BuzzInterest } from "../interestFlow";
import {
  EXPANDED_PANEL_HEIGHT,
  EXPANDED_PANEL_HORIZONTAL_INSET,
  FAB_DIAMETER,
} from "./activateFabConstants";

const WHEEL_TILE_MIN_HEIGHT = 108;
const WHEEL_TILE_LINE_HEIGHT = 18;
const WHEEL_TILE_HORIZONTAL_PADDING = 24;
const WHEEL_TILE_ESTIMATED_CHARACTER_WIDTH = 6.8;

export const getActivityTileMetrics = (screenWidth: number) => {
  const columnCount = screenWidth >= 520 ? 4 : 3;
  const horizontalPadding = screenWidth < 380 ? 18 : 24;
  const columnGap = screenWidth < 380 ? 10 : 14;
  const tileWidth = Math.floor(
    (screenWidth - horizontalPadding * 2 - columnGap * (columnCount - 1)) /
      columnCount,
  );

  return {
    columnCount,
    columnGap,
    horizontalPadding,
    tileWidth,
  };
};

const estimateTileLabelLines = (interest: BuzzInterest, tileWidth: number) => {
  const usableLabelWidth = Math.max(
    44,
    tileWidth - WHEEL_TILE_HORIZONTAL_PADDING,
  );
  const estimatedCharactersPerLine = Math.max(
    7,
    Math.floor(usableLabelWidth / WHEEL_TILE_ESTIMATED_CHARACTER_WIDTH),
  );
  const longestWordLength = interest.name
    .split(/\s+/)
    .reduce((maxLength, word) => Math.max(maxLength, word.length), 0);

  return Math.max(
    1,
    Math.ceil(interest.name.length / estimatedCharactersPerLine),
    Math.ceil(longestWordLength / estimatedCharactersPerLine),
  );
};

export const estimateActivityTileHeight = (
  interests: BuzzInterest[],
  screenWidth: number,
) => {
  const { tileWidth } = getActivityTileMetrics(screenWidth);
  const maxLineCount = interests.reduce(
    (maxLines, interest) =>
      Math.max(maxLines, estimateTileLabelLines(interest, tileWidth)),
    1,
  );

  return (
    WHEEL_TILE_MIN_HEIGHT +
    Math.max(0, maxLineCount - 1) * WHEEL_TILE_LINE_HEIGHT
  );
};

export const titleCaseCategory = (category: string) =>
  category
    ? category.charAt(0).toUpperCase() + category.slice(1).replaceAll("_", " ")
    : "";

export const createActivateFabStyles = (
  theme: BuzzTheme,
  compactBottomOffset: number,
  expandedBottomOffset: number,
  screenWidth: number,
  screenHeight: number,
  topInset: number,
) => {
  const { borderWidths, colors, fabWheel: fw, fontSizes, radii, spacing } =
    theme;
  const { columnGap, horizontalPadding, tileWidth } =
    getActivityTileMetrics(screenWidth);

  return StyleSheet.create({
    root: {
      bottom: 0,
      height: screenHeight,
      left: 0,
      position: "absolute",
      right: 0,
      zIndex: 40,
    },
    dismissLayer: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: fw.dismissScrim,
    },
    energyField: {
      ...StyleSheet.absoluteFillObject,
    },
    activityLayer: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 21,
    },
    wheelHeaderFade: {
      left: 0,
      position: "absolute",
      right: 0,
      top: 0,
      zIndex: 24,
    },
    wheelScroll: {
      bottom: 0,
      left: 0,
      position: "absolute",
      right: 0,
      top: 0,
      zIndex: 20,
    },
    wheelScrollContent: {
      paddingBottom: expandedBottomOffset + EXPANDED_PANEL_HEIGHT + spacing[6],
      paddingHorizontal: horizontalPadding,
      paddingTop: 0,
    },
    wheelSection: {
      gap: spacing[3],
      paddingBottom: spacing[5],
    },
    wheelSectionTitle: {
      color: fw.heroTextMuted,
      fontSize: fontSizes.sm,
      ...theme.fontStyles.black,
      letterSpacing: 0.7,
      lineHeight: 18,
      textShadowColor: fw.textShadow,
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 10,
      textTransform: "uppercase",
    },
    wheelGrid: {
      alignContent: "flex-start",
      flexDirection: "row",
      flexWrap: "wrap",
      gap: columnGap,
    },
    energyRingLarge: {
      backgroundColor: fw.energyRingGoldFill,
      borderColor: fw.energyRingGoldBorder,
      borderRadius: radii.full,
      borderWidth: borderWidths.hairline,
      bottom:
        compactBottomOffset + FAB_DIAMETER / 2 - (screenWidth * 1.18) / 2,
      height: screenWidth * 1.18,
      left: screenWidth / 2 - (screenWidth * 1.18) / 2,
      position: "absolute",
      width: screenWidth * 1.18,
    },
    energyRingMedium: {
      backgroundColor: fw.energyRingSky,
      borderRadius: radii.full,
      bottom:
        compactBottomOffset + FAB_DIAMETER / 2 - (screenWidth * 0.78) / 2,
      height: screenWidth * 0.78,
      left: screenWidth / 2 - (screenWidth * 0.78) / 2,
      position: "absolute",
      width: screenWidth * 0.78,
    },
    energyRingSmall: {
      backgroundColor: fw.energyRingGoldInner,
      borderRadius: radii.full,
      bottom:
        compactBottomOffset + FAB_DIAMETER / 2 - (screenWidth * 0.38) / 2,
      height: screenWidth * 0.38,
      left: screenWidth / 2 - (screenWidth * 0.38) / 2,
      position: "absolute",
      width: screenWidth * 0.38,
    },
    wheelHeader: {
      alignItems: "flex-start",
      flexDirection: "row",
      gap: spacing[4],
      justifyContent: "space-between",
      left: spacing[6],
      position: "absolute",
      right: spacing[6],
      top: topInset + spacing[4],
      zIndex: 25,
    },
    wheelHeaderCopy: {
      flex: 1,
      gap: spacing[1],
      paddingRight: spacing[3],
    },
    wheelEyebrow: {
      color: colors.warning,
      fontSize: fontSizes.xs,
      ...theme.fontStyles.black,
      letterSpacing: 1.3,
      lineHeight: 16,
      textTransform: "uppercase",
    },
    wheelTitle: {
      color: colors.surface,
      fontSize: fontSizes["2xl"],
      ...theme.fontStyles.black,
      lineHeight: 30,
      maxWidth: 250,
      textShadowColor: fw.textShadow,
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 10,
    },
    wheelSubtitle: {
      color: fw.heroTextMuted,
      fontSize: fontSizes.sm,
      ...theme.fontStyles.display,
      lineHeight: 19,
      maxWidth: 280,
    },
    closeButton: {
      alignItems: "center",
      backgroundColor: fw.closeButtonFill,
      borderColor: fw.closeButtonBorder,
      borderRadius: radii.full,
      borderWidth: borderWidths.hairline,
      height: 42,
      justifyContent: "center",
      width: 42,
    },
    closeButtonPressed: {
      opacity: 0.72,
      transform: [{ scale: 0.96 }],
    },
    anchor: {
      alignItems: "center",
      elevation: Platform.OS === "android" ? 0 : 16,
      left: 0,
      position: "absolute",
      right: 0,
      zIndex: 20,
    },
    pressable: {
      alignItems: "center",
      justifyContent: "flex-end",
      zIndex: 2,
    },
    fabActionHitArea: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 4,
    },
    glow: {
      backgroundColor: fw.fabCompactGlow,
      borderRadius: radii.md,
      bottom: -10,
      left: -10,
      opacity: 0,
      position: "absolute",
      right: -10,
      top: -10,
    },
    glowExpanded: {
      bottom: undefined,
      height: 46,
    },
    fabLiveBorder: {
      alignSelf: "stretch",
      backgroundColor: fw.fabLiveBorder,
      height: 3,
      left: 0,
      marginBottom: 0,
      position: "absolute",
      right: 0,
      top: 0,
      zIndex: 5,
    },
    fab: {
      alignItems: "center",
      alignSelf: "center",
      backgroundColor: colors.surfaceMuted,
      borderColor: colors.brandSoft,
      borderRadius: radii.sm,
      borderWidth: borderWidths.hairline,
      elevation: 0,
      flexDirection: "column",
      gap: spacing[0.5],
      height: FAB_DIAMETER,
      justifyContent: "center",
      overflow: "hidden",
      paddingHorizontal: spacing[2],
      paddingVertical: spacing[2],
      width: FAB_DIAMETER,
    },
    fabExpanded: {
      borderColor: colors.clear,
      borderWidth: 0,
      paddingHorizontal: spacing[6],
      paddingVertical: spacing[3],
    },
    fabReady: {
      backgroundColor: colors.surfaceMuted,
      borderColor: colors.brandSoft,
    },
    chargeFill: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: fw.chargeFill,
      opacity: 0,
    },
    contentViewport: {
      ...StyleSheet.absoluteFillObject,
      overflow: "hidden",
      zIndex: 2,
    },
    contentMorphLayer: {
      ...StyleSheet.absoluteFillObject,
      alignItems: "center",
      justifyContent: "center",
    },
    contentPanel: {
      alignItems: "center",
      gap: spacing[0.25],
      height: "100%",
      justifyContent: "center",
      paddingHorizontal: spacing[1],
    },
    expandedPanel: {
      alignItems: "center",
      gap: spacing[0.75],
      height: "100%",
      justifyContent: "center",
      paddingHorizontal: spacing[6],
    },
    compactContent: {
      ...StyleSheet.absoluteFillObject,
      alignItems: "center",
      gap: spacing[0.25],
      justifyContent: "center",
      paddingHorizontal: spacing[1],
      zIndex: 2,
    },
    clearSelectionInPanel: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 6,
    },
    clearSelectionButton: {
      alignItems: "center",
      backgroundColor: fw.clearSelectionFill,
      borderColor: fw.clearSelectionBorder,
      borderRadius: radii.full,
      borderWidth: borderWidths.hairline,
      height: 34,
      justifyContent: "center",
      position: "absolute",
      right: spacing[3],
      top: spacing[3],
      width: 34,
      zIndex: 2,
    },
    clearSelectionButtonPressed: {
      opacity: 0.72,
      transform: [{ scale: 0.96 }],
    },
    fabDisabled: {
      opacity: 0.45,
    },
    label: {
      color: colors.text,
      fontSize: fontSizes.xs,
      ...theme.fontStyles.display,
      letterSpacing: 0,
      lineHeight: 15,
      maxWidth: FAB_DIAMETER - spacing[2] * 2 - 4,
      textAlign: "center",
      marginTop: spacing[0.5],
    },
    expandedLabel: {
      fontSize: fontSizes.md,
      letterSpacing: 0,
      lineHeight: 22,
      maxWidth: screenWidth - EXPANDED_PANEL_HORIZONTAL_INSET * 2 - spacing[10],
    },
    prompt: {
      color: colors.text,
      fontSize: fontSizes.xs,
      ...theme.fontStyles.heavy,
      lineHeight: 15,
      maxWidth: screenWidth - EXPANDED_PANEL_HORIZONTAL_INSET * 2 - spacing[8],
      opacity: 0.82,
      textAlign: "center",
    },
    /** Short burst: no rounded clip (avoids hard mask edges); feather is gradient-only. */
    energyWaveBurst: {
      bottom: expandedBottomOffset + EXPANDED_PANEL_HEIGHT - 66,
      height: 248,
      left: 0,
      overflow: "visible",
      position: "absolute",
      width: screenWidth,
      zIndex: 13,
    },
    /** Tall tail wash: same — soft edges from alpha, not border clipping. */
    energyWaveTail: {
      bottom: expandedBottomOffset + EXPANDED_PANEL_HEIGHT - 78,
      height: 460,
      left: 0,
      overflow: "visible",
      position: "absolute",
      width: screenWidth,
      zIndex: 11,
    },
    wheelItem: {
      position: "absolute",
    },
    wheelTileShell: {
      alignSelf: "stretch",
      minWidth: 0,
    },
    wheelButton: {
      alignItems: "stretch",
      alignSelf: "stretch",
      backgroundColor: colors.surface,
      borderColor: fw.wheelButtonBorder,
      borderRadius: radii.lg,
      borderWidth: borderWidths.hairline,
      flex: 1,
      flexDirection: "column",
      gap: spacing[2],
      justifyContent: "flex-start",
      minWidth: 0,
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[3],
      width: tileWidth,
    },
    wheelButtonPressed: {
      transform: [{ scale: 0.97 }],
    },
    wheelIconBadge: {
      alignItems: "center",
      alignSelf: "flex-start",
      backgroundColor: colors.surfaceMuted,
      borderRadius: radii.full,
      flexShrink: 0,
      height: 30,
      justifyContent: "center",
      width: 30,
    },
    wheelLabelWrap: {
      flexGrow: 0,
      flexShrink: 0,
      justifyContent: "flex-start",
      minWidth: 0,
      width: "100%",
    },
    wheelLabel: {
      color: colors.text,
      flexShrink: 1,
      fontSize: 12,
      ...theme.fontStyles.black,
      lineHeight: 15,
      width: "100%",
    },
    expandedIconBadge: {
      alignItems: "center",
      backgroundColor: fw.expandedIconBadgeFill,
      borderColor: fw.expandedIconBadgeBorder,
      borderRadius: radii.full,
      borderWidth: borderWidths.hairline,
      height: 32,
      justifyContent: "center",
      marginBottom: spacing[0.25],
      width: 32,
    },
  });
};

export type ActivateFabStyles = ReturnType<typeof createActivateFabStyles>;
