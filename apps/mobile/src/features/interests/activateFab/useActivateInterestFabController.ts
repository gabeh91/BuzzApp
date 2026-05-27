import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  cancelAnimation,
  Easing,
  useAnimatedReaction,
  useAnimatedScrollHandler,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { useI18n } from "@/i18n/I18nProvider";
import { tabBarTotalHeight } from "@/navigation/tabBarLayout";
import { useBuzzTheme } from "@/theme/ThemeProvider";

import { useActivationGestureLock } from "../ActivationGestureLockProvider";
import type { ActivateInterestFabDockProps } from "./ActivateInterestFabDock";
import type {
  ActivateFabEnergyWaveGradient,
  ActivateInterestFabRipplesProps,
} from "./ActivateInterestFabRipples";
import type { ActivateInterestFabWheelProps } from "./ActivateInterestFabWheel";
import type {
  ActivateFabMode,
  ActivateInterestFabProps,
} from "./ActivateInterestFab.types";
import { fireActivateFabHaptic } from "./activateFabFireHaptic";
import {
  COLLAPSE_DURATION_MS,
  EXPANDED_PANEL_TAB_GAP,
  FAB_DIAMETER,
  HOLD_TO_ACTIVATE_MS,
  LIVE_BORDER_PULSE_DURATION_MS,
  READY_SETTLE_MS,
  RIPPLE_DURATION_MS,
  TAB_BAR_BASE_HEIGHT,
  WHEEL_CLOSE_DURATION_MS,
  WHEEL_OPEN_DURATION_MS,
} from "./activateFabConstants";
import {
  MORPH_SPRING_COLLAPSE,
  MORPH_SPRING_EXPAND,
} from "./activateFabMorphConfig";
import {
  createActivateFabStyles,
  estimateActivityTileHeight,
} from "./activateFabStyles";
import { groupInterestsByCategory } from "./groupInterestsByCategory";
import type { BuzzInterest } from "../interestFlow";
import { useActivateFabDockShellStyles } from "./useActivateFabDockShellStyles";
import { useActivateFabRippleStyles } from "./useActivateFabRippleStyles";
import { useActivateFabWheelChromeStyles } from "./useActivateFabWheelChromeStyles";

export type UseActivateInterestFabControllerResult = {
  dock: ActivateInterestFabDockProps;
  isWheelOpen: boolean;
  ripples: ActivateInterestFabRipplesProps;
  styles: ReturnType<typeof createActivateFabStyles>;
  wheel: ActivateInterestFabWheelProps;
};

