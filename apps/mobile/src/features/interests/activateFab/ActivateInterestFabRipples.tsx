import type { ComponentProps } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet } from "react-native";
import Animated from "react-native-reanimated";

import type { ActivateFabStyles } from "./activateFabStyles";

type AnimatedViewStyle = NonNullable<
  ComponentProps<typeof Animated.View>["style"]
>;

/** Stops for `expo-linear-gradient` (fixed-length tuple for `colors` prop). */
export type ActivateFabEnergyWaveGradient = readonly [
  string,
  string,
  string,
  string,
];

const gradientFill = StyleSheet.absoluteFillObject;

/** Top + bottom feathered; warm core sits mid-band (no hard horizontal seam). */
const burstLocations = [0, 0.14, 0.48, 1] as const;
const tailLocations = [0, 0.12, 0.42, 1] as const;

export type ActivateInterestFabRipplesProps = {
  energyReleaseBurstGradient: ActivateFabEnergyWaveGradient;
  energyReleaseTailGradient: ActivateFabEnergyWaveGradient;
  styles: ActivateFabStyles;
  waveBurstStyle: AnimatedViewStyle;
  waveTailStyle: AnimatedViewStyle;
};

export const ActivateInterestFabRipples = ({
  energyReleaseBurstGradient,
  energyReleaseTailGradient,
  styles,
  waveBurstStyle,
  waveTailStyle,
}: ActivateInterestFabRipplesProps) => (
  <>
    <Animated.View
      pointerEvents="none"
      style={[styles.energyWaveTail, waveTailStyle]}
    >
      <LinearGradient
        colors={energyReleaseTailGradient}
        end={{ x: 0.64, y: 1 }}
        locations={[...tailLocations]}
        start={{ x: 0.36, y: 0 }}
        style={gradientFill}
      />
    </Animated.View>
    <Animated.View
      pointerEvents="none"
      style={[styles.energyWaveBurst, waveBurstStyle]}
    >
      <LinearGradient
        colors={energyReleaseBurstGradient}
        end={{ x: 0.53, y: 1 }}
        locations={[...burstLocations]}
        start={{ x: 0.47, y: 0 }}
        style={gradientFill}
      />
    </Animated.View>
  </>
);
