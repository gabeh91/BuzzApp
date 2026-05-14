import type { SharedValue } from "react-native-reanimated";

import type { BuzzInterest } from "../interestFlow";

export type ActivateFabMode =
  | "idle"
  | "wheel_open"
  | "activity_selected"
  | "charging"
  | "ready_to_release"
  | "released"
  | "collapsing";

export type ActivateInterestFabProps = {
  accessibilityHint?: string;
  accessibilityLabel: string;
  activationBusy?: boolean;
  bottomInset: number;
  disabled?: boolean;
  interests: BuzzInterest[];
  onActivateSelectedInterest: () => Promise<void> | void;
  onActivitiesEmptyActivationPress?: () => void;
  onClearSelectedInterest: () => void;
  onSelectInterest: (interest: BuzzInterest) => void;
  selectedInterest: BuzzInterest | null;
  skipActivityWheel?: boolean;
  /** Mirrored to morph progress (0 docked … 1 expanded) for tab bar center slot. */
  tabBarDockClearProgress?: SharedValue<number>;
};
