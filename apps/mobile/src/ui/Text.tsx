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
    <NativeText
      {...textProps}
      allowFontScaling={false}
      maxFontSizeMultiplier={1}
      style={[styles.base, styles[variant], style]}
    />
  );
};

const createStyles = (theme: BuzzTheme) => {
  const { colors, fontSizes, lineHeights } = theme;

  return StyleSheet.create({
    base: {
      ...theme.fontStyles.body,
      color: colors.text,
      letterSpacing: 0,
    },
    logo: {
      ...theme.fontStyles.black,
      color: colors.text,
      fontSize: fontSizes["5xl"],
      lineHeight: 36,
    },
    city: {
      ...theme.fontStyles.labelStrong,
      color: colors.textMuted,
      fontSize: fontSizes.sm,
      letterSpacing: 1.1,
      textTransform: "uppercase",
    },
    eyebrow: {
      ...theme.fontStyles.labelStrong,
      color: colors.accent,
      fontSize: fontSizes.xs,
      letterSpacing: 0.8,
      textTransform: "uppercase",
    },
    title: {
      ...theme.fontStyles.display,
      color: colors.text,
      fontSize: fontSizes.hero,
      lineHeight: lineHeights.hero,
    },
    body: {
      ...theme.fontStyles.body,
      color: colors.textMuted,
      fontSize: fontSizes.md,
      lineHeight: lineHeights.body,
    },
    panelTitle: {
      ...theme.fontStyles.display,
      color: colors.brand,
      fontSize: fontSizes.xl,
      lineHeight: lineHeights.title,
    },
    panelBody: {
      ...theme.fontStyles.body,
      color: colors.text,
      fontSize: fontSizes.base,
      lineHeight: lineHeights.body,
    },
    button: {
      ...theme.fontStyles.display,
      color: colors.text,
      fontSize: fontSizes.sm,
    },
    feedback: {
      ...theme.fontStyles.labelStrong,
      color: colors.brand,
      fontSize: fontSizes.sm,
      lineHeight: lineHeights.tight,
    },
    status: {
      ...theme.fontStyles.labelStrong,
      fontSize: fontSizes.xs,
    },
  });
};
