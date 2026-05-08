import type { ProfileTraits } from "../quiz/quizModel";
import type { MatchCandidatePreview, MatchCandidateSource } from "./matchCandidate.types";

export type DeterministicMatchCandidateInput = {
  id: string;
  displayName: string;
  interestName: string;
  traits: ProfileTraits;
  candidateTraits?: Partial<ProfileTraits>;
  isDemo: boolean;
  source: MatchCandidateSource;
};

const formatScore = (score: number): number => {
  return Number(score.toFixed(2));
};

const calculateCompatibilityScore = (traits: ProfileTraits, candidateTraits: Partial<ProfileTraits> = {}): number => {
  const score =
    0.72 +
    (candidateTraits.socialStyle === traits.socialStyle ? 0.08 : 0) +
    (candidateTraits.energy === traits.energy ? 0.06 : 0) +
    (candidateTraits.planning === traits.planning ? 0.04 : 0) +
    (candidateTraits.availability === traits.availability ? 0.04 : 0);

  return formatScore(Math.min(0.94, score));
};

export const createDeterministicMatchCandidate = ({
  id,
  displayName,
  interestName,
  traits,
  candidateTraits,
  isDemo,
  source
}: DeterministicMatchCandidateInput): MatchCandidatePreview => {
  const groupPhrase = traits.socialStyle === "one_on_one" ? "one-on-one" : traits.socialStyle === "large_group" ? "open group" : "small group";
  const pacePhrase = traits.energy === "high" ? "with real momentum" : traits.energy === "low" ? "without pressure" : "at an easy pace";
  const hasSimilarPace = candidateTraits?.energy === traits.energy || candidateTraits?.socialStyle === traits.socialStyle;

  return {
    id,
    displayName,
    interestName,
    headline: `${displayName} is also open to ${interestName}`,
    reason: hasSimilarPace
      ? `You both look suited to a ${groupPhrase} ${interestName} plan at a similar pace.`
      : `You both look suited to a ${groupPhrase} ${interestName} plan ${pacePhrase}.`,
    suggestedPlan:
      traits.planning === "spontaneous"
        ? `Suggest a low-pressure ${interestName} session this week.`
        : `Suggest a clear ${interestName} plan for the next ${traits.availability === "weekend" ? "weekend" : "few days"}.`,
    score: calculateCompatibilityScore(traits, candidateTraits),
    isDemo,
    source
  };
};
