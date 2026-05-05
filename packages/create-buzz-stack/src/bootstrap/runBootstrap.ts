import { readFile } from "node:fs/promises";

import { logger } from "../utils/logger.js";
import { readMarker } from "../utils/marker.js";
import { ensureLocalEnvFiles } from "./ensureLocalEnvFiles.js";
import { ensureSupabaseRunning } from "./ensureSupabaseRunning.js";
import { hydrateLocalSupabaseEnv } from "./hydrateLocalSupabaseEnv.js";
import { validateAdminEnv } from "./validateAdminEnv.js";
import { validateMobileEnv } from "./validateMobileEnv.js";
import { validateRailwayConfig } from "./validateRailwayConfig.js";

export interface RunBootstrapOptions {
  cwd: string;
  dryRun: boolean;
  forceEnv?: boolean;
  skipInstall?: boolean;
  skipSupabase?: boolean;
  skipDbReset?: boolean;
  skipSmoke?: boolean;
}

const BOOTSTRAP_BLOCK_MESSAGE = `This does not appear to be a Buzz repository.

Use:
  buzz-stack init

only if you are creating a brand-new repository.`;

export async function runBootstrap(
  options: RunBootstrapOptions
): Promise<{ dryRun: boolean }> {
  const marker = await readMarker(options.cwd);

  if (!marker) {
    throw new Error(BOOTSTRAP_BLOCK_MESSAGE);
  }

  await ensureLocalEnvFiles(options.cwd, {
    dryRun: options.dryRun,
    forceEnv: options.forceEnv ?? false
  });

  if (!options.skipSupabase) {
    await ensureSupabaseRunning(options.cwd);
  }

  await hydrateLocalSupabaseEnv(options.cwd, {
    dryRun: options.dryRun,
    forceEnv: options.forceEnv ?? false
  });

  if (!options.dryRun) {
    validateMobileEnv(await readFile(`${options.cwd}/apps/mobile/.env.local`, "utf8"), "apps/mobile/.env.local");
    validateAdminEnv(await readFile(`${options.cwd}/apps/admin/.env.local`, "utf8"));
  }

  const railwayStatus = await validateRailwayConfig(options.cwd, marker);
  if (railwayStatus === "disabled") {
    logger.info("Railway is not enabled for this repo. Skipping Railway setup.");
  } else if (railwayStatus === "missing") {
    logger.warn("Railway config is missing, but this repo has Railway marked as enabled.");
    logger.plain("Run:\n  buzz-stack configure railway");
  } else {
    logger.success("Railway config detected");
  }

  logger.plain(`✅ Buzz local development is ready.

Run:
  pnpm dev

Useful URLs:
  Supabase API: http://127.0.0.1:54321
  Supabase Studio: http://127.0.0.1:54323
  Admin dashboard: http://localhost:3000
  Expo dev server: shown in terminal after pnpm dev
`);

  logger.plain(`Local development is ready.

Production deployment still requires external setup:
- Supabase cloud projects
- GitHub environment secrets
- Railway project/service IDs if Railway is enabled
- EAS project credentials
- Apple/Google OAuth credentials if enabled
- Stripe live keys if payments are enabled`);

  return {
    dryRun: options.dryRun
  };
}

export { BOOTSTRAP_BLOCK_MESSAGE };
