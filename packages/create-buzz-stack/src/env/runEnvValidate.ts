import { readFile } from "node:fs/promises";

import { validateMobileEnv } from "../bootstrap/validateMobileEnv.js";
import { logger } from "../utils/logger.js";
import { readMarker } from "../utils/marker.js";

export async function runEnvValidate(cwd: string): Promise<void> {
  const marker = await readMarker(cwd);
  if (!marker) {
    throw new Error("Missing .buzz-stack.json. Run buzz-stack init first.");
  }

  const rootEnv = await readFile(`${cwd}/.env.local`, "utf8");
  if (!rootEnv.includes("SUPABASE_URL=")) {
    throw new Error(".env.local is missing SUPABASE_URL");
  }

  validateMobileEnv(await readFile(`${cwd}/apps/mobile/.env.local`, "utf8"), "apps/mobile/.env.local");
  logger.success("Mobile env validation passed");
  logger.success("Admin env validation passed");
}
