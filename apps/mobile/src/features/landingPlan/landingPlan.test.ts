import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { createCityContextFallback } from "@/features/city/cityContext";
import type { ProfileTraits } from "@/features/quiz/quizModel";

import { createLandingPlan } from "./landingPlan";

const traits: ProfileTraits = {
  energy: "medium",
  planning: "planned",
  socialStyle: "small_group",
  availability: "weekend",
  activityIntent: "learn",
  cityTags: [],
  lifestyleTags: [],
  quizCompleted: true,
  answersCount: 20,
  totalQuestions: 20,
  summary: "Small group weekend learner",
};

test("createLandingPlan wraps suburb fit, interests, groups, invites, and repeat connection into a 30-day checklist", () => {
  const plan = createLandingPlan({
    cityContext: createCityContextFallback({ cityName: "Melbourne" }),
    selectedInterests: ["Coffee"],
    topSuburbs: ["Fitzroy", "Brunswick", "South Yarra"],
    traits,
  });

  assert.equal(plan.title, "Your first 30 days in Melbourne");
  assert.equal(plan.status, "active");
  assert.equal(plan.items[0]?.itemType, "complete_profile");
  assert.equal(plan.items[0]?.status, "completed");
  assert.equal(plan.items[1]?.itemType, "explore_suburb");
  assert.equal(plan.items[1]?.title, "Explore Fitzroy");
  assert.equal(plan.items[1]?.status, "active");
  assert.deepEqual(
    [...new Set(plan.items.map((item) => item.weekNumber))],
    [1, 2, 3, 4],
  );
  assert.ok(
    plan.items.some(
      (item) =>
        item.itemType === "activate_interest" && item.title.includes("Coffee"),
    ),
  );
  assert.ok(plan.items.some((item) => item.itemType === "join_plan"));
  assert.ok(plan.items.some((item) => item.itemType === "attend_activity"));
  assert.ok(plan.items.some((item) => item.itemType === "bring_friend"));
  assert.ok(plan.items.some((item) => item.itemType === "meet_again"));
});

test("profile screen renders the deterministic landing plan checklist while home stays activity-focused", () => {
  const homeSource = readFileSync("src/features/home/HomeScreen.tsx", "utf8");
  const profileSource = readFileSync(
    "src/features/profile/ProfileScreen.tsx",
    "utf8",
  );
  const rootTabsSource = readFileSync("src/navigation/RootTabs.tsx", "utf8");
  const translationsSource = readFileSync("src/i18n/en.ts", "utf8");

  assert.doesNotMatch(homeSource, /landingPlan\.items/);
  assert.doesNotMatch(homeSource, /LL\.home\.landingPlan/);
  assert.doesNotMatch(homeSource, /routes\.profile/);
  assert.match(rootTabsSource, /name="profile"/);
  assert.match(profileSource, /createLandingPlan/);
  assert.match(profileSource, /getTopSuburbMatchesForTraits/);
  assert.match(profileSource, /topSuburbMatches\.map/);
  assert.match(homeSource, /LL\.home\.suburbFit\.title/);
  assert.match(profileSource, /landingPlan\.items/);
  assert.match(profileSource, /LL\.profile\.landingPlan/);
  assert.match(translationsSource, /landingPlan:/);
  assert.match(translationsSource, /suburbFit:/);
  assert.match(translationsSource, /first30Days/);
});
