import assert from "node:assert/strict";
import test from "node:test";

import { isOnboardingRoute, routes } from "./routes";

test("routes define Expo Router paths for onboarding, home, profile, and activity groups", () => {
  assert.equal(routes.onboarding, "/");
  assert.equal(routes.home, "/home");
  assert.equal(routes.profile, "/profile");
  assert.equal(routes.group("group-123"), "/groups/group-123");
});

test("isOnboardingRoute identifies the guided onboarding entry route", () => {
  assert.equal(isOnboardingRoute(routes.onboarding), true);
  assert.equal(isOnboardingRoute(routes.home), false);
  assert.equal(isOnboardingRoute(routes.profile), false);
  assert.equal(isOnboardingRoute(routes.group("group-123")), false);
});
