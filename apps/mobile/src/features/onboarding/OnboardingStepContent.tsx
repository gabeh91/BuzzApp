import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { useBuzzAuth } from "@/auth/AuthProvider";
import { createCityContextFallback } from "@/features/city/cityContext";
import { useInterestFlow } from "@/features/interests/InterestFlowProvider";
import type {
  ActivationAvailabilityIntent,
  BuzzInterest,
} from "@/features/interests/interestFlow";
import { useQuiz } from "@/features/quiz/QuizProvider";
import { useI18n } from "@/i18n/I18nProvider";

import { useOnboarding } from "./OnboardingProvider";
import { useOnboardingTheme } from "./OnboardingTheme";

const IntroContent = () => {
  const { styles } = useOnboardingTheme();
  const { state } = useOnboarding();
  const { user } = useBuzzAuth();
  const cityContext = createCityContextFallback({
    cityId: user.cityId,
    cityName: user.cityName,
  });
  const { LL } = useI18n();
  const stepCopy = LL.onboarding.steps[state.step.id];

  if (state.step.id === "profile") {
    return (
      <View style={styles.contentStack}>
        <View style={styles.profileCard}>
          <Text style={styles.metaLabel}>
            {LL.onboarding.profile.metaLabel()}
          </Text>
          <Text style={styles.profileName}>{user.displayName}</Text>
          <Text style={styles.profileMeta}>
            {LL.onboarding.profile.meta({ city: cityContext.city.name })}
          </Text>
        </View>
        <Text style={styles.bodyCopy}>{LL.onboarding.profile.body()}</Text>
      </View>
    );
  }

  if (state.step.id === "howItWorks") {
    return (
      <View style={styles.howItWorksList}>
        {[
          LL.onboarding.howItWorks.itemOne(),
          LL.onboarding.howItWorks.itemTwo(),
          LL.onboarding.howItWorks.itemThree(),
        ].map((item, index) => (
          <View
            key={item}
            style={[
              styles.howItWorksItem,
              index === 1 ? styles.howItWorksItemFeatured : null,
            ]}
          >
            <Text
              style={[
                styles.howItWorksNumber,
                index === 1 ? styles.howItWorksFeaturedText : null,
              ]}
            >
              0{index + 1}
            </Text>
            <Text
              style={[
                styles.howItWorksText,
                index === 1 ? styles.howItWorksFeaturedText : null,
              ]}
            >
              {item}
            </Text>
          </View>
        ))}
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
              style={[
                styles.optionCard,
                selected ? styles.optionCardSelected : null,
              ]}
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
  error,
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
          const selected =
            interestFlow.state.selectedInterest?.id === interest.id;

          return (
            <Pressable
              key={interest.id}
              onPress={() => {
                interestFlow.select(interest);
              }}
              style={[
                styles.interestPill,
                selected ? styles.interestPillSelected : null,
              ]}
            >
              <Text
                style={[
                  styles.interestPillText,
                  selected ? styles.interestPillTextSelected : null,
                ]}
              >
                {interest.name}
              </Text>
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
  const selectedAvailability = interestFlow.state.activationAvailability;
  const availabilityOptions: Array<{
    id: string;
    label: string;
    intent: ActivationAvailabilityIntent;
  }> = [
    {
      id: "this-week",
      label: LL.onboarding.activation.availability.thisWeek(),
      intent: {
        availabilityWindow: "this_week",
        preferredTime: "flexible",
        urgency: "soon",
      },
    },
    {
      id: "weekend",
      label: LL.onboarding.activation.availability.weekend(),
      intent: {
        availabilityWindow: "weekend",
        preferredTime: "daytime",
        urgency: "soon",
      },
    },
    {
      id: "daytime",
      label: LL.onboarding.activation.availability.daytime(),
      intent: {
        availabilityWindow: "weekdays",
        preferredTime: "daytime",
        urgency: "low",
      },
    },
  ];

  return (
    <View style={styles.contentStack}>
      <View style={styles.activationCard}>
        <Text style={styles.activationEyebrow}>
          {LL.onboarding.activation.eyebrow()}
        </Text>
        <Text style={styles.activationTitle}>
          {selected
            ? selected.name
            : LL.onboarding.activation.chooseInterestFirst()}
        </Text>
        <Text style={styles.activationCopy}>{quiz.traits.summary}</Text>
      </View>
      <View style={styles.availabilityStack}>
        <Text style={styles.activationOptionLabel}>
          {LL.onboarding.activation.availability.label()}
        </Text>
        <View style={styles.availabilityGrid}>
          {availabilityOptions.map((option) => {
            const isSelected =
              selectedAvailability.availabilityWindow ===
                option.intent.availabilityWindow &&
              selectedAvailability.preferredTime ===
                option.intent.preferredTime &&
              selectedAvailability.urgency === option.intent.urgency;

            return (
              <Pressable
                key={option.id}
                accessibilityRole="button"
                onPress={() => {
                  interestFlow.setAvailabilityIntent(option.intent);
                }}
                style={[
                  styles.availabilityPill,
                  isSelected ? styles.availabilityPillSelected : null,
                ]}
              >
                <Text
                  style={[
                    styles.availabilityPillText,
                    isSelected ? styles.availabilityPillTextSelected : null,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      <Text style={styles.bodyCopy}>
        {interestFlow.state.activation.message}
      </Text>
    </View>
  );
};

const MatchPreviewContent = () => {
  const { styles } = useOnboardingTheme();
  const interestFlow = useInterestFlow();
  const { LL } = useI18n();
  const match = interestFlow.state.matchPreview;

  if (!match) {
    return (
      <Text style={styles.bodyCopy}>{LL.onboarding.matchPreview.empty()}</Text>
    );
  }

  return (
    <View style={styles.contentStack}>
      <View style={styles.matchCard}>
        <Text style={styles.matchEyebrow}>
          {LL.onboarding.matchPreview.eyebrow()}
        </Text>
        <Text style={styles.matchTitle}>{match.headline}</Text>
        <Text style={styles.matchReason}>{match.reason}</Text>
      </View>
      <View style={styles.suggestionCard}>
        <Text style={styles.suggestionTitle}>
          {LL.onboarding.matchPreview.suggestedNextStep()}
        </Text>
        <Text style={styles.suggestionCopy}>{match.suggestedPlan}</Text>
      </View>
    </View>
  );
};

export const StepContent = ({
  interests,
  loading,
  error,
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
    return (
      <InterestsContent interests={interests} loading={loading} error={error} />
    );
  }

  if (state.step.id === "activation") {
    return <ActivationContent />;
  }

  if (state.step.id === "matchPreview") {
    return <MatchPreviewContent />;
  }

  return <IntroContent />;
};
