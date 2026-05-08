import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const tokensSource = readFileSync("src/theme/tokens.ts", "utf8");

test("themes expose semantic light and dark design tokens", () => {
  assert.match(tokensSource, /mode: "light"/);
  assert.match(tokensSource, /mode: "dark"/);
  assert.match(tokensSource, /background:/);
  assert.match(tokensSource, /surface:/);
  assert.match(tokensSource, /text:/);
  assert.match(tokensSource, /accent:/);
});

test("theme includes typography, spacing, borders, radii, and shadows", () => {
  assert.match(tokensSource, /fontFamilies/);
  assert.match(tokensSource, /fontSizes/);
  assert.match(tokensSource, /spacing/);
  assert.match(tokensSource, /radii/);
  assert.match(tokensSource, /borderWidths/);
  assert.match(tokensSource, /shadows/);
  assert.match(tokensSource, /elevation: 5/);
  assert.match(tokensSource, /elevation: 6/);
});

test("mobile uses iOS system Avenir and bundled Android Metropolis with Menlo mono", () => {
  const packageJson = JSON.parse(readFileSync("package.json", "utf8")) as { dependencies?: Record<string, string> };
  const providersSource = readFileSync("src/providers/AppProviders.tsx", "utf8");

  assert.ok(packageJson.dependencies?.["expo-font"]);
  assert.equal(packageJson.dependencies?.["@expo-google-fonts/manrope"], undefined);
  assert.match(providersSource, /useFonts/);
  assert.match(providersSource, /Metropolis-Regular\.otf/);
  assert.match(providersSource, /Metropolis-ExtraBold\.otf/);
  assert.match(providersSource, /Menlo-Regular\.ttf/);
  assert.match(tokensSource, /Platform\.select/);
  assert.match(tokensSource, /ios: "Avenir Next"/);
  assert.match(tokensSource, /android: "Metropolis-Regular"/);
  assert.match(tokensSource, /android: "Metropolis-ExtraBold"/);
  assert.match(tokensSource, /android: "Menlo-Regular"/);
  assert.equal(readFileSync("assets/fonts/Metropolis-Regular.otf").byteLength > 0, true);
  assert.equal(readFileSync("assets/fonts/Metropolis-ExtraBold.otf").byteLength > 0, true);
  assert.equal(readFileSync("assets/fonts/Menlo-Regular.ttf").byteLength > 0, true);
});

test("display typography uses bundled Android font faces without weight resolution", () => {
  assert.match(tokensSource, /fontStyles/);
  assert.match(tokensSource, /android: \{\s*fontFamily: "Metropolis-ExtraBold"\s*\}/);
  assert.doesNotMatch(tokensSource, /android: \{[^}]*fontWeight/);

  const displayStyleFiles = [
    "src/features/home/HomeScreen.tsx",
    "src/features/groups/GroupScreen.tsx",
    "src/features/onboarding/OnboardingScreen.tsx"
  ];

  for (const file of displayStyleFiles) {
    const source = readFileSync(file, "utf8");
    assert.doesNotMatch(
      source,
      /fontFamily:\s*(?:theme\.)?fontFamilies\.display,[\s\S]{0,120}fontWeight:/,
      `${file} combines the Android display font face with fontWeight`
    );
  }
});
