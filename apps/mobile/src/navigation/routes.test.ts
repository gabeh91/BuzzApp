import assert from "node:assert/strict";
import test from "node:test";

import { isOnboardingRoute, routes } from "./routes";

test("routes define Expo Router paths for onboarding, root tabs, and activity groups", () => {
  assert.equal(routes.onboarding, "/");
  assert.equal(routes.onboardingQuiz, "/onboarding");
  assert.equal(routes.home, "/home");
  assert.equal(routes.activities, "/activities");
  assert.equal(routes.chats, "/chats");
  assert.equal(routes.profile, "/profile");
  assert.equal(routes.auth, "/auth");
  assert.equal(routes.authCode, "/auth/code");
  assert.equal(routes.group("group-123"), "/groups/group-123");
  assert.equal(
    routes.peopleConnect("profile-123"),
    "/people/profile-123/connect",
  );
});

test("isOnboardingRoute identifies the guided onboarding entry route", () => {
  assert.equal(isOnboardingRoute(routes.onboarding), true);
  assert.equal(isOnboardingRoute(routes.onboardingQuiz), true);
  assert.equal(isOnboardingRoute(routes.home), false);
  assert.equal(isOnboardingRoute(routes.activities), false);
  assert.equal(isOnboardingRoute(routes.chats), false);
  assert.equal(isOnboardingRoute(routes.profile), false);
  assert.equal(isOnboardingRoute(routes.group("group-123")), false);
  assert.equal(isOnboardingRoute(routes.peopleConnect("profile-123")), false);
});
