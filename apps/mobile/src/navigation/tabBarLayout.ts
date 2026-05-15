import type { BuzzTheme } from "@/theme/tokens";

/** Shell height of `AnimatedBubbleTabBar` above the home-indicator padding band. */
export const TAB_BAR_CORE_HEIGHT = 82;

export const tabBarHomeIndicatorPadding = (
  theme: BuzzTheme,
  bottomInset: number,
) => Math.max(bottomInset, theme.spacing[2]);

/** Matches `AnimatedBubbleTabBar` total height (for scroll/list bottom inset). */
export const tabBarTotalHeight = (theme: BuzzTheme, bottomInset: number) =>
  TAB_BAR_CORE_HEIGHT + tabBarHomeIndicatorPadding(theme, bottomInset);
