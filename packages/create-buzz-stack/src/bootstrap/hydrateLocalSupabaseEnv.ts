import { readFile } from "node:fs/promises";

import { FileWriter } from "../utils/fileWriter.js";
import { runCommand } from "../utils/shell.js";

function replaceOrAppend(contents: string, key: string, value: string): string {
  if (contents.includes(`${key}=`)) {
    return contents.replace(new RegExp(`^${key}=.*$`, "m"), `${key}=${value}`);
  }

  return `${contents.trim()}\n${key}=${value}\n`;
}

export async function hydrateLocalSupabaseEnv(
  cwd: string,
  options: { dryRun: boolean; forceEnv: boolean }
): Promise<void> {
  const supabaseEnv = await readSupabaseLocalEnv(cwd);
  const targets = [
    [
      ".env.local",
      {
        APP_ENV: "local",
        SUPABASE_URL: supabaseEnv.url,
        SUPABASE_ANON_KEY: supabaseEnv.anonKey,
        SUPABASE_SERVICE_ROLE_KEY: supabaseEnv.serviceRoleKey
      }
    ],
    [
      "apps/mobile/.env.local",
      {
        EXPO_PUBLIC_APP_ENV: "local",
        EXPO_PUBLIC_SUPABASE_URL: supabaseEnv.url,
        EXPO_PUBLIC_SUPABASE_ANON_KEY: supabaseEnv.anonKey
      }
    ],
    [
      "apps/admin/.env.local",
      {
        NEXT_PUBLIC_APP_ENV: "local",
        NEXT_PUBLIC_SUPABASE_URL: supabaseEnv.url,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseEnv.anonKey,
        SUPABASE_SERVICE_ROLE_KEY: supabaseEnv.serviceRoleKey
      }
    ]
  ] as const;
  const writer = new FileWriter({
    dryRun: options.dryRun,
    allowOverwrite: true,
    backupOnOverwrite: false
  });

  for (const [relativePath, values] of targets) {
    const filePath = `${cwd}/${relativePath}`;
    const current = await readFile(filePath, "utf8");
    const hydrated = Object.entries(values).reduce(
      (accumulator, [key, value]) => replaceOrAppend(accumulator, key, value),
      current
    );
    await writer.writeFile(filePath, hydrated);
  }
}

async function readSupabaseLocalEnv(cwd: string): Promise<{
  url: string;
  anonKey: string;
  serviceRoleKey: string;
}> {
  const fallback = {
    url: "http://127.0.0.1:54321",
    anonKey: "",
    serviceRoleKey: ""
  };

  const status = await runCommand("supabase", ["status", "-o", "env"], {
    cwd,
    reject: false
  });

  if (status.exitCode !== 0) {
    return fallback;
  }

  const values = parseEnvOutput(status.stdout);

  return {
    url: values.API_URL ?? fallback.url,
    anonKey: values.ANON_KEY ?? values.PUBLISHABLE_KEY ?? fallback.anonKey,
    serviceRoleKey: values.SERVICE_ROLE_KEY ?? values.SECRET_KEY ?? fallback.serviceRoleKey
  };
}

function parseEnvOutput(output: string): Record<string, string> {
  return Object.fromEntries(
    output
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => /^[A-Z0-9_]+=/.test(line))
      .map((line) => {
        const [key, ...valueParts] = line.split("=");
        const rawValue = valueParts.join("=");
        return [key, rawValue.replace(/^"|"$/g, "")];
      })
  );
}
