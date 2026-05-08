import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from "react-native";
import type { ReactNode } from "react";

import { useBuzzTheme } from "@/theme/ThemeProvider";
import type { BuzzTheme } from "@/theme/tokens";

type HeaderProps = ViewProps & {
  left: ReactNode;
  right?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export const Header = ({ left, right, style, ...viewProps }: HeaderProps) => {
  const { theme } = useBuzzTheme();
  const styles = createStyles(theme);

  return (
    <View {...viewProps} style={[styles.base, style]}>
      <View style={styles.side}>{left}</View>
      {right ? <View style={styles.side}>{right}</View> : null}
    </View>
  );
};

const createStyles = (theme: BuzzTheme) => {
  const { spacing } = theme;

  return StyleSheet.create({
    base: {
      alignItems: "center",
      flexDirection: "row",
      gap: spacing[3],
      justifyContent: "space-between",
    },
    side: {
      flexShrink: 1,
    },
  });
};
