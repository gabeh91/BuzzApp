export type QuizCompletionPromptState = {
  dismissedForSession: boolean;
  isAuthenticated: boolean;
  isInviteAcceptRoute: boolean;
  isOnboardingRoute: boolean;
  isProfileQuizRoute: boolean;
  quizCompleted: boolean;
};

export const shouldShowQuizCompletionPrompt = ({
  dismissedForSession,
  isAuthenticated,
  isInviteAcceptRoute,
  isOnboardingRoute,
  isProfileQuizRoute,
  quizCompleted,
}: QuizCompletionPromptState): boolean => {
  return (
    isAuthenticated &&
    !quizCompleted &&
    !dismissedForSession &&
    !isInviteAcceptRoute &&
    !isOnboardingRoute &&
    !isProfileQuizRoute
  );
};
