import {
  StyleSheet,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from "react-native";
import type { ReactNode } from "react";

import { useBuzzTheme } from "@/theme/ThemeProvider";
import type { BuzzTheme } from "@/theme/tokens";
import { Panel } from "./Panel";
import { Text } from "./Text";

type HeroPanelProps = ViewProps & {
  body: ReactNode;
  eyebrow: ReactNode;
  style?: StyleProp<ViewStyle>;
  title: ReactNode;
};

export const HeroPanel = ({
  body,
  eyebrow,
  style,
  title,
  ...viewProps
}: HeroPanelProps) => {
  const { theme } = useBuzzTheme();
  const styles = createStyles(theme);

  return (
    <Panel {...viewProps} style={[styles.base, style]}>
      <Text variant="eyebrow">{eyebrow}</Text>
      <Text variant="title">{title}</Text>
      <Text variant="body">{body}</Text>
    </Panel>
  );
};

const createStyles = (theme: BuzzTheme) => {
  const { colors, radii, spacing, borderWidths, shadows } = theme;

  return StyleSheet.create({
    base: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: radii["2xl"],
      borderWidth: borderWidths.hairline,
      gap: spacing[3],
      padding: spacing[6],
      ...shadows.card,
    },
  });
};
