import {
  StyleSheet,
  Text as NativeText,
  type StyleProp,
  type TextProps,
  type TextStyle,
} from "react-native";

import { useBuzzTheme } from "@/theme/ThemeProvider";
import type { BuzzTheme } from "@/theme/tokens";

export type TextVariant =
  | "logo"
  | "city"
  | "eyebrow"
  | "title"
  | "body"
  | "panelTitle"
  | "panelBody"
  | "button"
  | "feedback"
  | "status";

type TextPrimitiveProps = TextProps & {
  variant?: TextVariant;
  style?: StyleProp<TextStyle>;
  /** Android-only; forwarded to `Text`. */
  includeFontPadding?: boolean;
  /** Android-only; forwarded to `Text`. */
  textBreakStrategy?: "simple" | "highQuality" | "balanced";
};

export const Text = ({
  variant = "body",
  style,
  ...textProps
}: TextPrimitiveProps) => {
  const { theme } = useBuzzTheme();
  const styles = createStyles(theme);

  return (
    <NativeText {...textProps} style={[styles.base, styles[variant], style]} />
  );
};

const createStyles = (theme: BuzzTheme) => {
  const { colors, fontSizes, lineHeights } = theme;

  return StyleSheet.create({
    base: {
      color: colors.text,
      letterSpacing: 0,
    },
    logo: {
      ...theme.fontStyles.display,
      color: colors.text,
      fontSize: fontSizes["5xl"],
      lineHeight: 36,
    },
    city: {
      color: colors.textMuted,
      fontSize: fontSizes.sm,
      fontWeight: "800",
      letterSpacing: 1.1,
      textTransform: "uppercase",
    },
    eyebrow: {
      color: colors.accent,
      fontSize: fontSizes.xs,
      fontWeight: "900",
      letterSpacing: 1.2,
      textTransform: "uppercase",
    },
    title: {
      ...theme.fontStyles.display,
      color: colors.text,
      fontSize: fontSizes.hero,
      lineHeight: lineHeights.hero,
    },
    body: {
      color: colors.textMuted,
      fontSize: fontSizes.md,
      lineHeight: lineHeights.body,
    },
    panelTitle: {
      color: colors.brand,
      fontSize: fontSizes.xl,
      fontWeight: "900",
      lineHeight: lineHeights.title,
    },
    panelBody: {
      color: colors.brand,
      fontSize: fontSizes.base,
      lineHeight: lineHeights.tight,
    },
    button: {
      fontSize: fontSizes.sm,
      fontWeight: "900",
    },
    feedback: {
      color: colors.brand,
      fontSize: fontSizes.sm,
      fontWeight: "800",
      lineHeight: lineHeights.tight,
    },
    status: {
      fontSize: fontSizes.xs,
      fontWeight: "900",
    },
  });
};
