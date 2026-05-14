import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import type { RefObject } from "react";
import { useCallback, useMemo, useRef } from "react";
import { Platform, Pressable, View } from "react-native";
import { ScrollView as GestureScrollView } from "react-native-gesture-handler";
import Animated, {
  Extrapolate,
  type SharedValue,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
} from "react-native-reanimated";

import type { I18n } from "@/i18n";
import type { BuzzTheme } from "@/theme/tokens";
import { Text } from "@/ui";

import type { BuzzInterest } from "../interestFlow";
import { activityIconForInterest } from "./activateFabActivityIcon";
import { WHEEL_FADE_BAND_PX } from "./activateFabConstants";
import type { ActivateFabStyles } from "./activateFabStyles";
import { titleCaseCategory } from "./activateFabStyles";

const AnimatedScrollView = Animated.createAnimatedComponent(GestureScrollView);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const WHEEL_ITEM_STAGGER = 0.018;
const WHEEL_ITEM_ENTER_SPAN = 0.22;

export type GroupedInterests = {
  category: string;
  items: BuzzInterest[];
}[];

type WheelTileMeasureWrapperProps = {
  children: React.ReactNode;
  contentRef: RefObject<View | null>;
  interestId: string;
  onMeasured: (interestId: string, y: number) => void;
};

const WheelTileMeasureWrapper = ({
  children,
  contentRef,
  interestId,
  onMeasured,
}: WheelTileMeasureWrapperProps) => {
  const selfRef = useRef<View>(null);

  const measure = useCallback(() => {
    const content = contentRef.current;
    const node = selfRef.current;

    if (!content || !node) {
      return;
    }

    node.measureLayout(
      content,
      (_x, y) => onMeasured(interestId, y),
      () => undefined,
    );
  }, [contentRef, interestId, onMeasured]);

  return (
    <View
      collapsable={false}
      onLayout={measure}
      ref={selfRef}
      style={{ alignSelf: "stretch" }}
    >
      {children}
    </View>
  );
};

type WheelTileProps = {
  contentTopOffset: number;
  fadeHeight: number;
  index: number;
  interest: BuzzInterest;
  layoutY: number | null;
  onPress: () => void;
  openProgress: SharedValue<number>;
  scrollY: SharedValue<number>;
  styles: ActivateFabStyles;
  theme: BuzzTheme;
  tileHeight: number;
};

const WheelTile = ({
  contentTopOffset,
  fadeHeight,
  index,
  interest,
  layoutY,
  onPress,
  openProgress,
  scrollY,
  styles,
  theme,
  tileHeight,
}: WheelTileProps) => {
  const containerStyle = useAnimatedStyle(() => {
    const enterStart = Math.min(0.28, index * WHEEL_ITEM_STAGGER);
    const enter = interpolate(
      openProgress.value,
      [enterStart, enterStart + WHEEL_ITEM_ENTER_SPAN],
      [0, 1],
      Extrapolate.CLAMP,
    );

    if (layoutY === null || fadeHeight <= 0) {
      return {
        opacity: enter,
        transform: [
          { translateY: interpolate(enter, [0, 1], [18, 0]) },
          { scale: interpolate(enter, [0, 1], [0.96, 1]) },
        ],
      };
    }

    const tileTop = contentTopOffset + layoutY - scrollY.value;
    const fadeStart = Math.max(0, fadeHeight - WHEEL_FADE_BAND_PX);
    const scrollFade = interpolate(
      tileTop,
      [fadeStart, fadeHeight],
      [0, 1],
      Extrapolate.CLAMP,
    );

    return {
      opacity: enter * scrollFade,
      transform: [
        { translateY: interpolate(enter, [0, 1], [18, 0]) },
        { scale: interpolate(enter, [0, 1], [0.96, 1]) },
      ],
    };
  }, [contentTopOffset, fadeHeight, index, layoutY, openProgress]);

  return (
    <Animated.View style={[styles.wheelTileShell, containerStyle]}>
      <Pressable
        accessibilityLabel={interest.name}
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [
          styles.wheelButton,
          { height: tileHeight },
          pressed ? styles.wheelButtonPressed : null,
        ]}
      >
        <View style={styles.wheelIconBadge}>
          <Ionicons
            color={theme.colors.text}
            name={activityIconForInterest(interest)}
            size={18}
          />
        </View>
        <View style={styles.wheelLabelWrap}>
          <Text
            maxFontSizeMultiplier={1.28}
            style={styles.wheelLabel}
            {...(Platform.OS === "android"
              ? {
                  textBreakStrategy: "balanced" as const,
                }
              : {})}
          >
            {interest.name}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
};

