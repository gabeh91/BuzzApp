import { SCREEN_CONTENT_GUTTER_SPACING, type BuzzTheme } from "@/theme/tokens";

type DiscoverFeedItemMaxHeightParams = {
  bottomChromeHeight: number;
  theme: BuzzTheme;
  topInset: number;
  windowHeight: number;
};

export const getDiscoverFeedItemMaxHeight = ({
  bottomChromeHeight,
  theme,
  topInset,
  windowHeight,
}: DiscoverFeedItemMaxHeightParams) => {
  const appHeaderHeight =
    topInset +
    theme.spacing[SCREEN_CONTENT_GUTTER_SPACING] +
    theme.lineHeights.hero;
  const pinnedTabsHeight = theme.spacing[10] + theme.spacing[3];

  return Math.max(
    0,
    windowHeight - appHeaderHeight - pinnedTabsHeight - bottomChromeHeight,
  );
};
