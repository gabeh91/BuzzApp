import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { useBuzzTheme } from "@/theme/ThemeProvider";
import type { BuzzTheme } from "@/theme/tokens";
import { Text } from "./Text";

type AvatarProps = {
  accessibilityLabel: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
  uri: string | undefined;
  fallbackInitial: string | undefined;
};

export const Avatar = ({
  accessibilityLabel,
  fallbackInitial,
  size = 58,
  style,
  uri,
}: AvatarProps) => {
  const { theme } = useBuzzTheme();
  const styles = createStyles(theme, size);
  const initial = fallbackInitial?.trim().slice(0, 1).toUpperCase();

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="image"
      style={[styles.root, style]}
    >
      {uri ? (
        <Image
          accessibilityIgnoresInvertColors
          source={{ uri }}
          style={styles.image}
        />
      ) : initial ? (
        <Text style={styles.initial}>{initial}</Text>
      ) : null}
    </View>
  );
};

const createStyles = (theme: BuzzTheme, size: number) => {
  const { colors, fontSizes, lineHeights, radii } = theme;

  return StyleSheet.create({
    root: {
      alignItems: "center",
      backgroundColor: colors.surfaceMuted,
      borderRadius: radii.full,
      height: size,
      justifyContent: "center",
      overflow: "hidden",
      width: size,
    },
    image: {
      height: "100%",
      width: "100%",
    },
    initial: {
      color: colors.brand,
      fontSize: fontSizes["2xl"],
      ...theme.fontStyles.black,
      lineHeight: lineHeights.title,
    },
  });
};

