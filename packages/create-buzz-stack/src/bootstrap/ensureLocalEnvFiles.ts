import { readFile } from "node:fs/promises";

import { FileWriter } from "../utils/fileWriter.js";

const ENV_FILE_MAP = [
  [".env.local.example", ".env.local"],
  ["apps/mobile/.env.example", "apps/mobile/.env.local"],
  ["apps/admin/.env.example", "apps/admin/.env.local"]
] as const;

export async function ensureLocalEnvFiles(
  cwd: string,
  options: { dryRun: boolean; forceEnv: boolean }
): Promise<void> {
  const writer = new FileWriter({
    dryRun: options.dryRun,
    allowOverwrite: options.forceEnv
  });

  for (const [examplePath, targetPath] of ENV_FILE_MAP) {
    const contents = await readFile(`${cwd}/${examplePath}`, "utf8");
    await writer.writeFile(`${cwd}/${targetPath}`, contents);
  }
}
