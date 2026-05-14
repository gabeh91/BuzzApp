import { Extrapolate, interpolate } from "react-native-reanimated";

import {
  MORPH_LIFT_END,
  MORPH_SPREAD_START,
} from "./activateFabMorphConfig";

/**
 * Mirrors the UI-thread spread curve (for tests and documentation).
 * `mc` is morph progress in [0, 1].
 */
export function computeMorphSpreadBlend(mc: number): number {
  const t = Math.max(0, Math.min(1, mc));
  const spreadRaw = Math.max(
    0,
    Math.min(1, (t - MORPH_SPREAD_START) / (1 - MORPH_SPREAD_START)),
  );
  return Math.sin((spreadRaw * Math.PI) / 2);
}

export function morphSpreadBlend(mc: number): number {
  "worklet";
  const spreadRaw = interpolate(
    mc,
    [MORPH_SPREAD_START, 1],
    [0, 1],
    Extrapolate.CLAMP,
  );
  return Math.sin((spreadRaw * Math.PI) / 2);
}

export function morphLiftBottom(
  mc: number,
  compactBottom: number,
  expandedBottom: number,
): number {
  "worklet";
  const liftT = Math.min(1, mc / MORPH_LIFT_END);
  const liftEased = 1 - Math.cos((liftT * Math.PI) / 2);
  const bottomBlend = mc >= MORPH_LIFT_END ? 1 : liftEased;
  return (
    compactBottom + (expandedBottom - compactBottom) * bottomBlend
  );
}
