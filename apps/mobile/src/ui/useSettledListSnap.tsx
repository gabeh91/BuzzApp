import type { ListRenderItem } from "@shopify/flash-list";
import {
  createElement,
  isValidElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type ComponentType,
  type ReactElement,
} from "react";
import {
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";

import {
  closestSettledScrollSnapOffset,
  measuredItemSnapOffsets,
  settledScrollSnapMetricsFromNativeEvent,
  type SettledScrollSnapMetrics,
} from "./listSnap";

type ListScrollHandle = {
  scrollToOffset: (params: { animated?: boolean; offset: number }) => void;
};

type UseSettledListSnapInput<TItem> = {
  data: readonly TItem[];
  horizontal: boolean | null | undefined;
  itemGap: number;
  hasItemSeparator: boolean;
  inverted: boolean | null | undefined;
  listRef: React.MutableRefObject<ListScrollHandle | null>;
  ListHeaderComponent:
    | React.ComponentType<unknown>
    | ReactElement
    | null
    | undefined;
  onMomentumScrollBegin:
    | ((event: NativeSyntheticEvent<NativeScrollEvent>) => void)
    | undefined;
  onMomentumScrollEnd:
    | ((event: NativeSyntheticEvent<NativeScrollEvent>) => void)
    | undefined;
  onScrollEndDrag:
    | ((event: NativeSyntheticEvent<NativeScrollEvent>) => void)
    | undefined;
  renderItem: ListRenderItem<TItem> | null | undefined;
  resolveItemKey: (item: TItem, index: number) => string;
  scrollEnabled: boolean | null | undefined;
  scrollSettledSnapDelayMs: number;
  scrollSettledSnapThreshold: number;
  snapToClosestItemOnScrollSettled: boolean | undefined;
};

export const useSettledListSnap = <TItem,>({
  data,
  horizontal,
  itemGap,
  hasItemSeparator,
  inverted,
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
}: UseSettledListSnapInput<TItem>) => {
  const headerHeightRef = useRef(0);
  const headerMeasuredRef = useRef(!ListHeaderComponent);
  const itemHeightsRef = useRef(new Map<string, number>());
  const pendingSnapMetricsRef = useRef<SettledScrollSnapMetrics | null>(null);
  const previousDataRef = useRef(data);
  const previousListHeaderComponentRef = useRef(ListHeaderComponent);
  const settleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const snapEnabled =
    scrollEnabled !== false &&
    (snapToClosestItemOnScrollSettled ?? (!horizontal && !inverted));

  if (previousDataRef.current !== data) {
    previousDataRef.current = data;
    itemHeightsRef.current.clear();
    pendingSnapMetricsRef.current = null;
  }

  if (previousListHeaderComponentRef.current !== ListHeaderComponent) {
    previousListHeaderComponentRef.current = ListHeaderComponent;
    headerHeightRef.current = 0;
    headerMeasuredRef.current = !ListHeaderComponent;
    pendingSnapMetricsRef.current = null;
  }

  const clearSettleTimeout = useCallback(() => {
    if (settleTimeoutRef.current) {
      clearTimeout(settleTimeoutRef.current);
      settleTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => clearSettleTimeout, [clearSettleTimeout]);

  const snapToClosestMeasuredItem = useCallback(
    (snapMetrics: SettledScrollSnapMetrics) => {
      if (!snapEnabled || horizontal) return;

      if (data.length === 0) {
        pendingSnapMetricsRef.current = null;
        return;
      }

      const itemHeights = data.map((item, index) =>
        itemHeightsRef.current.get(resolveItemKey(item, index)),
      );
      const headerReady = !ListHeaderComponent || headerMeasuredRef.current;

      if (!headerReady || itemHeights[0] === undefined) {
        pendingSnapMetricsRef.current = snapMetrics;
        return;
      }

      const measuredItemOffsets = measuredItemSnapOffsets({
        itemGap: hasItemSeparator ? 0 : itemGap,
        itemHeights,
        leadingOffset: headerHeightRef.current,
      });
      if (measuredItemOffsets.length === 0) {
        pendingSnapMetricsRef.current = snapMetrics;
        return;
      }

      pendingSnapMetricsRef.current = null;
      const targetOffset = closestSettledScrollSnapOffset({
        currentOffset: snapMetrics.currentOffset,
        itemOffsets: measuredItemOffsets,
        maxOffset: snapMetrics.maxOffset,
        threshold: scrollSettledSnapThreshold,
      });

      if (targetOffset === null) return;

      listRef.current?.scrollToOffset({
        animated: true,
        offset: targetOffset,
      });
    },
    [
      data,
      hasItemSeparator,
      horizontal,
      itemGap,
      ListHeaderComponent,
      listRef,
      resolveItemKey,
      scrollSettledSnapThreshold,
      snapEnabled,
    ],
  );

  const flushPendingSnap = useCallback(() => {
    const snapMetrics = pendingSnapMetricsRef.current;
    if (!snapMetrics) return;

    pendingSnapMetricsRef.current = null;
    snapToClosestMeasuredItem(snapMetrics);
  }, [snapToClosestMeasuredItem]);

  const MeasuredListHeaderComponent = useMemo(() => {
    if (!ListHeaderComponent) return undefined;

    return function ListHeaderMeasurementWrapper() {
      const headerContent = isValidElement(ListHeaderComponent)
        ? ListHeaderComponent
        : createElement(ListHeaderComponent as ComponentType);

      if (!snapEnabled) {
        return headerContent;
      }

      return (
        <View
          collapsable={false}
          onLayout={(event) => {
            headerHeightRef.current = event.nativeEvent.layout.height;
            headerMeasuredRef.current = true;
            flushPendingSnap();
          }}
        >
          {headerContent}
        </View>
      );
    };
  }, [ListHeaderComponent, flushPendingSnap, snapEnabled]);

  const snappedRenderItem = useCallback<ListRenderItem<TItem>>(
    (info) => {
      if (!renderItem) return null;

      const renderedItem = renderItem(info);

      if (!snapEnabled || renderedItem === null) {
        return renderedItem;
      }

      return (
        <View
          collapsable={false}
          onLayout={(event) => {
            itemHeightsRef.current.set(
              resolveItemKey(info.item, info.index),
              event.nativeEvent.layout.height,
            );
            flushPendingSnap();
          }}
        >
          {renderedItem}
        </View>
      );
    },
    [flushPendingSnap, renderItem, resolveItemKey, snapEnabled],
  );

  const handleMomentumScrollBegin = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      clearSettleTimeout();
      onMomentumScrollBegin?.(event);
    },
    [clearSettleTimeout, onMomentumScrollBegin],
  );

  const handleMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      clearSettleTimeout();
      onMomentumScrollEnd?.(event);
      snapToClosestMeasuredItem(
        settledScrollSnapMetricsFromNativeEvent(event.nativeEvent),
      );
    },
    [clearSettleTimeout, onMomentumScrollEnd, snapToClosestMeasuredItem],
  );

  const handleScrollEndDrag = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      clearSettleTimeout();
      onScrollEndDrag?.(event);
      const snapMetrics = settledScrollSnapMetricsFromNativeEvent(
        event.nativeEvent,
      );

      settleTimeoutRef.current = setTimeout(() => {
        snapToClosestMeasuredItem(snapMetrics);
      }, scrollSettledSnapDelayMs);
    },
    [
      clearSettleTimeout,
      onScrollEndDrag,
      scrollSettledSnapDelayMs,
      snapToClosestMeasuredItem,
    ],
  );

  return {
    handleMomentumScrollBegin,
    handleMomentumScrollEnd,
    handleScrollEndDrag,
    MeasuredListHeaderComponent,
    snappedRenderItem,
  };
};
