import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { readMarker } from "../utils/marker.ts";
import { validateRailwayConfig } from "./validateRailwayConfig.ts";

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
