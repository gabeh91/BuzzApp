import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { useBuzzAuth } from "@/auth/AuthProvider";
import { useI18n } from "@/i18n/I18nProvider";
import { useBuzzTheme } from "@/theme/ThemeProvider";
import type { BuzzTheme } from "@/theme/tokens";
import { Button, Panel, Sheet, Text as UiText } from "@/ui";

import { usePersistQuizProfile } from "./usePersistQuizProfile";
import { useQuiz } from "./QuizProvider";

export const ProfileQuizOverwritePrompt = () => {
  const {
    profileQuizOverwritePrompt,
    profileQuizState,
    resolveProfileQuizOverwrite,
    user,
  } = useBuzzAuth();
  const persistQuizProfile = usePersistQuizProfile();
  const quiz = useQuiz();
  const { LL } = useI18n();
  const { theme } = useBuzzTheme();
  const styles = createStyles(theme);
  const [busyAction, setBusyAction] = useState<
    "overwrite" | "keep_existing" | null
  >(null);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const visible = Boolean(profileQuizOverwritePrompt);

  const keepExistingAnswers = async () => {
    setBusyAction("keep_existing");
    setErrorMessage(undefined);

    try {
      if (profileQuizState?.quizAnswers) {
        quiz.replaceAnswers(profileQuizState.quizAnswers);
      }

      await resolveProfileQuizOverwrite("keep_existing");
    } catch (caught) {
      setErrorMessage(
        caught instanceof Error
          ? caught.message
          : LL.profileQuizOverwritePrompt.failed(),
      );
    } finally {
      setBusyAction(null);
    }
  };

  const overwriteAnswers = async () => {
    setBusyAction("overwrite");
    setErrorMessage(undefined);

    try {
      await persistQuizProfile(user);
      await resolveProfileQuizOverwrite("overwrite");
    } catch (caught) {
      setErrorMessage(
        caught instanceof Error
          ? caught.message
          : LL.profileQuizOverwritePrompt.failed(),
      );
    } finally {
      setBusyAction(null);
    }
  };

  return (
    <Sheet dismissible={false} visible={visible}>
      <Panel variant="plain" style={styles.sheet}>
        <UiText variant="eyebrow">
          {LL.profileQuizOverwritePrompt.eyebrow()}
        </UiText>
        <UiText variant="panelTitle">
          {LL.profileQuizOverwritePrompt.title()}
        </UiText>
        <UiText variant="panelBody">
          {LL.profileQuizOverwritePrompt.body()}
        </UiText>
        {errorMessage ? (
          <UiText variant="feedback">{errorMessage}</UiText>
        ) : null}
        <View style={styles.actionStack}>
          <Button
            disabled={Boolean(busyAction)}
            label={
              busyAction === "overwrite"
                ? LL.profileQuizOverwritePrompt.overwriting()
                : LL.profileQuizOverwritePrompt.overwrite()
            }
            onPress={() => {
              void overwriteAnswers();
            }}
          />
          <Button
            disabled={Boolean(busyAction)}
            label={
              busyAction === "keep_existing"
                ? LL.profileQuizOverwritePrompt.keeping()
                : LL.profileQuizOverwritePrompt.keepExisting()
            }
            onPress={() => {
              void keepExistingAnswers();
            }}
            variant="tonal"
          />
        </View>
      </Panel>
    </Sheet>
  );
};

const createStyles = (theme: BuzzTheme) => {
  const { colors, spacing } = theme;

  return StyleSheet.create({
    actionStack: {
      gap: spacing[3],
    },
    sheet: {
      backgroundColor: colors.surface,
      gap: spacing[3],
    },
  });
};
