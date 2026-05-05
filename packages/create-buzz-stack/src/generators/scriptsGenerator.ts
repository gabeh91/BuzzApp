import type { GeneratedFile } from "./types.js";

function shell(contents: string): string {
  return `#!/usr/bin/env bash
set -euo pipefail

${contents}
`;
}

export function generateScriptFiles(): GeneratedFile[] {
  const files: GeneratedFile[] = [
    ["scripts/ci/typecheck.sh", "pnpm typecheck"],
    ["scripts/ci/lint.sh", "pnpm lint"],
    ["scripts/ci/test.sh", "pnpm test"],
    ["scripts/ci/admin-build.sh", "pnpm --filter admin build"],
    ["scripts/ci/mobile-checks.sh", "pnpm --filter mobile typecheck"],
    ["scripts/ci/validate-migrations.sh", "echo \"Validating Supabase migrations\""],
    ["scripts/deploy/deploy-dev.sh", "bash scripts/deploy/deploy-supabase.sh development"],
    ["scripts/deploy/deploy-staging.sh", "bash scripts/deploy/deploy-supabase.sh staging"],
    ["scripts/deploy/deploy-prod.sh", "if [ \"${GITHUB_ACTIONS:-}\" != \"true\" ]; then echo \"Production deploys should run through GitHub Actions only\"; exit 1; fi\nbash scripts/deploy/deploy-supabase.sh production"],
    ["scripts/deploy/deploy-supabase.sh", "TARGET_ENV=\"${1:-development}\"\necho \"Deploying Supabase assets to ${TARGET_ENV}\""],
    ["scripts/deploy/deploy-edge-functions.sh", "echo \"Deploying Supabase Edge Functions\""],
    ["scripts/deploy/deploy-admin.sh", "echo \"Deploying admin application\""],
    ["scripts/db/reset-local.sh", "supabase db reset"],
    ["scripts/db/generate-types.sh", "supabase gen types typescript --local > packages/shared-types/src/database.ts"],
    ["scripts/db/diff.sh", "supabase db diff"],
    ["scripts/db/push-dev.sh", "echo \"Push dev DB migrations\""],
    ["scripts/db/push-staging.sh", "echo \"Push staging DB migrations\""],
    ["scripts/db/push-prod.sh", "echo \"Push production DB migrations\""],
    ["scripts/mobile/build-dev.sh", "eas build --profile development"],
    ["scripts/mobile/build-staging.sh", "eas build --profile staging"],
    ["scripts/mobile/build-prod.sh", "eas build --profile production"],
    ["scripts/secrets/check-required-env.ts", "console.log('TODO: implement required env checks');"],
    ["scripts/secrets/print-required-secrets.ts", "console.log('TODO: print required secrets');"]
  ].map(([path, contents]) => ({
    path,
    contents: path.endsWith(".sh") ? shell(contents) : `${contents}\n`,
    executable: path.endsWith(".sh")
  }));

  return files;
}
