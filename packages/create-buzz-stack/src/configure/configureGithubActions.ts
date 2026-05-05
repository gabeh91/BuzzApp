import { FileWriter } from "../utils/fileWriter.js";
import { logger } from "../utils/logger.js";
import { generateGithubActionsFiles } from "../generators/githubActionsGenerator.js";

export async function configureGithubActions(
  cwd: string,
  options: { dryRun: boolean; force: boolean }
): Promise<void> {
  const writer = new FileWriter({
    dryRun: options.dryRun,
    allowOverwrite: options.force
  });

  for (const file of generateGithubActionsFiles()) {
    const result = await writer.writeFile(`${cwd}/${file.path}`, file.contents);
    if (result.status === "created" || result.status === "updated") {
      logger.success(`${result.status === "created" ? "Created" : "Updated"} ${file.path}`);
    }
  }
}
