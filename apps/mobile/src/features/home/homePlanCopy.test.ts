import assert from "node:assert/strict";
import test from "node:test";

import { createHomePlanCopy } from "./homePlanCopy";

const copy = {
  titleActivated: ({ interest }: { interest: string }) => `You activated ${interest}.`,
  titleReady: () => "Your Buzz profile is ready.",
  activatedBody: () => "You can now see practical next steps around this interest.",
  readyBody: () => "Complete onboarding to unlock your first suggested plan.",
  browsingBody: () => "Browse activities now and sign in when you are ready to join or activate a plan.",
  emptyPlan: () => "No suggested plan yet.",
  inactiveInterestTitle: ({ interest }: { interest: string }) =>
    `Keep browsing around ${interest}.`,
  waitingForCandidateTitle: () => "Explore your best-fit suburbs",
  waitingForCandidateBody: ({ interest }: { interest: string }) =>
    `Keep ${interest} active while Buzz looks for a real compatible plan.`
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
  assert.equal(planCopy.body, "You can now see practical next steps around this interest.");
  assert.equal(planCopy.suggestedTitle, "Explore your best-fit suburbs");
  assert.equal(planCopy.suggestedBody, "Keep Golf active while Buzz looks for a real compatible plan.");
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

  assert.equal(planCopy.title, "Your Buzz profile is ready.");
  assert.equal(planCopy.body, "Complete onboarding to unlock your first suggested plan.");
  assert.equal(planCopy.suggestedTitle, "No suggested plan yet.");
  assert.equal(planCopy.suggestedBody, "Small weekend groups fit.");
  assert.equal(planCopy.canActOnMatch, false);
});
