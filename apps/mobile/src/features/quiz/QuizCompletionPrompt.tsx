import { usePathname, useRouter } from "expo-router";
import { useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";

import { useBuzzAuth } from "@/auth/AuthProvider";
import { useI18n } from "@/i18n/I18nProvider";
import { routes } from "@/navigation/routes";
import { useBuzzTheme } from "@/theme/ThemeProvider";
import type { BuzzTheme } from "@/theme/tokens";
import { Button, Panel, Text as UiText } from "@/ui";
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
    quizCompleted: traits.quizCompleted,
  });

  const handleCompleteQuiz = () => {
    setDismissedForSession(true);
    router.push(routes.onboardingQuiz);
  };

  return (
    <Modal animationType="fade" transparent visible={visible}>
      <View style={styles.backdrop}>
        <Pressable
          accessibilityRole="button"
          onPress={() => setDismissedForSession(true)}
          style={styles.scrim}
        />
        <Panel variant="plain" style={styles.sheet}>
          <UiText variant="eyebrow">{LL.quizCompletionPrompt.eyebrow()}</UiText>
          <UiText variant="panelTitle">
            {LL.quizCompletionPrompt.title()}
          </UiText>
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
      </View>
    </Modal>
  );
};

const createStyles = (theme: BuzzTheme) => {
  const { colors, spacing } = theme;

  return StyleSheet.create({
    action: {
      flex: 1,
    },
    actionRow: {
      flexDirection: "row",
      gap: spacing[3],
    },
    backdrop: {
      backgroundColor: "rgba(13, 39, 31, 0.34)",
      flex: 1,
      justifyContent: "flex-end",
      padding: spacing[4],
    },
    scrim: {
      ...StyleSheet.absoluteFillObject,
    },
    sheet: {
      backgroundColor: colors.surface,
      gap: spacing[3],
    },
  });
};
