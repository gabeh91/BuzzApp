import { readFile } from "node:fs/promises";
import path from "node:path";

export const MARKER_FILENAME = ".buzz-stack.json";

export interface BuzzStackMarker {
  project: string;
  stackVersion: string;
  createdBy: "create-buzz-stack";
  createdAt: string;
  repoInitialized: boolean;
  ciProvider: string | null;
  hostingProvider: string | null;
  components: Record<
    string,
    {
      enabled: boolean;
      configured: boolean;
      [key: string]: unknown;
    }
  >;
}

export function getMarkerPath(cwd: string): string {
  return path.join(cwd, MARKER_FILENAME);
}

export async function readMarker(cwd: string): Promise<BuzzStackMarker | null> {
  try {
    const raw = await readFile(getMarkerPath(cwd), "utf8");
    return JSON.parse(raw) as BuzzStackMarker;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }

    throw error;
  }
}
