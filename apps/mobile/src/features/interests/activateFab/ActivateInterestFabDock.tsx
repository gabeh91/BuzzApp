import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { Pressable, View } from "react-native";
import Animated from "react-native-reanimated";

import { Text } from "@/ui";

import { activityIconForInterest } from "./activateFabActivityIcon";
import type { ActivateFabStyles } from "./activateFabStyles";
import type { BuzzInterest } from "../interestFlow";

type AnimatedViewStyle = NonNullable<
  ComponentProps<typeof Animated.View>["style"]
>;

export type ActivateInterestFabDockProps = {
  accessibilityHint: string | undefined;
  accessibilityLabel: string;
  anchorAnimatedStyle: AnimatedViewStyle;
  chargeFillStyle: AnimatedViewStyle;
  clearSelectionFadeStyle: AnimatedViewStyle;
  clearSelectionLabel: string;
  colors: { text: string };
  compactContentMorphStyle: AnimatedViewStyle;
  compactLabel: string;
  disabled: boolean | undefined;
  displaySelectedInterest: BuzzInterest | null;
  expandedContentMorphStyle: AnimatedViewStyle;
  fabAnimatedStyle: AnimatedViewStyle;
  fabColorStyle: AnimatedViewStyle;
  glowStyle: AnimatedViewStyle;
  handleClearSelection: () => void;
  isExpanded: boolean;
  isReadyToRelease: boolean;
  livePanelBorderStyle: AnimatedViewStyle;
  onPressInExpanded: (() => void) | undefined;
  onPressOutExpanded: (() => void) | undefined;
  openWheel: () => void;
  prompt: string;
  showContentTrack: boolean;
  styles: ActivateFabStyles;
};

export const ActivateInterestFabDock = ({
  accessibilityHint,
  accessibilityLabel,
  anchorAnimatedStyle,
  chargeFillStyle,
  clearSelectionFadeStyle,
  clearSelectionLabel,
  colors,
  compactContentMorphStyle,
  compactLabel,
  disabled,
  displaySelectedInterest,
  expandedContentMorphStyle,
  fabAnimatedStyle,
  fabColorStyle,
  glowStyle,
  handleClearSelection,
  isExpanded,
  isReadyToRelease,
  livePanelBorderStyle,
  onPressInExpanded,
  onPressOutExpanded,
  openWheel,
  prompt,
  showContentTrack,
  styles,
}: ActivateInterestFabDockProps) => (
  <Animated.View
    pointerEvents="box-none"
    style={[styles.anchor, anchorAnimatedStyle]}
  >
    <View style={styles.pressable}>
      <Animated.View
        style={[
          styles.glow,
          isExpanded ? styles.glowExpanded : null,
          glowStyle,
          disabled ? styles.fabDisabled : null,
        ]}
      />
      <Animated.View
        style={[
          styles.fab,
          fabColorStyle,
          isExpanded ? styles.fabExpanded : null,
          fabAnimatedStyle,
          isReadyToRelease ? styles.fabReady : null,
          disabled ? styles.fabDisabled : null,
        ]}
      >
        {isExpanded ? (
          <Animated.View
            pointerEvents="none"
            style={[styles.fabLiveBorder, livePanelBorderStyle]}
          />
        ) : null}
        <Pressable
          accessibilityHint={accessibilityHint}
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="button"
          accessibilityState={{ disabled: Boolean(disabled) }}
          disabled={disabled}
          onMoveShouldSetResponder={() => isExpanded}
          onResponderTerminationRequest={() => false}
          onPress={isExpanded ? undefined : openWheel}
          onPressIn={isExpanded ? onPressInExpanded : undefined}
          onPressOut={isExpanded ? onPressOutExpanded : undefined}
          onStartShouldSetResponder={() => isExpanded}
          style={styles.fabActionHitArea}
        />
        <Animated.View style={[styles.chargeFill, chargeFillStyle]} />
        {showContentTrack ? (
          <Animated.View style={styles.contentViewport}>
            <Animated.View
              pointerEvents="none"
              style={[
                styles.contentMorphLayer,
                styles.contentPanel,
                compactContentMorphStyle,
              ]}
            >
              <Ionicons color={colors.text} name="flash" size={28} />
              <Text numberOfLines={2} style={styles.label} variant="button">
                {compactLabel}
              </Text>
            </Animated.View>
            <Animated.View
              pointerEvents="none"
              style={[
                styles.contentMorphLayer,
                styles.expandedPanel,
                expandedContentMorphStyle,
              ]}
            >
              <View style={styles.expandedIconBadge}>
                <Ionicons
                  color={colors.text}
                  name={
                    displaySelectedInterest
                      ? activityIconForInterest(displaySelectedInterest)
                      : "flash"
                  }
                  size={18}
                />
              </View>
              <Text
                numberOfLines={1}
                style={[styles.label, styles.expandedLabel]}
                variant="button"
              >
                {displaySelectedInterest?.name}
              </Text>
              <Text numberOfLines={2} style={styles.prompt}>
                {prompt}
              </Text>
            </Animated.View>
          </Animated.View>
        ) : (
          <View pointerEvents="none" style={styles.compactContent}>
            <Ionicons color={colors.text} name="flash" size={28} />
            <Text numberOfLines={2} style={styles.label} variant="button">
              {compactLabel}
            </Text>
          </View>
        )}
        {isExpanded ? (
          <Animated.View
            pointerEvents="box-none"
            style={[styles.clearSelectionInPanel, clearSelectionFadeStyle]}
          >
            <Pressable
              accessibilityLabel={clearSelectionLabel}
              accessibilityRole="button"
              hitSlop={10}
              onPress={handleClearSelection}
              style={({ pressed }) => [
                styles.clearSelectionButton,
                pressed ? styles.clearSelectionButtonPressed : null,
              ]}
            >
              <Ionicons color={colors.text} name="close" size={16} />
            </Pressable>
          </Animated.View>
        ) : null}
      </Animated.View>
    </View>
  </Animated.View>
);
