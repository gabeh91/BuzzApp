import assert from "node:assert/strict";
import test from "node:test";

import { createHomePlanCopy } from "../homePlanCopy";

const copy = {
  titleActivated: ({ interest }: { interest: string }) => `You activated ${interest}.`,
  titleReady: () => "You are set to keep exploring.",
  activatedBody: () => "Here are practical next steps around this interest.",
  readyBody: () => "Finish your first steps to see a suggested plan tailored to you.",
  browsingBody: () =>
    "Look around for now. Sign in when you want to join or say you are in for a plan.",
  emptyPlan: () => "No suggested plan yet.",
  inactiveInterestTitle: ({ interest }: { interest: string }) =>
    `Keep browsing around ${interest}.`,
  waitingForCandidateTitle: () => "Explore your best-fit suburbs",
  waitingForCandidateBody: ({ interest }: { interest: string }) =>
    `Keep ${interest} on while we look for people who fit your pace and timing.`,
};

test("createHomePlanCopy keeps activated local onboarding plan-first without inventing a match", () => {
  const planCopy = createHomePlanCopy({
    activationComplete: true,
    hasSelectedInterest: true,
    interestName: "Golf",
    match: null,
    traitsSummary: "Small weekend groups fit.",
    copy
  });

  assert.equal(planCopy.title, "You activated Golf.");
  assert.equal(planCopy.body, "Here are practical next steps around this interest.");
  assert.equal(planCopy.suggestedTitle, "Explore your best-fit suburbs");
  assert.equal(
    planCopy.suggestedBody,
    "Keep Golf on while we look for people who fit your pace and timing.",
  );
  assert.equal(planCopy.canActOnMatch, false);
});

test("createHomePlanCopy preserves real backend match actions when a candidate exists", () => {
  const planCopy = createHomePlanCopy({
    activationComplete: true,
    hasSelectedInterest: true,
    interestName: "Golf",
    match: {
      id: "match-1",
      displayName: "Sam",
      interestName: "Golf",
      headline: "Sam is also open to Golf",
      reason: "You both look suited to a small group Golf plan.",
      suggestedPlan: "Suggest a clear Golf plan this weekend.",
      score: 0.82,
      isDemo: false,
      source: "supabase"
    },
    traitsSummary: "Small weekend groups fit.",
    copy
  });

  assert.equal(planCopy.title, "You activated Golf.");
  assert.equal(planCopy.suggestedTitle, "Sam is also open to Golf");
  assert.equal(planCopy.suggestedBody, "You both look suited to a small group Golf plan.");
  assert.equal(planCopy.canActOnMatch, true);
});

test("createHomePlanCopy keeps incomplete onboarding copy before activation", () => {
  const planCopy = createHomePlanCopy({
    activationComplete: false,
    hasSelectedInterest: false,
    interestName: "your next interest",
    match: null,
    traitsSummary: "Small weekend groups fit.",
    copy
  });

  assert.equal(planCopy.title, "You are set to keep exploring.");
  assert.equal(planCopy.body, "Finish your first steps to see a suggested plan tailored to you.");
  assert.equal(planCopy.suggestedTitle, "No suggested plan yet.");
  assert.equal(planCopy.suggestedBody, "Small weekend groups fit.");
  assert.equal(planCopy.canActOnMatch, false);
});
