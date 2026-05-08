import assert from "node:assert/strict";
import test from "node:test";

import { createDeterministicMatchCandidate } from "./demoMatch";
import type { MatchCandidatePreview } from "./matchCandidate.types";

test("createDeterministicMatchCandidate prefers compatible quiz traits", () => {
  const baseTraits = {
    energy: "high",
    planning: "planned",
    socialStyle: "small_group",
    availability: "weekend",
    activityIntent: "learn",
    cityTags: [],
    lifestyleTags: [],
    quizCompleted: true,
    answersCount: 20,
    totalQuestions: 20,
    summary: "You seem ready for small groups."
  } as const;

  const compatible = createDeterministicMatchCandidate({
    id: "candidate-compatible",
    displayName: "Mia",
    interestName: "Surfing",
    traits: baseTraits,
    candidateTraits: baseTraits,
    isDemo: false,
    source: "supabase"
  });
  const lessCompatible = createDeterministicMatchCandidate({
    id: "candidate-less-compatible",
    displayName: "Noah",
    interestName: "Surfing",
    traits: baseTraits,
    candidateTraits: {
      ...baseTraits,
      energy: "low",
      planning: "spontaneous",
      socialStyle: "one_on_one",
      availability: "weekday"
    },
    isDemo: false,
    source: "supabase"
  });

  const preview: MatchCandidatePreview = compatible;

  assert.equal(preview.source, "supabase");
  assert.equal(preview.isDemo, false);
  assert.equal(preview.id, "candidate-compatible");
  assert.ok(compatible.score > lessCompatible.score);
  assert.match(compatible.reason, /similar pace/i);
  assert.match(compatible.suggestedPlan, /weekend/i);
});
