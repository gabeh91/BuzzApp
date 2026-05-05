import { access } from "node:fs/promises";

import type { BuzzStackMarker } from "../utils/marker.js";

export async function validateRailwayConfig(cwd: string, marker: BuzzStackMarker): Promise<"present" | "missing" | "disabled"> {
  if (!marker.components.railway?.enabled) {
    return "disabled";
  }

  try {
    await access(`${cwd}/railway.json`);
    return "present";
  } catch {
    return "missing";
  }
}
