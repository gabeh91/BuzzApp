import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

test("mobile package uses Expo Router as its entrypoint", () => {
  const packageJson = JSON.parse(readFileSync("package.json", "utf8")) as {
    main?: string;
    dependencies?: Record<string, string>;
  };
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
  assert.deepEqual(tsconfig.compilerOptions?.paths?.["@graphql/*"], [
    "graphql/*",
  ]);
});

test("mobile app exposes Expo Router layout, onboarding, tabbed roots, and group routes", () => {
  assert.equal(existsSync("app/_layout.tsx"), true);
  assert.equal(existsSync("app/index.tsx"), true);
  assert.equal(existsSync("app/(tabs)/_layout.tsx"), true);
  assert.equal(existsSync("app/(tabs)/home.tsx"), true);
  assert.equal(existsSync("app/(tabs)/profile.tsx"), true);
  assert.equal(existsSync("app/home.tsx"), false);
  assert.equal(existsSync("app/profile.tsx"), false);
  assert.equal(existsSync("app/groups/[id].tsx"), true);
  assert.equal(existsSync("src/app"), false);

  const layoutSource = readFileSync("app/_layout.tsx", "utf8");
  const tabsLayoutSource = readFileSync("app/(tabs)/_layout.tsx", "utf8");

  assert.match(layoutSource, /<Stack/);
  assert.match(layoutSource, /@\/providers\/AppProviders/);
  assert.doesNotMatch(layoutSource, /@\/app\/AppProviders/);
  assert.match(tabsLayoutSource, /RootTabs/);
  assert.match(readFileSync("app/index.tsx", "utf8"), /OnboardingScreen/);
  assert.match(readFileSync("app/(tabs)/home.tsx", "utf8"), /HomeScreen/);
  assert.match(readFileSync("app/(tabs)/profile.tsx", "utf8"), /ProfileScreen/);
  assert.match(readFileSync("app/groups/[id].tsx", "utf8"), /GroupScreen/);
  assert.match(
    readFileSync("src/features/groups/GroupScreen.tsx", "utf8"),
    /LL\.groups/,
  );
});

test("home match preview can accept into the activity group route", () => {
  const homeSource = readFileSync("src/features/home/HomeScreen.tsx", "utf8");

  assert.match(homeSource, /runMatchAction/);
  assert.match(homeSource, /routes\.group/);
  assert.match(homeSource, /LL\.home\.acceptPlan/);
  assert.match(homeSource, /LL\.home\.declinePlan/);
});
