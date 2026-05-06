import assert from "node:assert/strict";
import test from "node:test";

import { getDefaultConfig } from "../schema/configSchema.ts";
import { generateWorkspaceFiles } from "./workspaceGenerator.ts";

test("admin scaffold uses a Next.js supported config filename", () => {
  const files = generateWorkspaceFiles(getDefaultConfig());
  const paths = files.map((file) => file.path);

  assert.ok(paths.includes("apps/admin/next.config.mjs"));
  assert.ok(!paths.includes("apps/admin/next.config.ts"));
});

test("mobile scaffold includes Expo public env typings", () => {
  const files = generateWorkspaceFiles(getDefaultConfig());
  const mobileEnvTypes = files.find((file) => file.path === "apps/mobile/env.d.ts");

  assert.ok(mobileEnvTypes);
  assert.match(mobileEnvTypes.contents, /EXPO_PUBLIC_SUPABASE_URL/);
  assert.match(mobileEnvTypes.contents, /EXPO_PUBLIC_AUTH_MODE/);
  assert.match(mobileEnvTypes.contents, /EXPO_PUBLIC_DEMO_USER_ID/);
  assert.doesNotMatch(mobileEnvTypes.contents, /SUPABASE_SERVICE_ROLE_KEY/);
});

test("mobile scaffold declares Babel runtime for Metro", () => {
  const files = generateWorkspaceFiles(getDefaultConfig());
  const mobilePackageJson = files.find((file) => file.path === "apps/mobile/package.json");

  assert.ok(mobilePackageJson);
  assert.match(mobilePackageJson.contents, /"@babel\/runtime": "7\.29\.2"/);
  assert.match(mobilePackageJson.contents, /"tsx": "latest"/);
  assert.match(
    mobilePackageJson.contents,
    /"test": "tsx --test src\/auth\/\*\.test\.ts src\/features\/\*\/\*\.test\.ts src\/navigation\/\*\.test\.ts src\/theme\/\*\.test\.ts"/
  );
});

test("mobile scaffold registers the Expo root component", () => {
  const files = generateWorkspaceFiles(getDefaultConfig());
  const mobilePackageJson = files.find((file) => file.path === "apps/mobile/package.json");
  const routerLayout = files.find((file) => file.path === "apps/mobile/app/_layout.tsx");
  const onboardingRoute = files.find((file) => file.path === "apps/mobile/app/index.tsx");
  const homeRoute = files.find((file) => file.path === "apps/mobile/app/home.tsx");

  assert.ok(mobilePackageJson);
  assert.match(mobilePackageJson.contents, /"main": "expo-router\/entry"/);
  assert.match(mobilePackageJson.contents, /"expo-router": "~4\.0\.22"/);
  assert.ok(routerLayout);
  assert.match(routerLayout.contents, /<Stack/);
  assert.ok(onboardingRoute);
  assert.match(onboardingRoute.contents, /OnboardingScreen/);
  assert.ok(homeRoute);
  assert.match(homeRoute.contents, /BuzzHomeScreen/);
});

