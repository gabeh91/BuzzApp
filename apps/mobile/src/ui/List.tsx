import {
  FlashList,
  type FlashListProps,
  type ListRenderItem,
} from "@shopify/flash-list";
import {
  forwardRef,
  type ElementRef,
  type ForwardedRef,
  useCallback,
  useMemo,
  useRef,
  type ReactElement,
} from "react";
import { View, type ViewStyle } from "react-native";

import { useBuzzTheme } from "@/theme/ThemeProvider";
import type { BuzzTheme } from "@/theme/tokens";
import { useSettledListSnap } from "./useSettledListSnap";

type ListGap = keyof BuzzTheme["spacing"] | number;
type FlashListScrollHandle = {
  scrollToOffset: (params: { animated?: boolean; offset: number }) => void;
};

export type ListProps<TItem> = FlashListProps<TItem> & {
  itemGap?: ListGap;
  snapToClosestItemOnScrollSettled?: boolean;
  scrollSettledSnapDelayMs?: number;
  scrollSettledSnapThreshold?: number;
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
    keyExtractor,
    ListHeaderComponent,
    onMomentumScrollBegin,
    onMomentumScrollEnd,
    onScrollEndDrag,
    renderItem,
    scrollEnabled,
    scrollSettledSnapDelayMs = 140,
    scrollSettledSnapThreshold = 12,
    showsHorizontalScrollIndicator,
    showsVerticalScrollIndicator,
    snapToClosestItemOnScrollSettled,
    style,
    ...props
  }: ListProps<TItem>,
  ref: ForwardedRef<ElementRef<typeof FlashList<TItem>>> | null,
) {
  const { theme } = useBuzzTheme();
  const resolvedGap = resolveGap(theme, itemGap);
  const listRef = useRef<FlashListScrollHandle | null>(null);
  const listData = useMemo(() => props.data ?? [], [props.data]);

  const setListRef = useCallback(
    (node: ElementRef<typeof FlashList<TItem>> | null) => {
      listRef.current = node as FlashListScrollHandle | null;

      if (typeof ref === "function") {
        ref(node);
        return;
      }

      if (ref) {
        ref.current = node;
      }
    },
    [ref],
  );

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

  const resolveItemKey = useCallback(
    (item: TItem, index: number) =>
      keyExtractor ? keyExtractor(item, index) : String(index),
    [keyExtractor],
  );

  const {
    handleMomentumScrollBegin,
    handleMomentumScrollEnd,
    handleScrollEndDrag,
    MeasuredListHeaderComponent,
    snappedRenderItem,
  } = useSettledListSnap<TItem>({
    data: listData,
    hasItemSeparator: Boolean(ItemSeparatorComponent),
    horizontal,
    inverted: props.inverted,
    itemGap: resolvedGap,
    listRef,
    ListHeaderComponent,
    onMomentumScrollBegin,
    onMomentumScrollEnd,
    onScrollEndDrag,
    renderItem,
    resolveItemKey,
    scrollEnabled,
    scrollSettledSnapDelayMs,
    scrollSettledSnapThreshold,
    snapToClosestItemOnScrollSettled,
  });

  return (
    <FlashList<TItem>
      ref={setListRef}
      horizontal={horizontal}
      ItemSeparatorComponent={GapSeparatorComponent}
      keyExtractor={keyExtractor}
      ListHeaderComponent={MeasuredListHeaderComponent}
      onMomentumScrollBegin={handleMomentumScrollBegin}
      onMomentumScrollEnd={handleMomentumScrollEnd}
      onScrollEndDrag={handleScrollEndDrag}
      renderItem={snappedRenderItem}
      scrollEnabled={scrollEnabled}
      showsHorizontalScrollIndicator={showsHorizontalScrollIndicator ?? false}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator ?? false}
      style={[style, { overflow: "visible" }]}
      {...props}
    />
  );
}

export const List = forwardRef(ListInner) as <TItem>(
  props: ListProps<TItem> & {
    ref?: ForwardedRef<ElementRef<typeof FlashList<TItem>>> | null;
  },
) => ReactElement | null;
