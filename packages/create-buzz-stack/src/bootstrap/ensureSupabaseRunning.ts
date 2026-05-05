import { logger } from "../utils/logger.js";
import { runCommand } from "../utils/shell.js";

export async function ensureSupabaseRunning(cwd: string): Promise<void> {
  const status = await runCommand("supabase", ["status"], { cwd, reject: false });
  if (status.exitCode === 0) {
    logger.success("Supabase local stack detected");
    return;
  }

  logger.info("Starting local Supabase. This may pull Docker images on the first run.");
  const started = await runCommand("supabase", ["start"], {
    cwd,
    reject: false,
    stdio: "inherit"
  });
  if (started.exitCode === 0) {
    logger.success("Started local Supabase");
    return;
  }

  logger.warn("Supabase CLI unavailable or local stack could not be started automatically");
}
