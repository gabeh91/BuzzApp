import { FileWriter } from "../utils/fileWriter.js";
import { generateSupabaseFiles } from "../generators/supabaseGenerator.js";

export async function configureSupabase(
  cwd: string,
  options: { dryRun: boolean; force: boolean }
): Promise<void> {
  const writer = new FileWriter({
    dryRun: options.dryRun,
    allowOverwrite: options.force
  });

  for (const file of generateSupabaseFiles()) {
    await writer.writeFile(`${cwd}/${file.path}`, file.contents);
  }
}
