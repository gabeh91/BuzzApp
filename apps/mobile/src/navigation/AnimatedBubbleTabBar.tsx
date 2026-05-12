import { useEffect, useRef, useState, type ReactNode } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { useBuzzTheme } from "@/theme/ThemeProvider";
import type { BuzzTheme } from "@/theme/tokens";
import { Text as UiText } from "@/ui";

const iconBubbleWidth = 44;
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
  const { theme } = useBuzzTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, insets.bottom);
  const [trackWidth, setTrackWidth] = useState(0);
  const activeIndex = useSharedValue(state.index);
  const bubbleMorph = useSharedValue(0);
  const bubbleSquash = useSharedValue(1);
  const bubbleStretch = useSharedValue(1);
  const movementDirection = useSharedValue(1);
  const previousIndex = useRef(state.index);
  const tabCount = state.routes.length;
  const tabWidth = trackWidth > 0 && tabCount > 0 ? trackWidth / tabCount : 0;

  useEffect(() => {
    if (tabWidth <= 0) {
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
    tabWidth,
  ]);

  const bubbleStyle = useAnimatedStyle(() => {
    const centeredOffset =
      tabWidth > 0 ? (tabWidth - iconBubbleWidth) / 2 : 0;

    return {
      transform: [
        {
          translateX:
            activeIndex.value * tabWidth +
            centeredOffset +
            movementDirection.value * bubbleMorph.value * bubbleMomentumOffset,
        },
        { scaleX: bubbleStretch.value },
        { scaleY: bubbleSquash.value },
      ],
    };
  }, [movementDirection, tabWidth]);

  return (
    <View style={styles.tabBar}>
      <View
        onLayout={(event) => {
          setTrackWidth(event.nativeEvent.layout.width);
        }}
        style={styles.track}
      >
        {tabWidth > 0 ? (
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
            <Pressable
              accessibilityLabel={
                descriptor?.options.tabBarAccessibilityLabel ??
                (typeof label === "string" ? label : route.name)
              }
              accessibilityRole="tab"
              accessibilityState={focused ? { selected: true } : undefined}
              key={route.key}
              onLongPress={onLongPress}
              onPress={onPress}
              style={styles.tabItem}
            >
              {descriptor?.options.tabBarIcon?.({
                color,
                focused,
                size: 24,
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
          );
        })}
      </View>
    </View>
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
      flex: 1,
      gap: spacing[1],
      justifyContent: "center",
      zIndex: 1,
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