test("mobile and admin scaffolds use Apollo against Supabase GraphQL", () => {
  const files = generateWorkspaceFiles(getDefaultConfig());
  const mobilePackageJson = files.find((file) => file.path === "apps/mobile/package.json");
  const adminPackageJson = files.find((file) => file.path === "apps/admin/package.json");
  const mobileApp = files.find((file) => file.path === "apps/mobile/src/features/onboarding/OnboardingScreen.tsx");
  const mobileProviders = files.find((file) => file.path === "apps/mobile/src/app/AppProviders.tsx");
  const mobileApollo = files.find((file) => file.path === "apps/mobile/src/lib/apollo.ts");
  const mobileTsconfig = files.find((file) => file.path === "apps/mobile/tsconfig.json");
  const adminPage = files.find((file) => file.path === "apps/admin/app/page.tsx");
  const mobileOperations = files.find((file) => file.path === "apps/mobile/graphql/operations.graphql");
  const mobileGenerated = files.find((file) => file.path === "apps/mobile/graphql/generated.tsx");
  const adminOperations = files.find((file) => file.path === "apps/admin/graphql/operations.graphql");
  const adminGenerated = files.find((file) => file.path === "apps/admin/graphql/generated.tsx");

  assert.ok(mobilePackageJson);
  assert.match(mobilePackageJson.contents, /"@apollo\/client": "\^3\./);
  assert.match(mobilePackageJson.contents, /"graphql": "latest"/);
  assert.ok(mobileTsconfig);
  assert.match(mobileTsconfig.contents, /"@\/\*": \["src\/\*"\]/);
  assert.match(mobileTsconfig.contents, /"@graphql\/\*": \["graphql\/\*"\]/);
  assert.ok(adminPackageJson);
  assert.match(adminPackageJson.contents, /"@apollo\/client": "\^3\./);
  assert.match(adminPackageJson.contents, /"graphql": "latest"/);

  assert.ok(mobileApp);
  assert.ok(mobileProviders);
  assert.match(mobileProviders.contents, /ApolloProvider/);
  assert.ok(mobileApollo);
  assert.match(mobileApollo.contents, /\/graphql\/v1/);
  assert.match(mobileApp.contents, /useBuzzHomeQuery/);
  assert.match(mobileApp.contents, /useActivateInterestMutation/);
  assert.match(mobileApp.contents, /StyleSheet\.create/);
  assert.match(mobileApp.contents, /@\/features\/quiz\/QuizProvider/);
  assert.match(mobileApp.contents, /@\/theme\/ThemeProvider/);
  assert.match(mobileApp.contents, /useBuzzTheme/);
  assert.match(mobileApp.contents, /@graphql\/generated/);
  assert.doesNotMatch(mobileApp.contents, /gql`/);
  assert.doesNotMatch(mobileApp.contents, /style=\{\{/);
  assert.doesNotMatch(mobileApp.contents, /const tabs =/);
  assert.doesNotMatch(mobileApp.contents, /fallbackInterests\[0\]\.id/);
  assert.ok(mobileOperations);
  assert.match(mobileOperations.contents, /query BuzzHome/);
  assert.match(mobileOperations.contents, /mutation ActivateInterest/);
  assert.ok(mobileGenerated);
  assert.match(mobileGenerated.contents, /useBuzzHomeQuery/);
  assert.match(mobileGenerated.contents, /useActivateInterestMutation/);
  assert.match(mobileGenerated.contents, /import \* as Apollo from "@apollo\/client"/);
  assert.doesNotMatch(mobileGenerated.contents, /import type \* as Apollo/);

  assert.ok(adminPage);
  assert.match(adminPage.contents, /"use client"/);
  assert.match(adminPage.contents, /ApolloProvider/);
  assert.match(adminPage.contents, /\/graphql\/v1/);
  assert.match(adminPage.contents, /useAdminDashboardQuery/);
  assert.doesNotMatch(adminPage.contents, /gql`/);
  assert.ok(adminOperations);
  assert.match(adminOperations.contents, /query AdminDashboard/);
  assert.ok(adminGenerated);
  assert.match(adminGenerated.contents, /useAdminDashboardQuery/);
  assert.match(adminGenerated.contents, /import \* as Apollo from "@apollo\/client"/);
  assert.doesNotMatch(adminGenerated.contents, /import type \* as Apollo/);
});

test("mobile scaffold includes replaceable demo auth, context hooks, quiz model, and deterministic match preview", () => {
  const files = generateWorkspaceFiles(getDefaultConfig());
  const paths = files.map((file) => file.path);

  assert.ok(paths.includes("apps/mobile/src/auth/AuthProvider.tsx"));
  assert.ok(paths.includes("apps/mobile/src/auth/demoAuth.ts"));
  assert.ok(paths.includes("apps/mobile/src/features/onboarding/OnboardingProvider.tsx"));
  assert.ok(paths.includes("apps/mobile/src/features/onboarding/OnboardingScreen.tsx"));
  assert.ok(paths.includes("apps/mobile/src/features/home/BuzzHomeScreen.tsx"));
  assert.ok(paths.includes("apps/mobile/src/features/quiz/QuizProvider.tsx"));
  assert.ok(paths.includes("apps/mobile/src/features/interests/InterestFlowProvider.tsx"));
  assert.ok(paths.includes("apps/mobile/src/features/matching/demoMatch.ts"));
  assert.ok(paths.includes("apps/mobile/src/theme/tokens.ts"));
  assert.ok(paths.includes("apps/mobile/src/theme/ThemeProvider.tsx"));

  const authProvider = files.find((file) => file.path === "apps/mobile/src/auth/AuthProvider.tsx");
  const onboardingProvider = files.find((file) => file.path === "apps/mobile/src/features/onboarding/OnboardingProvider.tsx");
  const quizModel = files.find((file) => file.path === "apps/mobile/src/features/quiz/quizModel.ts");
  const demoMatch = files.find((file) => file.path === "apps/mobile/src/features/matching/demoMatch.ts");

  assert.ok(authProvider);
  assert.match(authProvider.contents, /useBuzzAuth/);
  assert.match(authProvider.contents, /createDemoBuzzUser/);
  assert.ok(onboardingProvider);
  assert.match(onboardingProvider.contents, /useOnboarding/);
  assert.ok(quizModel);
  assert.match(quizModel.contents, /quizQuestions/);
  assert.match(quizModel.contents, /deriveProfileTraits/);
  assert.ok(demoMatch);
  assert.match(demoMatch.contents, /createDemoMatchPreview/);

  const themeProvider = files.find((file) => file.path === "apps/mobile/src/theme/ThemeProvider.tsx");
  const themeTokens = files.find((file) => file.path === "apps/mobile/src/theme/tokens.ts");
  assert.ok(themeProvider);
  assert.match(themeProvider.contents, /useBuzzTheme/);
  assert.ok(themeTokens);
  assert.match(themeTokens.contents, /themes/);
  assert.match(themeTokens.contents, /background/);
  assert.match(themeTokens.contents, /surface/);
  assert.match(themeTokens.contents, /fontFamilies/);
  assert.match(themeTokens.contents, /fontSizes/);
  assert.match(themeTokens.contents, /spacing/);
  assert.match(themeTokens.contents, /radii/);
  assert.match(themeTokens.contents, /borderWidths/);
  assert.match(themeTokens.contents, /shadows/);
});
