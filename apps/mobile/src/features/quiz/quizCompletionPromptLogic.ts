export type QuizCompletionPromptState = {
  dismissedForSession: boolean;
  isAuthenticated: boolean;
  isInviteAcceptRoute: boolean;
  isOnboardingRoute: boolean;
  quizCompleted: boolean;
};

export const shouldShowQuizCompletionPrompt = ({
  dismissedForSession,
  isAuthenticated,
  isInviteAcceptRoute,
  isOnboardingRoute,
  quizCompleted,
}: QuizCompletionPromptState): boolean => {
  return (
    isAuthenticated &&
    !quizCompleted &&
    !dismissedForSession &&
    !isInviteAcceptRoute &&
    !isOnboardingRoute
  );
};
