import type { ComponentProps } from "react";
import Animated from "react-native-reanimated";

import type { ActivateFabStyles } from "./activateFabStyles";

type AnimatedViewStyle = NonNullable<
  ComponentProps<typeof Animated.View>["style"]
>;

export type ActivateInterestFabRipplesProps = {
  rippleEchoStyle: AnimatedViewStyle;
  rippleStyle: AnimatedViewStyle;
  rippleWashStyle: AnimatedViewStyle;
  styles: ActivateFabStyles;
};

export const ActivateInterestFabRipples = ({
  rippleEchoStyle,
  rippleStyle,
  rippleWashStyle,
  styles,
}: ActivateInterestFabRipplesProps) => (
  <>
    <Animated.View
      pointerEvents="none"
      style={[styles.rippleWash, rippleWashStyle]}
    />
    <Animated.View
      pointerEvents="none"
      style={[styles.rippleEcho, rippleEchoStyle]}
    />
    <Animated.View pointerEvents="none" style={[styles.ripple, rippleStyle]} />
  </>
);
