import { runCommand } from "./shell.js";

export async function isInsideGitRepo(cwd: string): Promise<boolean> {
  const result = await runCommand("git", ["rev-parse", "--show-toplevel"], {
    cwd,
    reject: false
  });

  return result.exitCode === 0;
}
