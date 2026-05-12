import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";

import {
  useActivateInterestMutation,
  useBuzzHomeQuery,
  useUpsertBuzzProfileMutation,
} from "@graphql/generated";
import { useBuzzAuth } from "@/auth/AuthProvider";
import type { BuzzAuthUser } from "@/auth/auth.types";
import { createCityContextFallback } from "@/features/city/cityContext";
import { useInterestFlow } from "@/features/interests/InterestFlowProvider";
import {
  isBackendActivationResult,
  shouldActivateInterestThroughSupabase,
} from "@/features/interests/interestFlow";
import { useQuiz } from "@/features/quiz/QuizProvider";
import {
  createBuzzProfilePersistenceInput,
  shouldPersistProfileToSupabase,
} from "@/features/quiz/profilePersistence";
import { useI18n } from "@/i18n/I18nProvider";
import { routes } from "@/navigation/routes";
import { useBuzzTheme } from "@/theme/ThemeProvider";
import { Button, Screen } from "@/ui";
import { useOnboarding } from "@/features/onboarding/OnboardingProvider";
import { canBrowseFromOnboardingStep } from "@/features/onboarding/onboardingFlow";
import { markAnonymousOnboardingComplete } from "@/features/onboarding/onboardingDraft";
import { anonymousOnboardingDraftStore } from "@/features/onboarding/onboardingDraftStorage";
import {
  AmbientBackground,
  FixedOnboardingHeader,
  useContentSlideTransition,
} from "@/features/onboarding/OnboardingChrome";
import { createOnboardingStyles } from "@/features/onboarding/OnboardingScreen.styles";
import { StepContent } from "@/features/onboarding/OnboardingStepContent";
import {
  OnboardingThemeProvider,
  useOnboardingTheme,
} from "@/features/onboarding/OnboardingTheme";
import { getInterestsFromGraphql } from "@/features/onboarding/onboardingInterests";

