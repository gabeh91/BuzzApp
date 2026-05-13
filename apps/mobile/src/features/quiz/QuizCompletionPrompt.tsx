import { usePathname, useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { useBuzzAuth } from "@/auth/AuthProvider";
import { useI18n } from "@/i18n/I18nProvider";
import { routes } from "@/navigation/routes";
import { useBuzzTheme } from "@/theme/ThemeProvider";
import type { BuzzTheme } from "@/theme/tokens";
import { Button, Panel, Sheet, Text as UiText } from "@/ui";
import { useQuiz } from "./QuizProvider";
import { shouldShowQuizCompletionPrompt } from "./quizCompletionPromptLogic";

export const QuizCompletionPrompt = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated } = useBuzzAuth();
  const { LL } = useI18n();
  const { traits } = useQuiz();
  const { theme } = useBuzzTheme();
  const styles = createStyles(theme);
  const [dismissedForSession, setDismissedForSession] = useState(false);
  const visible = shouldShowQuizCompletionPrompt({
    dismissedForSession,
    isAuthenticated,
    isInviteAcceptRoute: pathname.startsWith("/join/group"),
    isOnboardingRoute:
      pathname === routes.onboarding || pathname === routes.onboardingQuiz,
    isProfileQuizRoute: pathname === routes.profileQuiz,
    quizCompleted: traits.quizCompleted,
  });

  const handleCompleteQuiz = () => {
    setDismissedForSession(true);
    router.push(routes.profileQuiz);
  };

  return (
    <Sheet
      onDismiss={() => setDismissedForSession(true)}
      snapPoints={["52%"]}
      visible={visible}
    >
      <Panel variant="plain" style={styles.sheet}>
        <UiText variant="eyebrow">{LL.quizCompletionPrompt.eyebrow()}</UiText>
        <UiText variant="panelTitle">{LL.quizCompletionPrompt.title()}</UiText>
        <UiText variant="panelBody">{LL.quizCompletionPrompt.body()}</UiText>
        <View style={styles.actionRow}>
          <Button
            label={LL.quizCompletionPrompt.completeQuiz()}
            onPress={handleCompleteQuiz}
            style={styles.action}
          />
          <Button
            label={LL.quizCompletionPrompt.notNow()}
            onPress={() => setDismissedForSession(true)}
            style={styles.action}
            variant="secondary"
          />
        </View>
      </Panel>
    </Sheet>
  );
};

const createStyles = (theme: BuzzTheme) => {
  const { colors, spacing } = theme;

  return StyleSheet.create({
    action: {
      flex: 1,
    },
    actionRow: {
      flexDirection: "column",
      gap: spacing[3],
      marginTop: spacing[3],
    },
    sheet: {
      backgroundColor: colors.surface,
      gap: spacing[3],
    },
  });
};
