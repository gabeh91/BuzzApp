import assert from "node:assert/strict";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { runEnvValidate } from "../runEnvValidate.ts";

async function withTempDir(run: (directory: string) => Promise<void>): Promise<void> {
  const directory = await mkdtemp(path.join(tmpdir(), "buzz-stack-env-"));
  await run(directory);
}

test("env validation accepts committed example env files in CI", async () => {
  await withTempDir(async (directory) => {
    await mkdir(path.join(directory, "apps", "mobile"), { recursive: true });
    await mkdir(path.join(directory, "apps", "admin"), { recursive: true });
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
          mobile: { enabled: true, configured: true },
          admin: { enabled: true, configured: true }
        }
      })
    );
    await writeFile(path.join(directory, ".env.local.example"), "APP_ENV=local\nSUPABASE_URL=http://127.0.0.1:54321\n");
    await writeFile(
      path.join(directory, "apps", "mobile", ".env.example"),
      "EXPO_PUBLIC_APP_ENV=local\nEXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321\nEXPO_PUBLIC_SUPABASE_ANON_KEY=\n"
    );
    await writeFile(
      path.join(directory, "apps", "admin", ".env.example"),
      "NEXT_PUBLIC_APP_ENV=local\nNEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321\n"
    );

    await assert.doesNotReject(() => runEnvValidate(directory, { ci: true }));
  });
});
