import { confirm } from "@inquirer/prompts";

import { getDefaultConfig, type BuzzStackConfig } from "../schema/configSchema.js";

export async function collectProjectConfig(): Promise<BuzzStackConfig> {
  const defaults = getDefaultConfig();
  const useRailway = await confirm({
    message: "Use Railway for hosting?",
    default: false
  });

  return {
    ...defaults,
    features: {
      ...defaults.features,
      railway: useRailway
    },
    hosting: {
      provider: useRailway ? "railway" : null
    },
    railway: {
      ...defaults.railway,
      enabled: useRailway
    }
  };
}
