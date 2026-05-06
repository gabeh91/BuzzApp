# TECHNICAL DESIGN

Buzz uses Expo, Next.js, Supabase GraphQL/Postgres/Auth/Edge Functions, optional Railway services, and Turborepo orchestration.

The UI data-access default is Apollo Client over Supabase `pg_graphql`. This keeps component code in `useQuery`/`useMutation` while preserving the Supabase-first architecture.

GraphQL operations live in app-local `.graphql` files and are compiled with GraphQL Code Generator:

```bash
pnpm graphql:codegen
```

Generated files are committed so clone/bootstrap/typecheck works immediately, but developers should regenerate them whenever GraphQL operations or Supabase schema fields change.

GraphQL is for RLS-backed product data:

- interests, cities, businesses, events, feature flags
- profile and preference mutations once Supabase Auth is wired
- typed client queries as the app grows

Edge Functions remain the server boundary for side effects and secrets:

- AI provider calls
- Stripe webhooks and payment operations
- push provider REST API calls
- match generation that needs service-role access
- moderation and other backend-only workflows
