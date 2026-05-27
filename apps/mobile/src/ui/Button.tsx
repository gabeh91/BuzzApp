import {
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";

import { useBuzzTheme } from "@/theme/ThemeProvider";
import { fontSizes, type BuzzTheme } from "@/theme/tokens";
import { Text } from "./Text";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "neutral"
  | "tonal"
  | "bordered"
  | "plain";

type ButtonProps = Omit<PressableProps, "style" | "children"> & {
  children?: string;
  label?: string;
  variant?: ButtonVariant;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export const Button = ({
  accessibilityRole = "button",
  children,
  disabled,
  label,
  style,
  textStyle,
  variant = "primary",
  ...pressableProps
}: ButtonProps) => {
  const { theme } = useBuzzTheme();
  const styles = createStyles(theme);
  const buttonLabel = label ?? children;

  return (
    <Pressable
      accessibilityLabel={
        typeof buttonLabel === "string" ? buttonLabel : undefined
      }
      accessibilityRole={accessibilityRole}
      disabled={disabled}
      style={[
        styles.base,
        styles[variant],
        disabled ? styles.disabled : null,
        style,
      ]}
      {...pressableProps}
    >
      <Text variant="button" style={[styles[`${variant}Text`], styles.textCore, textStyle]}>
        {buttonLabel}
      </Text>
    </Pressable>
  );
};

const createStyles = (theme: BuzzTheme) => {
  const { colors, radii, spacing, borderWidths } = theme;

  return StyleSheet.create({
    base: {
      alignItems: "center",
      borderRadius: radii.sm,
      borderWidth: borderWidths.hairline,
      justifyContent: "center",
      minHeight: 50,
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[3],
    },
    primary: {
      backgroundColor: colors.surfaceInverse,
      borderColor: colors.surfaceInverse,
    },
    secondary: {
      backgroundColor: "transparent",
      borderColor: colors.brandSoft,
    },
    neutral: {
      backgroundColor: colors.surface,
      borderColor: colors.overlay,
    },
    tonal: {
      backgroundColor: colors.surfaceMuted,
      borderColor: colors.overlay,
    },
    bordered: {
      backgroundColor: colors.surface,
      borderColor: colors.brandSoft,
    },
    plain: {
      backgroundColor: "transparent",
      borderColor: "transparent",
    },
    disabled: {
      opacity: 0.55,
    },
    primaryText: {
      color: colors.textInverse,
    },
    secondaryText: {
      color: colors.brand,
    },
    textCore: {
      alignSelf: "stretch",
      fontSize: fontSizes.md,
      textAlign: "center",
    },
    neutralText: {
      color: colors.text,
    },
    tonalText: {
      color: colors.text,
    },
    borderedText: {
      color: colors.text,
    },
    plainText: {
      color: colors.text,
    },
  });
};
