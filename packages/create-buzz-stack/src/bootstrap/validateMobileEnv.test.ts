import assert from "node:assert/strict";
import test from "node:test";

import { validateMobileEnv } from "./validateMobileEnv.ts";

test("mobile env validation fails when forbidden server keys are present", () => {
  assert.throws(
    () =>
      validateMobileEnv(
        "EXPO_PUBLIC_APP_ENV=local\nSUPABASE_SERVICE_ROLE_KEY=secret\n",
        "apps/mobile/.env.local"
      ),
    /Forbidden server-only key found in apps\/mobile\/.env.local:\nSUPABASE_SERVICE_ROLE_KEY/
  );
});
