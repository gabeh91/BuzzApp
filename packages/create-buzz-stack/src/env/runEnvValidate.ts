import { access, readFile } from "node:fs/promises";

import { validateAdminEnv } from "../bootstrap/validateAdminEnv.js";
import { validateMobileEnv } from "../bootstrap/validateMobileEnv.js";
import { logger } from "../utils/logger.js";
import { readMarker } from "../utils/marker.js";

export interface RunEnvValidateOptions {
  ci?: boolean;
}

export async function runEnvValidate(cwd: string, options: RunEnvValidateOptions = {}): Promise<void> {
  const marker = await readMarker(cwd);
  if (!marker) {
    throw new Error("Missing .buzz-stack.json. Run buzz-stack init first.");
  }

  const ci = options.ci ?? process.env.CI === "true";
  const rootEnvPath = await selectEnvFile(cwd, ".env.local", ".env.local.example", ci);
  const mobileEnvPath = await selectEnvFile(cwd, "apps/mobile/.env.local", "apps/mobile/.env.example", ci);
  const adminEnvPath = await selectEnvFile(cwd, "apps/admin/.env.local", "apps/admin/.env.example", ci);

  const rootEnv = await readFile(rootEnvPath.absolutePath, "utf8");
  if (!rootEnv.includes("SUPABASE_URL=")) {
    throw new Error(`${rootEnvPath.relativePath} is missing SUPABASE_URL`);
  }

  validateMobileEnv(await readFile(mobileEnvPath.absolutePath, "utf8"), mobileEnvPath.relativePath);
  validateAdminEnv(await readFile(adminEnvPath.absolutePath, "utf8"));
  logger.success("Mobile env validation passed");
  logger.success("Admin env validation passed");
}

async function selectEnvFile(
  cwd: string,
  localPath: string,
  examplePath: string,
  ci: boolean
): Promise<{ absolutePath: string; relativePath: string }> {
  if (await pathExists(`${cwd}/${localPath}`)) {
    return {
      absolutePath: `${cwd}/${localPath}`,
      relativePath: localPath
    };
  }

  if (ci && (await pathExists(`${cwd}/${examplePath}`))) {
    return {
      absolutePath: `${cwd}/${examplePath}`,
      relativePath: examplePath
    };
  }

  throw new Error(`Missing ${localPath}. Run buzz-stack bootstrap to create local env files.`);
}

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await access(targetPath);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return false;
    }

    throw error;
  }
}