export const useActivateInterestFabController = ({
  accessibilityHint,
  accessibilityLabel,
  activationBusy = false,
  bottomInset,
  disabled,
  interests,
  onActivateSelectedInterest,
  onActivitiesEmptyActivationPress,
  onClearSelectedInterest,
  onSelectInterest,
  selectedInterest,
  skipActivityWheel = false,
  tabBarDockClearProgress,
}: ActivateInterestFabProps): UseActivateInterestFabControllerResult => {
  const { LL } = useI18n();
  const { theme } = useBuzzTheme();
  const { colors } = theme;
  const hairlineW = theme.borderWidths.hairline;
  const { setActivationGestureLocked } = useActivationGestureLock();
  const insets = useSafeAreaInsets();
  const windowDimensions = useWindowDimensions();
  const [wheelHeaderHeight, setWheelHeaderHeight] = useState(0);
  const [wheelItemYs, setWheelItemYs] = useState<Record<string, number>>({});
  const wheelContentRef = useRef<View>(null);
  const compactBottomOffset =
    tabBarTotalHeight(theme, bottomInset) - FAB_DIAMETER / 2;
  const expandedBottomOffset =
    Math.max(bottomInset, theme.spacing[2]) +
    TAB_BAR_BASE_HEIGHT +
    EXPANDED_PANEL_TAB_GAP;
  const liftPx = expandedBottomOffset - compactBottomOffset;
  const styles = useMemo(
    () =>
      createActivateFabStyles(
        theme,
        compactBottomOffset,
        expandedBottomOffset,
        windowDimensions.width,
        windowDimensions.height,
        insets.top,
      ),
    [
      theme,
      bottomInset,
      compactBottomOffset,
      expandedBottomOffset,
      insets.top,
      windowDimensions.height,
      windowDimensions.width,
    ],
  );
  const wheelTileHeight = useMemo(
    () => estimateActivityTileHeight(interests, windowDimensions.width),
    [interests, windowDimensions.width],
  );
  const [mode, setModeState] = useState<ActivateFabMode>("idle");
  const [shouldRenderWheel, setShouldRenderWheel] = useState(false);
  const [wheelRenderKey, setWheelRenderKey] = useState(0);
  const [pendingSelectedInterest, setPendingSelectedInterest] =
    useState<BuzzInterest | null>(null);
  const modeRef = useRef<ActivateFabMode>("idle");
  const readyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const collapseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wheelVisibilityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const activationInFlightRef = useRef(false);
  const wheelProgress = useSharedValue(0);
  const wheelScrollY = useSharedValue(0);
  const morphProgress = useSharedValue(0);
  const tabBarDockClearSink = useSharedValue(0);
  const tabBarDockClearOut = tabBarDockClearProgress ?? tabBarDockClearSink;
  useAnimatedReaction(
    () => morphProgress.value,
    (m) => {
      const c = m <= 0 ? 0 : m >= 1 ? 1 : m;
      tabBarDockClearOut.value = c;
    },
    [tabBarDockClearOut],
  );
  const chargeProgress = useSharedValue(0);
  const readyPulse = useSharedValue(0);
  const rippleProgress = useSharedValue(0);
  const liveBorderPulse = useSharedValue(0);

  const groupedInterests = useMemo(
    () => groupInterestsByCategory(interests),
    [interests],
  );
  const displaySelectedInterest = selectedInterest ?? pendingSelectedInterest;

  const setMode = useCallback((nextMode: ActivateFabMode) => {
    modeRef.current = nextMode;
    setModeState(nextMode);
  }, []);

  const clearReadyTimer = useCallback(() => {
    if (readyTimerRef.current) {
      clearTimeout(readyTimerRef.current);
      readyTimerRef.current = null;
    }
  }, []);

  const clearCollapseTimer = useCallback(() => {
    if (collapseTimerRef.current) {
      clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = null;
    }
  }, []);

  const clearWheelVisibilityTimer = useCallback(() => {
    if (wheelVisibilityTimerRef.current) {
      clearTimeout(wheelVisibilityTimerRef.current);
      wheelVisibilityTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearReadyTimer();
      clearCollapseTimer();
      clearWheelVisibilityTimer();
      setActivationGestureLocked(false);
    };
  }, [
    clearCollapseTimer,
    clearReadyTimer,
    clearWheelVisibilityTimer,
    setActivationGestureLocked,
  ]);

  useEffect(() => {
    if (selectedInterest && modeRef.current === "idle") {
      setMode("activity_selected");
    }

    if (selectedInterest) {
      setPendingSelectedInterest(null);
    }
  }, [selectedInterest, setMode]);

  useEffect(() => {
    const shouldPulse =
      Boolean(selectedInterest) &&
      mode !== "idle" &&
      mode !== "wheel_open" &&
      mode !== "collapsing" &&
      mode !== "charging" &&
      mode !== "ready_to_release" &&
      !activationBusy;

    if (!shouldPulse) {
      cancelAnimation(liveBorderPulse);
      liveBorderPulse.value = withTiming(0, { duration: 160 });
      return;
    }

    liveBorderPulse.value = withRepeat(
      withSequence(
        withTiming(1, {
          duration: LIVE_BORDER_PULSE_DURATION_MS,
          easing: Easing.inOut(Easing.sin),
        }),
        withTiming(0, {
          duration: LIVE_BORDER_PULSE_DURATION_MS,
          easing: Easing.inOut(Easing.sin),
        }),
      ),
      -1,
      false,
    );
  }, [activationBusy, liveBorderPulse, mode, selectedInterest]);

  useEffect(() => {
    clearWheelVisibilityTimer();

    if (mode === "wheel_open") {
      cancelAnimation(wheelProgress);
      wheelProgress.value = 0;
      wheelScrollY.value = 0;
      setWheelItemYs({});
      setWheelRenderKey((current) => current + 1);
      setShouldRenderWheel(true);
      wheelProgress.value = withTiming(1, {
        duration: WHEEL_OPEN_DURATION_MS,
        easing: Easing.out(Easing.cubic),
      });
      return;
    }

    cancelAnimation(wheelProgress);
    wheelProgress.value = withTiming(0, {
      duration: WHEEL_CLOSE_DURATION_MS,
      easing: Easing.in(Easing.quad),
    });
    wheelVisibilityTimerRef.current = setTimeout(() => {
      setShouldRenderWheel(false);
    }, WHEEL_CLOSE_DURATION_MS);
  }, [clearWheelVisibilityTimer, mode, wheelProgress, wheelScrollY]);

  useEffect(() => {
    const isExpanded =
      mode === "activity_selected" ||
      mode === "charging" ||
      mode === "ready_to_release" ||
      mode === "released";

    cancelAnimation(morphProgress);
    morphProgress.value = withSpring(
      isExpanded ? 1 : 0,
      isExpanded ? MORPH_SPRING_EXPAND : MORPH_SPRING_COLLAPSE,
    );
  }, [mode, morphProgress]);

  const resetCharge = useCallback(() => {
    clearReadyTimer();
    chargeProgress.value = withTiming(0, { duration: 170 });
    readyPulse.value = withTiming(0, { duration: 140 });
  }, [chargeProgress, clearReadyTimer, readyPulse]);

  const closeWheel = useCallback(() => {
    if (modeRef.current === "wheel_open") {
      fireActivateFabHaptic(() => Haptics.selectionAsync());
      setMode(selectedInterest ? "activity_selected" : "idle");
    }
  }, [selectedInterest, setMode]);

  useEffect(() => {
    if (skipActivityWheel && modeRef.current === "wheel_open") {
      closeWheel();
    }
  }, [closeWheel, skipActivityWheel]);

  const openWheel = useCallback(() => {
    if (disabled || activationBusy) {
      return;
    }

    resetCharge();
    clearCollapseTimer();

    if (skipActivityWheel) {
      if (selectedInterest) {
        fireActivateFabHaptic(() => Haptics.selectionAsync());
        setMode("activity_selected");
        return;
      }

      onActivitiesEmptyActivationPress?.();
      return;
    }

    fireActivateFabHaptic(() => Haptics.selectionAsync());
    setMode(modeRef.current === "wheel_open" ? "idle" : "wheel_open");
  }, [
    activationBusy,
    clearCollapseTimer,
    disabled,
    onActivitiesEmptyActivationPress,
    resetCharge,
    selectedInterest,
    setMode,
    skipActivityWheel,
  ]);

  const handleSelectInterest = useCallback(
    (interest: BuzzInterest) => {
      if (disabled || activationBusy) {
        return;
      }

      onSelectInterest(interest);
      clearCollapseTimer();
      setPendingSelectedInterest(interest);
      resetCharge();
      fireActivateFabHaptic(() =>
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
      );
      setMode("activity_selected");
    },
    [
      activationBusy,
      clearCollapseTimer,
      disabled,
      onSelectInterest,
      resetCharge,
      setMode,
    ],
  );

  const handleClearSelection = useCallback(() => {
    if (activationBusy || activationInFlightRef.current) {
      return;
    }

    const previousSelection = displaySelectedInterest;

    resetCharge();
    setActivationGestureLocked(false);
    if (previousSelection) {
      setPendingSelectedInterest(previousSelection);
    }
    fireActivateFabHaptic(() => Haptics.selectionAsync());
    onClearSelectedInterest();
    setMode("collapsing");
    clearCollapseTimer();
    collapseTimerRef.current = setTimeout(() => {
      setPendingSelectedInterest(null);
      setMode("idle");
    }, COLLAPSE_DURATION_MS);
  }, [
    activationBusy,
    clearCollapseTimer,
    displaySelectedInterest,
    onClearSelectedInterest,
    resetCharge,
    setActivationGestureLocked,
    setMode,
  ]);

  const startCharging = useCallback(() => {
    if (
      !displaySelectedInterest ||
      modeRef.current === "collapsing" ||
      disabled ||
      activationBusy ||
      activationInFlightRef.current
    ) {
      return;
    }

    clearReadyTimer();
    setMode("charging");
    setActivationGestureLocked(true);
    fireActivateFabHaptic(() =>
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
    );
    chargeProgress.value = withTiming(1, {
      duration: HOLD_TO_ACTIVATE_MS,
      easing: Easing.out(Easing.cubic),
    });
    readyTimerRef.current = setTimeout(() => {
      setMode("ready_to_release");
      fireActivateFabHaptic(() =>
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
      );
      readyPulse.value = withSequence(
        withTiming(1, { duration: READY_SETTLE_MS }),
        withSpring(0.64, { damping: 7, mass: 0.6, stiffness: 160 }),
      );
    }, HOLD_TO_ACTIVATE_MS);
  }, [
    activationBusy,
    chargeProgress,
    clearReadyTimer,
    disabled,
    displaySelectedInterest,
    readyPulse,
    setActivationGestureLocked,
    setMode,
  ]);

  const cancelCharging = useCallback(() => {
    if (
      modeRef.current !== "charging" &&
      modeRef.current !== "ready_to_release"
    ) {
      return;
    }

    resetCharge();
    setActivationGestureLocked(false);
    fireActivateFabHaptic(() => Haptics.selectionAsync());
    setMode("activity_selected");
  }, [resetCharge, setActivationGestureLocked, setMode]);

  const releaseActivation = useCallback(async () => {
    if (activationInFlightRef.current) {
      return;
    }

    clearReadyTimer();
    setActivationGestureLocked(false);

    if (modeRef.current !== "ready_to_release") {
      cancelCharging();
      return;
    }

    activationInFlightRef.current = true;
    setMode("released");
    fireActivateFabHaptic(() =>
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
    );
    rippleProgress.value = 0;
    rippleProgress.value = withTiming(1, {
      duration: RIPPLE_DURATION_MS,
      /** Linear so `p` tracks wall-clock time; tail length is driven by opacity / translate keyframes. */
      easing: Easing.linear,
    });

    try {
      await onActivateSelectedInterest();
    } finally {
      activationInFlightRef.current = false;
      resetCharge();
      setTimeout(() => {
        rippleProgress.value = 0;
        setMode("idle");
      }, RIPPLE_DURATION_MS);
    }
  }, [
    cancelCharging,
    clearReadyTimer,
    onActivateSelectedInterest,
    resetCharge,
    rippleProgress,
    setMode,
    setActivationGestureLocked,
  ]);

  const { energyFieldStyle, wheelListStyle, wheelOverlayStyle } =
    useActivateFabWheelChromeStyles(wheelProgress);

  const { waveBurstStyle, waveTailStyle } = useActivateFabRippleStyles(
    rippleProgress,
    windowDimensions.height,
  );

  const energyReleaseGradients = useMemo(() => {
    const fw = theme.fabWheel;

    return {
      burst: [
        fw.energyReleasePrimaryG0,
        fw.energyReleasePrimaryG1,
        fw.energyReleasePrimaryG2,
        fw.energyReleasePrimaryG3,
      ] satisfies ActivateFabEnergyWaveGradient,
      tail: [
        fw.energyReleaseSecondaryG0,
        fw.energyReleaseSecondaryG1,
        fw.energyReleaseSecondaryG2,
        fw.energyReleaseSecondaryG3,
      ] satisfies ActivateFabEnergyWaveGradient,
    };
  }, [theme.fabWheel]);

  const {
    anchorAnimatedStyle,
    chargeFillStyle,
    clearSelectionFadeStyle,
    compactContentMorphStyle,
    expandedContentMorphStyle,
    fabAnimatedStyle,
    fabColorStyle,
    glowStyle,
    livePanelBorderStyle,
  } = useActivateFabDockShellStyles({
    chargeProgress,
    compactBorderRadius: theme.radii.sm,
    fabColors: {
      border: theme.colors.brandSoft,
      fill: theme.colors.surfaceMuted,
    },
    compactBottomOffset,
    hairlineW,
    liftPx,
    liveBorderPulse,
    morphProgress,
    readyPulse,
    windowWidth: windowDimensions.width,
  });

  const prompt = (() => {
    if (activationBusy || activationInFlightRef.current) {
      return LL.activities.activate.activating();
    }

    if (mode === "ready_to_release") {
      return LL.common.activateInterestFab.releaseToPing();
    }

    if (mode === "charging") {
      return LL.common.activateInterestFab.keepHolding();
    }

    if (displaySelectedInterest) {
      return LL.common.activateInterestFab.holdToActivate();
    }

    return LL.common.activateInterestFab.chooseActivity();
  })();

  const isExpanded =
    Boolean(displaySelectedInterest) &&
    mode !== "idle" &&
    mode !== "wheel_open";
  const isWheelOpen = mode === "wheel_open";
  const showContentTrack =
    Boolean(displaySelectedInterest) && (isExpanded || mode === "collapsing");
  const effectiveWheelHeaderHeight =
    wheelHeaderHeight > 0 ? wheelHeaderHeight : 108;
  const wheelFadeHeight =
    wheelHeaderHeight > 0
      ? insets.top + theme.spacing[4] + wheelHeaderHeight + theme.spacing[2]
      : 0;
  const wheelContentTopSpacerHeight =
    insets.top +
    theme.spacing[4] +
    effectiveWheelHeaderHeight +
    theme.spacing[2] +
    theme.spacing[1];
  const wheelScrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      wheelScrollY.value = event.contentOffset.y;
    },
  });

  const handleMeasuredItemY = useCallback((itemId: string, y: number) => {
    setWheelItemYs((current) =>
      current[itemId] === y ? current : { ...current, [itemId]: y },
    );
  }, []);

  const wheel: ActivateInterestFabWheelProps = useMemo(
    () => ({
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
      wheelOpenProgress: wheelProgress,
      wheelOverlayStyle,
      wheelRenderKey,
      wheelScrollHandler,
      wheelScrollY,
      wheelTileHeight,
    }),
    [
      closeWheel,
      colors,
      energyFieldStyle,
      groupedInterests,
      handleMeasuredItemY,
      handleSelectInterest,
      isWheelOpen,
      LL,
      shouldRenderWheel,
      styles,
      theme,
      wheelContentTopSpacerHeight,
      wheelFadeHeight,
      wheelItemYs,
      wheelListStyle,
      wheelProgress,
      wheelOverlayStyle,
      wheelRenderKey,
      wheelScrollHandler,
      wheelScrollY,
      wheelTileHeight,
      setWheelHeaderHeight,
    ],
  );

  const ripples: ActivateInterestFabRipplesProps = useMemo(
    () => ({
      energyReleaseBurstGradient: energyReleaseGradients.burst,
      energyReleaseTailGradient: energyReleaseGradients.tail,
      styles,
      waveBurstStyle,
      waveTailStyle,
    }),
    [energyReleaseGradients, styles, waveBurstStyle, waveTailStyle],
  );

  const dock: ActivateInterestFabDockProps = useMemo(
    () => ({
      accessibilityHint,
      accessibilityLabel,
      anchorAnimatedStyle,
      chargeFillStyle,
      clearSelectionFadeStyle,
      clearSelectionLabel: LL.common.activateInterestFab.clearSelection(),
      colors,
      compactContentMorphStyle,
      compactLabel: LL.common.activateInterestFab.label(),
      disabled,
      displaySelectedInterest,
      expandedContentMorphStyle,
      fabAnimatedStyle,
      fabColorStyle,
      glowStyle,
      handleClearSelection,
      isExpanded,
      isReadyToRelease: mode === "ready_to_release",
      livePanelBorderStyle,
      onPressInExpanded: startCharging,
      onPressOutExpanded: releaseActivation,
      openWheel,
      prompt,
      showContentTrack,
      styles,
    }),
    [
      accessibilityHint,
      accessibilityLabel,
      anchorAnimatedStyle,
      chargeFillStyle,
      clearSelectionFadeStyle,
      colors,
      compactContentMorphStyle,
      disabled,
      displaySelectedInterest,
      expandedContentMorphStyle,
      fabAnimatedStyle,
      fabColorStyle,
      glowStyle,
      handleClearSelection,
      isExpanded,
      livePanelBorderStyle,
      LL,
      mode,
      openWheel,
      prompt,
      releaseActivation,
      showContentTrack,
      startCharging,
      styles,
    ],
  );

  return {
    dock,
    isWheelOpen,
    ripples,
    styles,
    wheel,
  };
};
