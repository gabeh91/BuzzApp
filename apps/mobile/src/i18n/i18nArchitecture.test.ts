import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const projectRoot = path.resolve(__dirname, "../..");

const readProjectFile = (filePath: string) => {
  return readFileSync(path.join(projectRoot, filePath), "utf8");
};

test("mobile app exposes a typed typesafe-i18n hook and provider", () => {
  const packageJson = JSON.parse(readProjectFile("package.json")) as {
    dependencies?: Record<string, string>;
  };

  assert.ok(packageJson.dependencies?.["typesafe-i18n"]);
  assert.ok(existsSync(path.join(projectRoot, "src/i18n/en.ts")));
  assert.ok(existsSync(path.join(projectRoot, "src/i18n/index.ts")));
  assert.ok(existsSync(path.join(projectRoot, "src/i18n/I18nProvider.tsx")));

  const i18nSource = readProjectFile("src/i18n/index.ts");
  const providerSource = readProjectFile("src/i18n/I18nProvider.tsx");

  assert.match(i18nSource, /i18nObject/);
  assert.match(i18nSource, /typesafe-i18n/);
  assert.match(providerSource, /useI18n/);
  assert.match(providerSource, /createContext/);
});

test("rendered mobile screens consume localized copy through the typed hook", () => {
  const appProvidersSource = readProjectFile("src/providers/AppProviders.tsx");
  const onboardingSource = readProjectFile("src/features/onboarding/OnboardingScreen.tsx");
  const homeSource = readProjectFile("src/features/home/HomeScreen.tsx");
  const interestFlowSource = readProjectFile("src/features/interests/interestFlow.ts");

  assert.match(appProvidersSource, /I18nProvider/);
  assert.match(onboardingSource, /useI18n/);
  assert.match(onboardingSource, /LL\.onboarding/);
  assert.match(homeSource, /useI18n/);
  assert.match(homeSource, /LL\.home/);
  assert.match(interestFlowSource, /InterestFlowCopy/);
});

test("translations keep product mechanics out of user-facing copy", () => {
  const translationsSource = readProjectFile("src/i18n/en.ts");

  [
    /turning Buzz into/,
    /Buzz can shape/,
    /Buzz will use/,
    /Buzz has enough context/,
    /Buzz turns/,
    /Buzz avoids/,
    /Buzz forms/,
    /so Buzz can/,
    /Supabase session/,
  ].forEach((pattern) => {
    assert.doesNotMatch(translationsSource, pattern);
  });
});
