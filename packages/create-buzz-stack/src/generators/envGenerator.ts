import type { GeneratedFile } from "./types.js";

export function generateEnvFiles(): GeneratedFile[] {
  return [
    {
      path: ".env.example",
      contents: `APP_ENV=local

SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

SENTRY_DSN=
POSTHOG_PUBLIC_KEY=
POSTHOG_HOST=https://app.posthog.com

ANTHROPIC_API_KEY=
OPENAI_API_KEY=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

ONESIGNAL_APP_ID=
ONESIGNAL_REST_API_KEY=
EXPO_ACCESS_TOKEN=

RAILWAY_TOKEN=
RAILWAY_PROJECT_ID=
RAILWAY_SERVICE_ADMIN=
RAILWAY_SERVICE_API=
RAILWAY_SERVICE_WORKER=

ALLOW_LOCAL_DEV_AUTH_BYPASS=true
`
    },
    {
      path: ".env.local.example",
      contents: `APP_ENV=local

SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

AI_PROVIDER=mock
ANTHROPIC_API_KEY=
OPENAI_API_KEY=

STRIPE_MODE=disabled
PUSH_PROVIDER=mock
SENTRY_ENABLED=false
POSTHOG_ENABLED=false

ALLOW_LOCAL_DEV_AUTH_BYPASS=true
`
    },
    {
      path: ".env.development.example",
      contents: "APP_ENV=development\nSUPABASE_URL=\nSUPABASE_ANON_KEY=\n"
    },
    {
      path: ".env.staging.example",
      contents: "APP_ENV=staging\nSUPABASE_URL=\nSUPABASE_ANON_KEY=\n"
    },
    {
      path: ".env.production.example",
      contents: "APP_ENV=production\nSUPABASE_URL=\nSUPABASE_ANON_KEY=\n"
    },
    {
      path: "apps/mobile/.env.example",
      contents: `EXPO_PUBLIC_APP_ENV=local
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_SENTRY_DSN=
EXPO_PUBLIC_POSTHOG_PUBLIC_KEY=
EXPO_PUBLIC_POSTHOG_HOST=https://app.posthog.com
`
    },
    {
      path: "apps/admin/.env.example",
      contents: `NEXT_PUBLIC_APP_ENV=local
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_POSTHOG_PUBLIC_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

SUPABASE_SERVICE_ROLE_KEY=
SENTRY_DSN=
`
    },
    {
      path: "apps/api/.env.example",
      contents: `APP_ENV=local
PORT=3001

SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

ANTHROPIC_API_KEY=
OPENAI_API_KEY=
SENTRY_DSN=
POSTHOG_PROJECT_API_KEY=
`
    },
    {
      path: "apps/worker/.env.example",
      contents: `APP_ENV=local

SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

ANTHROPIC_API_KEY=
OPENAI_API_KEY=
SENTRY_DSN=
POSTHOG_PROJECT_API_KEY=
`
    }
  ];
}
