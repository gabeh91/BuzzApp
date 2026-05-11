import { Tabs } from "expo-router";
import { Platform, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useI18n } from "@/i18n/I18nProvider";
import { useBuzzTheme } from "@/theme/ThemeProvider";
import type { BuzzTheme } from "@/theme/tokens";
import { BottomTabIcon } from "./BottomTabIcon";

type TabBarIconProps = {
  color: string;
  focused: boolean;
  size: number;
};

export const RootTabs = () => {
  const { LL } = useI18n();
  const { theme } = useBuzzTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, insets.bottom);
  const { colors } = theme;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarHideOnKeyboard: true,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarItemStyle: styles.tabBarItem,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: LL.navigation.tabs.discover(),
          tabBarAccessibilityLabel: LL.navigation.tabs.discoverAccessibility(),
          tabBarIcon: ({ color, focused }: TabBarIconProps) => (
            <BottomTabIcon color={color} focused={focused} name="discover" />
          ),
          tabBarLabel: LL.navigation.tabs.discover(),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: LL.navigation.tabs.profile(),
          tabBarAccessibilityLabel: LL.navigation.tabs.profileAccessibility(),
          tabBarIcon: ({ color, focused }: TabBarIconProps) => (
            <BottomTabIcon color={color} focused={focused} name="profile" />
          ),
          tabBarLabel: LL.navigation.tabs.profile(),
        }}
      />
    </Tabs>
  );
};

const createStyles = (theme: BuzzTheme, bottomInset: number) => {
  const { colors, fontSizes, radii, shadows, spacing } = theme;

  return StyleSheet.create({
    tabBar: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderTopLeftRadius: radii.xl,
      borderTopRightRadius: radii.xl,
      borderTopWidth: 1,
      height: 76 + Math.max(bottomInset, spacing[2]),
      paddingBottom: Math.max(bottomInset, spacing[2]),
      paddingHorizontal: spacing[5],
      paddingTop: spacing[2],
      ...shadows.card,
      elevation: Platform.OS === "android" ? 12 : shadows.card.elevation,
    },
    tabBarItem: {
      borderRadius: radii.full,
      paddingVertical: spacing[1],
    },
    tabBarLabel: {
      fontSize: fontSizes.xs,
      fontWeight: "900",
      marginTop: spacing[1],
    },
  });
};
