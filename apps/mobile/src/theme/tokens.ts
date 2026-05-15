import { Platform } from "react-native";

export type BuzzThemeMode = "light" | "dark";

const fontFamilies = {
  display: Platform.select({
    ios: "Avenir Next",
    android: "Metropolis-ExtraBold",
    default: "Metropolis-ExtraBold"
  }),
  body: Platform.select({
    ios: "Avenir Next",
    android: "Metropolis-Regular",
    default: "Metropolis-Regular"
  }),
  mono: Platform.select({
    ios: "Menlo",
    android: "Menlo-Regular",
    default: "Menlo-Regular"
  })
};

const fontStyles = {
  display: Platform.select({
    ios: { fontFamily: "Avenir Next", fontWeight: "900" as const },
    android: { fontFamily: "Metropolis-ExtraBold" },
    default: { fontFamily: "Metropolis-ExtraBold" }
  }),
  displayStrong: Platform.select({
    ios: { fontFamily: "Avenir Next", fontWeight: "800" as const },
    android: { fontFamily: "Metropolis-ExtraBold" },
    default: { fontFamily: "Metropolis-ExtraBold" }
  })
};

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
  16: 64
} as const;

/** Default horizontal + top inset for `Screen`; bottom is left to scroll/list insets. */
export const SCREEN_CONTENT_GUTTER_SPACING: keyof typeof spacing = 6;

export const radii = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 30,
  "2xl": 36,
  full: 999
} as const;

export const fontSizes = {
  xs: 12,
  sm: 13,
  base: 15,
  md: 16,
  lg: 17,
  xl: 18,
  "2xl": 22,
  "3xl": 25,
  "4xl": 28,
  "5xl": 30,
  hero: 34
} as const;

export const lineHeights = {
  tight: 20,
  body: 24,
  relaxed: 26,
  title: 32,
  hero: 39
} as const;

export const borderWidths = {
  hairline: 1,
  focus: 2
} as const;

const lightPalette = {
  mode: "light",
  ink: "#15251f",
  muted: "#66736b",
  cream: "#f7f0df",
  paper: "#fffaf0",
  moss: "#31483f",
  sage: "#8fa88f",
  clay: "#c96f45",
  claySoft: "rgba(201, 111, 69, 0.14)",
  gold: "#d7a84b",
  goldSoft: "rgba(215, 168, 75, 0.28)",
  sky: "#d8e9ea",
  line: "rgba(21, 37, 31, 0.14)",
  disabled: "rgba(21, 37, 31, 0.26)",
  overlay: "rgba(21, 37, 31, 0.12)",
  danger: "#a82e24",
  toastBannerSuccess: "#31483f",
  toastBannerInfo: "#4f7268",
  toastBannerWarning: "#c96f45",
  toastBannerDanger: "#a82e24",
  toastChromeForeground: "rgba(255, 250, 240, 0.96)",
  toastChromeBarTrack: "rgba(255, 250, 240, 0.22)",
  toastChromeBarFill: "rgba(255, 250, 240, 0.72)",
  toastChromeDismissPressed: "rgba(255, 250, 240, 0.16)",
  badgeSelectedTint: "rgba(255, 250, 240, 0.22)"
} as const;

const darkPalette = {
  mode: "dark",
  ink: "#f8ecd8",
  muted: "#b8aa94",
  cream: "#101814",
  paper: "#17221d",
  moss: "#d9e7d7",
  sage: "#9fba9f",
  clay: "#e09063",
  claySoft: "rgba(224, 144, 99, 0.2)",
  gold: "#e7be6a",
  goldSoft: "rgba(231, 190, 106, 0.18)",
  sky: "#263d40",
  line: "rgba(248, 236, 216, 0.16)",
  disabled: "rgba(248, 236, 216, 0.24)",
  overlay: "rgba(248, 236, 216, 0.12)",
  danger: "#c44740",
  toastBannerSuccess: "#1e3330",
  toastBannerInfo: "#2a3d36",
  toastBannerWarning: "#6b3d1f",
  toastBannerDanger: "#5c1f1f",
  toastChromeForeground: "rgba(248, 236, 216, 0.96)",
  toastChromeBarTrack: "rgba(248, 236, 216, 0.22)",
  toastChromeBarFill: "rgba(248, 236, 216, 0.72)",
  toastChromeDismissPressed: "rgba(248, 236, 216, 0.16)",
  badgeSelectedTint: "rgba(248, 236, 216, 0.2)"
} as const;

