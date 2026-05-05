import { Command } from "commander";

import { runEnvValidate } from "../env/runEnvValidate.js";
import { logger } from "../utils/logger.js";

export function registerEnvCommand(program: Command): void {
  const env = program.command("env").description("Environment related commands");
  env
    .command("validate")
    .description("Validate environment files")
    .action(async () => {
      try {
        await runEnvValidate(process.cwd());
      } catch (error) {
        logger.error((error as Error).message);
        process.exitCode = 1;
      }
    });
}
