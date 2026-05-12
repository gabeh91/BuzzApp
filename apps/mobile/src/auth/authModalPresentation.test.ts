import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

test("auth uses a native route modal stack instead of an inline primitive modal", () => {
  const rootLayoutSource = readFileSync("app/_layout.tsx", "utf8");
  const authLayoutSource = readFileSync("app/auth/_layout.tsx", "utf8");
  const startSource = readFileSync("src/auth/AuthStartScreen.tsx", "utf8");
  const codeSource = readFileSync("src/auth/AuthCodeScreen.tsx", "utf8");
  const providerSource = readFileSync("src/auth/AuthProvider.tsx", "utf8");

  assert.equal(existsSync("app/auth/index.tsx"), true);
  assert.equal(existsSync("app/auth/code.tsx"), true);
  assert.equal(existsSync("src/auth/AuthSheet.tsx"), false);
  assert.match(rootLayoutSource, /name="auth"/);
  assert.match(rootLayoutSource, /presentation: "modal"/);
  assert.match(rootLayoutSource, /initialRouteName: "index"/);
  assert.match(authLayoutSource, /<Stack/);
  assert.match(startSource, /Send email code/);
  assert.match(startSource, /Sign in/);
  assert.match(startSource, /Create account/);
  assert.match(startSource, /secureTextEntry/);
  assert.match(startSource, /getAuthModalIntentParam/);
  assert.match(startSource, /createAuthCodeRoute/);
  assert.match(codeSource, /Enter your code/);
  assert.match(codeSource, /verifyEmailOtp/);
  assert.match(providerSource, /createAuthStartRoute\(decision\.intent\)/);
});
