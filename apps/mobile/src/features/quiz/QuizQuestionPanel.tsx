import { Pressable, StyleSheet, View } from "react-native";

import { useBuzzTheme } from "@/theme/ThemeProvider";
import type { BuzzTheme } from "@/theme/tokens";
import { Text as UiText } from "@/ui";

import { useQuiz } from "./QuizProvider";

export const QuizQuestionPanel = () => {
  const { theme } = useBuzzTheme();
  const styles = createStyles(theme);
  const quiz = useQuiz();
  const selectedOptionId = quiz.answers[quiz.activeQuestion.id];

  return (
    <View style={styles.container}>
      <UiText variant="panelTitle" style={styles.prompt}>
        {quiz.activeQuestion.prompt}
      </UiText>
      <View style={styles.optionsList}>
        {quiz.activeQuestion.options.map((option) => {
          const selected = selectedOptionId === option.id;

          return (
            <Pressable
              accessibilityRole="button"
              key={option.id}
              onPress={() => {
                quiz.answerQuestion(quiz.activeQuestion.id, option.id);
              }}
              style={[styles.option, selected ? styles.optionSelected : null]}
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

const createStyles = (theme: BuzzTheme) => {
  const { colors, fontSizes, lineHeights, radii, spacing, borderWidths } =
    theme;

  return StyleSheet.create({
    container: {
      gap: spacing[4],
    },
    optionsList: {
      gap: spacing[3],
    },
    option: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: radii.lg,
      borderWidth: borderWidths.hairline,
      gap: spacing[1],
      padding: spacing[4],
    },
    optionSelected: {
      backgroundColor: colors.surfaceMuted,
      borderColor: colors.surfaceMuted,
    },
    optionCopy: {
      color: colors.textMuted,
      fontSize: fontSizes.sm,
      lineHeight: lineHeights.tight,
      ...theme.fontStyles.body,
    },
    optionLabel: {
      color: colors.text,
      fontSize: fontSizes.base,
      lineHeight: lineHeights.tight,
      ...theme.fontStyles.labelStrong,
    },
    prompt: {
      maxWidth: "92%",
    },
  });
};
