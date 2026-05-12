import assert from "node:assert/strict";
import test from "node:test";

import {
  createAnonymousOnboardingDraft,
  claimAnonymousOnboardingDraft,
  isAnonymousOnboardingDraftReusable,
  mergeQuizAnswerIntoDraft,
  markAnonymousOnboardingComplete,
  resetClaimedAnonymousOnboardingDraft,
  selectDraftInterest,
} from "./onboardingDraft";

test("anonymous onboarding draft captures partly filled quiz answers", () => {
  const draft = mergeQuizAnswerIntoDraft(
    createAnonymousOnboardingDraft(),
    "pace",
    "low",
    3,
  );

  assert.equal(draft.status, "partial");
  assert.equal(draft.answers.pace, "low");
  assert.equal(draft.activeQuestionIndex, 3);
  assert.equal(draft.claimedUserId, undefined);
});

test("anonymous onboarding draft can store selected interest before auth", () => {
  const draft = selectDraftInterest(createAnonymousOnboardingDraft(), {
    id: "interest-1",
    name: "Golf",
    slug: "golf",
    category: "sport",
  });

  assert.equal(draft.status, "partial");
  assert.equal(draft.selectedInterest?.name, "Golf");
});

test("anonymous onboarding draft completion is separate from auth claim", () => {
  const completed = markAnonymousOnboardingComplete(
    mergeQuizAnswerIntoDraft(
      createAnonymousOnboardingDraft(),
      "pace",
      "low",
      19,
    ),
  );

  assert.equal(completed.status, "complete");
  const completedAt = completed.completedAt;

  assert.ok(completedAt);
  assert.equal(completedAt.length > 0, true);
  assert.equal(completed.claimedUserId, undefined);
});

test("anonymous onboarding draft can be claimed after first auth", () => {
  const draft = mergeQuizAnswerIntoDraft(
    createAnonymousOnboardingDraft(),
    "pace",
    "low",
    1,
  );

  const claimed = claimAnonymousOnboardingDraft(draft, "user-1");

  assert.equal(claimed.status, "partial");
  assert.equal(claimed.claimedUserId, "user-1");
  assert.equal(claimed.answers.pace, "low");
});

test("claimed anonymous onboarding drafts are not reused for a later account", () => {
  const completed = markAnonymousOnboardingComplete(
    mergeQuizAnswerIntoDraft(
      createAnonymousOnboardingDraft(),
      "pace",
      "low",
      19,
    ),
    new Date("2026-05-12T00:00:00.000Z"),
  );
  const claimed = claimAnonymousOnboardingDraft(completed, "user-1");

  assert.equal(isAnonymousOnboardingDraftReusable(completed), true);
  assert.equal(isAnonymousOnboardingDraftReusable(claimed), false);
  assert.deepEqual(
    resetClaimedAnonymousOnboardingDraft(claimed, "user-1"),
    createAnonymousOnboardingDraft(),
  );
});
