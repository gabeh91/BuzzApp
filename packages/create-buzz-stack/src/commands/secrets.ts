import { Command } from "commander";

import { runSecretsPrintRequired } from "../secrets/runSecretsPrintRequired.js";
import { logger } from "../utils/logger.js";

export function registerSecretsCommand(program: Command): void {
  const secrets = program.command("secrets").description("Secrets inventory helpers");
  secrets
    .command("print-required")
    .description("Print required secret names by environment")
    .action(async () => {
      try {
        await runSecretsPrintRequired(process.cwd());
      } catch (error) {
        logger.error((error as Error).message);
        process.exitCode = 1;
      }
    });
}
