import { existsSync, readFileSync } from "node:fs";

import type { CodegenConfig } from "@graphql-codegen/cli";

function readEnvFile(path: string): Record<string, string> {
  if (!existsSync(path)) {
    return {};
  }

  return Object.fromEntries(
    readFileSync(path, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const [key, ...valueParts] = line.split("=");
        return [key, valueParts.join("=").replace(/^["']|["']$/g, "")] as const;
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

const supabaseSchemaKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? rootLocalEnv.SUPABASE_SERVICE_ROLE_KEY ?? supabaseAnonKey;

const graphqlUrl = `${supabaseUrl.replace(/\/$/, "")}/graphql/v1`;

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
          apikey: supabaseSchemaKey,
          authorization: supabaseSchemaKey ? `Bearer ${supabaseSchemaKey}` : ""
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
