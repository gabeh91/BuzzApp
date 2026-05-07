import { createContext, useContext, useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import { ActivityIndicator, Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  type SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming
} from "react-native-reanimated";

import { useActivateInterestMutation, useBuzzHomeQuery } from "@graphql/generated";
import { useBuzzAuth } from "@/auth/AuthProvider";
import { useInterestFlow } from "@/features/interests/InterestFlowProvider";
import type { BuzzInterest } from "@/features/interests/interestFlow";
import { useQuiz } from "@/features/quiz/QuizProvider";
import { useI18n } from "@/i18n/I18nProvider";
import { routes } from "@/navigation/routes";
import { useBuzzTheme } from "@/theme/ThemeProvider";
import type { BuzzTheme } from "@/theme/tokens";
import { useOnboarding } from "@/features/onboarding/OnboardingProvider";

type OnboardingThemeContextValue = {
  colors: BuzzTheme["colors"];
  styles: ReturnType<typeof createStyles>;
};

const OnboardingThemeContext = createContext<OnboardingThemeContextValue | null>(null);

const useOnboardingTheme = (): OnboardingThemeContextValue => {
  const value = useContext(OnboardingThemeContext);

  if (!value) {
    throw new Error("useOnboardingTheme must be used within OnboardingThemeContext.Provider");
  }

  return value;
};

const fallbackInterests: BuzzInterest[] = [
  { id: "00000000-0000-0000-0000-000000000001", name: "Surfing", slug: "surfing", category: "sport" },
  { id: "00000000-0000-0000-0000-000000000002", name: "Tennis", slug: "tennis", category: "sport" },
  { id: "00000000-0000-0000-0000-000000000003", name: "Singing", slug: "singing", category: "music" },
  { id: "00000000-0000-0000-0000-000000000004", name: "Running", slug: "running", category: "fitness" },
  { id: "00000000-0000-0000-0000-000000000005", name: "Climbing", slug: "climbing", category: "fitness" },
  {
    id: "00000000-0000-0000-0000-000000000006",
    name: "Language Exchange",
    slug: "language-exchange",
    category: "learning"
  },
  { id: "00000000-0000-0000-0000-000000000007", name: "Board Games", slug: "board-games", category: "social" },
  { id: "00000000-0000-0000-0000-000000000008", name: "Coffee", slug: "coffee", category: "food" },
  { id: "00000000-0000-0000-0000-000000000009", name: "Cooking Classes", slug: "cooking-classes", category: "food" },
  { id: "00000000-0000-0000-0000-000000000010", name: "Gym / Fitness", slug: "gym-fitness", category: "fitness" },
  { id: "00000000-0000-0000-0000-000000000011", name: "Golf", slug: "golf", category: "sport" },
  { id: "00000000-0000-0000-0000-000000000012", name: "Knitting", slug: "knitting", category: "creative" },
  { id: "00000000-0000-0000-0000-000000000013", name: "Chess", slug: "chess", category: "social" },
  { id: "00000000-0000-0000-0000-000000000014", name: "Walking", slug: "walking", category: "fitness" },
  { id: "00000000-0000-0000-0000-000000000015", name: "Hackathons", slug: "hackathons", category: "learning" },
  { id: "00000000-0000-0000-0000-000000000016", name: "Book Clubs", slug: "book-clubs", category: "social" },
  { id: "00000000-0000-0000-0000-000000000017", name: "Wine Clubs", slug: "wine-clubs", category: "food" },
  { id: "00000000-0000-0000-0000-000000000018", name: "Pottery Classes", slug: "pottery-classes", category: "creative" },
  { id: "00000000-0000-0000-0000-000000000019", name: "Rock Climbing", slug: "rock-climbing", category: "fitness" },
  { id: "00000000-0000-0000-0000-000000000020", name: "Soccer", slug: "soccer", category: "sport" },
  { id: "00000000-0000-0000-0000-000000000021", name: "Archery", slug: "archery", category: "sport" },
  { id: "00000000-0000-0000-0000-000000000022", name: "Basketball", slug: "basketball", category: "sport" },
  { id: "00000000-0000-0000-0000-000000000023", name: "Netball", slug: "netball", category: "sport" },
  { id: "00000000-0000-0000-0000-000000000024", name: "Volleyball", slug: "volleyball", category: "sport" },
  { id: "00000000-0000-0000-0000-000000000025", name: "Ultimate Frisbee", slug: "ultimate-frisbee", category: "sport" },
  { id: "00000000-0000-0000-0000-000000000026", name: "Touch Rugby", slug: "touch-rugby", category: "sport" },
  { id: "00000000-0000-0000-0000-000000000027", name: "Pickleball", slug: "pickleball", category: "sport" },
  { id: "00000000-0000-0000-0000-000000000028", name: "Yoga", slug: "yoga", category: "fitness" },
  { id: "00000000-0000-0000-0000-000000000029", name: "Photography Walks", slug: "photography-walks", category: "creative" },
  { id: "00000000-0000-0000-0000-000000000030", name: "Trivia Nights", slug: "trivia-nights", category: "social" },
  { id: "00000000-0000-0000-0000-000000000031", name: "Gardening", slug: "gardening", category: "lifestyle" }
];

const isBuzzInterest = (value: unknown): value is BuzzInterest => {
  const interest = value as Partial<BuzzInterest>;

  return Boolean(interest.id && interest.name && interest.slug && interest.category);
};

const getInterestsFromGraphql = (data: ReturnType<typeof useBuzzHomeQuery>["data"]): BuzzInterest[] => {
  return data?.interestsCollection?.edges.map((edge) => edge.node).filter(isBuzzInterest) ?? fallbackInterests;
};

const useAmbientMotion = (scrollY: SharedValue<number>) => {
  const ambient = useSharedValue(0);

  useEffect(() => {
    ambient.value = withRepeat(
      withSequence(
        withTiming(1, {
          duration: 3600,
          easing: Easing.inOut(Easing.sin)
        }),
        withTiming(0, {
          duration: 3600,
          easing: Easing.inOut(Easing.sin)
        })
      ),
      -1,
      false
    );
  }, [ambient]);

  const skyStyle = useAnimatedStyle(() => {
    const skyParallaxY = scrollY.value * 0.34;

    return {
      transform: [
        {
          translateX: -18 * ambient.value
        },
        {
          translateY: 16 * ambient.value - skyParallaxY
        }
      ]
    };
  });

  const goldStyle = useAnimatedStyle(() => {
    const goldParallaxY = scrollY.value * 0.18;

    return {
      transform: [
        {
          translateX: 22 * ambient.value
        },
        {
          translateY: -14 * ambient.value - goldParallaxY
        }
      ]
    };
  });

  return {
    skyStyle,
    goldStyle
  };
};

const useContentSlideTransition = (transitionIndex: number) => {
  const previousIndex = useRef(transitionIndex);
  const translateX = useSharedValue(0);

  useEffect(() => {
    const direction = transitionIndex >= previousIndex.current ? 1 : -1;
    previousIndex.current = transitionIndex;
    translateX.value = direction * 34;
    translateX.value = withTiming(0, {
      duration: 240,
      easing: Easing.out(Easing.cubic)
    });
  }, [previousIndex, transitionIndex, translateX]);

  const cardStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: translateX.value
        }
      ]
    };
  });

  return {
    cardStyle
  };
};

