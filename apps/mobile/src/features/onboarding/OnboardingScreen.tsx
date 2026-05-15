import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";
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
import {
  canBrowseFromOnboardingStep,
  ONBOARDING_QUIZ_SECTION_PROFILE_STEPS,
} from "@/features/onboarding/onboardingFlow";
import {
  markAnonymousOnboardingComplete,
  mergeShortProfileLocationIntoDraft,
  mergeShortProfileNameIntoDraft,
  mergeShortProfileRetreatToName,
} from "@/features/onboarding/onboardingDraft";
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
  const interests = getInterestsFromGraphql(data);
  const selectedInterest = interestFlow.state.selectedInterest;
  const [shortProfilePhase, setShortProfilePhase] = useState(0);
  const [shortProfileName, setShortProfileName] = useState("");
  const quizSectionSpan =
    ONBOARDING_QUIZ_SECTION_PROFILE_STEPS + quiz.progress.total;
  const innerQuizSectionOffset =
    onboarding.state.step.id === "shortProfile"
      ? shortProfilePhase
      : onboarding.state.step.id === "quiz"
        ? ONBOARDING_QUIZ_SECTION_PROFILE_STEPS + quiz.activeQuestionIndex
        : 0;
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
  const shortProfileCopy =
    onboarding.state.step.id === "shortProfile"
      ? shortProfilePhase === 0
        ? LL.onboarding.shortProfile.name
        : LL.onboarding.shortProfile.location
      : null;
  const quizSectionProgress =
    onboarding.state.step.id === "shortProfile" ||
    onboarding.state.step.id === "quiz"
      ? {
          current:
            onboarding.state.step.id === "shortProfile"
              ? shortProfilePhase + 1
              : ONBOARDING_QUIZ_SECTION_PROFILE_STEPS +
                quiz.activeQuestionIndex +
                1,
          total: quizSectionSpan,
        }
      : undefined;

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

      setShortProfilePhase(draft.shortProfileSubIndex ?? 0);
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
        ? shortProfilePhase === 0
          ? LL.common.continue()
          : LL.onboarding.actions.startQuizQuestions()
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
    (onboarding.state.step.id === "shortProfile" &&
      shortProfilePhase === 0 &&
      !shortProfileName.trim()) ||
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
      if (shortProfilePhase === 0) {
        const trimmed = shortProfileName.trim();

        if (!trimmed) {
          return;
        }

        void anonymousOnboardingDraftStore.update((draft) =>
          mergeShortProfileNameIntoDraft(draft, trimmed),
        );
        setShortProfilePhase(1);
        return;
      }

      void anonymousOnboardingDraftStore.update((draft) =>
        mergeShortProfileLocationIntoDraft(draft, {
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
    if (onboarding.state.step.id === "shortProfile") {
      if (shortProfilePhase > 0) {
        void anonymousOnboardingDraftStore.update((draft) =>
          mergeShortProfileRetreatToName(draft),
        );
        setShortProfilePhase(0);
        return;
      }

      onboarding.back();
      return;
    }

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
          flowProgress={onboarding.state.progress}
          quizProgress={quizSectionProgress}
        />
      }
      style={styles.screen}
    >
      <View style={styles.stage}>
        <AmbientBackground scrollY={scrollY} />
        <Animated.ScrollView
          contentContainerStyle={styles.scrollContent}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
        >
          <View style={styles.layout}>
            <View style={styles.cardRail}>
              <Animated.View style={[styles.mainCard, transition.cardStyle]}>
                <View style={styles.titleStack}>
                  <Text style={styles.eyebrow}>
                    {shortProfileCopy
                      ? shortProfileCopy.eyebrow()
                      : stepCopy.eyebrow()}
                  </Text>
                  <Text style={styles.title}>
                    {shortProfileCopy
                      ? shortProfileCopy.title()
                      : stepCopy.title()}
                  </Text>
                  {shortProfileCopy ? (
                    <Text style={styles.bodyCopy}>{shortProfileCopy.body()}</Text>
                  ) : null}
                </View>
                <StepContent
                  interests={interests}
                  loading={loading}
                  error={error}
                  shortProfile={
                    onboarding.state.step.id === "shortProfile"
                      ? {
                          phase: shortProfilePhase,
                          nameValue: shortProfileName,
                          onNameChange: setShortProfileName,
                          cityName: cityContext.city.name,
                          cityHint: LL.onboarding.shortProfile.location.cityHint(),
                        }
                      : undefined
                  }
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
  const insets = useSafeAreaInsets();
  const styles = useMemo(
    () => createOnboardingStyles(theme, insets.bottom),
    [theme, insets.bottom],
  );

  return (
    <OnboardingThemeProvider value={{ colors: theme.colors, styles }}>
      <OnboardingExperience />
    </OnboardingThemeProvider>
  );
};
