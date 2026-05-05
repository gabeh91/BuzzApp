import { FileWriter } from "../utils/fileWriter.js";
import { generateWorkspaceFiles } from "../generators/workspaceGenerator.js";
import { getDefaultConfig } from "../schema/configSchema.js";

export async function configureMobile(
  cwd: string,
  options: { dryRun: boolean; force: boolean }
): Promise<void> {
  const writer = new FileWriter({
    dryRun: options.dryRun,
    allowOverwrite: options.force
  });

  for (const file of generateWorkspaceFiles(getDefaultConfig()).filter((item) => item.path.startsWith("apps/mobile/"))) {
    await writer.writeFile(`${cwd}/${file.path}`, file.contents);
  }
}
