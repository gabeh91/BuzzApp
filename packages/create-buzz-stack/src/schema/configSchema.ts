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

export function getDefaultConfig(): BuzzStackConfig {
  return configSchema.parse({});
}
