import type { ReactNode } from "react";
import type { ViewProps } from "react-native";
import {
  SegmentedTabs,
  type SegmentedTabsMode,
  type SegmentedTabSpec,
} from "./SegmentedTabs";

export type SegmentedTwoTabsValue = "left" | "right";

export type SegmentedTwoTabSpec = Omit<
  SegmentedTabSpec<SegmentedTwoTabsValue>,
  "value"
> & {
  icon?: ReactNode;
};

export type SegmentedTwoTabsProps = Omit<ViewProps, "children"> & {
  value: SegmentedTwoTabsValue;
  onChange: (next: SegmentedTwoTabsValue) => void;
  left: SegmentedTwoTabSpec;
  right: SegmentedTwoTabSpec;
  /** Optional pager progress from gestures (0 = left, 1 = right). */
  dragProgress?: number;
  mode?: SegmentedTabsMode;
  testID?: string;
};

export const SegmentedTwoTabs = ({
  value,
  onChange,
  left,
  right,
  dragProgress,
  mode = "label",
  testID,
  style,
  ...viewProps
}: SegmentedTwoTabsProps) => {
  const items = [
    { ...left, value: "left" as const },
    { ...right, value: "right" as const },
  ] as const;

  return (
    <SegmentedTabs
      {...viewProps}
      items={items}
      onChange={onChange}
      style={style}
      value={value}
      {...(testID === undefined ? {} : { testID })}
      {...(mode === undefined ? {} : { mode })}
      {...(dragProgress === undefined ? {} : { dragProgress })}
    />
  );
};
