import type { GeneratedFile } from "./types.js";

function doc(title: string, body: string): string {
  return `# ${title}

${body}
`;
}

export function generateDocs(): GeneratedFile[] {
  return [
    ["ONBOARDING", "Run `pnpm install`, then `pnpm bootstrap:dev`, then `pnpm dev`."],
    ["ENVIRONMENTS", "Local development is plug-and-play. Staging and production require hosted Supabase, GitHub secrets, and optional Railway services."],
    ["RELEASE_PROCESS", "Use GitHub Actions deploy workflows for environment promotion. Production deploys should only run in GitHub Actions."],
    ["RUNBOOK", "Use `buzz-stack doctor`, `buzz-stack env validate`, and Supabase reset scripts during incident response."],
    ["SECURITY", "Never place server-only secrets in `apps/mobile/.env*`. Production-sensitive values should not be written to plaintext by default."],
    ["TECHNICAL_DESIGN", "Buzz uses Expo, Next.js, Supabase Edge Functions, optional Railway services, and Turborepo orchestration."],
    ["DEVOPS_ARCHITECTURE", "GitHub Actions orchestrates CI/CD. Railway is optional runtime hosting for admin, API, and worker services."],
    ["API_CONTRACTS", "Mobile clients call Supabase and Edge Functions. AI, Stripe, and push provider calls stay server-side."],
    ["DATABASE_SCHEMA", "The local Supabase schema includes profiles, interests, matching entities, businesses, events, and observability tables."],
    ["AI_PROMPTS", "AI provider calls are backend-only. Use mock mode locally unless explicit provider credentials are configured."],
    ["RAILWAY", "Enable Railway later with `buzz-stack configure railway`. Set project and service IDs via environment variables."],
    ["GITHUB_ACTIONS", "CI validates lint, types, env safety, migrations, and app builds. Deploy workflows promote changes across environments."]
  ].map(([name, body]) => ({
    path: `docs/${name}.md`,
    contents: doc(name.replaceAll("_", " "), body)
  }));
}
