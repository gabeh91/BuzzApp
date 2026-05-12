import { Redirect, useNavigation, useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";

import { useBuzzAuth } from "@/auth/AuthProvider";
import { createCityContextFallback } from "@/features/city/cityContext";
import { useI18n } from "@/i18n/I18nProvider";
import { routes } from "@/navigation/routes";
import { useBuzzTheme } from "@/theme/ThemeProvider";
import type { BuzzTheme } from "@/theme/tokens";
import { Button, Header, HeroPanel, Panel, Screen, Text as UiText } from "@/ui";

import { QuizQuestionPanel } from "./QuizQuestionPanel";
import { useQuiz } from "./QuizProvider";
import { usePersistQuizProfile } from "./usePersistQuizProfile";

type RootNavigation = {
  canGoBack: () => boolean;
  goBack: () => void;
};

export const ProfileQuizScreen = () => {
  const router = useRouter();
  const rootNavigation = useNavigation<RootNavigation>("/");
  const { isAuthenticated, user } = useBuzzAuth();
  const { LL } = useI18n();
  const { theme } = useBuzzTheme();
  const styles = createStyles(theme);
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
    if (rootNavigation.canGoBack()) {
      rootNavigation.goBack();
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

  return (
    <Screen contentStyle={styles.content} edges={["top"]}>
      <Header
        left={<UiText variant="logo">{LL.brand.name()}</UiText>}
        right={
          <Button
            label={LL.profileQuiz.actions.close()}
            onPress={closeQuiz}
            style={styles.closeAction}
            variant="plain"
          />
        }
      />

      <HeroPanel
        body={LL.profileQuiz.body()}
        eyebrow={cityContext.city.name}
        title={LL.profileQuiz.title()}
      />

      <Panel style={styles.panel}>
        <UiText variant="eyebrow">
          {LL.common.progress.question({
            current: quiz.progress.current,
            total: quiz.progress.total,
          })}
        </UiText>
        <QuizQuestionPanel />
      </Panel>

      <View style={styles.actionRow}>
        {quiz.activeQuestionIndex > 0 ? (
          <Button
            disabled={saving}
            label={LL.common.back()}
            onPress={quiz.previousQuestion}
            style={styles.action}
            variant="plain"
          />
        ) : null}
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
          style={styles.action}
        />
      </View>

      {quiz.profilePersistence.status === "failed" ? (
        <UiText variant="feedback">{LL.profileQuiz.failed()}</UiText>
      ) : null}
    </Screen>
  );
};

const createStyles = (theme: BuzzTheme) => {
  const { spacing } = theme;

  return StyleSheet.create({
    action: {
      flex: 1,
    },
    actionRow: {
      flexDirection: "row",
      gap: spacing[3],
    },
    closeAction: {
      minHeight: 42,
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[2],
    },
    content: {
      flexGrow: 1,
      gap: spacing[5],
      padding: spacing[6],
    },
    panel: {
      gap: spacing[4],
    },
  });
};
