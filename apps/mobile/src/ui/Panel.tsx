import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from "react-native";

import { useBuzzTheme } from "@/theme/ThemeProvider";
import type { BuzzTheme } from "@/theme/tokens";

export type PanelVariant = "surface" | "muted" | "plain";

type PanelProps = ViewProps & {
  variant?: PanelVariant;
  style?: StyleProp<ViewStyle>;
};

export const Panel = ({
  variant = "surface",
  style,
  ...viewProps
}: PanelProps) => {
  const { theme } = useBuzzTheme();
  const styles = createStyles(theme);

  return <View {...viewProps} style={[styles.base, styles[variant], style]} />;
};

const createStyles = (theme: BuzzTheme) => {
  const { colors, radii, spacing, borderWidths, shadows } = theme;

  return StyleSheet.create({
    base: {
      borderRadius: radii.xl,
      gap: spacing[3],
      padding: spacing[5],
    },
    surface: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: borderWidths.hairline,
      ...shadows.card,
    },
    muted: {
      backgroundColor: colors.surfaceMuted,
    },
    plain: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: borderWidths.hairline,
    },
  });
};
