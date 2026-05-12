import { useEffect, useRef } from "react";
import { Text, View } from "react-native";
import Animated, {
  Easing,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { useI18n } from "@/i18n/I18nProvider";

import { useOnboardingTheme } from "./OnboardingTheme";

const useAmbientMotion = (scrollY: SharedValue<number>) => {
  const ambient = useSharedValue(0);

  useEffect(() => {
    ambient.value = withRepeat(
      withSequence(
        withTiming(1, {
          duration: 3600,
          easing: Easing.inOut(Easing.sin),
        }),
        withTiming(0, {
          duration: 3600,
          easing: Easing.inOut(Easing.sin),
        }),
      ),
      -1,
      false,
    );
  }, [ambient]);

  const skyStyle = useAnimatedStyle(() => {
    const skyParallaxY = scrollY.value * 0.34;

    return {
      transform: [
        {
          translateX: -18 * ambient.value,
        },
        {
          translateY: 16 * ambient.value - skyParallaxY,
        },
      ],
    };
  });

  const goldStyle = useAnimatedStyle(() => {
    const goldParallaxY = scrollY.value * 0.18;

    return {
      transform: [
        {
          translateX: 22 * ambient.value,
        },
        {
          translateY: -14 * ambient.value - goldParallaxY,
        },
      ],
    };
  });

  return {
    skyStyle,
    goldStyle,
  };
};

export const useContentSlideTransition = (transitionIndex: number) => {
  const previousIndex = useRef(transitionIndex);
  const translateX = useSharedValue(0);

  useEffect(() => {
    const direction = transitionIndex >= previousIndex.current ? 1 : -1;
    previousIndex.current = transitionIndex;
    translateX.value = direction * 34;
    translateX.value = withTiming(0, {
      duration: 240,
      easing: Easing.out(Easing.cubic),
    });
  }, [previousIndex, transitionIndex, translateX]);

  const cardStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: translateX.value,
        },
      ],
    };
  });

  return {
    cardStyle,
  };
};

const useAnimatedProgress = (current: number, total: number) => {
  const progress = useSharedValue(total > 0 ? current / total : 0);

  useEffect(() => {
    progress.value = withTiming(total > 0 ? current / total : 0, {
      duration: 260,
      easing: Easing.out(Easing.cubic),
    });
  }, [current, progress, total]);

  const progressFillStyle = useAnimatedStyle(() => {
    return {
      width: `${Math.min(Math.max(progress.value, 0), 1) * 100}%`,
    };
  });

  return {
    progressFillStyle,
  };
};

const useHeaderProgressTransition = (isQuizStep: boolean) => {
  const quizMode = useSharedValue(isQuizStep ? 1 : 0);

  useEffect(() => {
    quizMode.value = withTiming(isQuizStep ? 1 : 0, {
      duration: 260,
      easing: Easing.out(Easing.cubic),
    });
  }, [isQuizStep, quizMode]);

  const flowProgressStyle = useAnimatedStyle(() => {
    return {
      opacity: 1 - quizMode.value,
      transform: [
        {
          translateY: -12 * quizMode.value,
        },
      ],
    };
  });

  const quizProgressStyle = useAnimatedStyle(() => {
    return {
      opacity: quizMode.value,
      transform: [
        {
          translateY: 12 * (1 - quizMode.value),
        },
      ],
    };
  });

  return {
    flowProgressStyle,
    quizProgressStyle,
  };
};

type ProgressBarProps = {
  current: number;
  total: number;
  label: string;
};

const ProgressBar = ({ current, total, label }: ProgressBarProps) => {
  const { styles } = useOnboardingTheme();
  const { progressFillStyle } = useAnimatedProgress(current, total);

  return (
    <View style={styles.progressGroup}>
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, progressFillStyle]} />
      </View>
      <Text style={styles.progressLabel}>{label}</Text>
    </View>
  );
};

export const AmbientBackground = ({
  scrollY,
}: {
  scrollY: SharedValue<number>;
}) => {
  const { styles } = useOnboardingTheme();
  const transition = useAmbientMotion(scrollY);

  return (
    <View pointerEvents="none" style={styles.ambientRoot}>
      <Animated.View style={[styles.ambientSky, transition.skyStyle]} />
      <Animated.View style={[styles.ambientGold, transition.goldStyle]} />
    </View>
  );
};

export const FixedOnboardingHeader = ({
  cityName,
  flowProgress,
  quizProgress,
}: {
  cityName: string;
  flowProgress: { current: number; total: number };
  quizProgress: { current: number; total: number } | undefined;
}) => {
  const { styles } = useOnboardingTheme();
  const { LL } = useI18n();
  const isQuizStep = Boolean(quizProgress);
  const lastQuizProgress = useRef(quizProgress);
  const { flowProgressStyle, quizProgressStyle } =
    useHeaderProgressTransition(isQuizStep);

  useEffect(() => {
    if (quizProgress) {
      lastQuizProgress.current = quizProgress;
    }
  }, [quizProgress]);

  const visibleQuizProgress = quizProgress ?? lastQuizProgress.current;
  const flowProgressLabel = LL.common.progress.step({
    current: flowProgress.current,
    total: flowProgress.total,
  });
  const quizProgressLabel = visibleQuizProgress
    ? LL.common.progress.question({
        current: visibleQuizProgress.current,
        total: visibleQuizProgress.total,
      })
    : undefined;

  return (
    <View style={styles.fixedHeader}>
      <View style={styles.headerRow}>
        <Text style={styles.logo}>{LL.brand.name()}</Text>
        <Text style={styles.envLabel}>{cityName}</Text>
      </View>
      <View style={styles.headerProgressSlot}>
        <Animated.View style={[styles.flowProgressLayer, flowProgressStyle]}>
          <ProgressBar
            current={flowProgress.current}
            total={flowProgress.total}
            label={flowProgressLabel}
          />
        </Animated.View>
        {visibleQuizProgress ? (
          <Animated.View
            pointerEvents="none"
            style={[styles.quizProgressLayer, quizProgressStyle]}
          >
            <ProgressBar
              current={visibleQuizProgress.current}
              total={visibleQuizProgress.total}
              label={quizProgressLabel ?? ""}
            />
          </Animated.View>
        ) : null}
      </View>
    </View>
  );
};
