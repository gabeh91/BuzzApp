const FORBIDDEN_MOBILE_KEYS = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "ANTHROPIC_API_KEY",
  "OPENAI_API_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "ONESIGNAL_REST_API_KEY",
  "POSTHOG_PROJECT_API_KEY",
  "RAILWAY_TOKEN"
] as const;

export function validateMobileEnv(contents: string, filePath: string): void {
  const keys = contents
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"))
    .map((line) => line.split("=", 1)[0]?.trim())
    .filter((line): line is string => Boolean(line));

  for (const key of FORBIDDEN_MOBILE_KEYS) {
    if (keys.includes(key)) {
      throw new Error(`Forbidden server-only key found in ${filePath}:\n${key}\n\nRemove this key before running the app.`);
    }
  }
}
