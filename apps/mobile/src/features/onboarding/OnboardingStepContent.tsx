import { ActivityIndicator, Pressable, View } from "react-native";

import { Text as UiText } from "@/ui";

import { useInterestFlow } from "@/features/interests/InterestFlowProvider";
import type {
  ActivationAvailabilityIntent,
  BuzzInterest,
} from "@/features/interests/interestFlow";
import { useQuiz } from "@/features/quiz/QuizProvider";
import { useI18n } from "@/i18n/I18nProvider";

import { useOnboarding } from "./OnboardingProvider";
import { useOnboardingTheme } from "./OnboardingTheme";
import { ShortProfileFields } from "./ShortProfileFields";

const IntroContent = () => {
  const { styles } = useOnboardingTheme();
  const { state } = useOnboarding();
  const { LL } = useI18n();
  const stepCopy = LL.onboarding.steps[state.step.id];

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
            <UiText
              style={[
                styles.howItWorksNumber,
                index === 1 ? styles.howItWorksFeaturedText : null,
              ]}
            >
              0{index + 1}
            </UiText>
            <UiText
              style={[
                styles.howItWorksText,
                index === 1 ? styles.howItWorksFeaturedText : null,
              ]}
            >
              {item}
            </UiText>
          </View>
        ))}
      </View>
    );
  }

  return <UiText variant="body">{stepCopy.body()}</UiText>;
};

const QuizContent = () => {
  const { styles } = useOnboardingTheme();
  const quiz = useQuiz();
  const selectedOptionId = quiz.answers[quiz.activeQuestion.id];

  return (
    <View style={styles.contentStack}>
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
              <UiText style={styles.optionLabel}>{option.label}</UiText>
              <UiText style={styles.optionCopy}>{option.supportingText}</UiText>
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
        <UiText style={styles.statusCopy}>
          {loading
            ? LL.onboarding.interests.loading()
            : error
              ? LL.onboarding.interests.error()
              : LL.onboarding.interests.ready()}
        </UiText>
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
              <UiText
                style={[
                  styles.interestPillText,
                  selected ? styles.interestPillTextSelected : null,
                ]}
              >
                {interest.name}
              </UiText>
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
        <UiText style={styles.activationEyebrow}>
          {LL.onboarding.activation.eyebrow()}
        </UiText>
        <UiText style={styles.activationTitle}>
          {selected
            ? selected.name
            : LL.onboarding.activation.chooseInterestFirst()}
        </UiText>
        <UiText style={styles.activationCopy}>{quiz.traits.summary}</UiText>
      </View>
      <View style={styles.availabilityStack}>
        <UiText style={styles.activationOptionLabel}>
          {LL.onboarding.activation.availability.label()}
        </UiText>
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
                <UiText
                  style={[
                    styles.availabilityPillText,
                    isSelected ? styles.availabilityPillTextSelected : null,
                  ]}
                >
                  {option.label}
                </UiText>
              </Pressable>
            );
          })}
        </View>
      </View>
      <UiText style={styles.bodyCopy}>
        {interestFlow.state.activation.message}
      </UiText>
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
      <UiText style={styles.bodyCopy}>{LL.onboarding.matchPreview.empty()}</UiText>
    );
  }

  return (
    <View style={styles.contentStack}>
      <View style={styles.matchCard}>
        <UiText style={styles.matchEyebrow}>
          {LL.onboarding.matchPreview.eyebrow()}
        </UiText>
        <UiText style={styles.matchTitle}>{match.headline}</UiText>
        <UiText style={styles.matchReason}>{match.reason}</UiText>
      </View>
      <View style={styles.suggestionCard}>
        <UiText style={styles.suggestionTitle}>
          {LL.onboarding.matchPreview.suggestedNextStep()}
        </UiText>
        <UiText style={styles.suggestionCopy}>{match.suggestedPlan}</UiText>
      </View>
    </View>
  );
};

export const StepContent = ({
  interests,
  loading,
  error,
  shortProfile,
}: {
  interests: BuzzInterest[];
  loading: boolean;
  error: Error | undefined;
  shortProfile?:
    | {
        nameValue: string;
        onNameChange: (value: string) => void;
        cityName: string;
        cityHint?: string;
        cityNote?: string;
        layout?: "default" | "onboarding";
      }
    | undefined;
}) => {
  const { state } = useOnboarding();

  if (state.step.id === "shortProfile" && shortProfile) {
    return <ShortProfileFields {...shortProfile} />;
  }

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
