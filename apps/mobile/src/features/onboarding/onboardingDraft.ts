import type { BuzzInterest } from "@/features/interests/interestFlow";
import type { QuizAnswers } from "@/features/quiz/quizModel";

export type AnonymousOnboardingDraftStatus = "empty" | "partial" | "complete";

export type AnonymousOnboardingDraft = {
  status: AnonymousOnboardingDraftStatus;
  answers: QuizAnswers;
  activeQuestionIndex: number;
  selectedInterest: BuzzInterest | null;
  /** Display name collected before the lifestyle quiz (anonymous draft). */
  profileDisplayName?: string;
  profileCityId?: string;
  profileCityName?: string;
  /** Legacy resume metadata from the previous two-phase short profile step. */
  shortProfileSubIndex: number;
  shortProfileComplete: boolean;
  completedAt?: string;
  claimedUserId?: string;
};

const resetClaimMetadata = (
  draft: AnonymousOnboardingDraft,
): AnonymousOnboardingDraft => {
  const reusableDraft = { ...draft };

  delete reusableDraft.claimedUserId;
  delete reusableDraft.completedAt;

  return reusableDraft;
};

export const createAnonymousOnboardingDraft = (): AnonymousOnboardingDraft => ({
  activeQuestionIndex: 0,
  answers: {},
  selectedInterest: null,
  shortProfileSubIndex: 0,
  shortProfileComplete: false,
  status: "empty",
});

export const mergeShortProfileNameIntoDraft = (
  draft: AnonymousOnboardingDraft,
  profileDisplayName: string,
  city: { id: string; name: string },
): AnonymousOnboardingDraft => {
  const trimmedName = profileDisplayName.trim();

  return {
    ...resetClaimMetadata(draft),
    profileCityId: city.id,
    profileCityName: city.name,
    profileDisplayName: trimmedName,
    shortProfileComplete: trimmedName.length > 0,
    shortProfileSubIndex: 0,
    status: "partial",
  };
};

export const mergeQuizAnswerIntoDraft = (
  draft: AnonymousOnboardingDraft,
  questionId: string,
  optionId: string,
  activeQuestionIndex: number,
): AnonymousOnboardingDraft => ({
  ...resetClaimMetadata(draft),
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
  ...resetClaimMetadata(draft),
  selectedInterest,
  status: draft.status === "complete" ? "complete" : "partial",
});

export const clearDraftInterest = (
  draft: AnonymousOnboardingDraft,
): AnonymousOnboardingDraft => ({
  ...resetClaimMetadata(draft),
  selectedInterest: null,
  status: draft.status === "empty" ? "empty" : "partial",
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
