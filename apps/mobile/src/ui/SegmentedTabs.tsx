import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  PanResponder,
  Pressable,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type ViewProps,
} from "react-native";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";

import { useBuzzTheme } from "@/theme/ThemeProvider";
import type { BuzzTheme } from "@/theme/tokens";

import { Text as UiText } from "./Text";

export type SegmentedTabsMode = "label" | "iconCompact";
export type SegmentedTabsVariant = "track" | "chipRow";

export type SegmentedTabSpec<TValue extends string> = {
  value: TValue;
  label: string;
  count?: number;
  accessibilityHint?: string;
  icon?: ReactNode;
};

type SegmentedTabButtonProps<TValue extends string> = {
  index: number;
  activeIndex: SharedValue<number>;
  mode: SegmentedTabsMode;
  variant: SegmentedTabsVariant;
  segmentWidth: number;
  selected: boolean;
  spec: SegmentedTabSpec<TValue>;
  onPress: () => void;
  styles: ReturnType<typeof createStyles>;
  theme: BuzzTheme;
};

const SegmentedTabButton = <TValue extends string>({
  index,
  activeIndex,
  mode,
  variant,
  segmentWidth,
  selected,
  spec,
  onPress,
  styles,
  theme,
}: SegmentedTabButtonProps<TValue>) => {
  const labelStyle = useAnimatedStyle(() => {
    const distance = Math.abs(activeIndex.value - index);
    const active = interpolate(distance, [0, 1], [1, 0], Extrapolation.CLAMP);

    return {
      color: interpolateColor(
        distance,
        [0, 1],
        [theme.colors.text, theme.colors.textMuted],
      ),
      opacity:
        mode === "iconCompact"
          ? interpolate(active, [0, 1], [0, 1], Extrapolation.CLAMP)
          : 1,
      maxWidth:
        mode === "iconCompact"
          ? variant === "track"
            ? interpolate(
                active,
                [0, 1],
                [0, Math.max(segmentWidth - theme.spacing[7], 0)],
                Extrapolation.CLAMP,
              )
            : interpolate(active, [0, 1], [0, 220], Extrapolation.CLAMP)
          : undefined,
      marginLeft:
        mode === "iconCompact"
          ? interpolate(
              active,
              [0, 1],
              [0, theme.spacing[1]],
              Extrapolation.CLAMP,
            )
          : 0,
    };
  }, [index, mode, segmentWidth, theme, variant]);

  return (
    <Pressable
      accessibilityHint={spec.accessibilityHint}
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.tabHit,
        variant === "chipRow" ? styles.tabHitChip : null,
        variant === "chipRow" && selected ? styles.tabHitChipSelected : null,
        mode === "iconCompact" && variant === "track" ? styles.tabHitCompact : null,
        pressed ? styles.tabHitPressed : null,
      ]}
    >
      <View style={styles.tabLabelRow}>
        {spec.icon ? <View style={styles.tabIconSlot}>{spec.icon}</View> : null}
        <Animated.Text numberOfLines={1} style={[styles.tabLabel, labelStyle]}>
          {spec.label}
        </Animated.Text>
        {spec.count != null && spec.count > 0 ? (
          <UiText variant="feedback" style={styles.tabCount}>
            {` · ${spec.count}`}
          </UiText>
        ) : null}
      </View>
    </Pressable>
  );
};

export type SegmentedTabsProps<TValue extends string> = Omit<
  ViewProps,
  "children"
> & {
  value: TValue;
  onChange: (next: TValue) => void;
  items: readonly SegmentedTabSpec<TValue>[];
  dragProgress?: number;
  mode?: SegmentedTabsMode;
  variant?: SegmentedTabsVariant;
  testID?: string;
};

