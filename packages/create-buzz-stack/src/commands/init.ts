import { Command } from "commander";

import { runInit } from "../init/runInit.js";
import { logger } from "../utils/logger.js";

export function registerInitCommand(program: Command): void {
  program
    .command("init")
    .description("Create a brand-new Buzz repository scaffold")
    .option("--config <path>")
    .option("--yes", "Accept defaults", false)
    .option("--dry-run", "Preview files without writing", false)
    .option("--no-bootstrap", "Skip local bootstrap after init")
    .action(async (options) => {
      try {
        await runInit({
          cwd: process.cwd(),
          dryRun: Boolean(options.dryRun),
          yes: Boolean(options.yes),
          configPath: options.config,
          bootstrap: options.bootstrap
        });
      } catch (error) {
        logger.error((error as Error).message);
        process.exitCode = 1;
      }
    });
}