const OnboardingExperience = () => {
  const { styles } = useOnboardingTheme();
  const router = useRouter();
  const onboarding = useOnboarding();
  const { isAuthenticated, requireAuth, user } = useBuzzAuth();
  const cityContext = createCityContextFallback({
    cityId: user.cityId,
    cityName: user.cityName,
  });
  const { LL } = useI18n();
  const quiz = useQuiz();
  const interestFlow = useInterestFlow();
  const { data, loading, error } = useBuzzHomeQuery();
  const [activateInterest, { loading: activating }] =
    useActivateInterestMutation();
  const [upsertBuzzProfile] = useUpsertBuzzProfileMutation();
  const interests = getInterestsFromGraphql(data);
  const selectedInterest = interestFlow.state.selectedInterest;
  const transitionIndex =
    onboarding.state.index * (quiz.progress.total + 1) +
    (onboarding.state.step.id === "quiz" ? quiz.activeQuestionIndex : 0);
  const transition = useContentSlideTransition(transitionIndex);
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });
  const stepCopy = LL.onboarding.steps[onboarding.state.step.id];
  const quizProgress =
    onboarding.state.step.id === "quiz" ? quiz.progress : undefined;
  const canBrowseFromCurrentStep = canBrowseFromOnboardingStep(
    onboarding.state,
  );
  const showExistingAccountSignIn =
    !isAuthenticated &&
    onboarding.isFirstStep &&
    onboarding.state.step.id === "welcome";
  const showBackAction = !onboarding.isFirstStep;

  const persistQuizProfile = async (profileUser: BuzzAuthUser = user) => {
    const input = createBuzzProfilePersistenceInput({
      user: profileUser,
      answers: quiz.answers,
      traits: quiz.traits,
    });

    quiz.markProfileSaving(input);

    if (!shouldPersistProfileToSupabase(profileUser)) {
      quiz.markProfilePersisted(input);
      return;
    }

    try {
      await upsertBuzzProfile({
        variables: input,
      });
      quiz.markProfilePersisted(input);
    } catch (caught) {
      quiz.markProfilePersistenceFailed(
        input,
        caught instanceof Error ? caught.message : undefined,
      );
    }
  };

  const completeAnonymousOnboarding = async () => {
    await anonymousOnboardingDraftStore.update((draft) =>
      markAnonymousOnboardingComplete(draft),
    );
  };

  const browseBuzzForNow = async () => {
    await completeAnonymousOnboarding();
    router.replace(routes.home);
  };

  const handleExistingAccountSignIn = async () => {
    await requireAuth("save_profile", async () => {
      router.replace(routes.home);
    });
  };

  const activateSelectedInterest = async () => {
    if (!selectedInterest) {
      interestFlow.failActivation(
        LL.interests.activation.chooseBeforeActivating(),
      );
      return;
    }

    await requireAuth("activate_interest", async (authUser) => {
      await persistQuizProfile(authUser);
      interestFlow.markActivating();
      let shouldShowMatchPreview = false;

      try {
        if (shouldActivateInterestThroughSupabase(authUser)) {
          const response = await activateInterest({
            variables: {
              interestId: selectedInterest.id,
            },
          });

          if (!isBackendActivationResult(response.data?.activateInterest)) {
            throw new Error("Activation response was invalid");
          }

          const result = response.data.activateInterest;
          interestFlow.completeBackendActivation(result);
          shouldShowMatchPreview = result.matchCandidates.length > 0;
        } else {
          interestFlow.completeLocalActivation();
        }
      } catch {
        interestFlow.failActivation(LL.interests.activation.failed());
        return;
      }

      if (shouldShowMatchPreview) {
        onboarding.next();
        return;
      }

      await completeAnonymousOnboarding();
      router.replace(routes.home);
    });
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
            : isAuthenticated
              ? LL.onboarding.actions.activateInterest()
              : LL.onboarding.actions.signInToActivate()
          : onboarding.isLastStep
            ? LL.onboarding.actions.enterBuzz()
            : LL.common.continue();

  const primaryDisabled =
    (onboarding.state.step.id === "quiz" && !quiz.hasAnsweredActiveQuestion) ||
    (onboarding.state.step.id === "interests" && !selectedInterest) ||
    (onboarding.state.step.id === "activation" &&
      (!selectedInterest || activating));

  const handlePrimary = () => {
    const completeOnboardingAndEnterHome = async () => {
      await completeAnonymousOnboarding();
      router.replace(routes.home);
    };

    if (onboarding.isLastStep) {
      void completeOnboardingAndEnterHome();
      return;
    }

    if (onboarding.state.step.id === "quiz") {
      if (quiz.isLastQuestion) {
        void persistQuizProfile();
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
    <Screen
      contentStyle={styles.screenContent}
      edges={["top"]}
      scroll={false}
      style={styles.screen}
    >
      <FixedOnboardingHeader
        cityName={cityContext.city.name}
        flowProgress={onboarding.state.progress}
        quizProgress={quizProgress}
      />
      <View style={styles.stage}>
        <AmbientBackground scrollY={scrollY} />
        <Animated.ScrollView
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.layout}>
            <View style={styles.cardRail}>
              <Animated.View style={[styles.mainCard, transition.cardStyle]}>
                <View style={styles.titleStack}>
                  <Text style={styles.eyebrow}>{stepCopy.eyebrow()}</Text>
                  <Text style={styles.title}>{stepCopy.title()}</Text>
                </View>
                <StepContent
                  interests={interests}
                  loading={loading}
                  error={error}
                />
              </Animated.View>
            </View>

            <View style={styles.buttonStack}>
              <Button
                label={primaryLabel}
                disabled={primaryDisabled}
                onPress={handlePrimary}
                style={styles.primaryAction}
              />

              {canBrowseFromCurrentStep ? (
                <Button
                  label={LL.onboarding.actions.browseBuzz()}
                  onPress={() => {
                    void browseBuzzForNow();
                  }}
                  variant="tonal"
                  style={styles.secondaryAction}
                />
              ) : null}
              {showExistingAccountSignIn ? (
                <Button
                  label={LL.onboarding.actions.signInExisting()}
                  onPress={() => {
                    void handleExistingAccountSignIn();
                  }}
                  variant="tonal"
                  style={styles.secondaryAction}
                />
              ) : null}
              {showBackAction ? (
                <Button
                  label={LL.common.back()}
                  onPress={handleBack}
                  variant="plain"
                  style={styles.secondaryAction}
                  textStyle={styles.backActionText}
                />
              ) : null}
            </View>
          </View>
        </Animated.ScrollView>
      </View>
    </Screen>
  );
};

export const OnboardingScreen = () => {
  const { theme } = useBuzzTheme();
  const styles = createOnboardingStyles(theme);

  return (
    <OnboardingThemeProvider value={{ colors: theme.colors, styles }}>
      <OnboardingExperience />
    </OnboardingThemeProvider>
  );
};
