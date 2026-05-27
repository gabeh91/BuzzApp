import assert from "node:assert/strict";
import test from "node:test";

import { isCreateBuzzStackInvocation } from "../invocation.ts";

test("buzz-stack bin is not treated as create-buzz-stack because of package directory name", () => {
  assert.equal(
    isCreateBuzzStackInvocation("/repo/node_modules/create-buzz-stack/dist/index.js", {}),
    false
  );
});

test("create-buzz-stack wrapper is treated as the init alias", () => {
  assert.equal(
    isCreateBuzzStackInvocation("/repo/node_modules/create-buzz-stack/dist/create-buzz-stack.js", {}),
    true
  );
  assert.equal(isCreateBuzzStackInvocation("/repo/bin/anything.js", { BUZZ_STACK_CREATE_ALIAS: "true" }), true);
});
