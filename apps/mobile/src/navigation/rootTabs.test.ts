import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("root tabs expose activity discovery and profile as bottom navigation destinations", () => {
  const rootTabsSource = readFileSync("src/navigation/RootTabs.tsx", "utf8");
  const bottomTabIconSource = readFileSync(
    "src/navigation/BottomTabIcon.tsx",
    "utf8",
  );
  const homeSource = readFileSync("src/features/home/HomeScreen.tsx", "utf8");
  const profileSource = readFileSync(
    "src/features/profile/ProfileScreen.tsx",
    "utf8",
  );
  const translationsSource = readFileSync("src/i18n/en.ts", "utf8");

  assert.match(rootTabsSource, /<Tabs/);
  assert.match(rootTabsSource, /name="home"/);
  assert.match(rootTabsSource, /name="profile"/);
  assert.match(rootTabsSource, /tabBarStyle/);
  assert.match(rootTabsSource, /BottomTabIcon/);
  assert.match(bottomTabIconSource, /discover/);
  assert.match(bottomTabIconSource, /profile/);
  assert.doesNotMatch(homeSource, /routes\.profile/);
  assert.doesNotMatch(profileSource, /routes\.home/);
  assert.match(translationsSource, /navigation:/);
  assert.match(translationsSource, /discover:/);
  assert.match(translationsSource, /profile:/);
});
