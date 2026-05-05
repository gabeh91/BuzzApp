import { writeFile } from "node:fs/promises";

import { selectConfigureTarget } from "../prompts/configurePrompts.js";
import { logger } from "../utils/logger.js";
import { readMarker, getMarkerPath } from "../utils/marker.js";
import { configureAi } from "./configureAi.js";
import { configureGithubActions } from "./configureGithubActions.js";
import { configureMobile } from "./configureMobile.js";
import { configureObservability } from "./configureObservability.js";
import { configurePayments } from "./configurePayments.js";
import { configurePush } from "./configurePush.js";
import { configureRailway } from "./configureRailway.js";
import { configureSupabase } from "./configureSupabase.js";

export interface RunConfigureOptions {
  cwd: string;
  target?: string;
  dryRun: boolean;
  force: boolean;
}

const CONFIGURE_REQUIRES_MARKER_MESSAGE = `This does not appear to be a Buzz repository.

Use:
  buzz-stack init

only if you are creating a brand-new repository.`;

export async function runConfigure(options: RunConfigureOptions): Promise<void> {
  const marker = await readMarker(options.cwd);
  if (!marker) {
    throw new Error(CONFIGURE_REQUIRES_MARKER_MESSAGE);
  }

  const target = await selectConfigureTarget(options.target);

  switch (target) {
    case "railway":
      await configureRailway(options.cwd, options);
      marker.hostingProvider = "railway";
      marker.components.railway = { enabled: true, configured: true };
      break;
    case "github-actions":
      await configureGithubActions(options.cwd, options);
      marker.components.githubActions = { enabled: true, configured: true };
      break;
    case "supabase":
      await configureSupabase(options.cwd, options);
      break;
    case "mobile":
      await configureMobile(options.cwd, options);
      break;
    case "observability":
      await configureObservability();
      break;
    case "payments":
      await configurePayments();
      break;
    case "ai":
      await configureAi();
      break;
    case "push":
      await configurePush();
      break;
    default:
      throw new Error(`Unknown configure target: ${target}`);
  }

  if (!options.dryRun) {
    await writeFile(getMarkerPath(options.cwd), `${JSON.stringify(marker, null, 2)}\n`, "utf8");
    logger.success("Updated .buzz-stack.json");
  }
}
