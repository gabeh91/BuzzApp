import { execa } from "execa";

export async function runCommand(
  command: string,
  args: string[],
  options: { cwd: string; reject?: boolean; stdio?: "pipe" | "inherit" } = { cwd: process.cwd() }
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  const result = await execa(command, args, {
    cwd: options.cwd,
    reject: options.reject ?? false,
    stdio: options.stdio ?? "pipe"
  });

  return {
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    exitCode: result.exitCode ?? 0
  };
}
