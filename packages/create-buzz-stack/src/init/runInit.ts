import { chmod, readFile } from "node:fs/promises";

import { confirmBootstrapAfterInit } from "../prompts/bootstrapPrompts.js";
import { collectProjectConfig } from "../prompts/projectPrompts.js";
import { configSchema, getDefaultConfig, type BuzzStackConfig } from "../schema/configSchema.js";
import { generateRootFiles, buildMarker } from "../generators/rootGenerator.js";
import { FileWriter } from "../utils/fileWriter.js";
import { logger } from "../utils/logger.js";
import { createMarkerFile } from "./createMarkerFile.js";
import { detectExistingBuzzRepo } from "./detectExistingBuzzRepo.js";

export interface RunInitOptions {
  cwd: string;
  dryRun: boolean;
  yes: boolean;
  configPath?: string;
  bootstrap?: boolean;
}

const INIT_BLOCK_MESSAGE = `This directory already appears to be an initialized Buzz repository.

Use:
  buzz-stack bootstrap

instead of:
  buzz-stack init`;

export async function runInit(options: RunInitOptions): Promise<{ dryRun: boolean }> {
  const existingRepo = await detectExistingBuzzRepo({ cwd: options.cwd });

  if (existingRepo.isExistingRepo) {
    throw new Error(INIT_BLOCK_MESSAGE);
  }

  const config = await resolveConfig(options);
  const files = generateRootFiles(config);
  const writer = new FileWriter({ dryRun: options.dryRun });

  for (const file of files) {
    const result = await writer.writeFile(`${options.cwd}/${file.path}`, file.contents);
    if (result.status === "created") {
      logger.success(`Created ${file.path}`);
    } else if (result.status === "updated") {
      logger.success(`Updated ${file.path}`);
    } else if (result.status === "skipped") {
      logger.skip(`Skipped ${file.path} because it already exists`);
    }

    if (!options.dryRun && file.executable) {
      await chmod(`${options.cwd}/${file.path}`, 0o755);
    }
  }

  const marker = buildMarker(config);
  await createMarkerFile(options.cwd, marker, { dryRun: options.dryRun });

  const shouldBootstrap = options.bootstrap ?? (options.yes ? true : await confirmBootstrapAfterInit(true));
  if (shouldBootstrap) {
    logger.info("Run local bootstrap now? yes");
  }

  return {
    dryRun: options.dryRun
  };
}

export { INIT_BLOCK_MESSAGE };

async function resolveConfig(options: RunInitOptions): Promise<BuzzStackConfig> {
  if (options.configPath) {
    const raw = await readFile(options.configPath, "utf8");
    return configSchema.parse(JSON.parse(raw));
  }

  if (options.yes) {
    return getDefaultConfig();
  }

  return collectProjectConfig();
}
