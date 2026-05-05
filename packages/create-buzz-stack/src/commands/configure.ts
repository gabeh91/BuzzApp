import { Command } from "commander";

import { runConfigure } from "../configure/runConfigure.js";
import { logger } from "../utils/logger.js";

export function registerConfigureCommand(program: Command): void {
  program
    .command("configure [target]")
    .description("Add or update optional Buzz infrastructure")
    .option("--dry-run", "Preview file changes", false)
    .option("--force", "Allow overwriting generated files for the selected component", false)
    .action(async (target, options) => {
      try {
        await runConfigure({
          cwd: process.cwd(),
          target,
          dryRun: Boolean(options.dryRun),
          force: Boolean(options.force)
        });
      } catch (error) {
        logger.error((error as Error).message);
        process.exitCode = 1;
      }
    });
}
