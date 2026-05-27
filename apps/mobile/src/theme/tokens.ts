import { Platform } from "react-native";

export type BuzzThemeMode = "light" | "dark";

/** Registered in `AppProviders` via `useFonts` (Nunito Sans static cuts, SIL OFL). */
export const NUNITO_SANS_REGULAR = "NunitoSans-Regular";
export const NUNITO_SANS_MEDIUM = "NunitoSans-Medium";
export const NUNITO_SANS_SEMIBOLD = "NunitoSans-SemiBold";
export const NUNITO_SANS_BOLD = "NunitoSans-Bold";
export const NUNITO_SANS_EXTRABOLD = "NunitoSans-ExtraBold";
export const NUNITO_SANS_BLACK = "NunitoSans-Black";

/** @deprecated Prefer `theme.fontStyles` or a specific `NUNITO_SANS_*` constant. */
export const NUNITO_SANS_FAMILY = NUNITO_SANS_REGULAR;

const fontFamilies = {
  sans: NUNITO_SANS_MEDIUM,
  body: NUNITO_SANS_SEMIBOLD,
  display: NUNITO_SANS_EXTRABOLD,
  mono: Platform.select({
    ios: "Menlo",
    android: "Menlo-Regular",
    default: "Menlo-Regular",
  }),
};

/**
 * Shared sans styles; use these instead of raw `fontWeight` in feature styles.
 * Each role maps to its own bundled face so weights render consistently on iOS and Android.
 */
const fontStyles = {
  body: {
    fontFamily: NUNITO_SANS_SEMIBOLD,
  },
  labelStrong: {
    fontFamily: NUNITO_SANS_BOLD,
  },
  display: {
    fontFamily: NUNITO_SANS_EXTRABOLD,
  },
  /** @deprecated Use `labelStrong` */
  displayStrong: {
    fontFamily: NUNITO_SANS_BOLD,
  },
  heavy: {
    fontFamily: NUNITO_SANS_BLACK,
  },
  black: {
    fontFamily: NUNITO_SANS_BLACK,
  },
} as const;

export type BuzzFontStyle = keyof typeof fontStyles;

export const spacing = {
  0: 0,
  0.25: 1,
  0.5: 2,
  0.75: 3,
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
  16: 64,
} as const;

/** Default horizontal + top inset for `Screen`; bottom is left to scroll/list insets. */
export const SCREEN_CONTENT_GUTTER_SPACING: keyof typeof spacing = 6;

export const radii = {
  "2xs": 2,
  xs: 4,
  icon: 6,
  sm: 10,
  md: 14,
  lg: 20,
  xl: 24,
  "2xl": 28,
  full: 999,
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
  hero: 34,
} as const;

export const lineHeights = {
  tight: 20,
  body: 24,
  relaxed: 26,
  title: 32,
  hero: 39,
} as const;

export const borderWidths = {
  hairline: 1,
  focus: 2,
} as const;

const lightPalette = {
  mode: "light",
  ink: "#1d2624",
  muted: "#6a7270",
  cream: "#f4f2ed",
  paper: "#fcfbf8",
  moss: "#31483f",
  sage: "#8fa88f",
  clay: "#c96f45",
  claySoft: "rgba(201, 111, 69, 0.14)",
  gold: "#d7a84b",
  goldSoft: "rgba(215, 168, 75, 0.28)",
  sky: "#e9edf0",
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
  badgeSelectedTint: "rgba(255, 250, 240, 0.22)",
} as const;

const darkPalette = {
  mode: "dark",
  ink: "#f2eee6",
  muted: "#b4b0a7",
  cream: "#101314",
  paper: "#171c1d",
  moss: "#d9e7d7",
  sage: "#9fba9f",
  clay: "#e09063",
  claySoft: "rgba(224, 144, 99, 0.2)",
  gold: "#e7be6a",
  goldSoft: "rgba(231, 190, 106, 0.18)",
  sky: "#222a2c",
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
  badgeSelectedTint: "rgba(248, 236, 216, 0.2)",
} as const;

const fabWheel = {
  dismissScrim: "rgba(21, 37, 31, 0.74)",
  gradientDeep: "rgba(21, 37, 31, 0.56)",
  gradientMid: "rgba(21, 37, 31, 0.28)",
  gradientClear: "rgba(21, 37, 31, 0)",
  heroTextMuted: "rgba(255, 250, 240, 0.92)",
  textShadow: "rgba(21, 37, 31, 0.72)",
  energyRingGoldFill: "rgba(216, 233, 234, 0.14)",
  energyRingGoldBorder: "rgba(143, 168, 177, 0.18)",
  energyRingSky: "rgba(216, 233, 234, 0.18)",
  energyRingGoldInner: "rgba(112, 148, 160, 0.12)",
  closeButtonFill: "rgba(255, 250, 240, 0.16)",
  closeButtonBorder: "rgba(255, 250, 240, 0.24)",
  fabCompactGlow: "rgba(143, 168, 177, 0.28)",
  fabLiveBorder: "rgba(143, 168, 177, 0.74)",
  chargeFill: "rgba(79, 114, 124, 0.28)",
  clearSelectionFill: "rgba(255, 250, 240, 0.34)",
  clearSelectionBorder: "rgba(21, 37, 31, 0.12)",
  /** FAB release burst: transparent stops use paper hue so gradients don't muddy to grey. */
  energyReleasePrimaryG0: "rgba(255, 250, 240, 0)",
  energyReleasePrimaryG1: "rgba(216, 233, 234, 0.5)",
  energyReleasePrimaryG2: "rgba(112, 148, 160, 0.86)",
  energyReleasePrimaryG3: "rgba(255, 250, 240, 0)",
  /** FAB release tail: same neutral transparent ends. */
  energyReleaseSecondaryG0: "rgba(255, 250, 240, 0)",
  energyReleaseSecondaryG1: "rgba(216, 233, 234, 0.26)",
  energyReleaseSecondaryG2: "rgba(143, 168, 177, 0.42)",
  energyReleaseSecondaryG3: "rgba(255, 250, 240, 0)",
  wheelButtonBorder: "rgba(255, 250, 240, 0.86)",
  expandedIconBadgeFill: "rgba(255, 250, 240, 0.34)",
  expandedIconBadgeBorder: "rgba(21, 37, 31, 0.12)",
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
    focus: palette.clay,
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
          shadowOpacity: 0.08,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 8 },
          elevation: 4,
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
