import { Tabs } from "expo-router";

import { useI18n } from "@/i18n/I18nProvider";
import { useBuzzTheme } from "@/theme/ThemeProvider";
import {
  AnimatedBubbleTabBar,
  type AnimatedBubbleTabBarProps,
} from "./AnimatedBubbleTabBar";
import { BottomTabIcon } from "./BottomTabIcon";

type TabBarIconProps = {
  color: string;
  focused: boolean;
  size: number;
};

export const RootTabs = () => {
  const { LL } = useI18n();
  const { theme } = useBuzzTheme();
  const { colors } = theme;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarHideOnKeyboard: true,
        tabBarInactiveTintColor: colors.textMuted,
      }}
      tabBar={(props: AnimatedBubbleTabBarProps) => (
        <AnimatedBubbleTabBar {...props} />
      )}
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
        name="activities"
        options={{
          title: LL.navigation.tabs.activities(),
          tabBarAccessibilityLabel:
            LL.navigation.tabs.activitiesAccessibility(),
          tabBarIcon: ({ color, focused }: TabBarIconProps) => (
            <BottomTabIcon color={color} focused={focused} name="activities" />
          ),
          tabBarLabel: LL.navigation.tabs.activities(),
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: LL.navigation.tabs.chats(),
          tabBarAccessibilityLabel: LL.navigation.tabs.chatsAccessibility(),
          tabBarIcon: ({ color, focused }: TabBarIconProps) => (
            <BottomTabIcon color={color} focused={focused} name="chats" />
          ),
          tabBarLabel: LL.navigation.tabs.chats(),
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
