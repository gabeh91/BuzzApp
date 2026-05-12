import type { MatchCandidatePreview } from "@/features/matching/matchCandidate.types";

export type HomePlanCopyInput = {
  activationComplete: boolean;
  hasSelectedInterest: boolean;
  interestName: string;
  match: MatchCandidatePreview | null;
  traitsSummary: string;
  copy: {
    titleActivated: (params: { interest: string }) => string;
    titleReady: () => string;
    activatedBody: () => string;
    readyBody: () => string;
    browsingBody: () => string;
    emptyPlan: () => string;
    inactiveInterestTitle: (params: { interest: string }) => string;
    waitingForCandidateTitle: () => string;
    waitingForCandidateBody: (params: { interest: string }) => string;
  };
};

export type HomePlanCopy = {
  title: string;
  body: string;
  suggestedTitle: string;
  suggestedBody: string;
  canActOnMatch: boolean;
};

export const createHomePlanCopy = ({
  activationComplete,
  hasSelectedInterest,
  interestName,
  match,
  traitsSummary,
  copy
}: HomePlanCopyInput): HomePlanCopy => {
  if (match) {
    return {
      title: copy.titleActivated({ interest: interestName }),
      body: copy.activatedBody(),
      suggestedTitle: match.headline,
      suggestedBody: match.reason,
      canActOnMatch: true
    };
  }

  if (activationComplete) {
    return {
      title: copy.titleActivated({ interest: interestName }),
      body: copy.activatedBody(),
      suggestedTitle: copy.waitingForCandidateTitle(),
      suggestedBody: copy.waitingForCandidateBody({ interest: interestName }),
      canActOnMatch: false
    };
  }

  if (hasSelectedInterest) {
    return {
      title: copy.titleReady(),
      body: copy.browsingBody(),
      suggestedTitle: copy.inactiveInterestTitle({ interest: interestName }),
      suggestedBody: traitsSummary,
      canActOnMatch: false
    };
  }

  return {
    title: copy.titleReady(),
    body: copy.readyBody(),
    suggestedTitle: copy.emptyPlan(),
    suggestedBody: traitsSummary,
    canActOnMatch: false
  };
};
