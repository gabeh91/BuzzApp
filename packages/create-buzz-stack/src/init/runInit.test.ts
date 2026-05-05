import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { createMarkerFile } from "./createMarkerFile.ts";

async function withTempDir(run: (directory: string) => Promise<void>): Promise<void> {
  const directory = await mkdtemp(path.join(tmpdir(), "buzz-stack-init-"));
  await run(directory);
}

test("createMarkerFile writes the Buzz repo marker", async () => {
  await withTempDir(async (directory) => {
    await createMarkerFile(
      directory,
      {
        project: "buzz",
        stackVersion: "0.1.0",
        createdBy: "create-buzz-stack",
        createdAt: "2026-05-06T00:00:00.000Z",
        repoInitialized: true,
        ciProvider: "github-actions",
        hostingProvider: null,
        components: {
          supabase: {
            enabled: true,
            configured: true
          }
        }
      },
      { dryRun: false }
    );

    const markerContents = JSON.parse(await readFile(path.join(directory, ".buzz-stack.json"), "utf8"));
    assert.equal(markerContents.project, "buzz");
    assert.equal(markerContents.repoInitialized, true);
  });
});
