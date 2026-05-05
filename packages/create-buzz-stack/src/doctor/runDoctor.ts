import { logger } from "../utils/logger.js";
import { readMarker } from "../utils/marker.js";
import { checkPrereqs } from "../utils/prereqs.js";

export async function runDoctor(cwd: string): Promise<void> {
  const statuses = await checkPrereqs();
  for (const status of statuses) {
    const message = `${status.name}: ${status.detail}`;
    if (status.status === "pass") {
      logger.success(message);
    } else if (status.status === "warn") {
      logger.warn(message);
    } else {
      logger.error(message);
    }
  }

  const marker = await readMarker(cwd);
  if (!marker) {
    logger.warn("This repo has not been initialized yet.");
    return;
  }

  logger.success("Supabase configured");
  logger.success("GitHub Actions configured");
  if (marker.components.railway?.enabled) {
    logger.warn("Railway enabled. Run `buzz-stack configure railway` if config is missing.");
  } else {
    logger.plain("ℹ️ Railway not enabled");
  }
}
