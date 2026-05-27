import {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";

import {
  COMPACT_FAB_VISUAL_SCALE,
  EXPANDED_PANEL_HEIGHT,
  FAB_DIAMETER,
} from "./activateFabConstants";
import { morphSpreadBlend } from "./activateFabMorph";
import { MORPH_LIFT_END } from "./activateFabMorphConfig";

export type ActivateFabDockColors = {
  border: string;
  fill: string;
};

export type ActivateFabDockShellStyleArgs = {
  chargeProgress: SharedValue<number>;
  compactBorderRadius: number;
  fabColors: ActivateFabDockColors;
  compactBottomOffset: number;
  hairlineW: number;
  liftPx: number;
  liveBorderPulse: SharedValue<number>;
  morphProgress: SharedValue<number>;
  readyPulse: SharedValue<number>;
  windowWidth: number;
};

export const useActivateFabDockShellStyles = ({
  chargeProgress,
  compactBorderRadius,
  fabColors,
  compactBottomOffset,
  hairlineW,
  liftPx,
  liveBorderPulse,
  morphProgress,
  readyPulse,
  windowWidth,
}: ActivateFabDockShellStyleArgs) => {
  const fabAnimatedStyle = useAnimatedStyle(() => {
    const m = morphProgress.value;
    const mc = Math.min(1, Math.max(0, m));
    const spreadBlend = morphSpreadBlend(mc);
    const heightBlend = interpolate(
      mc,
      [0, MORPH_LIFT_END, 1],
      [0, 1, 1],
      Extrapolate.CLAMP,
    );
    const width = interpolate(
      spreadBlend,
      [0, 0.72, 1],
      [FAB_DIAMETER, windowWidth, windowWidth],
    );
    const height = interpolate(
      heightBlend,
      [0, 1],
      [FAB_DIAMETER, EXPANDED_PANEL_HEIGHT],
    );
    const cornerBlend = Math.pow(spreadBlend, 1.12);
    const borderRadius = interpolate(
      cornerBlend,
      [0, 0.72, 1],
      [compactBorderRadius, 0, 0],
      Extrapolate.CLAMP,
    );
    const chargeScale = 1 + chargeProgress.value * 0.045 + readyPulse.value * 0.065;
    const blob = Math.sin(mc * Math.PI);
    const liqScaleX = 1 + 0.024 * blob;
    const liqScaleY = 1 - 0.015 * blob;
    const compactVisualScale = interpolate(
      mc,
      [0, 0.22, 1],
      [COMPACT_FAB_VISUAL_SCALE, 1, 1],
      Extrapolate.CLAMP,
    );
    const padH = interpolate(spreadBlend, [0, 0.38, 1], [4, 24, 24]);
    const padV = interpolate(spreadBlend, [0, 0.38, 1], [4, 12, 12]);
    const borderW = interpolate(
      spreadBlend,
      [0, 0.42],
      [hairlineW, 0],
      Extrapolate.CLAMP,
    );

    return {
      borderRadius,
      borderWidth: borderW,
      height,
      paddingHorizontal: padH,
      paddingVertical: padV,
      transform: [
        { scaleX: chargeScale * liqScaleX * compactVisualScale },
        { scaleY: chargeScale * liqScaleY * compactVisualScale },
      ],
      width,
    };
  }, [compactBorderRadius, hairlineW, windowWidth]);

  const anchorAnimatedStyle = useAnimatedStyle(() => {
    const m = morphProgress.value;
    const mc = Math.min(1, Math.max(0, m));
    const liftT = interpolate(
      mc,
      [0, MORPH_LIFT_END, 1],
      [0, 1, 1],
      Extrapolate.CLAMP,
    );
    const liftEased = 1 - Math.cos((liftT * Math.PI) / 2);

    return {
      bottom: compactBottomOffset + liftPx * liftEased,
    };
  }, [compactBottomOffset, liftPx, morphProgress]);

  const fabColorStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: fabColors.fill,
      borderColor: fabColors.border,
    };
  }, [fabColors.border, fabColors.fill]);

  const chargeFillStyle = useAnimatedStyle(() => {
    const m = morphProgress.value;
    const mc = Math.min(1, Math.max(0, m));
    const spreadBlend = morphSpreadBlend(mc);
    const panelProgress = Math.max(
      0.001,
      Math.min(1, (chargeProgress.value - 0.28) / 0.72),
    );

    return {
      opacity:
        interpolate(spreadBlend, [0, 0.55, 1], [0, 0.24, 0.52]) *
        interpolate(chargeProgress.value, [0, 0.24, 0.38, 1], [0, 0, 0.72, 1]),
      transform: [
        { translateY: ((1 - panelProgress) * EXPANDED_PANEL_HEIGHT) / 2 },
        { scaleY: panelProgress },
      ],
    };
  }, [chargeProgress, morphProgress]);

  const glowStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(chargeProgress.value, [0, 0.72, 1], [0, 0.24, 0.42]),
      transform: [{ scale: interpolate(chargeProgress.value, [0, 1], [0.86, 1.22]) }],
    };
  }, [chargeProgress]);

  const livePanelBorderStyle = useAnimatedStyle(() => {
    const m = morphProgress.value;
    const mc = Math.min(1, Math.max(0, m));
    const spreadBlend = morphSpreadBlend(mc);
    const expandedReveal = interpolate(
      spreadBlend,
      [0, 0.62, 0.88, 1],
      [0, 0, 0.55, 1],
    );

    return {
      opacity:
        expandedReveal * interpolate(liveBorderPulse.value, [0, 1], [0.42, 0.9]),
    };
  }, [liveBorderPulse, morphProgress]);

  const clearSelectionFadeStyle = useAnimatedStyle(() => {
    const mc = Math.min(1, Math.max(0, morphProgress.value));
    return {
      opacity: interpolate(
        mc,
        [0, 0.28, 0.42, 0.58, 1],
        [0, 0, 0, 1, 1],
        Extrapolate.CLAMP,
      ),
    };
  }, [morphProgress]);

  const compactContentMorphStyle = useAnimatedStyle(() => {
    const mc = Math.min(1, Math.max(0, morphProgress.value));
    const spreadBlend = morphSpreadBlend(mc);

    return {
      opacity: interpolate(
        spreadBlend,
        [0, 0.32, 0.52],
        [1, 0.45, 0],
        Extrapolate.CLAMP,
      ),
    };
  }, [morphProgress]);

  const expandedContentMorphStyle = useAnimatedStyle(() => {
    const mc = Math.min(1, Math.max(0, morphProgress.value));
    const spreadBlend = morphSpreadBlend(mc);

    return {
      opacity: interpolate(
        spreadBlend,
        [0, 0.52, 0.72, 0.88, 1],
        [0, 0, 0.15, 0.75, 1],
        Extrapolate.CLAMP,
      ),
    };
  }, [morphProgress]);

  return {
    anchorAnimatedStyle,
    chargeFillStyle,
    clearSelectionFadeStyle,
    compactContentMorphStyle,
    expandedContentMorphStyle,
    fabAnimatedStyle,
    fabColorStyle,
    glowStyle,
    livePanelBorderStyle,
  };
};
