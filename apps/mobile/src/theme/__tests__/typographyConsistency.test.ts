import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const ROOT = "src";
const SCAN_DIRS = ["features", "ui", "auth", "navigation"];
const ALLOWED_FONT_WEIGHT_FILES = new Set([
  "theme/tokens.ts",
  "ui/Text.tsx",
  "ui/TextInputGroup.tsx",
]);

const collectSourceFiles = (directory: string): string[] => {
  const entries = readdirSync(directory);
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = join(directory, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      if (entry === "__tests__" || entry === "node_modules") {
        continue;
      }

      files.push(...collectSourceFiles(fullPath));
      continue;
    }

    if (fullPath.endsWith(".ts") || fullPath.endsWith(".tsx")) {
      files.push(fullPath);
    }
  }

  return files;
};

test("feature and UI styles use theme fontStyles instead of bare fontWeight", () => {
  const offenders: string[] = [];

  for (const dir of SCAN_DIRS) {
    const base = join(ROOT, dir);

    for (const file of collectSourceFiles(base)) {
      const normalized = file.replaceAll("\\", "/");

      if (ALLOWED_FONT_WEIGHT_FILES.has(normalized)) {
        continue;
      }

      if (normalized.includes("/__tests__/")) {
        continue;
      }

      const source = readFileSync(file, "utf8");

      if (!source.includes("fontWeight:")) {
        continue;
      }

      offenders.push(normalized);
    }
  }

  assert.deepEqual(
    offenders,
    [],
    `Use theme.fontStyles (body, labelStrong, display, heavy, black) instead of fontWeight:\n${offenders.join("\n")}`,
  );
});
