import { Redirect, useRouter } from "expo-router";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useBuzzAuth } from "@/auth/AuthProvider";
import { createCityContextFallback } from "@/features/city/cityContext";
import { useI18n } from "@/i18n/I18nProvider";
import { routes } from "@/navigation/routes";
import { useBuzzTheme } from "@/theme/ThemeProvider";
import type { BuzzTheme } from "@/theme/tokens";
import { BackHeader, Button, HeroPanel, Panel, QuizProgressBar, Screen, Text as UiText } from "@/ui";

import { QuizQuestionPanel } from "./QuizQuestionPanel";
import { useQuiz } from "./QuizProvider";
import { usePersistQuizProfile } from "./usePersistQuizProfile";

export const ProfileQuizScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAuthenticated, user } = useBuzzAuth();
  const { LL } = useI18n();
  const { theme } = useBuzzTheme();
  const styles = useMemo(
    () => createStyles(theme, insets.bottom),
    [theme, insets.bottom],
  );
  const quiz = useQuiz();
  const persistQuizProfile = usePersistQuizProfile();
  const cityContext = createCityContextFallback({
    cityId: user.cityId,
    cityName: user.cityName,
  });
  const saving = quiz.profilePersistence.status === "saving";

  if (!isAuthenticated) {
    return <Redirect href={routes.onboarding} />;
  }

  const closeQuiz = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(routes.profile);
  };

  const handleNext = async () => {
    if (!quiz.isLastQuestion) {
      quiz.nextQuestion();
      return;
    }

    try {
      await persistQuizProfile();
      closeQuiz();
    } catch {
      // The hook has already moved the shared quiz state into failed feedback.
    }
  };

  const progressLabel = LL.common.progress.question({
    current: quiz.progress.current,
    total: quiz.progress.total,
  });

  return (
    <Screen
      contentStyle={styles.content}
      edges={["top"]}
      stickyHeader={
        <View style={styles.stickyChrome}>
          <BackHeader
            backLabel={LL.common.back()}
            onBack={closeQuiz}
            right={<UiText variant="city">{cityContext.city.name}</UiText>}
          />
          <QuizProgressBar
            current={quiz.progress.current}
            label={progressLabel}
            total={quiz.progress.total}
          />
        </View>
      }
    >
      <HeroPanel
        body={
          quiz.traits.quizCompleted
            ? LL.profileQuiz.retakeIntro.body()
            : LL.profileQuiz.body()
        }
        eyebrow={cityContext.city.name}
        title={
          quiz.traits.quizCompleted
            ? LL.profileQuiz.retakeIntro.title()
            : LL.profileQuiz.title()
        }
      />

      <Panel style={styles.panel}>
        <QuizQuestionPanel />
      </Panel>

      <View style={styles.buttonStack}>
        <Button
          disabled={!quiz.hasAnsweredActiveQuestion || saving}
          label={
            saving
              ? LL.profileQuiz.saving()
              : quiz.isLastQuestion
                ? LL.profileQuiz.actions.finish()
                : LL.profileQuiz.actions.next()
          }
          onPress={() => {
            void handleNext();
          }}
          style={styles.primaryNav}
        />
        {quiz.activeQuestionIndex > 0 ? (
          <Button
            disabled={saving}
            label={LL.common.back()}
            onPress={quiz.previousQuestion}
            style={styles.secondaryNav}
            textStyle={styles.backNavText}
            variant="plain"
          />
        ) : null}
      </View>

      {quiz.profilePersistence.status === "failed" ? (
        <UiText variant="feedback">{LL.profileQuiz.failed()}</UiText>
      ) : null}
    </Screen>
  );
};

const createStyles = (theme: BuzzTheme, bottomInset: number) => {
  const { fontSizes, radii, spacing } = theme;

  return StyleSheet.create({
    backNavText: {
      fontSize: fontSizes.base,
      ...theme.fontStyles.display,
    },
    buttonStack: {
      gap: spacing[1],
      width: "100%",
    },
    content: {
      flexGrow: 1,
      gap: spacing[5],
      paddingBottom: bottomInset + spacing[10],
      paddingTop: spacing[5],
    },
    panel: {
      gap: spacing[4],
    },
    primaryNav: {
      borderRadius: radii.lg,
    },
    secondaryNav: {
      borderRadius: radii.lg,
      marginTop: spacing[2],
    },
    stickyChrome: {
      gap: spacing[4],
      paddingBottom: spacing[3],
      width: "100%",
    },
  });
};
