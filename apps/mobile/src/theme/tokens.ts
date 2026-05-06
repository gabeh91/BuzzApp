import { Platform } from "react-native";

export type BuzzThemeMode = "light" | "dark";

const fontFamilies = {
  display: Platform.select({
    ios: "Avenir Next",
    android: "sans-serif-condensed",
    default: "serif"
  }),
  body: Platform.select({
    ios: "Avenir Next",
    android: "sans-serif",
    default: "sans-serif"
  }),
  mono: Platform.select({
    ios: "Menlo",
    android: "monospace",
    default: "monospace"
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
  overlay: "rgba(21, 37, 31, 0.12)"
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
  overlay: "rgba(248, 236, 216, 0.12)"
} as const;

const lightShadows = {
  card: {
    shadowColor: "#15251f",
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 5
  }
} as const;

const darkShadows = {
  card: {
    shadowColor: "#000000",
    shadowOpacity: 0.28,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 16 },
    elevation: 6
  }
} as const;

const createSemanticColors = (palette: typeof lightPalette | typeof darkPalette) => {
  return {
    ...palette,
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
  shadows: typeof lightShadows | typeof darkShadows
) => {
  return {
    mode,
    palette,
    colors: createSemanticColors(palette),
    fontFamilies,
    fontSizes,
    lineHeights,
    spacing,
    radii,
    borderWidths,
    shadows
  };
};

export const themes = {
  light: createTheme("light", lightPalette, lightShadows),
  dark: createTheme("dark", darkPalette, darkShadows)
} as const;

export type BuzzTheme = (typeof themes)[BuzzThemeMode];

export const colors = themes.light.colors;
export const theme = themes.light;
export const shadows = themes.light.shadows;
