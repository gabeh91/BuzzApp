import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";

import {
  useActivateInterestMutation,
  useBuzzHomeQuery,
} from "@graphql/generated";
import { useBuzzAuth } from "@/auth/AuthProvider";
import type { BuzzAuthUser } from "@/auth/auth.types";
import { createCityContextFallback } from "@/features/city/cityContext";
import { useInterestFlow } from "@/features/interests/InterestFlowProvider";
import {
  isBackendActivationResult,
  parseActivateInterestJsonScalar,
  shouldActivateInterestThroughSupabase,
} from "@/features/interests/interestFlow";
import { useQuiz } from "@/features/quiz/QuizProvider";
import {
  createBuzzProfilePersistenceInput,
  shouldPersistProfileToSupabase,
} from "@/features/quiz/profilePersistence";
import { persistBuzzProfileToSupabase } from "@/features/quiz/profilePersistenceClient";
import { useI18n } from "@/i18n/I18nProvider";
import { routes } from "@/navigation/routes";
import { useBuzzTheme } from "@/theme/ThemeProvider";
import { Button, Screen } from "@/ui";
import { useOnboarding } from "@/features/onboarding/OnboardingProvider";
import { canBrowseFromOnboardingStep } from "@/features/onboarding/onboardingFlow";
import {
  createAnonymousOnboardingDraft,
  markAnonymousOnboardingComplete,
  mergeShortProfileNameIntoDraft,
} from "@/features/onboarding/onboardingDraft";
import { anonymousOnboardingDraftStore } from "@/features/onboarding/onboardingDraftStorage";
import {
  AmbientBackground,
  FixedOnboardingHeader,
  useContentSlideTransition,
} from "@/features/onboarding/OnboardingChrome";
import { createOnboardingStyles } from "@/features/onboarding/OnboardingScreen.styles";
import { StepContent } from "@/features/onboarding/OnboardingStepContent";
import { OnboardingMainCard } from "@/features/onboarding/OnboardingMainCard";
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
  const interests = getInterestsFromGraphql(data);
  const selectedInterest = interestFlow.state.selectedInterest;
  const [shortProfileName, setShortProfileName] = useState("");
  const quizSectionSpan = quiz.progress.total;
  const innerQuizSectionOffset =
    onboarding.state.step.id === "quiz" ? quiz.activeQuestionIndex : 0;
  const transitionIndex =
    onboarding.state.index * (quizSectionSpan + 1) + innerQuizSectionOffset;
  const transition = useContentSlideTransition(transitionIndex);
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });
  const stepCopy = LL.onboarding.steps[onboarding.state.step.id];
  const cardEyebrow = stepCopy.eyebrow();
  const cardTitle =
    onboarding.state.step.id === "quiz"
      ? quiz.activeQuestion.prompt
      : stepCopy.title();
  const cardBody =
    onboarding.state.step.id === "shortProfile" ? stepCopy.body() : undefined;
  const quizSectionProgress =
    onboarding.state.step.id === "quiz"
      ? {
          current: quiz.activeQuestionIndex + 1,
          total: quizSectionSpan,
        }
      : undefined;
  const showFlowProgress = onboarding.state.step.id !== "welcome";
  const flowProgress = {
    current: Math.max(1, onboarding.state.index),
    total: onboarding.state.progress.total - 1,
  };

  useEffect(() => {
    if (onboarding.state.step.id !== "shortProfile") {
      return;
    }

    let cancelled = false;

    const loadDraft = async () => {
      const draft = await anonymousOnboardingDraftStore.load();

      if (cancelled) {
        return;
      }

      setShortProfileName(draft.profileDisplayName?.trim() ?? "");
    };

    void loadDraft();

    return () => {
      cancelled = true;
    };
  }, [onboarding.state.step.id]);
  const canBrowseFromCurrentStep = canBrowseFromOnboardingStep(
    onboarding.state,
  );
  const showExistingAccountSignIn =
    !isAuthenticated &&
    onboarding.isFirstStep &&
    onboarding.state.step.id === "welcome";
  const showBackAction = !onboarding.isFirstStep;

  const persistQuizProfile = async (profileUser: BuzzAuthUser = user) => {
    const draft = await anonymousOnboardingDraftStore.load();
    const trimmedName = draft.profileDisplayName?.trim();
    const hasProfileOverrides = Boolean(trimmedName || draft.profileCityId);
    const input = createBuzzProfilePersistenceInput({
      user: profileUser,
      answers: quiz.answers,
      traits: quiz.traits,
      ...(hasProfileOverrides
        ? {
            overrides: {
              displayName: trimmedName || profileUser.displayName,
              cityId: draft.profileCityId ?? profileUser.cityId,
            },
          }
        : {}),
    });

    quiz.markProfileSaving(input);

    if (!shouldPersistProfileToSupabase(profileUser)) {
      quiz.markProfilePersisted(input);
      return;
    }

    try {
      await persistBuzzProfileToSupabase(input);
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
    await requireAuth("existing_account_sign_in", async (_authUser, _token, context) => {
      await anonymousOnboardingDraftStore.update(() =>
        createAnonymousOnboardingDraft(),
      );
      onboarding.reset();

      if (context?.profileQuizState?.quizCompleted) {
        router.replace(routes.home);
        return;
      }

      router.replace(routes.profileQuiz);
    });
  };

  const activateSelectedInterest = async () => {
    if (!selectedInterest) {
      interestFlow.failActivation(
        LL.interests.activation.chooseBeforeActivating(),
      );
      return;
    }

    await requireAuth(
      "activate_interest",
      async (authUser, _token, context) => {
        if (!context?.profileQuizOverwriteDecision) {
          await persistQuizProfile(authUser);
        }

        interestFlow.markActivating();
        let shouldShowMatchPreview = false;

        try {
          if (shouldActivateInterestThroughSupabase(authUser)) {
            const response = await activateInterest({
              variables: {
                interestId: selectedInterest.id,
              },
            });

            if (response.errors?.length) {
              throw new Error(
                response.errors.map((graphError) => graphError.message).join("; "),
              );
            }

            const payload = parseActivateInterestJsonScalar(
              response.data?.activateInterest,
            );

            if (!isBackendActivationResult(payload)) {
              throw new Error("Activation response was invalid");
            }

            interestFlow.completeBackendActivation(payload);
            shouldShowMatchPreview = payload.matchCandidates.length > 0;
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
      },
    );
  };

  const primaryLabel =
    onboarding.state.step.id === "quiz"
      ? quiz.isLastQuestion
        ? LL.onboarding.actions.finishQuiz()
        : LL.onboarding.actions.nextQuestion()
      : onboarding.state.step.id === "shortProfile"
        ? LL.common.continue()
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
    (onboarding.state.step.id === "shortProfile" && !shortProfileName.trim()) ||
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

    if (onboarding.state.step.id === "shortProfile") {
      const trimmed = shortProfileName.trim();

      if (!trimmed) {
        return;
      }

      void anonymousOnboardingDraftStore.update((draft) =>
        mergeShortProfileNameIntoDraft(draft, trimmed, {
          id: cityContext.city.id,
          name: cityContext.city.name,
        }),
      );
      onboarding.next();
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
      stickyHeader={
        <FixedOnboardingHeader
          cityName={cityContext.city.name}
          flowProgress={flowProgress}
          quizProgress={quizSectionProgress}
          showFlowProgress={showFlowProgress}
        />
      }
      style={styles.screen}
    >
      <View style={styles.stage}>
        <AmbientBackground scrollY={scrollY} />
        <Animated.ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            showFlowProgress ? styles.scrollContentWithHeaderProgress : null,
          ]}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
        >
          <View style={styles.layout}>
            <View style={styles.cardRail}>
              <OnboardingMainCard
                body={cardBody}
                eyebrow={cardEyebrow}
                style={transition.cardStyle}
                title={cardTitle}
              >
                <StepContent
                  interests={interests}
                  loading={loading}
                  error={error}
                  shortProfile={
                    onboarding.state.step.id === "shortProfile"
                      ? {
                          nameValue: shortProfileName,
                          onNameChange: setShortProfileName,
                          cityName: cityContext.city.name,
                          cityNote: LL.onboarding.shortProfile.location.note(),
                          layout: "onboarding",
                        }
                      : undefined
                  }
                />
              </OnboardingMainCard>
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
  const insets = useSafeAreaInsets();
  const { fontScale } = useWindowDimensions();
  const styles = useMemo(
    () => createOnboardingStyles(theme, insets.bottom, fontScale),
    [fontScale, theme, insets.bottom],
  );

  return (
    <OnboardingThemeProvider
      value={{
        colors: theme.colors,
        styles,
        headerProgressHeight: theme.spacing[10],
        headerProgressGap: theme.spacing[5],
      }}
    >
      <OnboardingExperience />
    </OnboardingThemeProvider>
  );
};
