import type { BuzzStackConfig } from "../schema/configSchema.js";
import type { BuzzStackMarker } from "../utils/marker.js";
import type { GeneratedFile } from "./types.js";

import { generateDocs } from "./docsGenerator.js";
import { generateDockerFiles } from "./dockerGenerator.js";
import { generateEnvFiles } from "./envGenerator.js";
import { generateFunctionFiles } from "./functionsGenerator.js";
import { generateGithubActionsFiles } from "./githubActionsGenerator.js";
import { generateRailwayFiles } from "./railwayGenerator.js";
import { generateScriptFiles } from "./scriptsGenerator.js";
import { generateSupabaseFiles } from "./supabaseGenerator.js";
import { generateWorkspaceFiles } from "./workspaceGenerator.js";

function generateBaseRootFiles(config: BuzzStackConfig): GeneratedFile[] {
  return [
    {
      path: "package.json",
      contents: `{
  "name": "${config.projectName}",
  "private": true,
  "packageManager": "pnpm@9.15.0",
  "scripts": {
    "dev": "turbo dev",
    "dev:local": "pnpm bootstrap:dev:quick && turbo dev",
    "dev:mobile": "pnpm --filter mobile start",
    "dev:admin": "pnpm --filter admin dev",
    "dev:functions": "supabase functions serve --env-file .env.local",
    "dev:supabase": "supabase start",
    "dev:stop": "supabase stop",
    "buzz-stack": "tsx packages/create-buzz-stack/src/index.ts",
    "bootstrap:dev": "tsx packages/create-buzz-stack/src/index.ts bootstrap",
    "bootstrap:dev:quick": "tsx packages/create-buzz-stack/src/index.ts bootstrap --skip-db-reset",
    "doctor": "tsx packages/create-buzz-stack/src/index.ts doctor",
    "env:validate": "tsx packages/create-buzz-stack/src/index.ts env validate",
    "check:prereqs": "tsx packages/create-buzz-stack/src/index.ts doctor",
    "check:env": "tsx packages/create-buzz-stack/src/index.ts env validate",
    "graphql:codegen": "graphql-codegen --config codegen.ts",
    "graphql:codegen:watch": "graphql-codegen --config codegen.ts --watch",
    "lint": "pnpm -r lint",
    "typecheck": "pnpm -r typecheck",
    "test": "pnpm -r test",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "supabase:start": "supabase start",
    "supabase:stop": "supabase stop",
    "supabase:reset": "supabase db reset",
    "supabase:types": "bash scripts/db/generate-types.sh",
    "supabase:validate": "bash scripts/ci/validate-migrations.sh",
    "db:reset": "bash scripts/db/reset-local.sh",
    "db:diff": "bash scripts/db/diff.sh",
    "db:push:dev": "bash scripts/db/push-dev.sh",
    "db:push:staging": "bash scripts/db/push-staging.sh",
    "db:push:prod": "bash scripts/db/push-prod.sh",
    "deploy:dev": "bash scripts/deploy/deploy-dev.sh",
    "deploy:staging": "bash scripts/deploy/deploy-staging.sh",
    "deploy:prod": "bash scripts/deploy/deploy-prod.sh",
    "railway:deploy:admin:dev": "bash scripts/railway/deploy-admin.sh development",
    "railway:deploy:admin:staging": "bash scripts/railway/deploy-admin.sh staging",
    "railway:deploy:admin:prod": "bash scripts/railway/deploy-admin.sh production",
    "mobile:build:dev": "bash scripts/mobile/build-dev.sh",
    "mobile:build:staging": "bash scripts/mobile/build-staging.sh",
    "mobile:build:prod": "bash scripts/mobile/build-prod.sh"
  },
  "devDependencies": {
    "@graphql-codegen/cli": "latest",
    "@graphql-codegen/typescript": "latest",
    "@graphql-codegen/typescript-operations": "latest",
    "@graphql-codegen/typescript-react-apollo": "latest",
    "@types/node": "latest",
    "concurrently": "latest",
    "eslint": "latest",
    "prettier": "latest",
    "turbo": "latest",
    "tsx": "latest",
    "typescript": "latest",
    "zod": "latest"
  }
}
`
    },
    {
      path: "codegen.ts",
      contents: `import { existsSync, readFileSync } from "node:fs";

import type { CodegenConfig } from "@graphql-codegen/cli";

function readEnvFile(path: string): Record<string, string> {
  if (!existsSync(path)) {
    return {};
  }

  return Object.fromEntries(
    readFileSync(path, "utf8")
      .split(/\\r?\\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const [key, ...valueParts] = line.split("=");
        return [key, valueParts.join("=").replace(/^[\\"']|[\\"']$/g, "")] as const;
      })
  );
}

const rootLocalEnv = readEnvFile(".env.local");
const mobileLocalEnv = readEnvFile("apps/mobile/.env.local");
const adminLocalEnv = readEnvFile("apps/admin/.env.local");

const supabaseUrl =
  process.env.SUPABASE_URL ??
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  process.env.EXPO_PUBLIC_SUPABASE_URL ??
  rootLocalEnv.SUPABASE_URL ??
  adminLocalEnv.NEXT_PUBLIC_SUPABASE_URL ??
  mobileLocalEnv.EXPO_PUBLIC_SUPABASE_URL ??
  "http://127.0.0.1:54321";

const supabaseAnonKey =
  process.env.SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  rootLocalEnv.SUPABASE_ANON_KEY ??
  adminLocalEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  mobileLocalEnv.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  "";

const graphqlUrl = \`\${supabaseUrl.replace(/\\/$/, "")}/graphql/v1\`;

const sharedApolloConfig = {
  withHooks: true,
  withHOC: false,
  withComponent: false,
  reactApolloVersion: 3,
  apolloReactHooksImportFrom: "@apollo/client",
  apolloReactCommonImportFrom: "@apollo/client",
  gqlImport: "@apollo/client#gql",
  scalars: {
    UUID: "string",
    BigInt: "number",
    Date: "string",
    Datetime: "string",
    JSON: "Record<string, unknown>"
  },
  skipTypename: true,
  useTypeImports: true
};

const config: CodegenConfig = {
  overwrite: true,
  schema: [
    {
      [graphqlUrl]: {
        headers: {
          apikey: supabaseAnonKey,
          authorization: supabaseAnonKey ? \`Bearer \${supabaseAnonKey}\` : ""
        }
      }
    }
  ],
  generates: {
    "apps/mobile/graphql/generated.tsx": {
      documents: "apps/mobile/graphql/**/*.graphql",
      plugins: ["typescript", "typescript-operations", "typescript-react-apollo"],
      config: sharedApolloConfig
    },
    "apps/admin/graphql/generated.tsx": {
      documents: "apps/admin/graphql/**/*.graphql",
      plugins: ["typescript", "typescript-operations", "typescript-react-apollo"],
      config: sharedApolloConfig
    }
  }
};

export default config;
`
    },
    {
      path: "pnpm-workspace.yaml",
      contents: `packages:
  - "apps/*"
  - "packages/*"
  - "supabase/functions/*"
  - "supabase/functions/_shared"
`
    },
    {
      path: "turbo.json",
      contents: `{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "dev": {
      "cache": false,
      "persistent": true
    },
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "lint": {},
    "typecheck": {},
    "test": {}
  }
}
`
    },
    {
      path: "tsconfig.base.json",
      contents: `{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM"],
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "strict": true,
    "skipLibCheck": true,
    "declaration": true,
    "sourceMap": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
`
    },
    {
      path: ".gitignore",
      contents: `node_modules/
.pnpm-store/

.env
.env.*
!.env.example
!.env.local.example
!.env.development.example
!.env.staging.example
!.env.production.example

dist/
build/
.next/
.expo/
.expo-shared/
coverage/
*.tsbuildinfo

ios/Pods/
android/.gradle/
android/app/build/
*.apk
*.aab
*.ipa

*.log
npm-debug.log*
pnpm-debug.log*

.DS_Store

.supabase/
supabase/.branches/
supabase/.temp/

*.pem
*.key
secrets.json
service-account.json
`
    },
    {
      path: ".nvmrc",
      contents: "22\n"
    },
    {
      path: ".npmrc",
      contents: "auto-install-peers=true\nstrict-peer-dependencies=false\n"
    },
    {
      path: "README.md",
      contents: `# ${config.projectName}

Buzz is a Supabase-first city integration platform monorepo with Expo mobile, Next.js admin, local Supabase, optional Railway services, and the internal create-buzz-stack CLI.
`
    }
  ];
}

