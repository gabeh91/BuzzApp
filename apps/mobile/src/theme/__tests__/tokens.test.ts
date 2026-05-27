import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
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
  assert.match(tokensSource, /elevation: 4/);
  assert.match(tokensSource, /elevation: 6/);
});

test("mobile bundles Nunito Sans for cross-platform sans typography", () => {
  const packageJson = JSON.parse(readFileSync("package.json", "utf8")) as {
    dependencies?: Record<string, string>;
  };
  const providersSource = readFileSync("src/providers/AppProviders.tsx", "utf8");

  assert.ok(packageJson.dependencies?.["expo-font"]);
  assert.match(providersSource, /useFonts/);
  assert.match(providersSource, /NunitoSans-Regular\.ttf/);
  assert.match(providersSource, /NunitoSans-Medium\.ttf/);
  assert.match(providersSource, /NunitoSans-Bold\.ttf/);
  assert.match(providersSource, /Menlo-Regular\.ttf/);
  assert.match(tokensSource, /NUNITO_SANS_REGULAR = "NunitoSans-Regular"/);
  assert.match(tokensSource, /NUNITO_SANS_MEDIUM = "NunitoSans-Medium"/);
  assert.doesNotMatch(tokensSource, /Avenir Next/);
  assert.doesNotMatch(tokensSource, /Metropolis/);
  for (const file of [
    "NunitoSans-Regular.ttf",
    "NunitoSans-Medium.ttf",
    "NunitoSans-SemiBold.ttf",
    "NunitoSans-Bold.ttf",
    "NunitoSans-ExtraBold.ttf",
    "NunitoSans-Black.ttf",
  ]) {
    assert.equal(readFileSync(`assets/fonts/${file}`).byteLength > 0, true, file);
  }
  assert.equal(readFileSync("assets/fonts/NunitoSans-OFL.txt").byteLength > 0, true);
  assert.equal(readFileSync("assets/fonts/Menlo-Regular.ttf").byteLength > 0, true);
});

test("bundled Nunito Sans faces have unique PostScript names for iOS", () => {
  const manifestPath = "assets/fonts/nunito-font-metadata.json";
  assert.equal(existsSync(manifestPath), true);

  const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as Array<{
    file: string;
    postScript: string;
    weight: number;
  }>;

  assert.equal(manifest.length, 6);
  const postScripts = new Set<string>();

  for (const entry of manifest) {
    assert.equal(existsSync(`assets/fonts/${entry.file}`), true);
    assert.equal(entry.postScript, entry.file.replace(/\.ttf$/, ""));
    assert.ok(entry.weight >= 400 && entry.weight <= 900);
    postScripts.add(entry.postScript);
  }

  assert.equal(postScripts.size, manifest.length);
});

test("fontStyles map semantic roles onto bundled Nunito Sans faces", () => {
  assert.match(tokensSource, /fontStyles/);
  assert.match(tokensSource, /body:[\s\S]*fontFamily: NUNITO_SANS_SEMIBOLD/);
  assert.match(tokensSource, /labelStrong:[\s\S]*fontFamily: NUNITO_SANS_BOLD/);
  assert.match(tokensSource, /display:[\s\S]*fontFamily: NUNITO_SANS_EXTRABOLD/);
  assert.match(tokensSource, /heavy:[\s\S]*fontFamily: NUNITO_SANS_BLACK/);
  assert.match(tokensSource, /black:[\s\S]*fontFamily: NUNITO_SANS_BLACK/);
  assert.doesNotMatch(tokensSource, /fontStyles[\s\S]*fontWeight:/);

  const displayStyleFiles = [
    "src/features/home/HomeScreen.tsx",
    "src/features/groups/GroupScreen.tsx",
    "src/features/onboarding/OnboardingScreen.tsx",
  ];

  for (const file of displayStyleFiles) {
    const source = readFileSync(file, "utf8");
    assert.doesNotMatch(
      source,
      /fontFamily:\s*(?:theme\.)?fontFamilies\.display,[\s\S]{0,120}fontWeight:/,
      `${file} should use theme.fontStyles instead of combining display family with fontWeight`,
    );
  }
});
