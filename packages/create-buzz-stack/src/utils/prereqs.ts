import { runCommand } from "./shell.js";

export interface PrereqStatus {
  name: string;
  status: "pass" | "warn" | "fail";
  detail: string;
}

async function hasBinary(binary: string): Promise<boolean> {
  const result = await runCommand("bash", ["-lc", `command -v ${binary}`], {
    cwd: process.cwd(),
    reject: false
  });

  return result.exitCode === 0;
}

export async function checkPrereqs(): Promise<PrereqStatus[]> {
  const checks = await Promise.all([
    hasBinary("node"),
    hasBinary("pnpm"),
    hasBinary("git"),
    hasBinary("docker"),
    hasBinary("supabase"),
    hasBinary("railway"),
    hasBinary("eas"),
    hasBinary("xcodebuild")
  ]);

  return [
    {
      name: "Node.js >= 22",
      status: process.versions.node.startsWith("22.") ? "pass" : "fail",
      detail: process.versions.node
    },
    {
      name: "pnpm",
      status: checks[1] ? "pass" : "fail",
      detail: checks[1] ? "Installed" : "Missing"
    },
    {
      name: "Git",
      status: checks[2] ? "pass" : "fail",
      detail: checks[2] ? "Installed" : "Missing"
    },
    {
      name: "Docker",
      status: checks[3] ? "pass" : "warn",
      detail: checks[3] ? "Installed" : "Optional for local parity, but recommended"
    },
    {
      name: "Supabase CLI",
      status: checks[4] ? "pass" : "warn",
      detail: checks[4] ? "Installed" : "Required for full local bootstrap"
    },
    {
      name: "Railway CLI",
      status: checks[5] ? "pass" : "warn",
      detail: checks[5] ? "Installed" : "Optional unless Railway is enabled"
    },
    {
      name: "EAS CLI",
      status: checks[6] ? "pass" : "warn",
      detail: checks[6] ? "Installed" : "Optional unless running mobile builds"
    },
    {
      name: "Xcode",
      status: checks[7] ? "pass" : "warn",
      detail: checks[7] ? "Installed" : "Optional for iOS builds"
    }
  ];
}
