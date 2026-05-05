import path from "node:path";

export const ROOT_DIRECTORIES = {
  apps: "apps",
  packages: "packages",
  supabase: "supabase",
  scripts: "scripts",
  docs: "docs",
  github: ".github"
} as const;

export function resolveFromCwd(cwd: string, ...segments: string[]): string {
  return path.join(cwd, ...segments);
}
