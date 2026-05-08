import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { createCityContextFallback } from "@/features/city/cityContext";

import { createDefaultActivityPlan } from "./activityPlan";

test("createDefaultActivityPlan turns an interest and match suggestion into a public structured plan", () => {
  const plan = createDefaultActivityPlan({
    cityContext: createCityContextFallback({ cityName: "Melbourne" }),
    interestName: "Coffee",
    matchSuggestion: "Suggest a clear Coffee plan for the next weekend."
  });

  assert.equal(plan.title, "Coffee plan in Melbourne");
  assert.equal(plan.activityName, "Coffee");
  assert.equal(plan.status, "proposed");
  assert.equal(plan.confirmationStatus, "pending");
  assert.equal(plan.publicLocationName, "Public Coffee spot in Melbourne");
  assert.equal(plan.locationVisibility, "area_only");
  assert.equal(plan.venueType, "public");
  assert.equal(plan.capacityMin, 3);
  assert.equal(plan.capacityMax, 5);
  assert.equal(plan.minGroupSize, 3);
  assert.equal(plan.suggestedTiming, "Next weekend");
  assert.match(plan.safetyGuidance, /public venue/);
});

test("accept-match creates and returns activity plan metadata", () => {
  const source = readFileSync("../../supabase/functions/accept-match/index.ts", "utf8");

  assert.match(source, /activity_plans/);
  assert.match(source, /confirmation_status/);
  assert.match(source, /activityPlan/);
});

test("group screen renders a structured plan card with pre-plan confirmation", () => {
  const groupSource = readFileSync("src/features/groups/GroupScreen.tsx", "utf8");
  const translationsSource = readFileSync("src/i18n/en.ts", "utf8");

  assert.match(groupSource, /createDefaultActivityPlan/);
  assert.match(groupSource, /confirmationStatus/);
  assert.match(groupSource, /LL\.groups\.planCard/);
  assert.match(translationsSource, /planCard:/);
  assert.match(translationsSource, /confirm:/);
  assert.match(translationsSource, /requestChanges:/);
});
