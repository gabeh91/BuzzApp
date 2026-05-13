import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View, type LayoutChangeEvent } from "react-native";
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { useBuzzAuth } from "@/auth/AuthProvider";
import { createCityContextFallback } from "@/features/city/cityContext";
import { useI18n } from "@/i18n/I18nProvider";
import { useBuzzTheme } from "@/theme/ThemeProvider";
import type { BuzzTheme } from "@/theme/tokens";
import { Header, HeroPanel, List, Panel, Screen, Text as UiText } from "@/ui";

export const ChatsScreen = () => {
  const { LL } = useI18n();
  const { theme } = useBuzzTheme();
  const styles = createStyles(theme);
  const { user } = useBuzzAuth();
  const [activeTab, setActiveTab] = useState<"requests" | "groups">("requests");
  const [tabWidth, setTabWidth] = useState(0);
  const cityContext = createCityContextFallback({
    cityId: user.cityId,
    cityName: user.cityName,
  });

  const activeIndex = useSharedValue(activeTab === "requests" ? 0 : 1);

  useEffect(() => {
    activeIndex.value =
      tabWidth <= 0
        ? activeTab === "requests"
          ? 0
          : 1
        : withSequence(
            withTiming(activeTab === "requests" ? 0 : 1, {
              duration: 240,
              easing: Easing.out(Easing.cubic),
            }),
            withSpring(activeTab === "requests" ? 0 : 1, {
              damping: 16,
              mass: 0.55,
              stiffness: 200,
            }),
          );
  }, [activeIndex, activeTab, tabWidth]);

  const pillStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: activeIndex.value * tabWidth }],
    };
  }, [tabWidth]);

  const requestsLabelStyle = useAnimatedStyle(() => {
    return {
      color: interpolateColor(
        activeIndex.value,
        [0, 1],
        [theme.colors.text, theme.colors.textMuted],
      ),
    };
  }, [theme.colors.text, theme.colors.textMuted]);

  const groupsLabelStyle = useAnimatedStyle(() => {
    return {
      color: interpolateColor(
        activeIndex.value,
        [0, 1],
        [theme.colors.textMuted, theme.colors.text],
      ),
    };
  }, [theme.colors.text, theme.colors.textMuted]);

  const handleTabLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    setTabWidth(width > 0 ? width / 2 : 0);
  };

  const header = useMemo(
    () => (
      <View style={styles.headerStack}>
        <Header
          left={<UiText variant="logo">{LL.brand.name()}</UiText>}
          right={<UiText variant="city">{cityContext.city.name}</UiText>}
        />

        <HeroPanel
          body={LL.chats.subtitle()}
          eyebrow={LL.chats.eyebrow()}
          title={LL.chats.title()}
        />

        <View onLayout={handleTabLayout} style={styles.tabRow}>
          <Animated.View style={[styles.tabPill, pillStyle]} />
          <Pressable
            accessibilityRole="button"
            onPress={() => setActiveTab("requests")}
            style={[
              styles.tabButton,
              activeTab === "requests" ? styles.tabButtonPressed : null,
            ]}
          >
            <Animated.Text style={[styles.tabLabel, requestsLabelStyle]}>
              {LL.chats.requests.title()}
            </Animated.Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => setActiveTab("groups")}
            style={[
              styles.tabButton,
              activeTab === "groups" ? styles.tabButtonPressed : null,
            ]}
          >
            <Animated.Text style={[styles.tabLabel, groupsLabelStyle]}>
              {LL.chats.groups.title()}
            </Animated.Text>
          </Pressable>
        </View>
      </View>
    ),
    [
      LL,
      activeTab,
      cityContext.city.name,
      groupsLabelStyle,
      pillStyle,
      requestsLabelStyle,
      styles,
    ],
  );

  const empty = useMemo(() => {
    if (activeTab === "groups") {
      return (
        <Panel variant="plain" style={styles.emptyPanel}>
          <UiText variant="panelTitle">{LL.chats.groups.title()}</UiText>
          <UiText variant="panelBody">{LL.chats.groups.empty()}</UiText>
        </Panel>
      );
    }

    return (
      <Panel variant="muted" style={styles.emptyPanel}>
        <UiText variant="panelTitle">{LL.chats.requests.title()}</UiText>
        <UiText variant="panelBody">{LL.chats.requests.empty()}</UiText>
      </Panel>
    );
  }, [LL, activeTab, styles.emptyPanel]);

  return (
    <Screen contentStyle={styles.screenContent} edges={["top"]} scroll={false}>
      <List
        contentContainerStyle={styles.listContent}
        data={[]}
        itemGap={0}
        keyExtractor={() => "empty"}
        ListEmptyComponent={empty}
        ListHeaderComponent={header}
        renderItem={() => null}
        style={styles.list}
      />
    </Screen>
  );
};

const createStyles = (theme: BuzzTheme) => {
  const { borderWidths, colors, fontSizes, radii, spacing } = theme;

  return StyleSheet.create({
    screenContent: {
      flex: 1,
      flexGrow: 1,
      gap: 0,
      padding: 0,
    },
    list: {
      flex: 1,
    },
    listContent: {
      padding: spacing[6],
      paddingBottom: spacing[8],
    },
    headerStack: {
      gap: spacing[5],
      marginBottom: spacing[4],
    },
    tabRow: {
      backgroundColor: colors.surfaceMuted,
      borderRadius: radii.full,
      flexDirection: "row",
      padding: spacing[1],
      position: "relative",
    },
    tabPill: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: radii.full,
      borderWidth: borderWidths.hairline,
      bottom: spacing[1],
      left: spacing[1],
      position: "absolute",
      top: spacing[1],
      width: "50%",
    },
    tabButton: {
      alignItems: "center",
      borderRadius: radii.full,
      flex: 1,
      justifyContent: "center",
      minHeight: 40,
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[2],
      zIndex: 1,
    },
    tabButtonPressed: {
      opacity: 0.92,
    },
    tabLabel: {
      fontSize: fontSizes.sm,
      fontWeight: "900",
    },
    emptyPanel: {
      gap: spacing[3],
    },
  });
};
