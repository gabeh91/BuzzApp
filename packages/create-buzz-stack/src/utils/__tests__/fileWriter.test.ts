import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { FileWriter } from "../fileWriter.ts";

async function withTempDir(run: (directory: string) => Promise<void>): Promise<void> {
  const directory = await mkdtemp(path.join(tmpdir(), "buzz-stack-writer-"));
  await run(directory);
}

test("creates missing files", async () => {
  await withTempDir(async (directory) => {
    const writer = new FileWriter({ dryRun: false });
    const filePath = path.join(directory, "package.json");

    const result = await writer.writeFile(filePath, "{\"name\":\"buzz\"}\n");

    assert.equal(result.status, "created");
    assert.equal(await readFile(filePath, "utf8"), "{\"name\":\"buzz\"}\n");
  });
});

test("skips existing files unless overwrite is allowed", async () => {
  await withTempDir(async (directory) => {
    const writer = new FileWriter({ dryRun: false });
    const filePath = path.join(directory, "package.json");
    await writeFile(filePath, "{\"name\":\"existing\"}\n");

    const result = await writer.writeFile(filePath, "{\"name\":\"buzz\"}\n");

    assert.equal(result.status, "skipped");
    assert.equal(await readFile(filePath, "utf8"), "{\"name\":\"existing\"}\n");
  });
});

test("creates a backup before overwriting", async () => {
  await withTempDir(async (directory) => {
    const writer = new FileWriter({ dryRun: false, allowOverwrite: true });
    const filePath = path.join(directory, "package.json");
    await writeFile(filePath, "{\"name\":\"existing\"}\n");

    const result = await writer.writeFile(filePath, "{\"name\":\"buzz\"}\n");

    assert.equal(result.status, "updated");
    assert.equal(await readFile(filePath, "utf8"), "{\"name\":\"buzz\"}\n");
    assert.equal(await readFile(`${filePath}.bak`, "utf8"), "{\"name\":\"existing\"}\n");
  });
});
