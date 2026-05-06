import assert from "node:assert/strict";
import test from "node:test";

import { isOnboardingRoute, routes } from "./routes";

test("routes define Expo Router paths for onboarding and the first app destination", () => {
  assert.deepEqual(routes, {
    onboarding: "/",
    home: "/home"
  });
});

test("isOnboardingRoute identifies the guided onboarding entry route", () => {
  assert.equal(isOnboardingRoute(routes.onboarding), true);
  assert.equal(isOnboardingRoute(routes.home), false);
});
