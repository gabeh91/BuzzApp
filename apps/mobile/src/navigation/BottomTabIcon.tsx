import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

import { useBuzzTheme } from "@/theme/ThemeProvider";
import type { BuzzTheme } from "@/theme/tokens";

export type BottomTabIconName =
  | "activities"
  | "chats"
  | "discover"
  | "profile";

type BottomTabIconProps = {
  color: string;
  focused: boolean;
  name: BottomTabIconName;
  unreadCount?: number;
};

export const BottomTabIcon = ({
  color,
  name,
  unreadCount = 0,
}: BottomTabIconProps) => {
  const { theme } = useBuzzTheme();
  const styles = createStyles(theme);
  const hasUnreadChats = name === "chats" && unreadCount > 0;
  const accessibilityLabelByName: Record<BottomTabIconName, string> = {
    activities: "Activities tab icon",
    chats: "Chats tab icon",
    discover: "Discover tab icon",
    profile: "Profile tab icon",
  };

  return (
    <View
      accessibilityLabel={accessibilityLabelByName[name]}
      accessibilityRole="image"
      style={styles.shell}
    >
      {name === "discover" ? (
        <View style={styles.discoverGlyph}>
          <View style={[styles.discoverRing, { borderColor: color }]} />
          <View style={[styles.discoverNeedle, { backgroundColor: color }]} />
          <View style={[styles.discoverDot, { backgroundColor: color }]} />
        </View>
      ) : name === "activities" ? (
        <View style={styles.activitiesGlyph}>
          <Ionicons color={color} name="ticket-outline" size={25} />
        </View>
      ) : name === "chats" ? (
        <View style={styles.chatsGlyph}>
          <Ionicons color={color} name="chatbubble-outline" size={24} />
          {hasUnreadChats ? (
            <View
              accessibilityLabel="Unread chats"
              accessibilityRole="image"
              style={styles.unreadDot}
            />
          ) : null}
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
  const { radii, spacing } = theme;

  return StyleSheet.create({
    shell: {
      alignItems: "center",
      borderRadius: radii.full,
      height: 34,
      justifyContent: "center",
      width: 44,
    },
    discoverGlyph: {
      alignItems: "center",
      height: 24,
      justifyContent: "center",
      width: 24,
    },
    discoverRing: {
      borderRadius: radii.sm,
      borderWidth: 2,
      height: 23,
      width: 23,
    },
    discoverNeedle: {
      borderRadius: radii["2xs"],
      height: 12,
      position: "absolute",
      transform: [{ rotate: "38deg" }],
      width: 2,
    },
    discoverDot: {
      borderRadius: radii.xs,
      height: 5,
      position: "absolute",
      width: 5,
    },
    activitiesGlyph: {
      alignItems: "center",
      height: 24,
      justifyContent: "center",
      width: 24,
    },
    chatsGlyph: {
      alignItems: "center",
      height: 24,
      justifyContent: "center",
      width: 24,
    },
    unreadDot: {
      backgroundColor: theme.colors.accent,
      borderRadius: radii.xs,
      height: 8,
      position: "absolute",
      right: 0,
      top: 0,
      width: 8,
    },
    profileGlyph: {
      alignItems: "center",
      height: 24,
      justifyContent: "center",
      width: 24,
    },
    profileHead: {
      borderRadius: radii.icon,
      borderWidth: 2,
      height: 10,
      marginBottom: spacing[0.5],
      width: 10,
    },
    profileShoulders: {
      borderBottomWidth: 0,
      borderTopLeftRadius: radii.sm,
      borderTopRightRadius: radii.sm,
      borderWidth: 2,
      height: 10,
      width: 23,
    },
  });
};
