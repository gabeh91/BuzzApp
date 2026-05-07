import assert from "node:assert/strict";
import test from "node:test";

import { createBuzzAuthState } from "./AuthProvider";
import { createDemoBuzzUser } from "./demoAuth";

test("createDemoBuzzUser keeps demo identity behind a replaceable auth boundary", () => {
  const user = createDemoBuzzUser({
    EXPO_PUBLIC_DEMO_USER_ID: "00000000-0000-0000-0000-000000000202",
    EXPO_PUBLIC_DEMO_CITY_ID: "00000000-0000-0000-0000-000000000001",
    EXPO_PUBLIC_DEMO_DISPLAY_NAME: "Mia"
  });

  assert.deepEqual(user, {
    id: "00000000-0000-0000-0000-000000000202",
    displayName: "Mia",
    cityId: "00000000-0000-0000-0000-000000000001",
    cityName: "Melbourne",
    authSource: "demo"
  });
  assert.equal("isDemo" in user, false);
});

test("createDemoBuzzUser has safe local defaults when demo env values are absent", () => {
  const user = createDemoBuzzUser({});

  assert.equal(user.id, "00000000-0000-0000-0000-000000000101");
  assert.equal(user.cityId, "00000000-0000-0000-0000-000000000001");
  assert.equal(user.displayName, "New Buzz Member");
  assert.equal(user.authSource, "demo");
});

test("createBuzzAuthState derives mode from the replaceable user auth source", () => {
  const state = createBuzzAuthState({
    EXPO_PUBLIC_DEMO_USER_ID: "00000000-0000-0000-0000-000000000303",
    EXPO_PUBLIC_DEMO_CITY_ID: "00000000-0000-0000-0000-000000000001",
    EXPO_PUBLIC_DEMO_DISPLAY_NAME: "Noor"
  });

  assert.equal(state.mode, "demo");
  assert.equal(state.user.authSource, "demo");
  assert.equal(state.user.displayName, "Noor");
  assert.equal("isDemo" in state.user, false);
});
