import { createContext, useContext } from "react";
import { useRouter } from "expo-router";
import { ActivityIndicator, Animated, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import { useActivateInterestMutation, useBuzzHomeQuery } from "@graphql/generated";
import { useBuzzAuth } from "@/auth/AuthProvider";
import { useInterestFlow } from "@/features/interests/InterestFlowProvider";
import type { BuzzInterest } from "@/features/interests/interestFlow";
import { useQuiz } from "@/features/quiz/QuizProvider";
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
  { id: "00000000-0000-0000-0000-000000000010", name: "Gym / Fitness", slug: "gym-fitness", category: "fitness" }
];

const env = process.env.EXPO_PUBLIC_APP_ENV ?? "local";

const isBuzzInterest = (value: unknown): value is BuzzInterest => {
  const interest = value as Partial<BuzzInterest>;

  return Boolean(interest.id && interest.name && interest.slug && interest.category);
};

const getInterestsFromGraphql = (data: ReturnType<typeof useBuzzHomeQuery>["data"]): BuzzInterest[] => {
  return data?.interestsCollection?.edges.map((edge) => edge.node).filter(isBuzzInterest) ?? fallbackInterests;
};

const ProgressBar = ({ current, total }: { current: number; total: number }) => {
  const { styles } = useOnboardingTheme();

  return (
    <View style={styles.progressGroup}>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.round((current / total) * 100)}%` }]} />
      </View>
      <Text style={styles.progressLabel}>
        Step {current} of {total}
      </Text>
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

const AmbientBackground = () => {
  const { styles } = useOnboardingTheme();

  return (
    <View pointerEvents="none" style={styles.ambientRoot}>
      <View style={styles.ambientSky} />
      <View style={styles.ambientGold} />
    </View>
  );
};

const IntroContent = () => {
  const { styles } = useOnboardingTheme();
  const { state } = useOnboarding();
  const { user, mode } = useBuzzAuth();

  if (state.step.id === "profile") {
    return (
      <View style={styles.contentStack}>
        <View style={styles.profileCard}>
          <Text style={styles.metaLabel}>Replaceable auth boundary</Text>
          <Text style={styles.profileName}>{user.displayName}</Text>
          <Text style={styles.profileMeta}>
            {user.cityName} · {mode} mode · {user.isDemo ? "demo profile" : "authenticated profile"}
          </Text>
        </View>
        <Text style={styles.bodyCopy}>
          Screens consume `useBuzzAuth()`. When Supabase Auth replaces demo mode, this profile step should keep the same UI contract.
        </Text>
      </View>
    );
  }

  if (state.step.id === "howItWorks") {
    return (
      <View style={styles.howItWorksList}>
        {["Choose what you actually want to do.", "Activate when you are open to a plan.", "Match into a small activity group."].map(
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

  return <Text style={styles.bodyCopy}>{state.step.body}</Text>;
};

const QuizContent = () => {
  const { styles } = useOnboardingTheme();
  const quiz = useQuiz();
  const selectedOptionId = quiz.answers[quiz.activeQuestion.id];

  return (
    <View style={styles.contentStack}>
      <ProgressBar current={quiz.progress.current} total={quiz.progress.total} />
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

  return (
    <View style={styles.contentStack}>
      <View style={styles.inlineStatus}>
        {loading ? <ActivityIndicator color={colors.accent} /> : null}
        <Text style={styles.statusCopy}>
          {loading
            ? "Loading interests from Supabase GraphQL"
            : error
              ? "Using local fallback interests until GraphQL is reachable"
              : "Loaded from Supabase GraphQL"}
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
  const selected = interestFlow.state.selectedInterest;

  return (
    <View style={styles.contentStack}>
      <View style={styles.activationCard}>
        <Text style={styles.activationEyebrow}>Ready signal</Text>
        <Text style={styles.activationTitle}>{selected ? selected.name : "Choose an interest first"}</Text>
        <Text style={styles.activationCopy}>{quiz.traits.summary}</Text>
      </View>
      <Text style={styles.bodyCopy}>{interestFlow.state.activation.message}</Text>
    </View>
  );
};

const MatchPreviewContent = () => {
  const { styles } = useOnboardingTheme();
  const interestFlow = useInterestFlow();
  const match = interestFlow.state.matchPreview;

  if (!match) {
    return <Text style={styles.bodyCopy}>Activate an interest to create a local deterministic match preview.</Text>;
  }

  return (
    <View style={styles.contentStack}>
      <View style={styles.matchCard}>
        <Text style={styles.matchEyebrow}>Demo match</Text>
        <Text style={styles.matchTitle}>{match.headline}</Text>
        <Text style={styles.matchReason}>{match.reason}</Text>
      </View>
      <View style={styles.suggestionCard}>
        <Text style={styles.suggestionTitle}>Suggested next step</Text>
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
  const quiz = useQuiz();
  const interestFlow = useInterestFlow();
  const { data, loading, error } = useBuzzHomeQuery();
  const [activateInterest, { loading: activating }] = useActivateInterestMutation();
  const interests = getInterestsFromGraphql(data);
  const selectedInterest = interestFlow.state.selectedInterest;

  const activateSelectedInterest = async () => {
    if (!selectedInterest) {
      interestFlow.failActivation("Choose an interest before activating.");
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
        ? "Finish quiz"
        : "Next question"
      : onboarding.state.step.id === "interests"
        ? "Use this interest"
        : onboarding.state.step.id === "activation"
          ? activating || interestFlow.state.activation.status === "activating"
            ? "Activating..."
            : "Activate interest"
          : onboarding.isLastStep
            ? "Enter Buzz"
            : "Continue";

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
      <AmbientBackground />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View style={styles.layout}>
          <View style={styles.headerStack}>
            <View style={styles.headerRow}>
              <Text style={styles.logo}>Buzz</Text>
              <Text style={styles.envLabel}>{env}</Text>
            </View>
            <ProgressBar current={onboarding.state.progress.current} total={onboarding.state.progress.total} />
          </View>

          <View style={styles.mainCard}>
            <View style={styles.titleStack}>
              <Text style={styles.eyebrow}>{onboarding.state.step.eyebrow}</Text>
              <Text style={styles.title}>{onboarding.state.step.title}</Text>
            </View>
            <StepContent interests={interests} loading={loading} error={error} />
          </View>

          <View style={styles.buttonStack}>
            <PrimaryButton label={primaryLabel} disabled={primaryDisabled} onPress={handlePrimary} />
            <SecondaryButton label="Back" disabled={onboarding.isFirstStep && onboarding.state.step.id !== "quiz"} onPress={handleBack} />
          </View>
        </Animated.View>
      </ScrollView>
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
    padding: 22,
    paddingTop: 18
  },
  layout: {
    flex: 1,
    justifyContent: "space-between",
    gap: 22
  },
  ambientRoot: {
    position: "absolute",
    inset: 0,
    overflow: "hidden"
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
  headerStack: {
    gap: 18
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
