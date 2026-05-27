type ClosestSettledScrollSnapOffsetInput = {
  currentOffset: number;
  itemOffsets: readonly number[];
  maxOffset: number;
  threshold: number;
};

type SettledScrollNativeMetrics = {
  contentOffset: {
    y: number;
  };
  contentSize: {
    height: number;
  };
  layoutMeasurement: {
    height: number;
  };
};

export type SettledScrollSnapMetrics = {
  currentOffset: number;
  maxOffset: number;
};

type MeasuredItemSnapOffsetsInput = {
  itemGap?: number;
  itemHeights: readonly (number | undefined)[];
  leadingOffset?: number;
};

export const settledScrollSnapMetricsFromNativeEvent = ({
  contentOffset,
  contentSize,
  layoutMeasurement,
}: SettledScrollNativeMetrics): SettledScrollSnapMetrics => ({
  currentOffset: contentOffset.y,
  maxOffset: Math.max(0, contentSize.height - layoutMeasurement.height),
});

export const measuredItemSnapOffsets = ({
  itemGap = 0,
  itemHeights,
  leadingOffset = 0,
}: MeasuredItemSnapOffsetsInput): number[] => {
  const offsets: number[] = [];
  let nextOffset = leadingOffset;

  for (const height of itemHeights) {
    if (height === undefined) {
      break;
    }

    offsets.push(nextOffset);
    nextOffset += height + itemGap;
  }

  return offsets;
};

export const closestSettledScrollSnapOffset = ({
  currentOffset,
  itemOffsets,
  maxOffset,
  threshold,
}: ClosestSettledScrollSnapOffsetInput): number | null => {
  if (itemOffsets.length === 0) return null;

  const boundedCurrentOffset = Math.max(0, Math.min(currentOffset, maxOffset));
  const firstItemOffset = Math.max(0, Math.min(itemOffsets[0] ?? 0, maxOffset));

  if (boundedCurrentOffset < firstItemOffset) {
    return null;
  }

  let closestOffset = itemOffsets[0] ?? 0;
  let closestDistance = Math.abs(boundedCurrentOffset - closestOffset);

  for (const offset of itemOffsets) {
    const boundedOffset = Math.max(0, Math.min(offset, maxOffset));
    const distance = Math.abs(boundedCurrentOffset - boundedOffset);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestOffset = boundedOffset;
    }
  }

  if (closestDistance <= threshold) {
    return null;
  }

  return Math.max(0, Math.min(closestOffset, maxOffset));
};