const fabWheel = {
  dismissScrim: "rgba(21, 37, 31, 0.74)",
  gradientDeep: "rgba(21, 37, 31, 0.56)",
  gradientMid: "rgba(21, 37, 31, 0.28)",
  gradientClear: "rgba(21, 37, 31, 0)",
  heroTextMuted: "rgba(255, 250, 240, 0.92)",
  textShadow: "rgba(21, 37, 31, 0.72)",
  energyRingGoldFill: "rgba(215, 168, 75, 0.07)",
  energyRingGoldBorder: "rgba(215, 168, 75, 0.16)",
  energyRingSky: "rgba(216, 233, 234, 0.1)",
  energyRingGoldInner: "rgba(215, 168, 75, 0.1)",
  closeButtonFill: "rgba(255, 250, 240, 0.16)",
  closeButtonBorder: "rgba(255, 250, 240, 0.24)",
  fabLiveBorder: "rgba(215, 168, 75, 0.78)",
  chargeFill: "rgba(255, 250, 240, 0.36)",
  clearSelectionFill: "rgba(255, 250, 240, 0.34)",
  clearSelectionBorder: "rgba(21, 37, 31, 0.12)",
  /** FAB release burst: transparent stops use paper hue so gradients don’t muddy to grey. */
  energyReleasePrimaryG0: "rgba(255, 250, 240, 0)",
  energyReleasePrimaryG1: "rgba(255, 228, 168, 0.44)",
  energyReleasePrimaryG2: "rgba(232, 188, 88, 0.88)",
  energyReleasePrimaryG3: "rgba(255, 250, 240, 0)",
  /** FAB release tail: same — warm transparent ends. */
  energyReleaseSecondaryG0: "rgba(255, 250, 240, 0)",
  energyReleaseSecondaryG1: "rgba(255, 232, 200, 0.2)",
  energyReleaseSecondaryG2: "rgba(215, 168, 75, 0.36)",
  energyReleaseSecondaryG3: "rgba(255, 250, 240, 0)",
  wheelButtonBorder: "rgba(255, 250, 240, 0.86)",
  expandedIconBadgeFill: "rgba(255, 250, 240, 0.34)",
  expandedIconBadgeBorder: "rgba(21, 37, 31, 0.12)",
  idlePulseFillEnd: "#e7bd62",
  idlePulseBorderEnd: "#efcd7e",
} as const;

export type FabWheelTheme = typeof fabWheel;

const createSemanticColors = (palette: typeof lightPalette | typeof darkPalette) => {
  return {
    ...palette,
    clear: "rgba(0, 0, 0, 0)",
    background: palette.cream,
    surface: palette.paper,
    surfaceMuted: palette.sky,
    surfaceInverse: palette.ink,
    text: palette.ink,
    textMuted: palette.muted,
    textInverse: palette.paper,
    brand: palette.moss,
    brandSoft: palette.sage,
    accent: palette.clay,
    accentSoft: palette.claySoft,
    warning: palette.gold,
    warningSoft: palette.goldSoft,
    border: palette.line,
    focus: palette.clay
  };
};

const createTheme = <Mode extends BuzzThemeMode>(
  mode: Mode,
  palette: typeof lightPalette | typeof darkPalette,
) => {
  const cardShadow =
    mode === "dark"
      ? {
          shadowColor: "#000000",
          shadowOpacity: 0.28,
          shadowRadius: 28,
          shadowOffset: { width: 0, height: 16 },
          elevation: 6,
        }
      : {
          shadowColor: palette.ink,
          shadowOpacity: 0.12,
          shadowRadius: 24,
          shadowOffset: { width: 0, height: 14 },
          elevation: 5,
        };

  return {
    mode,
    palette,
    colors: createSemanticColors(palette),
    fabWheel,
    fontFamilies,
    fontStyles,
    fontSizes,
    lineHeights,
    spacing,
    radii,
    borderWidths,
    shadows: {
      card: cardShadow,
    },
  };
};

export const themes = {
  light: createTheme("light", lightPalette),
  dark: createTheme("dark", darkPalette),
} as const;

export type BuzzTheme = (typeof themes)[BuzzThemeMode];

export const colors = themes.light.colors;
export const theme = themes.light;
export const shadows = themes.light.shadows;
