import { z } from "zod";

export const configSchema = z.object({
  projectName: z.string().default("buzz"),
  packageManager: z.literal("pnpm").default("pnpm"),
  nodeVersion: z.string().default("22"),
  features: z.object({
    mobile: z.boolean().default(true),
    admin: z.boolean().default(true),
    apiPlaceholder: z.boolean().default(true),
    workerPlaceholder: z.boolean().default(true),
    githubActions: z.boolean().default(true),
    railway: z.boolean().default(false),
    docker: z.boolean().default(true),
    supabase: z.boolean().default(true),
    edgeFunctions: z.boolean().default(true),
    turborepo: z.boolean().default(true)
  }),
  ci: z.object({
    provider: z.literal("github-actions").default("github-actions"),
    environments: z.array(z.string()).default(["development", "staging", "production"]),
    productionRequiresApproval: z.boolean().default(true)
  }),
  hosting: z.object({
    provider: z.enum(["railway"]).nullable().default(null)
  }),
  railway: z.object({
    enabled: z.boolean().default(false),
    projectName: z.string().default("buzz"),
    environments: z.object({
      development: z.string().default("development"),
      staging: z.string().default("staging"),
      production: z.string().default("production")
    }),
    services: z.object({
      admin: z.string().default("buzz-admin"),
      api: z.string().default("buzz-api"),
      worker: z.string().default("buzz-worker")
    })
  }),
  mobile: z.object({
    appName: z.string().default("Buzz"),
    ios: z.object({
      devBundleId: z.string().default("com.buzz.dev"),
      stagingBundleId: z.string().default("com.buzz.staging"),
      prodBundleId: z.string().default("com.buzz.app")
    }),
    android: z.object({
      devPackage: z.string().default("com.buzz.dev"),
      stagingPackage: z.string().default("com.buzz.staging"),
      prodPackage: z.string().default("com.buzz.app")
    })
  }),
  localDev: z.object({
    runBootstrapAfterInit: z.boolean().default(true),
    useMockAi: z.boolean().default(true),
    disableStripe: z.boolean().default(true),
    disablePush: z.boolean().default(true),
    disableSentry: z.boolean().default(true),
    disablePostHog: z.boolean().default(true)
  })
});

export type BuzzStackConfig = z.infer<typeof configSchema>;

const DEFAULT_CONFIG = {
  projectName: "buzz",
  packageManager: "pnpm",
  nodeVersion: "22",
  features: {
    mobile: true,
    admin: true,
    apiPlaceholder: true,
    workerPlaceholder: true,
    githubActions: true,
    railway: false,
    docker: true,
    supabase: true,
    edgeFunctions: true,
    turborepo: true
  },
  ci: {
    provider: "github-actions",
    environments: ["development", "staging", "production"],
    productionRequiresApproval: true
  },
  hosting: {
    provider: null
  },
  railway: {
    enabled: false,
    projectName: "buzz",
    environments: {
      development: "development",
      staging: "staging",
      production: "production"
    },
    services: {
      admin: "buzz-admin",
      api: "buzz-api",
      worker: "buzz-worker"
    }
  },
  mobile: {
    appName: "Buzz",
    ios: {
      devBundleId: "com.buzz.dev",
      stagingBundleId: "com.buzz.staging",
      prodBundleId: "com.buzz.app"
    },
    android: {
      devPackage: "com.buzz.dev",
      stagingPackage: "com.buzz.staging",
      prodPackage: "com.buzz.app"
    }
  },
  localDev: {
    runBootstrapAfterInit: true,
    useMockAi: true,
    disableStripe: true,
    disablePush: true,
    disableSentry: true,
    disablePostHog: true
  }
} satisfies BuzzStackConfig;

export function getDefaultConfig(): BuzzStackConfig {
  return configSchema.parse(DEFAULT_CONFIG);
}