export const SegmentedTabs = <TValue extends string>({
  value,
  onChange,
  items,
  dragProgress,
  mode = "label",
  variant = "track",
  testID,
  style,
  ...viewProps
}: SegmentedTabsProps<TValue>) => {
  const { theme } = useBuzzTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [segmentWidth, setSegmentWidth] = useState(0);
  const isDraggingRef = useRef(false);
  const selectedIndex = Math.max(
    0,
    items.findIndex((item) => item.value === value),
  );
  const activeIndex = useSharedValue(selectedIndex);

  useEffect(() => {
    if (isDraggingRef.current) {
      return;
    }

    if (typeof dragProgress === "number") {
      activeIndex.value = dragProgress;
      return;
    }

    activeIndex.value = withTiming(selectedIndex, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
  }, [activeIndex, dragProgress, selectedIndex]);

  const lensWidth = segmentWidth > 0 ? Math.max(segmentWidth - theme.spacing[1] * 2, 0) : 0;

  const lensStyle = useAnimatedStyle(() => {
    const laneOffset = theme.spacing[1];
    const phase = Math.abs(activeIndex.value - Math.round(activeIndex.value));

    return {
      transform: [
        { translateX: laneOffset + activeIndex.value * segmentWidth },
        { scaleX: 1 + phase * 0.16 },
      ],
      width: lensWidth,
    };
  }, [lensWidth, segmentWidth, theme.spacing]);

  const handleTrackLayout = (event: LayoutChangeEvent) => {
    if (variant === "chipRow") {
      return;
    }
    const width = event.nativeEvent.layout.width;
    setSegmentWidth(items.length > 0 && width > 0 ? width / items.length : 0);
  };

  const tabPanResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          variant === "track" &&
          typeof dragProgress !== "number" &&
          Math.abs(gestureState.dx) > 3,
        onPanResponderGrant: () => {
          isDraggingRef.current = true;
        },
        onPanResponderMove: (event) => {
          if (
            variant !== "track" ||
            segmentWidth <= 0 ||
            typeof dragProgress === "number"
          ) {
            return;
          }

          const x = event.nativeEvent.locationX;
          const next = Math.max(
            0,
            Math.min(items.length - 1, (x - segmentWidth / 2) / segmentWidth),
          );
          activeIndex.value = next;
        },
        onPanResponderRelease: () => {
          const nextIndex = Math.max(
            0,
            Math.min(items.length - 1, Math.round(activeIndex.value)),
          );

          activeIndex.value = withTiming(nextIndex, {
            duration: 220,
            easing: Easing.out(Easing.cubic),
          });
          isDraggingRef.current = false;

          const nextValue = items[nextIndex]?.value;
          if (nextValue && nextValue !== value) {
            onChange(nextValue);
          }
        },
        onPanResponderTerminate: () => {
          isDraggingRef.current = false;
          activeIndex.value = withTiming(selectedIndex, {
            duration: 180,
            easing: Easing.out(Easing.cubic),
          });
        },
      }),
    [
      activeIndex,
      dragProgress,
      items,
      onChange,
      segmentWidth,
      selectedIndex,
      value,
      variant,
    ],
  );

  return (
    <View
      accessibilityRole="tablist"
      style={[styles.track, variant === "chipRow" ? styles.trackChipRow : null, style]}
      testID={testID}
      onLayout={handleTrackLayout}
      {...(typeof dragProgress === "number" || variant !== "track"
        ? {}
        : tabPanResponder.panHandlers)}
      {...viewProps}
    >
      {variant === "track" ? (
        <Animated.View pointerEvents="none" style={[styles.lens, lensStyle]} />
      ) : null}

      {items.map((item, index) => (
        <SegmentedTabButton
          activeIndex={activeIndex}
          index={index}
          key={item.value}
          mode={mode}
          onPress={() => {
            onChange(item.value);
          }}
          segmentWidth={segmentWidth}
          selected={value === item.value}
          spec={item}
          styles={styles}
          theme={theme}
          variant={variant}
        />
      ))}
    </View>
  );
};

const createStyles = (theme: BuzzTheme) => {
  const { borderWidths, colors, fontSizes, lineHeights, radii, spacing } =
    theme;

  return StyleSheet.create({
    track: {
      alignItems: "center",
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: radii.md,
      borderWidth: borderWidths.hairline,
      flexDirection: "row",
      padding: spacing[0.75],
      position: "relative",
    },
    trackChipRow: {
      alignSelf: "flex-start",
      backgroundColor: "transparent",
      borderWidth: 0,
      gap: spacing[2],
      padding: 0,
    },
    lens: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: radii.sm,
      borderWidth: borderWidths.hairline,
      bottom: spacing[0.75],
      left: spacing[0.75],
      position: "absolute",
      top: spacing[0.75],
      ...theme.shadows.card,
    },
    tabHit: {
      alignItems: "center",
      flex: 1,
      justifyContent: "center",
      minHeight: 44,
      paddingHorizontal: spacing[2],
      paddingVertical: spacing[2],
      zIndex: 1,
    },
    tabHitChip: {
      backgroundColor: colors.surface,
      borderColor: colors.overlay,
      borderRadius: radii.sm,
      borderWidth: borderWidths.hairline,
      flex: 0,
      paddingHorizontal: spacing[4],
    },
    tabHitChipSelected: {
      backgroundColor: colors.surfaceMuted,
      borderColor: colors.brandSoft,
    },
    tabHitCompact: {
      paddingHorizontal: spacing[1],
    },
    tabHitPressed: {
      opacity: 0.88,
    },
    tabLabelRow: {
      alignItems: "center",
      flexDirection: "row",
      gap: spacing[1],
      justifyContent: "center",
    },
    tabLabel: {
      fontSize: fontSizes.sm,
      ...theme.fontStyles.display,
      letterSpacing: 0.2,
      lineHeight: lineHeights.tight,
      overflow: "hidden",
    },
    tabCount: {
      fontSize: fontSizes.xs,
      ...theme.fontStyles.display,
      letterSpacing: 0,
      lineHeight: lineHeights.tight,
    },
    tabIconSlot: {
      alignItems: "center",
      justifyContent: "center",
    },
  });
};
