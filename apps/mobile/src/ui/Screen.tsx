import type { ReactNode } from "react";
import { useContext, useMemo } from "react";
import {
  Platform,
  ScrollView,
  type ScrollViewProps,
  StyleSheet,
  View,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from "react-native";
import {
  Edge,
  SafeAreaInsetsContext,
  SafeAreaView,
} from "react-native-safe-area-context";

import { useBuzzTheme } from "@/theme/ThemeProvider";
import { SCREEN_CONTENT_GUTTER_SPACING, type BuzzTheme } from "@/theme/tokens";

type ScreenProps = ViewProps & {
  contentStyle?: StyleProp<ViewStyle>;
  scroll?: boolean;
  stickyHeader?: ReactNode;
  style?: StyleProp<ViewStyle>;
  edges?: Edge[];
  refreshControl?: ScrollViewProps["refreshControl"];
};

export const Screen = ({
  children,
  contentStyle,
  scroll = true,
  stickyHeader,
  style,
  edges = ["top", "bottom"],
  refreshControl,
  ...viewProps
}: ScreenProps) => {
  const { theme } = useBuzzTheme();
  const styles = createStyles(theme);
  const contextInsets = useContext(SafeAreaInsetsContext);
  const insets = contextInsets ?? { top: 0, left: 0, right: 0, bottom: 0 };

  const safeAreaEdges = useMemo(
    () => (stickyHeader ? edges.filter((edge) => edge !== "top") : edges),
    [edges, stickyHeader],
  );

  const stickySlotStyle = useMemo(
    () => [
      styles.stickySlot,
      {
        paddingTop:
          insets.top + theme.spacing[SCREEN_CONTENT_GUTTER_SPACING],
      },
    ],
    [insets.top, styles.stickySlot, theme.spacing],
  );

  const scrollContentStyle = [
    styles.content,
    stickyHeader ? styles.contentBelowSticky : null,
    contentStyle,
  ];

  const nonScrollStyle = [
    styles.content,
    stickyHeader ? styles.contentBelowSticky : null,
    contentStyle,
    styles.nonScrollRoot,
    stickyHeader ? styles.nonScrollBody : null,
    stickyHeader ? styles.clipScrollBody : null,
  ];

  return (
    <SafeAreaView style={[styles.screen, style]} edges={safeAreaEdges}>
      {stickyHeader ? (
        <View style={stickySlotStyle}>{stickyHeader}</View>
      ) : null}
      {scroll ? (
        <ScrollView
          contentContainerStyle={scrollContentStyle}
          refreshControl={refreshControl}
          style={styles.scrollRoot}
          {...viewProps}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={nonScrollStyle} {...viewProps}>
          {children}
        </View>
      )}
    </SafeAreaView>
  );
};

const createStyles = (theme: BuzzTheme) => {
  const { colors, spacing } = theme;

  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    stickySlot: {
      backgroundColor: colors.background,
      elevation: Platform.OS === "android" ? 0 : 10,
      paddingHorizontal: spacing[SCREEN_CONTENT_GUTTER_SPACING],
      position: "relative",
      zIndex: 10,
    },
    clipScrollBody: {
      overflow: "hidden",
    },
    scrollRoot: {
      flex: 1,
      overflow: "visible",
      zIndex: 0,
    },
    nonScrollRoot: {
      overflow: "visible",
    },
    nonScrollBody: {
      flex: 1,
      zIndex: 0,
    },
    content: {
      flexGrow: 1,
      gap: spacing[5],
      paddingBottom: 0,
      paddingHorizontal: spacing[SCREEN_CONTENT_GUTTER_SPACING],
      paddingTop: spacing[SCREEN_CONTENT_GUTTER_SPACING],
    },
    contentBelowSticky: {
      paddingTop: 0,
    },
  });
};
