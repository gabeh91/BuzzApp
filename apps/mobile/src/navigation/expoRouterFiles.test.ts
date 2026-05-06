import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

test("mobile package uses Expo Router as its entrypoint", () => {
  const packageJson = JSON.parse(readFileSync("package.json", "utf8")) as { main?: string; dependencies?: Record<string, string> };
  const tsconfig = JSON.parse(readFileSync("tsconfig.json", "utf8")) as {
    compilerOptions?: {
      baseUrl?: string;
      paths?: Record<string, string[]>;
    };
  };

  assert.equal(packageJson.main, "expo-router/entry");
  assert.ok(packageJson.dependencies?.["expo-router"]);
  assert.equal(tsconfig.compilerOptions?.baseUrl, ".");
  assert.deepEqual(tsconfig.compilerOptions?.paths?.["@/*"], ["src/*"]);
  assert.deepEqual(tsconfig.compilerOptions?.paths?.["@graphql/*"], ["graphql/*"]);
});

test("mobile app exposes Expo Router layout, onboarding, and home routes", () => {
  assert.equal(existsSync("app/_layout.tsx"), true);
  assert.equal(existsSync("app/index.tsx"), true);
  assert.equal(existsSync("app/home.tsx"), true);

  assert.match(readFileSync("app/_layout.tsx", "utf8"), /<Stack/);
  assert.match(readFileSync("app/index.tsx", "utf8"), /OnboardingScreen/);
  assert.match(readFileSync("app/home.tsx", "utf8"), /BuzzHomeScreen/);
});
