import { chmod } from "node:fs/promises";

import { generateRailwayFiles } from "../generators/railwayGenerator.js";
import { FileWriter } from "../utils/fileWriter.js";
import { logger } from "../utils/logger.js";

export async function configureRailway(
  cwd: string,
  options: { dryRun: boolean; force: boolean }
): Promise<void> {
  const writer = new FileWriter({
    dryRun: options.dryRun,
    allowOverwrite: options.force
  });

  for (const file of generateRailwayFiles()) {
    const result = await writer.writeFile(`${cwd}/${file.path}`, file.contents);
    if (result.status === "created" || result.status === "updated") {
      logger.success(`${result.status === "created" ? "Created" : "Updated"} ${file.path}`);
    }
    if (!options.dryRun && file.executable) {
      await chmod(`${cwd}/${file.path}`, 0o755);
    }
  }
}
