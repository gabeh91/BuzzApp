import { interpolate, useAnimatedStyle, type SharedValue } from "react-native-reanimated";

export const useActivateFabWheelChromeStyles = (
  wheelProgress: SharedValue<number>,
) => {
  const energyFieldStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(wheelProgress.value, [0, 1], [0, 1]),
      transform: [
        { scale: interpolate(wheelProgress.value, [0, 1], [0.94, 1]) },
      ],
    };
  }, [wheelProgress]);

  const wheelOverlayStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(wheelProgress.value, [0, 1], [0, 1]),
    };
  }, [wheelProgress]);

  const wheelListStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(wheelProgress.value, [0, 1], [0, 1]),
      transform: [
        { translateY: interpolate(wheelProgress.value, [0, 1], [18, 0]) },
        { scale: interpolate(wheelProgress.value, [0, 1], [0.98, 1]) },
      ],
    };
  }, [wheelProgress]);

  return { energyFieldStyle, wheelListStyle, wheelOverlayStyle };
};
