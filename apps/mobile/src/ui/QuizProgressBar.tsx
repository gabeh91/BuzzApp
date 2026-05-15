import { useEffect, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { useBuzzTheme } from "@/theme/ThemeProvider";
import type { BuzzTheme } from "@/theme/tokens";

import { Text as UiText } from "./Text";

export type QuizProgressBarProps = {
  current: number;
  label: string;
  total: number;
};

export const QuizProgressBar = ({ current, label, total }: QuizProgressBarProps) => {
  const { theme } = useBuzzTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const progress = useSharedValue(total > 0 ? current / total : 0);

  useEffect(() => {
    progress.value = withTiming(total > 0 ? current / total : 0, {
      duration: 260,
      easing: Easing.out(Easing.cubic),
    });
  }, [current, progress, total]);

  const progressFillStyle = useAnimatedStyle(() => ({
    width: `${Math.min(Math.max(progress.value, 0), 1) * 100}%`,
  }));

  return (
    <View style={styles.progressGroup}>
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, progressFillStyle]} />
      </View>
      <UiText style={styles.progressLabel}>{label}</UiText>
    </View>
  );
};

const createStyles = (theme: BuzzTheme) => {
  const { colors, fontSizes, radii, spacing } = theme;

  return StyleSheet.create({
    progressFill: {
      backgroundColor: colors.accent,
      borderRadius: radii.full,
      height: "100%",
    },
    progressGroup: {
      gap: spacing[2],
    },
    progressLabel: {
      color: colors.textMuted,
      fontSize: fontSizes.xs,
      letterSpacing: 1.2,
      textTransform: "uppercase",
    },
    progressTrack: {
      backgroundColor: colors.overlay,
      borderRadius: radii.full,
      height: spacing[2],
      overflow: "hidden",
    },
  });
};
