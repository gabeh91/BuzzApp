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
  assert.doesNotMatch(mobileEnvTypes.contents, /SUPABASE_SERVICE_ROLE_KEY/);
});

test("mobile scaffold declares Babel runtime for Metro", () => {
  const files = generateWorkspaceFiles(getDefaultConfig());
  const mobilePackageJson = files.find((file) => file.path === "apps/mobile/package.json");

  assert.ok(mobilePackageJson);
  assert.match(mobilePackageJson.contents, /"@babel\/runtime": "7\.29\.2"/);
});

test("mobile scaffold registers the Expo root component", () => {
  const files = generateWorkspaceFiles(getDefaultConfig());
  const mobilePackageJson = files.find((file) => file.path === "apps/mobile/package.json");
  const mobileEntry = files.find((file) => file.path === "apps/mobile/index.ts");

  assert.ok(mobilePackageJson);
  assert.match(mobilePackageJson.contents, /"main": "index\.ts"/);
  assert.ok(mobileEntry);
  assert.match(mobileEntry.contents, /registerRootComponent\(App\)/);
});

test("mobile and admin scaffolds use Apollo against Supabase GraphQL", () => {
  const files = generateWorkspaceFiles(getDefaultConfig());
  const mobilePackageJson = files.find((file) => file.path === "apps/mobile/package.json");
  const adminPackageJson = files.find((file) => file.path === "apps/admin/package.json");
  const mobileApp = files.find((file) => file.path === "apps/mobile/App.tsx");
  const adminPage = files.find((file) => file.path === "apps/admin/app/page.tsx");
  const mobileOperations = files.find((file) => file.path === "apps/mobile/graphql/operations.graphql");
  const mobileGenerated = files.find((file) => file.path === "apps/mobile/graphql/generated.tsx");
  const adminOperations = files.find((file) => file.path === "apps/admin/graphql/operations.graphql");
  const adminGenerated = files.find((file) => file.path === "apps/admin/graphql/generated.tsx");

  assert.ok(mobilePackageJson);
  assert.match(mobilePackageJson.contents, /"@apollo\/client": "\^3\./);
  assert.match(mobilePackageJson.contents, /"graphql": "latest"/);
  assert.ok(adminPackageJson);
  assert.match(adminPackageJson.contents, /"@apollo\/client": "\^3\./);
  assert.match(adminPackageJson.contents, /"graphql": "latest"/);

  assert.ok(mobileApp);
  assert.match(mobileApp.contents, /ApolloProvider/);
  assert.match(mobileApp.contents, /\/graphql\/v1/);
  assert.match(mobileApp.contents, /useBuzzHomeQuery/);
  assert.match(mobileApp.contents, /useActivateInterestMutation/);
  assert.doesNotMatch(mobileApp.contents, /gql`/);
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
