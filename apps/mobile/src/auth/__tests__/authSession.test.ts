import assert from "node:assert/strict";
import test from "node:test";

import {
  createAnonymousBuzzUser,
  createSupabaseBuzzUser,
  shouldLockStoredSession,
} from "../authSession";

test("anonymous browsing user is not an authenticated interaction identity", () => {
  const user = createAnonymousBuzzUser();

  assert.equal(user.authSource, "anonymous");
  assert.equal(user.id.startsWith("anonymous-"), true);
  assert.equal(user.cityName, "Melbourne");
});

test("Supabase session maps to authenticated Buzz user", () => {
  const user = createSupabaseBuzzUser({
    cityId: "city-1",
    cityName: "Melbourne",
    email: "sam@example.com",
    id: "user-1",
  });

  assert.deepEqual(user, {
    authSource: "supabase",
    cityId: "city-1",
    cityName: "Melbourne",
    displayName: "sam@example.com",
    id: "user-1",
  });
});

test("stored Supabase sessions only lock when biometric unlock is enabled", () => {
  assert.equal(
    shouldLockStoredSession({
      biometricEnabled: true,
      hasStoredSupabaseSession: true,
    }),
    true,
  );
  assert.equal(
    shouldLockStoredSession({
      biometricEnabled: false,
      hasStoredSupabaseSession: true,
    }),
    false,
  );
});
