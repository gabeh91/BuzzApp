import type { BuzzInterest } from "@/features/interests/interestFlow";
import type { QuizAnswers } from "@/features/quiz/quizModel";

export type AnonymousOnboardingDraftStatus = "empty" | "partial" | "complete";

export type AnonymousOnboardingDraft = {
  status: AnonymousOnboardingDraftStatus;
  answers: QuizAnswers;
  activeQuestionIndex: number;
  selectedInterest: BuzzInterest | null;
  completedAt?: string;
  claimedUserId?: string;
};

export const createAnonymousOnboardingDraft = (): AnonymousOnboardingDraft => ({
  activeQuestionIndex: 0,
  answers: {},
  selectedInterest: null,
  status: "empty",
});

export const mergeQuizAnswerIntoDraft = (
  draft: AnonymousOnboardingDraft,
  questionId: string,
  optionId: string,
  activeQuestionIndex: number,
): AnonymousOnboardingDraft => ({
  ...draft,
  activeQuestionIndex,
  answers: {
    ...draft.answers,
    [questionId]: optionId,
  },
  status: "partial",
});

export const selectDraftInterest = (
  draft: AnonymousOnboardingDraft,
  selectedInterest: BuzzInterest,
): AnonymousOnboardingDraft => ({
  ...draft,
  selectedInterest,
  status: draft.status === "complete" ? "complete" : "partial",
});

export const markAnonymousOnboardingComplete = (
  draft: AnonymousOnboardingDraft,
  now: Date = new Date(),
): AnonymousOnboardingDraft => ({
  ...draft,
  completedAt: now.toISOString(),
  status: "complete",
});

export const claimAnonymousOnboardingDraft = (
  draft: AnonymousOnboardingDraft,
  userId: string,
): AnonymousOnboardingDraft => ({
  ...draft,
  claimedUserId: userId,
});

export const isAnonymousOnboardingDraftReusable = (
  draft: AnonymousOnboardingDraft,
): boolean => !draft.claimedUserId;

export const shouldRestoreAnonymousOnboardingDraft = (
  draft: AnonymousOnboardingDraft,
): boolean =>
  draft.status !== "empty" && isAnonymousOnboardingDraftReusable(draft);

export const isAnonymousOnboardingCompleteForCurrentVisitor = (
  draft: AnonymousOnboardingDraft,
): boolean =>
  draft.status === "complete" && isAnonymousOnboardingDraftReusable(draft);

export const resetClaimedAnonymousOnboardingDraft = (
  draft: AnonymousOnboardingDraft,
  userId: string,
): AnonymousOnboardingDraft => {
  if (draft.claimedUserId !== userId) {
    return draft;
  }

  return createAnonymousOnboardingDraft();
};
