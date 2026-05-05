import { chmod } from "node:fs/promises";

import { generateDocs } from "../generators/docsGenerator.js";
import { generateFunctionFiles } from "../generators/functionsGenerator.js";
import { generateGithubActionsFiles } from "../generators/githubActionsGenerator.js";
import { generateRailwayFiles } from "../generators/railwayGenerator.js";
import { FileWriter } from "../utils/fileWriter.js";
import { logger } from "../utils/logger.js";

export async function runGenerate(cwd: string, target: string): Promise<void> {
  const writer = new FileWriter({ dryRun: false, allowOverwrite: true });
  const files =
    target === "docs"
      ? generateDocs()
      : target === "functions"
        ? generateFunctionFiles()
        : target === "github-actions"
          ? generateGithubActionsFiles()
          : target === "railway"
            ? generateRailwayFiles()
            : [];

  if (files.length === 0) {
    throw new Error(`Unknown generate target: ${target}`);
  }

  for (const file of files) {
    const result = await writer.writeFile(`${cwd}/${file.path}`, file.contents);
    logger.success(`${result.status === "updated" ? "Updated" : "Created"} ${file.path}`);
    if (file.executable) {
      await chmod(`${cwd}/${file.path}`, 0o755);
    }
  }
}
