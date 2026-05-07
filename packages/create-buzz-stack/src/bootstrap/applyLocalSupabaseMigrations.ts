import { logger } from "../utils/logger.js";
import { runCommand } from "../utils/shell.js";

type CommandOptions = NonNullable<Parameters<typeof runCommand>[2]>;
type CommandResult = Awaited<ReturnType<typeof runCommand>>;
type CommandRunner = (command: string, args: string[], options: CommandOptions) => Promise<CommandResult>;

export async function applyLocalSupabaseMigrations(
  cwd: string,
  options: {
    dryRun: boolean;
    runner?: CommandRunner;
  }
): Promise<void> {
  if (options.dryRun) {
    logger.info("Would apply pending local Supabase migrations");
    return;
  }

  const runner = options.runner ?? runCommand;
  const result = await runner("supabase", ["migration", "up"], {
    cwd,
    reject: false,
    stdio: "inherit"
  });

  if (result.exitCode !== 0) {
    throw new Error("Failed to apply local Supabase migrations. Run `supabase migration up --debug` for details.");
  }

  logger.success("Applied local Supabase migrations");
}
