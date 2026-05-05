import { access, readFile } from "node:fs/promises";
import path from "node:path";

export interface ExistingBuzzRepoResult {
  isExistingRepo: boolean;
  reason: string | null;
}

export interface DetectExistingBuzzRepoOptions {
  cwd: string;
}

const REPO_MARKERS = [
  ".buzz-stack.json",
  "apps/mobile",
  "apps/admin",
  "supabase/config.toml",
  ".github/workflows/ci.yml",
  "railway.json"
] as const;

export async function detectExistingBuzzRepo(
  options: DetectExistingBuzzRepoOptions
): Promise<ExistingBuzzRepoResult> {
  for (const marker of REPO_MARKERS) {
    if (await pathExists(path.join(options.cwd, marker))) {
      return {
        isExistingRepo: true,
        reason: marker
      };
    }
  }

  const workspacePath = path.join(options.cwd, "pnpm-workspace.yaml");
  if (await pathExists(workspacePath)) {
    const contents = await readFile(workspacePath, "utf8");
    if (contents.includes('apps/*') || contents.includes('packages/*')) {
      return {
        isExistingRepo: true,
        reason: "pnpm-workspace.yaml"
      };
    }
  }

  const packageJsonPath = path.join(options.cwd, "package.json");
  if (await pathExists(packageJsonPath)) {
    const contents = await readFile(packageJsonPath, "utf8");
    if (contents.includes('"name": "buzz"') || contents.includes('"name":"buzz"')) {
      return {
        isExistingRepo: true,
        reason: "package.json"
      };
    }
  }

  return {
    isExistingRepo: false,
    reason: null
  };
}

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await access(targetPath);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return false;
    }

    throw error;
  }
}