type WheelSectionHeaderProps = {
  contentTopOffset: number;
  fadeHeight: number;
  index: number;
  layoutY: number | null;
  openProgress: SharedValue<number>;
  scrollY: SharedValue<number>;
  styles: ActivateFabStyles;
  title: string;
};

const WheelSectionHeader = ({
  contentTopOffset,
  fadeHeight,
  index,
  layoutY,
  openProgress,
  scrollY,
  styles,
  title,
}: WheelSectionHeaderProps) => {
  const headerStyle = useAnimatedStyle(() => {
    const enterStart = Math.min(0.24, index * WHEEL_ITEM_STAGGER);
    const enter = interpolate(
      openProgress.value,
      [enterStart, enterStart + WHEEL_ITEM_ENTER_SPAN],
      [0, 1],
      Extrapolate.CLAMP,
    );

    if (layoutY === null || fadeHeight <= 0) {
      return {
        opacity: enter,
        transform: [{ translateY: interpolate(enter, [0, 1], [10, 0]) }],
      };
    }

    const top = contentTopOffset + layoutY - scrollY.value;
    const fadeStart = Math.max(0, fadeHeight - WHEEL_FADE_BAND_PX);
    const scrollFade = interpolate(
      top,
      [fadeStart, fadeHeight],
      [0, 1],
      Extrapolate.CLAMP,
    );

    return {
      opacity: enter * scrollFade,
      transform: [{ translateY: interpolate(enter, [0, 1], [10, 0]) }],
    };
  }, [contentTopOffset, fadeHeight, index, layoutY, openProgress]);

  return (
    <Animated.View style={headerStyle}>
      <Text style={styles.wheelSectionTitle}>{title}</Text>
    </Animated.View>
  );
};

export type ActivateInterestFabWheelProps = {
  closeWheel: () => void;
  colors: BuzzTheme["colors"];
  energyFieldStyle: object;
  groupedInterests: GroupedInterests;
  handleMeasuredItemY: (interestId: string, y: number) => void;
  handleSelectInterest: (interest: BuzzInterest) => void;
  isWheelOpen: boolean;
  LL: I18n;
  setWheelHeaderHeight: (height: number) => void;
  shouldRenderWheel: boolean;
  styles: ActivateFabStyles;
  theme: BuzzTheme;
  wheelContentRef: RefObject<View | null>;
  wheelContentTopSpacerHeight: number;
  wheelFadeHeight: number;
  wheelItemYs: Record<string, number>;
  wheelListStyle: object;
  wheelOpenProgress: SharedValue<number>;
  wheelOverlayStyle: object;
  wheelRenderKey: number;
  wheelScrollHandler: ReturnType<typeof useAnimatedScrollHandler>;
  wheelScrollY: SharedValue<number>;
  wheelTileHeight: number;
};

