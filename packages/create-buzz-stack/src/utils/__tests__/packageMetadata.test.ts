import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("cli package prepares dist binaries for workspace installs and publish", async () => {
  const packageJsonUrl = new URL("../../../package.json", import.meta.url);
  const packageJson = JSON.parse(await readFile(packageJsonUrl, "utf8")) as {
    bin?: Record<string, string>;
    files?: string[];
    scripts?: Record<string, string>;
  };

  assert.equal(packageJson.bin?.["buzz-stack"], "./dist/index.js");
  assert.equal(packageJson.bin?.["create-buzz-stack"], "./dist/create-buzz-stack.js");
  assert.ok(packageJson.files?.includes("dist"));
  assert.equal(packageJson.scripts?.prepare, "pnpm run build");
});