export function buildMarker(config: BuzzStackConfig): BuzzStackMarker {
  return {
    project: config.projectName,
    stackVersion: "0.1.0",
    createdBy: "create-buzz-stack",
    createdAt: new Date().toISOString(),
    repoInitialized: true,
    ciProvider: "github-actions",
    hostingProvider: config.railway.enabled ? "railway" : null,
    components: {
      mobile: { enabled: true, configured: true, provider: "expo" },
      admin: { enabled: true, configured: true, hosting: null },
      supabase: { enabled: true, configured: true },
      githubActions: { enabled: true, configured: true },
      railway: { enabled: config.railway.enabled, configured: config.railway.enabled },
      api: { enabled: true, configured: true, hosting: config.railway.enabled ? "railway" : null },
      worker: { enabled: true, configured: true, hosting: config.railway.enabled ? "railway" : null },
      sentry: { enabled: false, configured: false },
      posthog: { enabled: false, configured: false },
      stripe: { enabled: false, configured: false },
      push: { enabled: false, configured: false, provider: null },
      ai: { enabled: true, configured: false, providers: ["mock"] }
    }
  };
}

export function generateRootFiles(config: BuzzStackConfig): GeneratedFile[] {
  return [
    ...generateBaseRootFiles(config),
    ...generateWorkspaceFiles(config),
    ...generateEnvFiles(),
    ...generateSupabaseFiles(),
    ...generateFunctionFiles(),
    ...generateScriptFiles(),
    ...generateDocs(),
    ...generateGithubActionsFiles(),
    ...generateDockerFiles(),
    ...(config.railway.enabled ? generateRailwayFiles() : [])
  ];
}