export const ActivateInterestFabWheel = ({
  closeWheel,
  colors,
  energyFieldStyle,
  groupedInterests,
  handleMeasuredItemY,
  handleSelectInterest,
  isWheelOpen,
  LL,
  setWheelHeaderHeight,
  shouldRenderWheel,
  styles,
  theme,
  wheelContentRef,
  wheelContentTopSpacerHeight,
  wheelFadeHeight,
  wheelItemYs,
  wheelListStyle,
  wheelOpenProgress,
  wheelOverlayStyle,
  wheelRenderKey,
  wheelScrollHandler,
  wheelScrollY,
  wheelTileHeight,
}: ActivateInterestFabWheelProps) => {
  const indexedSections = useMemo(() => {
    let startIndex = 0;

    return groupedInterests.map((section) => {
      const indexedSection = {
        ...section,
        startIndex,
      };

      startIndex += section.items.length + 1;

      return indexedSection;
    });
  }, [groupedInterests]);

  return (
    <>
      {shouldRenderWheel ? (
        <AnimatedPressable
          accessibilityLabel={LL.common.activateInterestFab.closeWheel()}
          accessibilityRole="button"
          onPress={closeWheel}
          style={[styles.dismissLayer, wheelOverlayStyle]}
        />
      ) : null}
      <Animated.View
        pointerEvents="none"
        style={[styles.energyField, energyFieldStyle]}
      >
        <View style={styles.energyRingLarge} />
        <View style={styles.energyRingMedium} />
        <View style={styles.energyRingSmall} />
      </Animated.View>
      {shouldRenderWheel ? (
        <LinearGradient
          colors={[
            "rgba(13, 39, 31, 0.56)",
            "rgba(13, 39, 31, 0.28)",
            "rgba(13, 39, 31, 0)",
          ]}
          end={{ x: 0.5, y: 1 }}
          locations={[0, 0.6, 1]}
          pointerEvents="none"
          start={{ x: 0.5, y: 0 }}
          style={[
            styles.wheelHeaderFade,
            wheelOverlayStyle,
            {
              height:
                wheelFadeHeight > 0
                  ? wheelFadeHeight + WHEEL_FADE_BAND_PX
                  : wheelContentTopSpacerHeight,
            },
          ]}
        />
      ) : null}
      {shouldRenderWheel ? (
        <Animated.View
          onLayout={(event) => {
            setWheelHeaderHeight(event.nativeEvent.layout.height);
          }}
          style={[styles.wheelHeader, wheelOverlayStyle]}
        >
          <View style={styles.wheelHeaderCopy}>
            <Text style={styles.wheelEyebrow}>
              {LL.activities.activate.heroEyebrow()}
            </Text>
            <Text style={styles.wheelTitle}>
              {LL.common.activateInterestFab.chooseActivity()}
            </Text>
            <Text style={styles.wheelSubtitle}>
              {LL.common.activateInterestFab.chooseActivityHint()}
            </Text>
          </View>
          <Pressable
            accessibilityLabel={LL.common.activateInterestFab.closeWheel()}
            accessibilityRole="button"
            onPress={closeWheel}
            style={({ pressed }) => [
              styles.closeButton,
              pressed ? styles.closeButtonPressed : null,
            ]}
          >
            <Ionicons color={colors.surface} name="close" size={20} />
          </Pressable>
        </Animated.View>
      ) : null}
      <Animated.View
        pointerEvents={isWheelOpen ? "auto" : "none"}
        onMoveShouldSetResponderCapture={() => isWheelOpen}
        style={[styles.activityLayer, wheelListStyle]}
      >
        {shouldRenderWheel ? (
          <AnimatedScrollView
            contentContainerStyle={styles.wheelScrollContent}
            key={wheelRenderKey}
            onScroll={wheelScrollHandler}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            style={styles.wheelScroll}
          >
            <View
              pointerEvents="none"
              style={{ height: wheelContentTopSpacerHeight }}
            />
            <View collapsable={false} ref={wheelContentRef}>
              {indexedSections.map((section) => (
                <View key={section.category} style={styles.wheelSection}>
                  <WheelTileMeasureWrapper
                    contentRef={wheelContentRef}
                    interestId={`header:${section.category}`}
                    onMeasured={handleMeasuredItemY}
                  >
                    <WheelSectionHeader
                      contentTopOffset={wheelContentTopSpacerHeight}
                      fadeHeight={wheelFadeHeight}
                      index={section.startIndex}
                      layoutY={wheelItemYs[`header:${section.category}`] ?? null}
                      openProgress={wheelOpenProgress}
                      scrollY={wheelScrollY}
                      styles={styles}
                      title={titleCaseCategory(section.category)}
                    />
                  </WheelTileMeasureWrapper>
                  <View style={styles.wheelGrid}>
                    {section.items.map((interest, itemIndex) => (
                      <WheelTileMeasureWrapper
                        key={interest.id}
                        contentRef={wheelContentRef}
                        interestId={interest.id}
                        onMeasured={handleMeasuredItemY}
                      >
                        <WheelTile
                          contentTopOffset={wheelContentTopSpacerHeight}
                          fadeHeight={wheelFadeHeight}
                          index={section.startIndex + itemIndex + 1}
                          interest={interest}
                          layoutY={wheelItemYs[interest.id] ?? null}
                          onPress={() => handleSelectInterest(interest)}
                          openProgress={wheelOpenProgress}
                          scrollY={wheelScrollY}
                          styles={styles}
                          theme={theme}
                          tileHeight={wheelTileHeight}
                        />
                      </WheelTileMeasureWrapper>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          </AnimatedScrollView>
        ) : null}
      </Animated.View>
    </>
  );
};
