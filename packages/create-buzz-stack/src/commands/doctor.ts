import { Command } from "commander";

import { runDoctor } from "../doctor/runDoctor.js";
import { logger } from "../utils/logger.js";

export function registerDoctorCommand(program: Command): void {
  program
    .command("doctor")
    .description("Inspect local toolchain and stack health")
    .action(async () => {
      try {
        await runDoctor(process.cwd());
      } catch (error) {
        logger.error((error as Error).message);
        process.exitCode = 1;
      }
    });
}
