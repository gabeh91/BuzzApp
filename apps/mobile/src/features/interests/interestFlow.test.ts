import assert from "node:assert/strict";
import test from "node:test";

import { activateInterestLocally, createInitialInterestFlowState, selectInterest } from "./interestFlow";

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
  assert.equal(activated.activation.message, "Surfing is active for your demo profile.");
  assert.equal(activated.matchPreview?.interestName, "Surfing");
});
