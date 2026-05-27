import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

import type { BuzzAuthUser } from "@/auth/auth.types";

import {
  activateInterestLocally,
  completeBackendActivation,
  createInitialInterestFlowState,
  isBackendActivationResult,
  isBackendActivationRateLimitResult,
  parseActivateInterestJsonScalar,
  selectInterest,
  setActivationAvailabilityIntent,
  shouldActivateInterestThroughSupabase,
} from "../interestFlow";

const surfing = {
  id: "00000000-0000-0000-0000-000000000001",
  name: "Surfing",
  slug: "surfing",
  category: "sport",
};

test("selectInterest stores a replaceable interest selection state", () => {
  const state = selectInterest(createInitialInterestFlowState(), surfing);

  assert.equal(state.selectedInterest?.id, surfing.id);
  assert.equal(state.activation.status, "idle");
  assert.equal(state.matchPreview, null);
});

test("activateInterestLocally completes activation without creating a fake match preview", () => {
  const selected = selectInterest(createInitialInterestFlowState(), surfing);
  const activated = activateInterestLocally(selected);

  assert.equal(activated.activation.status, "complete");
  assert.equal(
    activated.activation.message,
    "Surfing is on. Your next suggestion can start from this.",
  );
  assert.equal(activated.matchPreview, null);
});

test("parseActivateInterestJsonScalar parses stringified JSON from GraphQL JSON scalars", () => {
  const raw = JSON.stringify({
    ok: true,
    activationId: "00000000-0000-0000-0000-000000000501",
    interestId: "00000000-0000-0000-0000-000000000001",
    interestName: "Surfing",
    matchCandidates: [],
  });
  const parsed = parseActivateInterestJsonScalar(raw);

  assert.equal(isBackendActivationResult(parsed), true);
});

test("rate-limited activation responses are parsed separately from successful activations", () => {
  const raw = JSON.stringify({
    ok: false,
    code: "rate_limited_activity",
    retryAfterSeconds: 421,
    interestId: surfing.id,
    interestName: surfing.name,
  });
  const parsed = parseActivateInterestJsonScalar(raw);

  assert.equal(isBackendActivationRateLimitResult(parsed), true);
  assert.equal(isBackendActivationResult(parsed), false);
});

test("shouldActivateInterestThroughSupabase only sends activation writes for Supabase users", () => {
  const user: BuzzAuthUser = {
    id: "00000000-0000-0000-0000-000000000101",
    displayName: "Mia",
    cityId: "00000000-0000-0000-0000-000000000001",
    cityName: "Melbourne",
    authSource: "demo",
  };

  assert.equal(shouldActivateInterestThroughSupabase(user), false);
  assert.equal(
    shouldActivateInterestThroughSupabase({ ...user, authSource: "supabase" }),
    true,
  );
});

test("setActivationAvailabilityIntent stores pre-activation availability preferences", () => {
  const state = setActivationAvailabilityIntent(
    createInitialInterestFlowState(),
    {
      availabilityWindow: "weekend",
      preferredTime: "daytime",
      urgency: "soon",
    },
  );

  assert.deepEqual(state.activationAvailability, {
    availabilityWindow: "weekend",
    preferredTime: "daytime",
    urgency: "soon",
  });
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
        score: 0.82,
      },
    ],
  });

  assert.equal(activated.activation.status, "complete");
  assert.equal(
    activated.activation.activationId,
    "00000000-0000-0000-0000-000000000501",
  );
  assert.equal(activated.activation.source, "supabase");
  assert.equal(activated.matchPreview?.isDemo, false);
  assert.equal(activated.matchPreview?.source, "supabase");
  assert.equal(
    activated.matchPreview?.id,
    "00000000-0000-0000-0000-000000000601",
  );
  assert.equal(activated.matchPreview?.score, 0.82);
  assert.equal(activated.matchPreview?.displayName, "Sam");
  assert.equal(activated.matchPreview?.reason, "Sam also activated Surfing.");
});

const readOptionalSource = (path: string): string => {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
};

test("accept match edge function authenticates the profile, accepts the candidate, and creates an activity group", () => {
  const source = readFileSync(
    "../../supabase/functions/accept-match/index.ts",
    "utf8",
  );

  assert.match(source, /resolveCurrentProfile/);
  assert.match(source, /match_candidates/);
  assert.match(source, /status:\s*"accepted"/);
  assert.match(source, /activity_groups/);
  assert.match(source, /activity_group_members/);
  assert.match(source, /activityGroupId/);
});

test("decline match edge function authenticates the profile and does not create a group", () => {
  const source = readFileSync(
    "../../supabase/functions/decline-match/index.ts",
    "utf8",
  );

  assert.match(source, /resolveCurrentProfile/);
  assert.match(source, /match_candidates/);
  assert.match(source, /status:\s*"declined"/);
  assert.doesNotMatch(source, /activity_groups/);
  assert.doesNotMatch(source, /activity_group_members/);
});

test("mobile match action client calls accept and decline Edge Functions with local-only bypass headers", () => {
  const source = readOptionalSource("src/lib/functions.ts");

  assert.match(source, /accept-match/);
  assert.match(source, /decline-match/);
  assert.match(source, /functions\/v1/);
  assert.match(source, /x-buzz-local-bypass/);
  assert.match(source, /appEnv === "local"/);
});

test("onboarding captures availability intent before activating an interest", () => {
  const source = readFileSync(
    "src/features/onboarding/OnboardingStepContent.tsx",
    "utf8",
  );
  const translationsSource = readFileSync("src/i18n/en.ts", "utf8");

  assert.match(source, /availabilityOptions/);
  assert.match(source, /setAvailabilityIntent/);
  assert.match(source, /LL\.onboarding\.activation\.availability/);
  assert.match(translationsSource, /availability:/);
  assert.match(translationsSource, /weekend:/);
  assert.match(translationsSource, /daytime:/);
});
