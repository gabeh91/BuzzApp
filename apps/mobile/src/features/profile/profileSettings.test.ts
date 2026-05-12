import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const updateSettledFunctionPath = "../../supabase/functions/update-profile-settled/index.ts";

test("update-profile-settled edge function persists profile settled status", () => {
  assert.equal(
    existsSync(updateSettledFunctionPath),
    true,
    "update-profile-settled Edge Function should exist",
  );

  const source = readFileSync(updateSettledFunctionPath, "utf8");

  assert.match(source, /resolveCurrentProfile/);
  assert.match(source, /profiles/);
  assert.match(source, /settled/);
  assert.match(source, /visible/);
});

test("profile screen owns landing plan, progress, and settled availability controls", () => {
  const profileSource = readFileSync("src/features/profile/ProfileScreen.tsx", "utf8");
  const homeSource = readFileSync("src/features/home/HomeScreen.tsx", "utf8");
  const translationsSource = readFileSync("src/i18n/en.ts", "utf8");

  assert.match(profileSource, /runSettledAction/);
  assert.match(profileSource, /createLandingPlan/);
  assert.match(profileSource, /createSettlingProgress/);
  assert.match(profileSource, /useSettlingProgressState/);
  assert.match(profileSource, /LL\.profile\.settled/);
  assert.doesNotMatch(homeSource, /createLandingPlan/);
  assert.doesNotMatch(homeSource, /createSettlingProgress/);
  assert.match(translationsSource, /profile:/);
  assert.match(translationsSource, /settled:/);
});

test("profile hides matching availability controls for anonymous browsing", () => {
  const profileSource = readFileSync("src/features/profile/ProfileScreen.tsx", "utf8");

  assert.match(profileSource, /const \{\s*[\s\S]*isAuthenticated,/);
  assert.match(
    profileSource,
    /\{isAuthenticated \? \(\s*<Panel variant="muted" style=\{styles\.panel\}>\s*<UiText variant="panelTitle">\{LL\.profile\.settled\.title\(\)\}/,
  );
  assert.match(profileSource, /await requireAuth\("save_profile"/);
});
