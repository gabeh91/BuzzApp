import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  closestSettledScrollSnapOffset,
  measuredItemSnapOffsets,
  settledScrollSnapMetricsFromNativeEvent,
} from "../listSnap";

test("settled list snapping chooses the closest measured item top", () => {
  assert.equal(
    closestSettledScrollSnapOffset({
      currentOffset: 242,
      itemOffsets: [0, 180, 360],
      maxOffset: 500,
      threshold: 10,
    }),
    180,
  );
});

test("settled list snapping leaves nearly aligned offsets alone", () => {
  assert.equal(
    closestSettledScrollSnapOffset({
      currentOffset: 184,
      itemOffsets: [0, 180, 360],
      maxOffset: 500,
      threshold: 8,
    }),
    null,
  );
});

test("settled list snapping clamps targets to the scrollable range", () => {
  assert.equal(
    closestSettledScrollSnapOffset({
      currentOffset: 410,
      itemOffsets: [0, 240, 620],
      maxOffset: 420,
      threshold: 8,
    }),
    420,
  );
});

test("settled list snapping snapshots native event metrics before delayed snapping", () => {
  assert.deepEqual(
    settledScrollSnapMetricsFromNativeEvent({
      contentOffset: { y: 128 },
      contentSize: { height: 900 },
      layoutMeasurement: { height: 400 },
    }),
    {
      currentOffset: 128,
      maxOffset: 500,
    },
  );
});

test("settled list snapping derives absolute offsets from measured item heights", () => {
  assert.deepEqual(
    measuredItemSnapOffsets({
      itemHeights: [180, 220, 140],
      itemGap: 12,
    }),
    [0, 192, 424],
  );
});

test("settled list snapping uses the measured prefix of a virtualized list", () => {
  assert.deepEqual(
    measuredItemSnapOffsets({
      itemHeights: [180, 220, undefined, undefined],
      itemGap: 12,
      leadingOffset: 96,
    }),
    [96, 288],
  );
});

test("settled list snapping leaves header space alone before the first item", () => {
  assert.equal(
    closestSettledScrollSnapOffset({
      currentOffset: 48,
      itemOffsets: [96, 288],
      maxOffset: 500,
      threshold: 8,
    }),
    null,
  );
});

test("shared List snaps only from settled scroll events", () => {
  const listSource = readFileSync("src/ui/List.tsx", "utf8");
  const hookSource = readFileSync("src/ui/useSettledListSnap.tsx", "utf8");

  assert.match(listSource, /useSettledListSnap/);
  assert.doesNotMatch(listSource, /closestSettledScrollSnapOffset/);
  assert.match(hookSource, /onMomentumScrollEnd/);
  assert.match(hookSource, /onScrollEndDrag/);
  assert.match(hookSource, /setTimeout/);
  assert.match(hookSource, /scrollToOffset/);
  assert.match(hookSource, /closestSettledScrollSnapOffset/);
  assert.match(hookSource, /measuredItemSnapOffsets/);
  assert.match(hookSource, /snapToClosestItemOnScrollSettled/);
  assert.match(hookSource, /event\.nativeEvent\.layout\.height/);
  assert.doesNotMatch(hookSource, /event\.nativeEvent\.layout\.y/);
  assert.doesNotMatch(
    hookSource,
    /itemHeights\.some\(\(height\) => height === undefined\)/,
  );
  assert.doesNotMatch(
    hookSource,
    /useEffect\(\(\) => \{\s*itemHeightsRef\.current\.clear\(\);/,
  );
  assert.match(hookSource, /previousDataRef\.current !== data/);
  assert.match(
    hookSource,
    /const snapMetrics = settledScrollSnapMetricsFromNativeEvent\(\s*event\.nativeEvent,\s*\)/,
  );
  assert.doesNotMatch(
    hookSource,
    /setTimeout\(\(\) => \{\s*snapToClosestMeasuredItem\(event\)/,
  );
});

test("settled list snapping retries once initial row measurements arrive", () => {
  const hookSource = readFileSync("src/ui/useSettledListSnap.tsx", "utf8");

  assert.match(hookSource, /pendingSnapMetricsRef/);
  assert.match(hookSource, /flushPendingSnap/);
  assert.match(hookSource, /pendingSnapMetricsRef\.current = snapMetrics/);
  assert.match(hookSource, /pendingSnapMetricsRef\.current = null/);
  assert.match(
    hookSource,
    /onLayout=\{\(event\) => \{[\s\S]*flushPendingSnap\(\)/,
  );
});

test("settled list snapping preserves measured header across data swaps", () => {
  const hookSource = readFileSync("src/ui/useSettledListSnap.tsx", "utf8");

  assert.match(hookSource, /previousListHeaderComponentRef/);
  assert.match(
    hookSource,
    /if \(previousDataRef\.current !== data\) \{\s*previousDataRef\.current = data;\s*itemHeightsRef\.current\.clear\(\);\s*pendingSnapMetricsRef\.current = null;\s*\}/,
  );
  assert.match(
    hookSource,
    /if \(previousListHeaderComponentRef\.current !== ListHeaderComponent\) \{[\s\S]*headerMeasuredRef\.current = !ListHeaderComponent/,
  );
});
