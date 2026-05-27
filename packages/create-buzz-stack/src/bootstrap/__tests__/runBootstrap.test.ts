import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { readMarker } from "../../utils/marker.ts";
import { applyLocalSupabaseMigrations } from "../applyLocalSupabaseMigrations.ts";
import { validateRailwayConfig } from "../validateRailwayConfig.ts";

test("validateRailwayConfig reports disabled when Railway is not enabled", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "buzz-stack-bootstrap-"));
  await writeFile(
    path.join(directory, ".buzz-stack.json"),
    JSON.stringify({
      project: "buzz",
      stackVersion: "0.1.0",
      createdBy: "create-buzz-stack",
      createdAt: "2026-05-06T00:00:00.000Z",
      repoInitialized: true,
      ciProvider: "github-actions",
      hostingProvider: null,
      components: {
        railway: {
          enabled: false,
          configured: false
        }
      }
    })
  );

  const marker = await readMarker(directory);
  assert.ok(marker);

  const result = await validateRailwayConfig(directory, marker);
  assert.equal(result, "disabled");
});

test("applyLocalSupabaseMigrations applies pending migrations without resetting the database", async () => {
  const calls: Array<{ command: string; args: string[]; cwd: string }> = [];

  await applyLocalSupabaseMigrations("/tmp/buzz", {
    dryRun: false,
    runner: async (command, args, options) => {
      calls.push({ command, args, cwd: options.cwd });
      return { stdout: "", stderr: "", exitCode: 0 };
    }
  });

  assert.deepEqual(calls, [
    {
      command: "supabase",
      args: ["migration", "up"],
      cwd: "/tmp/buzz"
    }
  ]);
});
