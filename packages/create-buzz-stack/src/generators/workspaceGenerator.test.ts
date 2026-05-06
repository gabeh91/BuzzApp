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
