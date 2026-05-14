import {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";

export const useActivateFabRippleStyles = (
  rippleProgress: SharedValue<number>,
  windowHeight: number,
) => {
  const rippleStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        rippleProgress.value,
        [0, 0.04, 0.34, 0.72, 1],
        [0, 0.96, 0.62, 0.2, 0],
      ),
      transform: [
        {
          translateY: interpolate(
            rippleProgress.value,
            [0, 1],
            [0, -windowHeight * 0.74],
          ),
        },
        { scaleX: interpolate(rippleProgress.value, [0, 1], [0.86, 1.18]) },
        { scaleY: interpolate(rippleProgress.value, [0, 1], [0.38, 1.08]) },
      ],
    };
  }, [rippleProgress, windowHeight]);

  const rippleEchoStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        rippleProgress.value,
        [0, 0.1, 0.44, 0.82, 1],
        [0, 0.72, 0.34, 0.12, 0],
      ),
      transform: [
        {
          translateY: interpolate(
            rippleProgress.value,
            [0, 1],
            [0, -windowHeight * 0.56],
          ),
        },
        { scaleX: interpolate(rippleProgress.value, [0, 1], [0.74, 1.08]) },
        { scaleY: interpolate(rippleProgress.value, [0, 1], [0.5, 0.9]) },
      ],
    };
  }, [rippleProgress, windowHeight]);

  const rippleWashStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        rippleProgress.value,
        [0, 0.04, 0.3, 0.76, 1],
        [0, 0.52, 0.36, 0.12, 0],
      ),
      transform: [
        {
          translateY: interpolate(
            rippleProgress.value,
            [0, 1],
            [0, -windowHeight * 0.46],
          ),
        },
        { scaleY: interpolate(rippleProgress.value, [0, 1], [0.22, 1.28]) },
      ],
    };
  }, [rippleProgress, windowHeight]);

  return { rippleEchoStyle, rippleStyle, rippleWashStyle };
};
