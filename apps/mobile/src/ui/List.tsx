import {
  FlashList,
  type FlashListProps,
  type ListRenderItem,
} from "@shopify/flash-list";
import {
  forwardRef,
  type ElementRef,
  type ForwardedRef,
  useMemo,
  type ReactElement,
} from "react";
import { View, type ViewStyle } from "react-native";

import { useBuzzTheme } from "@/theme/ThemeProvider";
import type { BuzzTheme } from "@/theme/tokens";

type ListGap = keyof BuzzTheme["spacing"] | number;

export type ListProps<TItem> = FlashListProps<TItem> & {
  itemGap?: ListGap;
};

export type { ListRenderItem };

const resolveGap = (theme: BuzzTheme, gap: ListGap | undefined) => {
  if (typeof gap === "number") {
    return gap;
  }

  return gap === undefined ? 0 : theme.spacing[gap];
};

function ListInner<TItem>(
  {
    horizontal,
    itemGap,
    ItemSeparatorComponent,
    showsHorizontalScrollIndicator,
    showsVerticalScrollIndicator,
    ...props
  }: ListProps<TItem>,
  ref: ForwardedRef<ElementRef<typeof FlashList<TItem>>> | null,
) {
  const { theme } = useBuzzTheme();
  const resolvedGap = resolveGap(theme, itemGap);

  const GapSeparatorComponent = useMemo(() => {
    if (ItemSeparatorComponent || resolvedGap <= 0) {
      return ItemSeparatorComponent;
    }

    const separatorStyle: ViewStyle = horizontal
      ? { width: resolvedGap }
      : { height: resolvedGap };

    return function ListGapSeparator() {
      return <View style={separatorStyle} />;
    };
  }, [ItemSeparatorComponent, horizontal, resolvedGap]);

  return (
    <FlashList<TItem>
      ref={ref}
      horizontal={horizontal}
      ItemSeparatorComponent={GapSeparatorComponent}
      showsHorizontalScrollIndicator={showsHorizontalScrollIndicator ?? false}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator ?? false}
      {...props}
    />
  );
}

export const List = forwardRef(ListInner) as <TItem>(
  props: ListProps<TItem> & {
    ref?: ForwardedRef<ElementRef<typeof FlashList<TItem>>> | null;
  },
) => ReactElement | null;
