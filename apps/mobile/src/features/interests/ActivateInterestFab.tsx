import { View } from "react-native";

import { ActivateInterestFabDock } from "./activateFab/ActivateInterestFabDock";
import { ActivateInterestFabRipples } from "./activateFab/ActivateInterestFabRipples";
import { ActivateInterestFabWheel } from "./activateFab/ActivateInterestFabWheel";
import type {
  ActivateFabMode,
  ActivateInterestFabProps,
} from "./activateFab/ActivateInterestFab.types";
import { useActivateInterestFabController } from "./activateFab/useActivateInterestFabController";

export type { ActivateFabMode, ActivateInterestFabProps } from "./activateFab/ActivateInterestFab.types";

export { useActivateInterestFabController } from "./activateFab/useActivateInterestFabController";

export const ActivateInterestFab = (props: ActivateInterestFabProps) => {
  const { dock, isWheelOpen, ripples, styles, wheel } =
    useActivateInterestFabController(props);

  return (
    <View pointerEvents={isWheelOpen ? "auto" : "box-none"} style={styles.root}>
      <ActivateInterestFabWheel {...wheel} />
      <ActivateInterestFabRipples {...ripples} />
      <ActivateInterestFabDock {...dock} />
    </View>
  );
};
