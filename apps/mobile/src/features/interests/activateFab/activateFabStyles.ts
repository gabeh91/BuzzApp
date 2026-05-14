import { StyleSheet } from "react-native";

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
  wheelHeaderHeight: number,
) => {
  const { borderWidths, colors, fontSizes, radii, shadows, spacing } = theme;
  const { columnGap, horizontalPadding, tileWidth } =
    getActivityTileMetrics(screenWidth);
  const effectiveWheelHeaderHeight =
    wheelHeaderHeight > 0 ? wheelHeaderHeight : 108;

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
      backgroundColor: "rgba(13, 39, 31, 0.74)",
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
      color: "rgba(255, 252, 245, 0.92)",
      fontSize: fontSizes.sm,
      fontWeight: "900",
      letterSpacing: 0.7,
      lineHeight: 18,
      textShadowColor: "rgba(13, 39, 31, 0.72)",
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
      backgroundColor: "rgba(214, 170, 67, 0.07)",
      borderColor: "rgba(214, 170, 67, 0.16)",
      borderRadius: 999,
      borderWidth: borderWidths.hairline,
      bottom:
        compactBottomOffset + FAB_DIAMETER / 2 - (screenWidth * 1.18) / 2,
      height: screenWidth * 1.18,
      left: screenWidth / 2 - (screenWidth * 1.18) / 2,
      position: "absolute",
      width: screenWidth * 1.18,
    },
    energyRingMedium: {
      backgroundColor: "rgba(204, 232, 235, 0.10)",
      borderRadius: 999,
      bottom:
        compactBottomOffset + FAB_DIAMETER / 2 - (screenWidth * 0.78) / 2,
      height: screenWidth * 0.78,
      left: screenWidth / 2 - (screenWidth * 0.78) / 2,
      position: "absolute",
      width: screenWidth * 0.78,
    },
    energyRingSmall: {
      backgroundColor: "rgba(214, 170, 67, 0.10)",
      borderRadius: 999,
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
      fontWeight: "900",
      letterSpacing: 1.3,
      lineHeight: 16,
      textTransform: "uppercase",
    },
    wheelTitle: {
      color: colors.surface,
      fontSize: fontSizes["2xl"],
      fontWeight: "900",
      lineHeight: 30,
      maxWidth: 250,
      textShadowColor: "rgba(13, 39, 31, 0.72)",
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 10,
    },
    wheelSubtitle: {
      color: "rgba(255, 252, 245, 0.92)",
      fontSize: fontSizes.sm,
      fontWeight: "700",
      lineHeight: 19,
      maxWidth: 280,
    },
    closeButton: {
      alignItems: "center",
      backgroundColor: "rgba(255, 252, 245, 0.16)",
      borderColor: "rgba(255, 252, 245, 0.24)",
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
      elevation: 16,
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
      backgroundColor: colors.warning,
      borderRadius: 999,
      bottom: -8,
      left: -8,
      opacity: 0,
      position: "absolute",
      right: -8,
      top: -8,
    },
    glowExpanded: {
      bottom: undefined,
      height: 46,
    },
    fabLiveBorder: {
      alignSelf: "stretch",
      backgroundColor: "rgba(215, 168, 75, 0.78)",
      borderRadius: radii.full,
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
      backgroundColor: colors.warning,
      borderColor: colors.warning,
      borderRadius: radii.full,
      borderWidth: borderWidths.hairline,
      flexDirection: "column",
      gap: 2,
      height: FAB_DIAMETER,
      justifyContent: "center",
      overflow: "hidden",
      paddingHorizontal: spacing[1],
      paddingVertical: spacing[1],
      width: FAB_DIAMETER,
      ...shadows.card,
    },
    fabExpanded: {
      borderColor: "transparent",
      borderWidth: 0,
      elevation: 0,
      paddingHorizontal: spacing[6],
      paddingVertical: spacing[3],
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
    },
    fabReady: {
      backgroundColor: colors.warning,
      borderColor: colors.text,
    },
    chargeFill: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(255, 252, 245, 0.36)",
      opacity: 0,
    },
    contentViewport: {
      ...StyleSheet.absoluteFillObject,
      overflow: "hidden",
      zIndex: 2,
    },
    contentTrack: {
      flexDirection: "row",
      height: "100%",
    },
    contentPanel: {
      alignItems: "center",
      gap: 1,
      height: "100%",
      justifyContent: "center",
      paddingHorizontal: spacing[1],
    },
    expandedPanel: {
      alignItems: "center",
      gap: 3,
      height: "100%",
      justifyContent: "center",
      paddingHorizontal: spacing[6],
    },
    compactContent: {
      ...StyleSheet.absoluteFillObject,
      alignItems: "center",
      gap: 1,
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
      backgroundColor: "rgba(255, 252, 245, 0.34)",
      borderColor: "rgba(13, 39, 31, 0.12)",
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
      fontSize: 9,
      fontWeight: "900",
      letterSpacing: 0.15,
      lineHeight: 10,
      maxWidth: FAB_DIAMETER - spacing[1] * 2 - 4,
      textAlign: "center",
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
      fontWeight: "800",
      lineHeight: 15,
      maxWidth: screenWidth - EXPANDED_PANEL_HORIZONTAL_INSET * 2 - spacing[8],
      opacity: 0.82,
      textAlign: "center",
    },
    ripple: {
      backgroundColor: "rgba(214, 170, 67, 0.46)",
      borderColor: "rgba(255, 244, 205, 0.9)",
      borderRadius: 72,
      borderTopWidth: 8,
      bottom: expandedBottomOffset + EXPANDED_PANEL_HEIGHT - 94,
      height: 188,
      left: -screenWidth * 0.225,
      position: "absolute",
      width: screenWidth * 1.45,
      zIndex: 12,
    },
    rippleEcho: {
      backgroundColor: "rgba(255, 225, 153, 0.32)",
      borderColor: "rgba(255, 252, 245, 0.76)",
      borderRadius: 52,
      borderTopWidth: 4,
      bottom: expandedBottomOffset + EXPANDED_PANEL_HEIGHT - 62,
      height: 124,
      left: -screenWidth * 0.15,
      position: "absolute",
      width: screenWidth * 1.3,
      zIndex: 11,
    },
    rippleWash: {
      backgroundColor: "rgba(214, 170, 67, 0.4)",
      borderTopLeftRadius: 80,
      borderTopRightRadius: 80,
      bottom: expandedBottomOffset + EXPANDED_PANEL_HEIGHT - 34,
      height: screenHeight * 0.64,
      left: 0,
      position: "absolute",
      width: screenWidth,
      zIndex: 10,
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
      borderColor: "rgba(255, 252, 245, 0.86)",
      borderRadius: 24,
      borderWidth: borderWidths.hairline,
      flex: 1,
      flexDirection: "column",
      gap: spacing[2],
      justifyContent: "flex-start",
      minWidth: 0,
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[3],
      width: tileWidth,
      ...shadows.card,
    },
    wheelButtonPressed: {
      transform: [{ scale: 0.97 }],
    },
    wheelIconBadge: {
      alignItems: "center",
      alignSelf: "flex-start",
      backgroundColor: colors.warningSoft,
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
      fontWeight: "900",
      lineHeight: 15,
      width: "100%",
    },
    expandedIconBadge: {
      alignItems: "center",
      backgroundColor: "rgba(255, 252, 245, 0.34)",
      borderColor: "rgba(13, 39, 31, 0.12)",
      borderRadius: radii.full,
      borderWidth: borderWidths.hairline,
      height: 32,
      justifyContent: "center",
      marginBottom: 1,
      width: 32,
    },
  });
};

export type ActivateFabStyles = ReturnType<typeof createActivateFabStyles>;
