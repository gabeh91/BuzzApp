/** Vertical stretch + translate complete before lateral spread (must be < MORPH_SPREAD_START). */
export const MORPH_LIFT_END = 0.38;
/** Width / horizontal chrome only ramp after the shell has lifted clear of tab icons. */
export const MORPH_SPREAD_START = 0.44;

export const MORPH_SPRING_EXPAND = {
  stiffness: 142,
  damping: 16,
  mass: 0.92,
  overshootClamping: true,
  restDisplacementThreshold: 0.008,
  restSpeedThreshold: 0.008,
} as const;

export const MORPH_SPRING_COLLAPSE = {
  stiffness: 188,
  damping: 22,
  mass: 0.86,
  overshootClamping: true,
  restDisplacementThreshold: 0.01,
  restSpeedThreshold: 0.01,
} as const;
