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

test("mobile app config supports hosted auth redirects and biometric unlock", () => {
  const appJson = JSON.parse(readFileSync("app.json", "utf8")) as {
    expo?: {
      scheme?: string;
      plugins?: unknown[];
    };
  };

  assert.equal(appJson.expo?.scheme, "buzz");
  assert.ok(
    appJson.expo?.plugins?.some((plugin) => {
      return (
        Array.isArray(plugin) &&
        plugin[0] === "expo-local-authentication" &&
        typeof plugin[1] === "object"
      );
    }),
  );
  assert.ok(appJson.expo?.plugins?.includes("expo-secure-store"));
});

test("mobile app exposes Expo Router layout, onboarding, tabbed roots, and group routes", () => {
  assert.equal(existsSync("app/_layout.tsx"), true);
  assert.equal(existsSync("app/index.tsx"), true);
  assert.equal(existsSync("app/onboarding.tsx"), true);
  assert.equal(existsSync("app/(tabs)/_layout.tsx"), true);
  assert.equal(existsSync("app/(tabs)/home.tsx"), true);
  assert.equal(existsSync("app/(tabs)/activities.tsx"), true);
  assert.equal(existsSync("app/(tabs)/chats.tsx"), true);
  assert.equal(existsSync("app/(tabs)/profile.tsx"), true);
  assert.equal(existsSync("app/profile/quiz.tsx"), true);
  assert.equal(existsSync("app/auth/_layout.tsx"), true);
  assert.equal(existsSync("app/auth/index.tsx"), true);
  assert.equal(existsSync("app/auth/code.tsx"), true);
  assert.equal(existsSync("app/people/[profileId]/connect.tsx"), true);
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
  assert.match(readFileSync("app/index.tsx", "utf8"), /AppEntry/);
  assert.match(readFileSync("app/onboarding.tsx", "utf8"), /OnboardingScreen/);
  assert.match(
    readFileSync("src/navigation/AppEntry.tsx", "utf8"),
    /getInitialAppRoute/,
  );
  assert.match(readFileSync("app/(tabs)/home.tsx", "utf8"), /HomeScreen/);
  assert.match(
    readFileSync("app/(tabs)/activities.tsx", "utf8"),
    /ActivitiesScreen/,
  );
  assert.match(readFileSync("app/(tabs)/chats.tsx", "utf8"), /ChatsScreen/);
  assert.match(readFileSync("app/(tabs)/profile.tsx", "utf8"), /ProfileScreen/);
  assert.match(
    readFileSync("app/profile/quiz.tsx", "utf8"),
    /ProfileQuizScreen/,
  );
  assert.match(readFileSync("app/auth/index.tsx", "utf8"), /AuthStartScreen/);
  assert.match(readFileSync("app/auth/code.tsx", "utf8"), /AuthCodeScreen/);
  assert.match(
    readFileSync("app/people/[profileId]/connect.tsx", "utf8"),
    /PeopleConnectionRequestScreen/,
  );
  assert.match(readFileSync("app/groups/[id].tsx", "utf8"), /GroupScreen/);
  assert.match(
    readFileSync("src/features/groups/GroupScreen.tsx", "utf8"),
    /LL\.groups/,
  );
});

test("discover owns the people feed and auth-gated connection starts", () => {
  const homeSource = readFileSync("src/features/home/HomeScreen.tsx", "utf8");
  const connectSource = readFileSync(
    "src/features/people/PeopleConnectionRequestScreen.tsx",
    "utf8",
  );

  assert.match(homeSource, /loadPeopleMatchesFromSupabase/);
  assert.match(homeSource, /PeopleMatchCard/);
  assert.match(homeSource, /requireAuth\("chat"/);
  assert.match(homeSource, /routes\.peopleConnect/);
  assert.match(homeSource, /router\.push/);
  assert.doesNotMatch(homeSource, /sendConnectionRequestToSupabase/);
  assert.match(connectSource, /sendConnectionRequestToSupabase/);
  assert.match(connectSource, /LL\.peopleConnect/);
  assert.match(connectSource, /defaultActivityMessage/);
});
