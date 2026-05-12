import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

test("mobile app exposes reusable UI primitives for repeated screen chrome", () => {
  assert.equal(existsSync("src/ui/Screen.tsx"), true);
  assert.equal(existsSync("src/ui/Text.tsx"), true);
  assert.equal(existsSync("src/ui/Panel.tsx"), true);
  assert.equal(existsSync("src/ui/Button.tsx"), true);
  assert.equal(existsSync("src/ui/Header.tsx"), true);
  assert.equal(existsSync("src/ui/HeroPanel.tsx"), true);
  assert.equal(existsSync("src/ui/List.tsx"), true);
  assert.equal(existsSync("src/ui/index.ts"), true);

  const screenSource = readFileSync("src/ui/Screen.tsx", "utf8");
  const textSource = readFileSync("src/ui/Text.tsx", "utf8");
  const buttonSource = readFileSync("src/ui/Button.tsx", "utf8");
  const panelSource = readFileSync("src/ui/Panel.tsx", "utf8");
  const headerSource = readFileSync("src/ui/Header.tsx", "utf8");
  const heroPanelSource = readFileSync("src/ui/HeroPanel.tsx", "utf8");
  const listSource = readFileSync("src/ui/List.tsx", "utf8");
  const indexSource = readFileSync("src/ui/index.ts", "utf8");

  assert.match(screenSource, /SafeAreaView/);
  assert.match(screenSource, /ScrollView/);
  assert.match(textSource, /variant/);
  assert.match(buttonSource, /variant/);
  assert.match(panelSource, /variant/);
  assert.match(headerSource, /left/);
  assert.match(headerSource, /right/);
  assert.match(heroPanelSource, /eyebrow/);
  assert.match(heroPanelSource, /title/);
  assert.match(heroPanelSource, /body/);
  assert.match(listSource, /@shopify\/flash-list/);
  assert.match(listSource, /FlashList/);
  assert.match(indexSource, /export \{ List/);
  assert.doesNotMatch(
    indexSource,
    /Buzz(Screen|Text|Panel|Button|Header|HeroPanel|List)/,
  );
});

test("Home and Group screens consume shared UI primitives instead of duplicating every primitive style", () => {
  const homeSource = readFileSync("src/features/home/HomeScreen.tsx", "utf8");
  const groupSource = readFileSync(
    "src/features/groups/GroupScreen.tsx",
    "utf8",
  );

  assert.match(homeSource, /@\/ui/);
  assert.match(homeSource, /<Screen/);
  assert.match(homeSource, /<Header/);
  assert.match(homeSource, /<Panel/);
  assert.match(homeSource, /<UiText/);
  assert.match(homeSource, /PeopleMatchCard/);
  assert.match(groupSource, /@\/ui/);
  assert.match(groupSource, /<Header/);
  assert.match(groupSource, /<Button/);
});

test("Discover feed uses the shared virtualized List primitive", () => {
  const homeSource = readFileSync("src/features/home/HomeScreen.tsx", "utf8");

  assert.match(homeSource, /<List/);
  assert.match(homeSource, /renderItem=\{renderPeopleMatch\}/);
  assert.match(homeSource, /keyExtractor=\{getPersonKey\}/);
  assert.match(homeSource, /extraData=\{connectionStatuses\}/);
  assert.match(homeSource, /scroll=\{false\}/);
  assert.doesNotMatch(homeSource, /peopleMatches\.map/);
});

test("Home and Profile screens share the same hero panel component", () => {
  const homeSource = readFileSync("src/features/home/HomeScreen.tsx", "utf8");
  const profileSource = readFileSync(
    "src/features/profile/ProfileScreen.tsx",
    "utf8",
  );

  assert.match(homeSource, /HeroPanel/);
  assert.match(profileSource, /HeroPanel/);
  assert.doesNotMatch(homeSource, /heroCard/);
  assert.doesNotMatch(profileSource, /heroCard/);
});

test("Onboarding actions use shared button variants instead of local button wrappers", () => {
  const onboardingSource = readFileSync(
    "src/features/onboarding/OnboardingScreen.tsx",
    "utf8",
  );

  assert.match(onboardingSource, /import \{[^}]*Button[^}]*\} from "@\/ui"/);
  assert.match(onboardingSource, /variant="tonal"/);
  assert.match(onboardingSource, /variant="plain"/);
  assert.doesNotMatch(onboardingSource, /const PrimaryButton/);
  assert.doesNotMatch(onboardingSource, /const SecondaryButton/);
  assert.doesNotMatch(onboardingSource, /primaryButton/);
  assert.doesNotMatch(onboardingSource, /secondaryButton/);
});
