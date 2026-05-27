import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from "react-native";

import { useBuzzTheme } from "@/theme/ThemeProvider";
import type { BuzzTheme } from "@/theme/tokens";
import { Text as UiText } from "@/ui";

import {
  activityIconForInterest,
  type ActivityIconInterest,
} from "./activateFab/activateFabActivityIcon";

export type InterestPillProps = {
  interest: ActivityIconInterest | { name: string; slug?: string };
  onPress?: () => void;
  selected?: boolean;
  showRadio?: boolean;
  style?: StyleProp<ViewStyle>;
};

export type InterestPillRowProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
} & Pick<ViewProps, "accessibilityRole">;

const toActivityIconInterest = (
  interest: InterestPillProps["interest"],
): ActivityIconInterest => ({
  name: interest.name,
  slug: "slug" in interest && interest.slug ? interest.slug : "",
});

export const InterestPillRow = ({
  accessibilityRole,
  children,
  style,
}: InterestPillRowProps) => {
  const { theme } = useBuzzTheme();
  const styles = createRowStyles(theme);

  return (
    <View accessibilityRole={accessibilityRole} style={[styles.row, style]}>
      {children}
    </View>
  );
};

export const InterestPill = ({
  interest,
  onPress,
  selected = false,
  showRadio = false,
  style,
}: InterestPillProps) => {
  const { theme } = useBuzzTheme();
  const styles = createStyles(theme);
  const iconInterest = toActivityIconInterest(interest);
  const pillStyle = [
    styles.pill,
    showRadio ? styles.pillWithRadio : null,
    selected ? styles.pillSelected : null,
    style,
  ];

  const content = (
    <>
      <Ionicons
        color={theme.colors.brand}
        name={activityIconForInterest(iconInterest)}
        size={15}
        style={styles.icon}
      />
      <UiText numberOfLines={1} style={styles.label}>
        {interest.name}
      </UiText>
      {showRadio ? (
        <Ionicons
          color={selected ? theme.colors.brand : theme.colors.textMuted}
          name={selected ? "radio-button-on" : "radio-button-off"}
          size={18}
          style={styles.radio}
        />
      ) : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityLabel={interest.name}
        accessibilityRole="radio"
        accessibilityState={{ selected }}
        onPress={onPress}
        style={({ pressed }) => [
          pillStyle,
          pressed ? styles.pillPressed : null,
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={pillStyle}>{content}</View>;
};

const createRowStyles = (theme: BuzzTheme) => {
  const { spacing } = theme;

  return StyleSheet.create({
    row: {
      alignContent: "flex-start",
      alignItems: "center",
      alignSelf: "stretch",
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing[2],
      width: "100%",
    },
  });
};

const createStyles = (theme: BuzzTheme) => {
  const { borderWidths, colors, fontSizes, lineHeights, radii, spacing } = theme;

  return StyleSheet.create({
    pill: {
      alignItems: "center",
      alignSelf: "flex-start",
      backgroundColor: colors.background,
      borderColor: colors.border,
      borderRadius: radii.md,
      borderWidth: borderWidths.hairline,
      flexDirection: "row",
      flexGrow: 0,
      flexShrink: 0,
      gap: spacing[1],
      maxWidth: "100%",
      paddingLeft: spacing[2],
      paddingRight: spacing[3],
      paddingVertical: spacing[1],
    },
    pillWithRadio: {
      gap: spacing[2],
      paddingRight: spacing[2],
    },
    pillSelected: {
      borderColor: colors.brand,
      borderWidth: borderWidths.focus,
    },
    pillPressed: {
      opacity: 0.88,
    },
    icon: {
      flexShrink: 0,
    },
    label: {
      color: colors.text,
      flexShrink: 1,
      fontSize: fontSizes.sm,
      ...theme.fontStyles.display,
      letterSpacing: 0.15,
      lineHeight: lineHeights.tight,
    },
    radio: {
      flexShrink: 0,
    },
  });
};
