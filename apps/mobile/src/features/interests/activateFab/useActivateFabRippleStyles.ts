import {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";

/**
 * Release FX: one sharp **burst** (early `p`), then a softer **tail** that rises
 * more slowly and fades across most of the timeline (`p` = shared 0→1).
 */
export const useActivateFabRippleStyles = (
  rippleProgress: SharedValue<number>,
  windowHeight: number,
) => {
  const travel = windowHeight * 0.94;

  const waveBurstStyle = useAnimatedStyle(() => {
    const p = rippleProgress.value;

    return {
      opacity: interpolate(
        p,
        [0, 0.015, 0.06, 0.12, 0.2, 0.3, 0.38, 0.46, 0.52],
        [0, 0.35, 0.98, 1, 0.88, 0.48, 0.18, 0.04, 0],
        Extrapolate.CLAMP,
      ),
      transform: [
        {
          translateY: interpolate(
            p,
            [0, 0.035, 0.09, 0.16, 0.24, 0.34, 0.44, 0.52],
            [
              14,
              -travel * 0.08,
              -travel * 0.22,
              -travel * 0.4,
              -travel * 0.56,
              -travel * 0.72,
              -travel * 0.86,
              -travel * 0.93,
            ],
            Extrapolate.CLAMP,
          ),
        },
        {
          scaleX: interpolate(
            p,
            [0, 0.1, 0.22, 0.36, 0.5],
            [0.86, 1.06, 1.14, 1.18, 1.2],
            Extrapolate.CLAMP,
          ),
        },
        {
          scaleY: interpolate(
            p,
            [0, 0.06, 0.14, 0.26, 0.38, 0.5],
            [0.3, 0.82, 1.06, 1.12, 1.08, 1.02],
            Extrapolate.CLAMP,
          ),
        },
      ],
    };
  }, [rippleProgress, travel]);

  const waveTailStyle = useAnimatedStyle(() => {
    const p = rippleProgress.value;

    return {
      opacity: interpolate(
        p,
        [0, 0.035, 0.08, 0.16, 0.28, 0.4, 0.52, 0.64, 0.76, 0.86, 0.94, 1],
        [0, 0.02, 0.08, 0.18, 0.28, 0.34, 0.36, 0.3, 0.2, 0.12, 0.05, 0],
        Extrapolate.CLAMP,
      ),
      transform: [
        {
          translateY: interpolate(
            p,
            [0, 0.08, 0.18, 0.32, 0.46, 0.6, 0.72, 0.82, 0.9, 0.96, 1],
            [
              68,
              36,
              4,
              -travel * 0.12,
              -travel * 0.28,
              -travel * 0.44,
              -travel * 0.58,
              -travel * 0.72,
              -travel * 0.84,
              -travel * 0.94,
              -travel,
            ],
            Extrapolate.CLAMP,
          ),
        },
        {
          scaleX: interpolate(p, [0, 0.32, 0.65, 1], [0.9, 1.03, 1.09, 1.1], Extrapolate.CLAMP),
        },
        {
          scaleY: interpolate(
            p,
            [0, 0.2, 0.45, 0.7, 0.9, 1],
            [0.4, 0.74, 0.94, 1.04, 1.06, 1.05],
            Extrapolate.CLAMP,
          ),
        },
      ],
    };
  }, [rippleProgress, travel]);

  return { waveBurstStyle, waveTailStyle };
};
