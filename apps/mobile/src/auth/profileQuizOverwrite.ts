import type { AnonymousOnboardingDraft } from "@/features/onboarding/onboardingDraft";

import type { ProfileQuizState } from "./auth.types";

type ProfileQuizOverwriteInput = {
  draft: AnonymousOnboardingDraft;
  profileQuizState: ProfileQuizState | null;
};

const hasDraftQuizAnswers = (draft: AnonymousOnboardingDraft): boolean =>
  Object.keys(draft.answers).length > 0;

const hasProfileQuizAnswers = (profileQuizState: ProfileQuizState): boolean =>
  Object.keys(profileQuizState.quizAnswers ?? {}).length > 0;

export const shouldPromptForProfileQuizOverwrite = ({
  draft,
  profileQuizState,
}: ProfileQuizOverwriteInput): boolean => {
  if (draft.claimedUserId) {
    return false;
  }

  return Boolean(
    profileQuizState &&
    hasDraftQuizAnswers(draft) &&
    (profileQuizState.quizCompleted || hasProfileQuizAnswers(profileQuizState)),
  );
};
