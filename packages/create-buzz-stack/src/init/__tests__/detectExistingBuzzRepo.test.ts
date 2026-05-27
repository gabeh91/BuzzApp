import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { detectExistingBuzzRepo } from "../detectExistingBuzzRepo.ts";

async function withTempDir(run: (directory: string) => Promise<void>): Promise<void> {
  const directory = await mkdtemp(path.join(tmpdir(), "buzz-stack-detect-"));
  await run(directory);
}

test("detects initialized repo from marker file", async () => {
  await withTempDir(async (directory) => {
    await writeFile(path.join(directory, ".buzz-stack.json"), "{}");

    const result = await detectExistingBuzzRepo({ cwd: directory });

    assert.equal(result.isExistingRepo, true);
    assert.equal(result.reason, ".buzz-stack.json");
  });
});

test("detects initialized repo from expected scaffold files", async () => {
  await withTempDir(async (directory) => {
    await mkdir(path.join(directory, "apps", "mobile"), { recursive: true });

    const result = await detectExistingBuzzRepo({ cwd: directory });

    assert.equal(result.isExistingRepo, true);
    assert.equal(result.reason, "apps/mobile");
  });
});

test("does not flag an empty directory", async () => {
  await withTempDir(async (directory) => {
    const result = await detectExistingBuzzRepo({ cwd: directory });

    assert.equal(result.isExistingRepo, false);
    assert.equal(result.reason, null);
  });
});
