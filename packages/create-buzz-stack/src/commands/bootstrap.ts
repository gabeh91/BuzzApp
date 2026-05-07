import { Command } from "commander";

import { runBootstrap } from "../bootstrap/runBootstrap.js";
import { logger } from "../utils/logger.js";

export function registerBootstrapCommand(program: Command): void {
  program
    .command("bootstrap")
    .description("Prepare local development inside an existing Buzz repo")
    .option("--dry-run", "Preview bootstrap steps", false)
    .option("--force-env", "Overwrite existing env files", false)
    .option("--skip-install", "Skip dependency install", false)
    .option("--skip-supabase", "Skip Supabase startup", false)
    .option("--skip-db-reset", "Skip local database migration application", false)
    .option("--skip-smoke", "Skip smoke checks", false)
    .action(async (options) => {
      try {
        await runBootstrap({
          cwd: process.cwd(),
          dryRun: Boolean(options.dryRun),
          forceEnv: Boolean(options.forceEnv),
          skipInstall: Boolean(options.skipInstall),
          skipSupabase: Boolean(options.skipSupabase),
          skipDbReset: Boolean(options.skipDbReset),
          skipSmoke: Boolean(options.skipSmoke)
        });
      } catch (error) {
        logger.error((error as Error).message);
        process.exitCode = 1;
      }
    });
}
