import { Ionicons } from "@expo/vector-icons";
import {
  Pressable,
  StyleSheet,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from "react-native";
import type { ReactNode } from "react";

import { useBuzzTheme } from "@/theme/ThemeProvider";
import type { BuzzTheme } from "@/theme/tokens";

import { Header } from "./Header";
import { Text } from "./Text";

export type BackHeaderProps = Omit<ViewProps, "children"> & {
  /** Visible next to the caret; pass `LL.common.back()` (or equivalent) from i18n. */
  backLabel: string;
  onBack: () => void;
  right?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export const BackHeader = ({
  backLabel,
  onBack,
  right,
  style,
  ...viewProps
}: BackHeaderProps) => {
  const { theme } = useBuzzTheme();
  const { colors } = theme;
  const styles = createStyles(theme);

  return (
    <Header
      {...viewProps}
      left={
        <Pressable
          accessibilityLabel={backLabel}
          accessibilityRole="button"
          hitSlop={12}
          onPress={onBack}
          style={({ pressed }) => [styles.backControl, pressed ? styles.backPressed : null]}
        >
          <Ionicons color={colors.text} name="chevron-back" size={22} />
          <Text style={styles.backLabel} variant="body">
            {backLabel}
          </Text>
        </Pressable>
      }
      right={right}
      style={style}
    />
  );
};

const createStyles = (theme: BuzzTheme) => {
  const { spacing } = theme;

  return StyleSheet.create({
    backControl: {
      alignItems: "center",
      alignSelf: "flex-start",
      flexDirection: "row",
      gap: spacing[1],
      minHeight: 44,
      paddingRight: spacing[2],
    },
    backPressed: {
      opacity: 0.72,
    },
    backLabel: {
      fontWeight: "800",
    },
  });
};
