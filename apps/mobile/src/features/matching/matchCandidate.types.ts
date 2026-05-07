export type MatchCandidateSource = "local" | "supabase";

export type MatchCandidatePreview = {
  id: string;
  displayName: string;
  interestName: string;
  headline: string;
  reason: string;
  suggestedPlan: string;
  score: number;
  isDemo: boolean;
  source: MatchCandidateSource;
};
