import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import {
  PanResponder,
  type GestureResponderEvent,
  type GestureResponderHandlers,
  type LayoutChangeEvent,
  type PanResponderGestureState,
} from "react-native";
import {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type UseSegmentedTabSwipeInput<TTab extends string> = {
  tabOrder: readonly TTab[];
  activeTab: TTab;
  setActiveTab: Dispatch<SetStateAction<TTab>>;
  swipeThresholdRatio?: number;
  swipeVelocityThreshold?: number;
  settleDurationMs?: number;
};

type UseSegmentedTabSwipeOutput = {
  tabDragProgress: number | undefined;
  contentDragStyle: ReturnType<typeof useAnimatedStyle>;
  contentPanHandlers: GestureResponderHandlers;
  onContentLayout: (event: LayoutChangeEvent) => void;
};

export const useSegmentedTabSwipe = <TTab extends string>({
  tabOrder,
  activeTab,
  setActiveTab,
  swipeThresholdRatio = 0.18,
  swipeVelocityThreshold = 0.35,
  settleDurationMs = 180,
}: UseSegmentedTabSwipeInput<TTab>): UseSegmentedTabSwipeOutput => {
  const [tabDragProgress, setTabDragProgress] = useState<number | undefined>(
    undefined,
  );
  const [contentWidth, setContentWidth] = useState(0);
  const contentDragX = useSharedValue(0);

  const contentDragStyle = useAnimatedStyle(() => ({
    opacity: 1 - Math.min(Math.abs(contentDragX.value) / 720, 0.08),
    transform: [{ translateX: contentDragX.value * 0.18 }],
  }));

  const onContentLayout = (event: LayoutChangeEvent) => {
    setContentWidth(event.nativeEvent.layout.width);
  };

  const onMoveShouldSetPanResponder = (
    _: GestureResponderEvent,
    gestureState: PanResponderGestureState,
  ) =>
    Math.abs(gestureState.dx) > 8 &&
    Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.2;

  const contentPanResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder,
        onPanResponderMove: (_, gestureState) => {
          if (contentWidth <= 0) {
            return;
          }

          const baseIndex = tabOrder.indexOf(activeTab);
          if (baseIndex < 0) {
            return;
          }

          const nextProgress = Math.max(
            0,
            Math.min(tabOrder.length - 1, baseIndex - gestureState.dx / contentWidth),
          );

          contentDragX.value = gestureState.dx;
          setTabDragProgress(nextProgress);
        },
        onPanResponderRelease: (_, gestureState) => {
          const baseIndex = tabOrder.indexOf(activeTab);
          if (baseIndex < 0) {
            return;
          }

          const ratio = contentWidth > 0 ? gestureState.dx / contentWidth : 0;
          const shouldSwitch =
            Math.abs(ratio) >= swipeThresholdRatio ||
            Math.abs(gestureState.vx) >= swipeVelocityThreshold;

          const nextIndex = shouldSwitch
            ? Math.max(
                0,
                Math.min(
                  tabOrder.length - 1,
                  baseIndex - Math.sign(ratio || gestureState.vx),
                ),
              )
            : baseIndex;

          const nextTab = tabOrder[nextIndex];
          if (nextTab) {
            setActiveTab(nextTab);
          }
          setTabDragProgress(undefined);
          contentDragX.value = withTiming(0, {
            duration: settleDurationMs,
            easing: Easing.out(Easing.cubic),
          });
        },
        onPanResponderTerminate: () => {
          setTabDragProgress(undefined);
          contentDragX.value = withTiming(0, {
            duration: settleDurationMs,
            easing: Easing.out(Easing.cubic),
          });
        },
      }),
    [
      activeTab,
      contentDragX,
      contentWidth,
      setActiveTab,
      settleDurationMs,
      swipeThresholdRatio,
      swipeVelocityThreshold,
      tabOrder,
    ],
  );

  return {
    contentDragStyle,
    contentPanHandlers: contentPanResponder.panHandlers,
    onContentLayout,
    tabDragProgress,
  };
};
