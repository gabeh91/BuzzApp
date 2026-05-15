import { Fragment, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { useBuzzAuth } from "@/auth/AuthProvider";
import { ActivateInterestFab } from "@/features/interests/ActivateInterestFab";
import { useConnectionRequestInbox } from "@/features/chat/ConnectionRequestInboxSingleton";
import { useChatSummaries } from "@/features/chat/useChatSummaries";
import { useActivationPingInbox } from "@/features/interests/ActivationPingInboxSingleton";
import { useActivateInterestActions } from "@/features/interests/useActivateInterestActions";
import { useActivitiesPickerFocus } from "@/features/activities/ActivitiesPickerFocusContext";
import { useI18n } from "@/i18n/I18nProvider";
import { TAB_BAR_CORE_HEIGHT } from "@/navigation/tabBarLayout";
import { useBuzzTheme } from "@/theme/ThemeProvider";
import type { BuzzTheme } from "@/theme/tokens";
import { Text as UiText, useToast } from "@/ui";

const iconBubbleWidth = 44;
const centerDockWidth = 82;
const bubbleStretchPeak = 1.66;
const bubbleSquashPeak = 0.88;
const bubbleMomentumOffset = 7;

type TabRoute = {
  key: string;
  name: string;
};

type TabBarIconProps = {
  color: string;
  focused: boolean;
  size: number;
  unreadCount?: number;
};

type TabDescriptor = {
  options: {
    tabBarAccessibilityLabel?: string;
    tabBarIcon?: (props: TabBarIconProps) => ReactNode;
    tabBarLabel?: ReactNode | ((props: TabBarIconProps) => ReactNode);
    title?: string;
  };
};

type TabNavigationEvent = {
  defaultPrevented: boolean;
};

export type AnimatedBubbleTabBarProps = {
  descriptors: Record<string, TabDescriptor>;
  navigation: {
    emit: (event: {
      canPreventDefault?: boolean;
      target: string;
      type: "tabPress" | "tabLongPress";
    }) => TabNavigationEvent;
    navigate: (routeName: string) => void;
  };
  state: {
    index: number;
    routes: TabRoute[];
  };
};

const getLabel = (descriptor: TabDescriptor, routeName: string): ReactNode => {
  const { options } = descriptor;

  if (typeof options.tabBarLabel === "string") {
    return options.tabBarLabel;
  }

  if (typeof options.title === "string") {
    return options.title;
  }

  return routeName;
};

export const AnimatedBubbleTabBar = ({
  descriptors,
  navigation,
  state,
}: AnimatedBubbleTabBarProps) => {
  const { LL } = useI18n();
  const { theme } = useBuzzTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, insets.bottom);
  const { isAuthenticated, user } = useBuzzAuth();
  const pingInbox = useActivationPingInbox();
  const connectionRequestInbox = useConnectionRequestInbox();
  const chatSummaries = useChatSummaries({
    enabled: isAuthenticated,
    userId: user.id,
  });
  const {
    activationBusy,
    handleActivateSelectedInterest,
    handleClearSelectedInterest,
    handleSelectInterest,
    interests,
    selectedInterest,
  } = useActivateInterestActions();
  const { focusActivitiesInterestPicker } = useActivitiesPickerFocus();
  const { showToast } = useToast();
  const activeRouteName = state.routes[state.index]?.name;
  const isActivitiesTab = activeRouteName === "activities";
  const chatsUnreadCount =
    pingInbox.pings.length +
    connectionRequestInbox.requests.length +
    chatSummaries.summaries.reduce(
      (total, summary) => total + summary.unreadCount,
      0,
    );

  const handleActivitiesEmptyFabPress = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    showToast({
      message: LL.common.activateInterestFab.pickOnActivitiesTabFirst(),
      variant: "info",
    });
    focusActivitiesInterestPicker();
  }, [LL, focusActivitiesInterestPicker, showToast]);
  const [trackWidth, setTrackWidth] = useState(0);
  const trackWidthSv = useSharedValue(0);
  const fabDockClearSv = useSharedValue(0);
  const activeIndex = useSharedValue(state.index);
  const bubbleMorph = useSharedValue(0);
  const bubbleSquash = useSharedValue(1);
  const bubbleStretch = useSharedValue(1);
  const movementDirection = useSharedValue(1);
  const previousIndex = useRef(state.index);
  const tabCount = state.routes.length;
  const layoutReady = trackWidth > 0 && tabCount > 0;

  useEffect(() => {
    if (!layoutReady) {
      return;
    }

    const previous = previousIndex.current;
    const distance = Math.abs(state.index - previous);
    movementDirection.value = state.index >= previous ? 1 : -1;
    previousIndex.current = state.index;
    activeIndex.value = withSequence(
      withTiming(state.index, {
        duration: 330,
        easing: Easing.out(Easing.cubic),
      }),
      withSpring(state.index, {
        damping: 13,
        mass: 0.45,
        stiffness: 180,
      }),
    );
    bubbleStretch.value = withSequence(
      withTiming(distance > 0 ? bubbleStretchPeak : 1, {
        duration: 150,
        easing: Easing.out(Easing.quad),
      }),
      withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      }),
    );
    bubbleSquash.value = withSequence(
      withTiming(distance > 0 ? bubbleSquashPeak : 1, {
        duration: 150,
        easing: Easing.out(Easing.quad),
      }),
      withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      }),
    );
    bubbleMorph.value = withSequence(
      withTiming(distance > 0 ? 1 : 0, {
        duration: 150,
        easing: Easing.out(Easing.quad),
      }),
      withTiming(0, {
        duration: 320,
        easing: Easing.out(Easing.cubic),
      }),
    );
  }, [
    activeIndex,
    bubbleMorph,
    bubbleSquash,
    bubbleStretch,
    movementDirection,
    state.index,
    layoutReady,
  ]);

  const bubbleStyle = useAnimatedStyle(() => {
    const tw = trackWidthSv.value;
    const clear =
      fabDockClearSv.value <= 0
        ? 0
        : fabDockClearSv.value >= 1
          ? 1
          : fabDockClearSv.value;
    const reserved = centerDockWidth * (1 - clear);
    const tWidth = tw > 0 && tabCount > 0 ? (tw - reserved) / tabCount : 0;
    const centeredOffset = tWidth > 0 ? (tWidth - iconBubbleWidth) / 2 : 0;
    const dockOffset =
      Math.min(Math.max(activeIndex.value - 1, 0), 1) * reserved;

    return {
      transform: [
        {
          translateX:
            activeIndex.value * tWidth +
            dockOffset +
            centeredOffset +
            movementDirection.value * bubbleMorph.value * bubbleMomentumOffset,
        },
        { scaleX: bubbleStretch.value },
        { scaleY: bubbleSquash.value },
      ],
    };
  }, [fabDockClearSv, movementDirection, tabCount, trackWidthSv]);

  const centerFabClearanceStyle = useAnimatedStyle(() => {
    const clear =
      fabDockClearSv.value <= 0
        ? 0
        : fabDockClearSv.value >= 1
          ? 1
          : fabDockClearSv.value;
    return {
      flexShrink: 1,
      minWidth: 0,
      overflow: "hidden" as const,
      width: centerDockWidth * (1 - clear),
    };
  }, [fabDockClearSv]);

  const activationLabel = activationBusy
    ? LL.activities.activate.activating()
    : LL.activities.activate.activate();

  return (
    <View pointerEvents="box-none" style={styles.container}>
      <ActivateInterestFab
        activationBusy={activationBusy}
        accessibilityHint={LL.common.activateInterestFab.hint()}
        accessibilityLabel={`${LL.common.activateInterestFab.label()}. ${activationLabel}`}
        bottomInset={insets.bottom}
        disabled={interests.length === 0}
        interests={interests}
        onActivateSelectedInterest={handleActivateSelectedInterest}
        {...(isActivitiesTab
          ? {
              onActivitiesEmptyActivationPress: handleActivitiesEmptyFabPress,
              skipActivityWheel: true as const,
            }
          : {})}
        onClearSelectedInterest={handleClearSelectedInterest}
        onSelectInterest={handleSelectInterest}
        selectedInterest={selectedInterest}
        tabBarDockClearProgress={fabDockClearSv}
      />

      <View style={styles.tabBar}>
        <View
          onLayout={(event) => {
            const w = event.nativeEvent.layout.width;
            setTrackWidth(w);
            trackWidthSv.value = w;
          }}
          style={styles.track}
        >
          {layoutReady ? (
            <Animated.View
              pointerEvents="none"
              style={[styles.activeBubble, bubbleStyle]}
            />
          ) : null}

          {state.routes.map((route, index) => {
            const descriptor = descriptors[route.key];
            const focused = state.index === index;
            const color = focused ? colors.text : colors.textMuted;
            const label = descriptor
              ? getLabel(descriptor, route.name)
              : route.name;

            const onPress = () => {
              const event = navigation.emit({
                canPreventDefault: true,
                target: route.key,
                type: "tabPress",
              });

              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                target: route.key,
                type: "tabLongPress",
              });
            };

            return (
              <Fragment key={route.key}>
                <Pressable
                  accessibilityLabel={
                    descriptor?.options.tabBarAccessibilityLabel ??
                    (typeof label === "string" ? label : route.name)
                  }
                  accessibilityRole="tab"
                  accessibilityState={focused ? { selected: true } : undefined}
                  onLongPress={onLongPress}
                  onPress={onPress}
                  style={[
                    styles.tabItem,
                    layoutReady ? styles.tabItemFlex : styles.tabItemFallback,
                  ]}
                >
                  {descriptor?.options.tabBarIcon?.({
                    color,
                    focused,
                    size: 24,
                    ...(route.name === "chats" ? { unreadCount: chatsUnreadCount } : {}),
                  })}
                  <UiText
                    style={[
                      styles.tabLabel,
                      focused ? styles.tabLabelFocused : null,
                    ]}
                  >
                    {label}
                  </UiText>
                </Pressable>
                {index === 1 ? (
                  <Animated.View
                    pointerEvents="none"
                    style={[styles.centerFabClearance, centerFabClearanceStyle]}
                  />
                ) : null}
              </Fragment>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const createStyles = (theme: BuzzTheme, bottomInset: number) => {
  const { borderWidths, colors, fontSizes, radii, spacing } = theme;

  return StyleSheet.create({
    container: {
      position: "relative",
      zIndex: 30,
    },
    tabBar: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderTopLeftRadius: radii.xl,
      borderTopRightRadius: radii.xl,
      borderTopWidth: borderWidths.hairline,
      elevation: 0,
      height: TAB_BAR_CORE_HEIGHT + Math.max(bottomInset, spacing[2]),
      paddingBottom: Math.max(bottomInset, spacing[2]),
      paddingHorizontal: spacing[5],
      paddingTop: spacing[3],
      shadowOpacity: 0,
      zIndex: 1,
    },
    track: {
      flex: 1,
      flexDirection: "row",
      position: "relative",
    },
    activeBubble: {
      backgroundColor: colors.warningSoft,
      borderRadius: radii.full,
      height: 35,
      left: 0,
      position: "absolute",
      top: 2.5,
      width: iconBubbleWidth,
    },
    tabItem: {
      alignItems: "center",
      gap: spacing[1],
      justifyContent: "center",
      zIndex: 1,
    },
    tabItemFlex: {
      flexBasis: 0,
      flexGrow: 1,
      flexShrink: 1,
      minWidth: 0,
    },
    tabItemFallback: {
      flex: 1,
    },
    centerFabClearance: {
      alignSelf: "stretch",
      flexShrink: 1,
      minWidth: 0,
      zIndex: 0,
    },
    tabLabel: {
      color: colors.textMuted,
      fontSize: fontSizes.xs,
      fontWeight: "900",
    },
    tabLabelFocused: {
      color: colors.text,
    },
  });
};
