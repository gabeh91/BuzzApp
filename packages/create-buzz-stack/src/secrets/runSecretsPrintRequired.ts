import { logger } from "../utils/logger.js";
import { readMarker } from "../utils/marker.js";

export async function runSecretsPrintRequired(cwd: string): Promise<void> {
  const marker = await readMarker(cwd);
  if (!marker) {
    throw new Error("Missing .buzz-stack.json. Run buzz-stack init first.");
  }

  const railwayLine = marker.components.railway?.enabled
    ? `- RAILWAY_TOKEN
- RAILWAY_PROJECT_ID
- RAILWAY_SERVICE_ADMIN`
    : "- Railway secrets not required";

  logger.plain(`Required GitHub Actions secrets:

Development:
- SUPABASE_ACCESS_TOKEN
- SUPABASE_PROJECT_REF_DEV
- SUPABASE_SERVICE_ROLE_KEY_DEV
${railwayLine}

Staging:
- SUPABASE_ACCESS_TOKEN
- SUPABASE_PROJECT_REF_STAGING
- SUPABASE_SERVICE_ROLE_KEY_STAGING
${railwayLine}

Production:
- SUPABASE_ACCESS_TOKEN
- SUPABASE_PROJECT_REF_PROD
- SUPABASE_SERVICE_ROLE_KEY_PROD
${railwayLine}

Required Railway variables for admin service, only if Railway is enabled:
- NEXT_PUBLIC_APP_ENV
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- SENTRY_DSN
- NEXT_PUBLIC_POSTHOG_PUBLIC_KEY`);
}