const useAnimatedProgress = (current: number, total: number) => {
  const progress = useSharedValue(total > 0 ? current / total : 0);

  useEffect(() => {
    progress.value = withTiming(total > 0 ? current / total : 0, {
      duration: 260,
      easing: Easing.out(Easing.cubic)
    });
  }, [current, progress, total]);

  const progressFillStyle = useAnimatedStyle(() => {
    return {
      width: `${Math.min(Math.max(progress.value, 0), 1) * 100}%`
    };
  });

  return {
    progressFillStyle
  };
};

const useHeaderProgressTransition = (isQuizStep: boolean) => {
  const quizMode = useSharedValue(isQuizStep ? 1 : 0);

  useEffect(() => {
    quizMode.value = withTiming(isQuizStep ? 1 : 0, {
      duration: 260,
      easing: Easing.out(Easing.cubic)
    });
  }, [isQuizStep, quizMode]);

  const flowProgressStyle = useAnimatedStyle(() => {
    return {
      opacity: 1 - quizMode.value,
      transform: [
        {
          translateY: -12 * quizMode.value
        }
      ]
    };
  });

  const quizProgressStyle = useAnimatedStyle(() => {
    return {
      opacity: quizMode.value,
      transform: [
        {
          translateY: 12 * (1 - quizMode.value)
        }
      ]
    };
  });

  return {
    flowProgressStyle,
    quizProgressStyle
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

const PrimaryButton = ({
  label,
  disabled,
  onPress
}: {
  label: string;
  disabled?: boolean;
  onPress: () => void;
}) => {
  const { styles } = useOnboardingTheme();

  return (
    <Pressable disabled={disabled} onPress={onPress} style={[styles.primaryButton, disabled ? styles.primaryButtonDisabled : null]}>
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
};

const SecondaryButton = ({ label, disabled, onPress }: { label: string; disabled?: boolean; onPress: () => void }) => {
  const { styles } = useOnboardingTheme();

  return (
    <Pressable disabled={disabled} onPress={onPress} style={styles.secondaryButton}>
      <Text style={[styles.secondaryButtonText, disabled ? styles.secondaryButtonTextDisabled : null]}>{label}</Text>
    </Pressable>
  );
};

const AmbientBackground = ({ scrollY }: { scrollY: SharedValue<number> }) => {
  const { styles } = useOnboardingTheme();
  const transition = useAmbientMotion(scrollY);

  return (
    <View pointerEvents="none" style={styles.ambientRoot}>
      <Animated.View style={[styles.ambientSky, transition.skyStyle]} />
      <Animated.View style={[styles.ambientGold, transition.goldStyle]} />
    </View>
  );
};

const FixedOnboardingHeader = ({
  cityName,
  flowProgress,
  quizProgress
}: {
  cityName: string;
  flowProgress: { current: number; total: number };
  quizProgress: { current: number; total: number } | undefined;
}) => {
  const { styles } = useOnboardingTheme();
  const { LL } = useI18n();
  const isQuizStep = Boolean(quizProgress);
  const lastQuizProgress = useRef(quizProgress);
  const { flowProgressStyle, quizProgressStyle } = useHeaderProgressTransition(isQuizStep);

  useEffect(() => {
    if (quizProgress) {
      lastQuizProgress.current = quizProgress;
    }
  }, [quizProgress]);

  const visibleQuizProgress = quizProgress ?? lastQuizProgress.current;
  const flowProgressLabel = LL.common.progress.step({
    current: flowProgress.current,
    total: flowProgress.total
  });
  const quizProgressLabel = visibleQuizProgress
    ? LL.common.progress.question({
        current: visibleQuizProgress.current,
        total: visibleQuizProgress.total
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
          <ProgressBar current={flowProgress.current} total={flowProgress.total} label={flowProgressLabel} />
        </Animated.View>
        {visibleQuizProgress ? (
          <Animated.View pointerEvents="none" style={[styles.quizProgressLayer, quizProgressStyle]}>
            <ProgressBar current={visibleQuizProgress.current} total={visibleQuizProgress.total} label={quizProgressLabel ?? ""} />
          </Animated.View>
        ) : null}
      </View>
    </View>
  );
};

const IntroContent = () => {
  const { styles } = useOnboardingTheme();
  const { state } = useOnboarding();
  const { user } = useBuzzAuth();
  const { LL } = useI18n();
  const stepCopy = LL.onboarding.steps[state.step.id];

  if (state.step.id === "profile") {
    return (
      <View style={styles.contentStack}>
        <View style={styles.profileCard}>
          <Text style={styles.metaLabel}>{LL.onboarding.profile.metaLabel()}</Text>
          <Text style={styles.profileName}>{user.displayName}</Text>
          <Text style={styles.profileMeta}>{LL.onboarding.profile.meta({ city: user.cityName })}</Text>
        </View>
        <Text style={styles.bodyCopy}>{LL.onboarding.profile.body()}</Text>
      </View>
    );
  }

  if (state.step.id === "howItWorks") {
    return (
      <View style={styles.howItWorksList}>
        {[LL.onboarding.howItWorks.itemOne(), LL.onboarding.howItWorks.itemTwo(), LL.onboarding.howItWorks.itemThree()].map(
          (item, index) => (
            <View key={item} style={[styles.howItWorksItem, index === 1 ? styles.howItWorksItemFeatured : null]}>
              <Text style={[styles.howItWorksNumber, index === 1 ? styles.howItWorksFeaturedText : null]}>0{index + 1}</Text>
              <Text style={[styles.howItWorksText, index === 1 ? styles.howItWorksFeaturedText : null]}>{item}</Text>
            </View>
          )
        )}
      </View>
    );
  }

  return <Text style={styles.bodyCopy}>{stepCopy.body()}</Text>;
};

const QuizContent = () => {
  const { styles } = useOnboardingTheme();
  const quiz = useQuiz();
  const selectedOptionId = quiz.answers[quiz.activeQuestion.id];

  return (
    <View style={styles.contentStack}>
      <Text style={styles.quizPrompt}>{quiz.activeQuestion.prompt}</Text>
      <View style={styles.optionsList}>
        {quiz.activeQuestion.options.map((option) => {
          const selected = selectedOptionId === option.id;

          return (
            <Pressable
              key={option.id}
              onPress={() => {
                quiz.answerQuestion(quiz.activeQuestion.id, option.id);
              }}
              style={[styles.optionCard, selected ? styles.optionCardSelected : null]}
            >
              <Text style={styles.optionLabel}>{option.label}</Text>
              <Text style={styles.optionCopy}>{option.supportingText}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const InterestsContent = ({
  interests,
  loading,
  error
}: {
  interests: BuzzInterest[];
  loading: boolean;
  error: Error | undefined;
}) => {
  const { colors, styles } = useOnboardingTheme();
  const interestFlow = useInterestFlow();
  const { LL } = useI18n();

  return (
    <View style={styles.contentStack}>
      <View style={styles.inlineStatus}>
        {loading ? <ActivityIndicator color={colors.accent} /> : null}
        <Text style={styles.statusCopy}>
          {loading
            ? LL.onboarding.interests.loading()
            : error
              ? LL.onboarding.interests.error()
              : LL.onboarding.interests.ready()}
        </Text>
      </View>
      <View style={styles.interestGrid}>
        {interests.map((interest) => {
          const selected = interestFlow.state.selectedInterest?.id === interest.id;

          return (
            <Pressable
              key={interest.id}
              onPress={() => {
                interestFlow.select(interest);
              }}
              style={[styles.interestPill, selected ? styles.interestPillSelected : null]}
            >
              <Text style={[styles.interestPillText, selected ? styles.interestPillTextSelected : null]}>{interest.name}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const ActivationContent = () => {
  const { styles } = useOnboardingTheme();
  const interestFlow = useInterestFlow();
  const quiz = useQuiz();
  const { LL } = useI18n();
  const selected = interestFlow.state.selectedInterest;

  return (
    <View style={styles.contentStack}>
      <View style={styles.activationCard}>
        <Text style={styles.activationEyebrow}>{LL.onboarding.activation.eyebrow()}</Text>
        <Text style={styles.activationTitle}>{selected ? selected.name : LL.onboarding.activation.chooseInterestFirst()}</Text>
        <Text style={styles.activationCopy}>{quiz.traits.summary}</Text>
      </View>
      <Text style={styles.bodyCopy}>{interestFlow.state.activation.message}</Text>
    </View>
  );
};

const MatchPreviewContent = () => {
  const { styles } = useOnboardingTheme();
  const interestFlow = useInterestFlow();
  const { LL } = useI18n();
  const match = interestFlow.state.matchPreview;

  if (!match) {
    return <Text style={styles.bodyCopy}>{LL.onboarding.matchPreview.empty()}</Text>;
  }

  return (
    <View style={styles.contentStack}>
      <View style={styles.matchCard}>
        <Text style={styles.matchEyebrow}>{LL.onboarding.matchPreview.eyebrow()}</Text>
        <Text style={styles.matchTitle}>{match.headline}</Text>
        <Text style={styles.matchReason}>{match.reason}</Text>
      </View>
      <View style={styles.suggestionCard}>
        <Text style={styles.suggestionTitle}>{LL.onboarding.matchPreview.suggestedNextStep()}</Text>
        <Text style={styles.suggestionCopy}>{match.suggestedPlan}</Text>
      </View>
    </View>
  );
};

const StepContent = ({
  interests,
  loading,
  error
}: {
  interests: BuzzInterest[];
  loading: boolean;
  error: Error | undefined;
}) => {
  const { state } = useOnboarding();

  if (state.step.id === "quiz") {
    return <QuizContent />;
  }

  if (state.step.id === "interests") {
    return <InterestsContent interests={interests} loading={loading} error={error} />;
  }

  if (state.step.id === "activation") {
    return <ActivationContent />;
  }

  if (state.step.id === "matchPreview") {
    return <MatchPreviewContent />;
  }

  return <IntroContent />;
};

const OnboardingExperience = () => {
  const { styles } = useOnboardingTheme();
  const router = useRouter();
  const onboarding = useOnboarding();
  const { user } = useBuzzAuth();
  const { LL } = useI18n();
  const quiz = useQuiz();
  const interestFlow = useInterestFlow();
  const { data, loading, error } = useBuzzHomeQuery();
  const [activateInterest, { loading: activating }] = useActivateInterestMutation();
  const interests = getInterestsFromGraphql(data);
  const selectedInterest = interestFlow.state.selectedInterest;
  const transitionIndex =
    onboarding.state.index * (quiz.progress.total + 1) + (onboarding.state.step.id === "quiz" ? quiz.activeQuestionIndex : 0);
  const transition = useContentSlideTransition(transitionIndex);
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    }
  });
  const stepCopy = LL.onboarding.steps[onboarding.state.step.id];
  const quizProgress = onboarding.state.step.id === "quiz" ? quiz.progress : undefined;

  const activateSelectedInterest = async () => {
    if (!selectedInterest) {
      interestFlow.failActivation(LL.interests.activation.chooseBeforeActivating());
      return;
    }

    interestFlow.markActivating();

    try {
      await activateInterest({
        variables: {
          interestId: selectedInterest.id
        }
      });
    } catch {
      // Demo mode still shows the local product loop when auth-backed GraphQL writes are unavailable.
    }

    interestFlow.completeLocalActivation(quiz.traits);
    onboarding.next();
  };

  const primaryLabel =
    onboarding.state.step.id === "quiz"
      ? quiz.isLastQuestion
        ? LL.onboarding.actions.finishQuiz()
        : LL.onboarding.actions.nextQuestion()
      : onboarding.state.step.id === "interests"
        ? LL.onboarding.actions.useInterest()
        : onboarding.state.step.id === "activation"
          ? activating || interestFlow.state.activation.status === "activating"
            ? LL.onboarding.actions.activating()
            : LL.onboarding.actions.activateInterest()
          : onboarding.isLastStep
            ? LL.onboarding.actions.enterBuzz()
            : LL.common.continue();

  const primaryDisabled =
    (onboarding.state.step.id === "quiz" && !quiz.hasAnsweredActiveQuestion) ||
    (onboarding.state.step.id === "interests" && !selectedInterest) ||
    (onboarding.state.step.id === "activation" && (!selectedInterest || activating));

  const handlePrimary = () => {
    if (onboarding.isLastStep) {
      router.replace(routes.home);
      return;
    }

    if (onboarding.state.step.id === "quiz") {
      if (quiz.isLastQuestion) {
        onboarding.next();
        return;
      }

      quiz.nextQuestion();
      return;
    }

    if (onboarding.state.step.id === "activation") {
      void activateSelectedInterest();
      return;
    }

    onboarding.next();
  };

  const handleBack = () => {
    if (onboarding.state.step.id === "quiz" && quiz.activeQuestionIndex > 0) {
      quiz.previousQuestion();
      return;
    }

    onboarding.back();
  };

  return (
    <SafeAreaView style={styles.screen}>
      <FixedOnboardingHeader cityName={user.cityName} flowProgress={onboarding.state.progress} quizProgress={quizProgress} />
      <View style={styles.stage}>
        <AmbientBackground scrollY={scrollY} />
        <Animated.ScrollView onScroll={scrollHandler} scrollEventThrottle={16} contentContainerStyle={styles.scrollContent}>
          <View style={styles.layout}>
            <View style={styles.cardRail}>
              <Animated.View style={[styles.mainCard, transition.cardStyle]}>
                <View style={styles.titleStack}>
                  <Text style={styles.eyebrow}>{stepCopy.eyebrow()}</Text>
                  <Text style={styles.title}>{stepCopy.title()}</Text>
                </View>
                <StepContent interests={interests} loading={loading} error={error} />
              </Animated.View>
            </View>

            <View style={styles.buttonStack}>
              <PrimaryButton label={primaryLabel} disabled={primaryDisabled} onPress={handlePrimary} />
              <SecondaryButton label={LL.common.back()} disabled={onboarding.isFirstStep && onboarding.state.step.id !== "quiz"} onPress={handleBack} />
            </View>
          </View>
        </Animated.ScrollView>
      </View>
    </SafeAreaView>
  );
};

export const OnboardingScreen = () => {
  const { theme } = useBuzzTheme();
  const styles = createStyles(theme);

  return (
    <OnboardingThemeContext.Provider value={{ colors: theme.colors, styles }}>
      <OnboardingExperience />
    </OnboardingThemeContext.Provider>
  );
};

const createStyles = (theme: BuzzTheme) => {
  const { colors, fontFamilies, fontSizes, lineHeights, radii, spacing, borderWidths, shadows } = theme;

  return StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 22
  },
  stage: {
    flex: 1,
    position: "relative"
  },
  layout: {
    flexGrow: 1,
    justifyContent: "space-between",
    gap: 22
  },
  ambientRoot: {
    position: "absolute",
    inset: 0
  },
  ambientSky: {
    position: "absolute",
    top: -80,
    right: -70,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: colors.surfaceMuted
  },
  ambientGold: {
    position: "absolute",
    bottom: 90,
    left: -95,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: colors.warningSoft
  },
  fixedHeader: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 16,
    gap: 18,
    backgroundColor: colors.background,
    borderBottomWidth: borderWidths.hairline,
    borderBottomColor: colors.overlay,
    zIndex: 1
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  logo: {
    color: colors.text,
    fontFamily: fontFamilies.display,
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -1
  },
  envLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.1,
    textTransform: "uppercase"
  },
  progressGroup: {
    gap: 8
  },
  headerProgressSlot: {
    height: 38,
    overflow: "hidden"
  },
  flowProgressLayer: {
    ...StyleSheet.absoluteFillObject
  },
  quizProgressLayer: {
    ...StyleSheet.absoluteFillObject
  },
  progressTrack: {
    height: 8,
    borderRadius: radii.full,
    backgroundColor: colors.overlay,
    overflow: "hidden"
  },
  progressFill: {
    height: "100%",
    borderRadius: radii.full,
    backgroundColor: colors.accent
  },
  progressLabel: {
    color: colors.textMuted,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: "uppercase"
  },
  mainCard: {
    backgroundColor: colors.surface,
    borderRadius: 36,
    padding: 24,
    gap: 22,
    borderWidth: borderWidths.hairline,
    borderColor: colors.border,
    ...shadows.card
  },
  cardRail: {
    flex: 1,
    justifyContent: "center"
  },
  titleStack: {
    gap: 10
  },
  eyebrow: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.4,
    textTransform: "uppercase"
  },
  title: {
    color: colors.text,
    fontFamily: fontFamilies.display,
    fontSize: 34,
    fontWeight: "900",
    lineHeight: 39,
    letterSpacing: -1.2
  },
  contentStack: {
    gap: 16
  },
  bodyCopy: {
    color: colors.textMuted,
    fontSize: 17,
    lineHeight: 26
  },
  profileCard: {
    backgroundColor: colors.background,
    borderRadius: 24,
    padding: 18
  },
  metaLabel: {
    color: colors.textMuted,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: "uppercase"
  },
  profileName: {
    color: colors.text,
    fontFamily: fontFamilies.display,
    fontSize: 28,
    fontWeight: "800",
    marginTop: 10
  },
  profileMeta: {
    color: colors.textMuted,
    marginTop: 8
  },
  howItWorksList: {
    gap: 12
  },
  howItWorksItem: {
    backgroundColor: colors.background,
    borderRadius: 22,
    padding: 16,
    flexDirection: "row",
    gap: 14,
    alignItems: "center"
  },
  howItWorksItemFeatured: {
    backgroundColor: colors.surfaceInverse
  },
  howItWorksNumber: {
    color: colors.accent,
    fontWeight: "900"
  },
  howItWorksText: {
    color: colors.text,
    flex: 1,
    fontSize: 16
  },
  howItWorksFeaturedText: {
    color: colors.textInverse
  },
  quizPrompt: {
    color: colors.text,
    fontSize: 25,
    fontWeight: "800",
    lineHeight: 32
  },
  optionsList: {
    gap: 10
  },
  optionCard: {
    borderWidth: borderWidths.hairline,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 16,
    gap: 5
  },
  optionCardSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft
  },
  optionLabel: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800"
  },
  optionCopy: {
    color: colors.textMuted,
    lineHeight: 20
  },
  inlineStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  statusCopy: {
    color: colors.textMuted
  },
  interestGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  interestPill: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: colors.background,
    borderWidth: borderWidths.hairline,
    borderColor: colors.border
  },
  interestPillSelected: {
    backgroundColor: colors.surfaceInverse,
    borderColor: colors.surfaceInverse
  },
  interestPillText: {
    color: colors.text,
    fontWeight: "800"
  },
  interestPillTextSelected: {
    color: colors.textInverse
  },
  activationCard: {
    backgroundColor: colors.surfaceInverse,
    borderRadius: 28,
    padding: 20,
    gap: 10
  },
  activationEyebrow: {
    color: colors.warning,
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1.2,
    textTransform: "uppercase"
  },
  activationTitle: {
    color: colors.textInverse,
    fontSize: 28,
    fontWeight: "900"
  },
  activationCopy: {
    color: colors.textInverse,
    lineHeight: 22
  },
  matchCard: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 30,
    padding: 22,
    gap: 10
  },
  matchEyebrow: {
    color: colors.brand,
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1.2,
    textTransform: "uppercase"
  },
  matchTitle: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "900"
  },
  matchReason: {
    color: colors.brand,
    lineHeight: 22
  },
  suggestionCard: {
    backgroundColor: colors.background,
    borderRadius: 24,
    padding: 18
  },
  suggestionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "800"
  },
  suggestionCopy: {
    color: colors.textMuted,
    marginTop: 8,
    lineHeight: 22
  },
  buttonStack: {
    gap: 4
  },
  primaryButton: {
    backgroundColor: colors.surfaceInverse,
    borderRadius: 22,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center"
  },
  primaryButtonDisabled: {
    backgroundColor: colors.disabled
  },
  primaryButtonText: {
    color: colors.textInverse,
    fontSize: 16,
    fontWeight: "700"
  },
  secondaryButton: {
    paddingVertical: 16,
    alignItems: "center"
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700"
  },
  secondaryButtonTextDisabled: {
    color: colors.disabled
  }
  });
};
