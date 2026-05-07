import assert from "node:assert/strict";
import test from "node:test";

import type { BuzzAuthUser } from "@/auth/auth.types";

import {
  activateInterestLocally,
  completeBackendActivation,
  createInitialInterestFlowState,
  selectInterest,
  shouldActivateInterestThroughSupabase
} from "./interestFlow";

const surfing = {
  id: "00000000-0000-0000-0000-000000000001",
  name: "Surfing",
  slug: "surfing",
  category: "sport"
};

test("selectInterest stores a replaceable interest selection state", () => {
  const state = selectInterest(createInitialInterestFlowState(), surfing);

  assert.equal(state.selectedInterest?.id, surfing.id);
  assert.equal(state.activation.status, "idle");
  assert.equal(state.matchPreview, null);
});

test("activateInterestLocally creates a deterministic preview from selected interest and traits", () => {
  const selected = selectInterest(createInitialInterestFlowState(), surfing);
  const activated = activateInterestLocally(selected, {
    energy: "medium",
    planning: "balanced",
    socialStyle: "small_group",
    availability: "weekend",
    activityIntent: "social",
    quizCompleted: true,
    answersCount: 20,
    totalQuestions: 20,
    summary: "Small groups fit."
  });

  assert.equal(activated.activation.status, "complete");
  assert.equal(activated.activation.message, "Surfing is active. Buzz will use it to shape your next suggestion.");
  assert.equal(activated.matchPreview?.interestName, "Surfing");
});

test("shouldActivateInterestThroughSupabase only sends activation writes for Supabase users", () => {
  const user: BuzzAuthUser = {
    id: "00000000-0000-0000-0000-000000000101",
    displayName: "Mia",
    cityId: "00000000-0000-0000-0000-000000000001",
    cityName: "Melbourne",
    authSource: "demo"
  };

  assert.equal(shouldActivateInterestThroughSupabase(user), false);
  assert.equal(shouldActivateInterestThroughSupabase({ ...user, authSource: "supabase" }), true);
});

test("completeBackendActivation stores the persisted activation and first backend match preview", () => {
  const selected = selectInterest(createInitialInterestFlowState(), surfing);
  const activated = completeBackendActivation(selected, {
    ok: true,
    activationId: "00000000-0000-0000-0000-000000000501",
    interestId: surfing.id,
    interestName: surfing.name,
    matchCandidates: [
      {
        id: "00000000-0000-0000-0000-000000000601",
        displayName: "Sam",
        reason: "Sam also activated Surfing.",
        suggestedPlan: "Suggest a Surfing plan this week.",
        score: 0.82
      }
    ]
  });

  assert.equal(activated.activation.status, "complete");
  assert.equal(activated.activation.activationId, "00000000-0000-0000-0000-000000000501");
  assert.equal(activated.activation.source, "supabase");
  assert.equal(activated.matchPreview?.isDemo, false);
  assert.equal(activated.matchPreview?.displayName, "Sam");
  assert.equal(activated.matchPreview?.reason, "Sam also activated Surfing.");
});
