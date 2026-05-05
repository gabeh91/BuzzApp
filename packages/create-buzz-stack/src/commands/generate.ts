import { Command } from "commander";

import { runGenerate } from "../generate/runGenerate.js";
import { logger } from "../utils/logger.js";

export function registerGenerateCommand(program: Command): void {
  program
    .command("generate <target>")
    .description("Regenerate selected generated assets")
    .action(async (target) => {
      try {
        await runGenerate(process.cwd(), target);
      } catch (error) {
        logger.error((error as Error).message);
        process.exitCode = 1;
      }
    });
}
