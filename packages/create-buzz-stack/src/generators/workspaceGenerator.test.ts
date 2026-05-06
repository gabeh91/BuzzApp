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
