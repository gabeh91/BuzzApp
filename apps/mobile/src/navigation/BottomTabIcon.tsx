import { StyleSheet, View } from "react-native";

import { useBuzzTheme } from "@/theme/ThemeProvider";
import type { BuzzTheme } from "@/theme/tokens";

export type BottomTabIconName = "discover" | "profile";

type BottomTabIconProps = {
  color: string;
  focused: boolean;
  name: BottomTabIconName;
};

export const BottomTabIcon = ({ color, focused, name }: BottomTabIconProps) => {
  const { theme } = useBuzzTheme();
  const styles = createStyles(theme);

  return (
    <View
      accessibilityLabel={`${name === "discover" ? "Discover" : "Profile"} tab icon`}
      accessibilityRole="image"
      style={[styles.shell, focused ? styles.shellFocused : null]}
    >
      {name === "discover" ? (
        <View style={styles.discoverGlyph}>
          <View style={[styles.discoverRing, { borderColor: color }]} />
          <View style={[styles.discoverNeedle, { backgroundColor: color }]} />
          <View style={[styles.discoverDot, { backgroundColor: color }]} />
        </View>
      ) : (
        <View style={styles.profileGlyph}>
          <View style={[styles.profileHead, { borderColor: color }]} />
          <View style={[styles.profileShoulders, { borderColor: color }]} />
        </View>
      )}
    </View>
  );
};

const createStyles = (theme: BuzzTheme) => {
  const { colors, radii } = theme;

  return StyleSheet.create({
    shell: {
      alignItems: "center",
      borderRadius: radii.full,
      height: 34,
      justifyContent: "center",
      width: 44,
    },
    shellFocused: {
      backgroundColor: colors.accentSoft,
    },
    discoverGlyph: {
      alignItems: "center",
      height: 24,
      justifyContent: "center",
      width: 24,
    },
    discoverRing: {
      borderRadius: 12,
      borderWidth: 2,
      height: 23,
      width: 23,
    },
    discoverNeedle: {
      borderRadius: 1,
      height: 12,
      position: "absolute",
      transform: [{ rotate: "38deg" }],
      width: 2,
    },
    discoverDot: {
      borderRadius: 3,
      height: 5,
      position: "absolute",
      width: 5,
    },
    profileGlyph: {
      alignItems: "center",
      height: 24,
      justifyContent: "center",
      width: 24,
    },
    profileHead: {
      borderRadius: 6,
      borderWidth: 2,
      height: 10,
      marginBottom: 2,
      width: 10,
    },
    profileShoulders: {
      borderBottomWidth: 0,
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
      borderWidth: 2,
      height: 10,
      width: 23,
    },
  });
};
