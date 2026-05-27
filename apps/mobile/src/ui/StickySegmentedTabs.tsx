import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import {
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, { useAnimatedStyle, useSharedValue } from "react-native-reanimated";

import { useBuzzTheme } from "@/theme/ThemeProvider";
import type { BuzzTheme } from "@/theme/tokens";

import { SegmentedTabs, type SegmentedTabSpec } from "./SegmentedTabs";

type StickySegmentedTabsRenderArgs = {
  header: ReactElement;
  overlay: ReactElement | null;
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
};

type StickySegmentedTabsProps<TValue extends string> = {
  preTabsContent: ReactNode;
  items: readonly SegmentedTabSpec<TValue>[];
  value: TValue;
  onChange: (next: TValue) => void;
  parallaxFactor?: number;
  parallaxMaxOffset?: number;
  dragProgress?: number;
  pinnedTabsContainerStyle?: StyleProp<ViewStyle>;
  tabsContainerStyle?: StyleProp<ViewStyle>;
  tabsStyle?: StyleProp<ViewStyle>;
  testID?: string;
  children: (args: StickySegmentedTabsRenderArgs) => ReactNode;
};

export const StickySegmentedTabs = <TValue extends string>({
  preTabsContent,
  items,
  value,
  onChange,
  parallaxFactor = 0.35,
  parallaxMaxOffset = Number.POSITIVE_INFINITY,
  dragProgress,
  pinnedTabsContainerStyle,
  tabsContainerStyle,
  tabsStyle,
  testID,
  children,
}: StickySegmentedTabsProps<TValue>) => {
  const { theme } = useBuzzTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [tabsPinned, setTabsPinned] = useState(false);
  const [tabsPinTriggerY, setTabsPinTriggerY] = useState(0);
  const scrollY = useSharedValue(0);

  useEffect(() => {
    scrollY.value = 0;
    setTabsPinned(false);
  }, [scrollY, value]);

  const preTabsParallaxStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: Math.min(scrollY.value * parallaxFactor, parallaxMaxOffset),
        },
      ],
    };
  }, [parallaxFactor, parallaxMaxOffset]);

  const renderTabs = useCallback(
    () => (
      <SegmentedTabs
        items={items}
        mode="iconCompact"
        variant="chipRow"
        value={value}
        onChange={onChange}
        style={tabsStyle}
        {...(dragProgress === undefined ? {} : { dragProgress })}
        {...(testID === undefined ? {} : { testID })}
      />
    ),
    [dragProgress, items, onChange, tabsStyle, testID, value],
  );

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (tabsPinTriggerY <= 0) {
        scrollY.value = event.nativeEvent.contentOffset.y;
        return;
      }

      const y = event.nativeEvent.contentOffset.y;
      scrollY.value = y;
      const shouldPin = y >= tabsPinTriggerY + theme.spacing[2];
      setTabsPinned((current) => (current === shouldPin ? current : shouldPin));
    },
    [scrollY, tabsPinTriggerY, theme.spacing],
  );

  const header = (
    <View style={styles.headerStack}>
      <Animated.View style={[styles.preTabsSection, preTabsParallaxStyle]}>
        {preTabsContent}
      </Animated.View>
      <View
        onLayout={(event) => {
          setTabsPinTriggerY(event.nativeEvent.layout.y);
        }}
        pointerEvents={tabsPinned ? "none" : "auto"}
        style={[
          styles.tabsInlineWrap,
          tabsPinned ? styles.tabsGhost : null,
          tabsContainerStyle,
        ]}
      >
        {renderTabs()}
      </View>
    </View>
  );

  const overlay = tabsPinned ? (
    <View
      pointerEvents="box-none"
      style={[styles.pinnedTabsOverlay, pinnedTabsContainerStyle]}
    >
      <View style={tabsContainerStyle}>{renderTabs()}</View>
    </View>
  ) : null;

  return <>{children({ header, onScroll, overlay })}</>;
};

const createStyles = (theme: BuzzTheme) => {
  const { colors, spacing } = theme;

  return StyleSheet.create({
    headerStack: {
      gap: spacing[3],
      marginBottom: spacing[5],
    },
    preTabsSection: {
      gap: spacing[1],
    },
    tabsInlineWrap: {},
    tabsGhost: {
      opacity: 0,
    },
    pinnedTabsOverlay: {
      backgroundColor: colors.background,
      left: 0,
      position: "absolute",
      right: 0,
      top: 0,
      zIndex: 20,
    },
  });
};
