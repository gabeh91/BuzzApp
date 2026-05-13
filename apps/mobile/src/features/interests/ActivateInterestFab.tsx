import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { useBuzzTheme } from "@/theme/ThemeProvider";
import type { BuzzTheme } from "@/theme/tokens";
import { Text } from "@/ui";

const FAB_TAB_CLEARANCE = 72;

type ActivateInterestFabProps = {
  accessibilityHint?: string;
  accessibilityLabel: string;
  bottomInset: number;
  disabled?: boolean;
  label: string;
  onPress: () => void;
};

export const ActivateInterestFab = ({
  accessibilityHint,
  accessibilityLabel,
  bottomInset,
  disabled,
  label,
  onPress,
}: ActivateInterestFabProps) => {
  const { theme } = useBuzzTheme();
  const { colors } = theme;
  const styles = useMemo(
    () => createStyles(theme, bottomInset + FAB_TAB_CLEARANCE),
    [theme, bottomInset],
  );

  return (
    <View pointerEvents="box-none" style={styles.anchor}>
      <Pressable
        accessibilityHint={accessibilityHint}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        accessibilityState={{ disabled: Boolean(disabled) }}
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => [
          styles.fab,
          disabled ? styles.fabDisabled : null,
          pressed && !disabled ? styles.fabPressed : null,
        ]}
      >
        <Ionicons color={colors.text} name="flash" size={22} />
        <Text numberOfLines={2} style={styles.label} variant="button">
          {label}
        </Text>
      </Pressable>
    </View>
  );
};

const FAB_DIAMETER = 100;

const createStyles = (theme: BuzzTheme, bottomOffset: number) => {
  const { borderWidths, colors, radii, shadows, spacing } = theme;

  return StyleSheet.create({
    anchor: {
      bottom: spacing[4] + bottomOffset,
      elevation: 16,
      position: "absolute",
      right: spacing[5],
      zIndex: 20,
    },
    fab: {
      alignItems: "center",
      alignSelf: "flex-end",
      backgroundColor: colors.warning,
      borderColor: colors.warning,
      borderRadius: radii.full,
      borderWidth: borderWidths.hairline,
      flexDirection: "column",
      gap: 2,
      height: FAB_DIAMETER,
      justifyContent: "center",
      overflow: "hidden",
      paddingHorizontal: spacing[1],
      paddingVertical: spacing[1],
      width: FAB_DIAMETER,
      ...shadows.card,
    },
    fabDisabled: {
      opacity: 0.45,
    },
    fabPressed: {
      opacity: 0.92,
    },
    label: {
      color: colors.text,
      fontSize: 10,
      fontWeight: "900",
      letterSpacing: 0.15,
      lineHeight: 11,
      maxWidth: FAB_DIAMETER - spacing[1] * 2 - 4,
      textAlign: "center",
    },
  });
};
