# API CONTRACTS

Mobile and admin UI code should use Apollo Client against Supabase GraphQL at:

```txt
${SUPABASE_URL}/graphql/v1
```

Use Supabase GraphQL for ordinary RLS-backed reads and mutations. Keep AI, Stripe, push provider calls, webhook handling, and any service-role operations inside Supabase Edge Functions or backend services.

The starter GraphQL query shape is:

```graphql
query BuzzHome {
  interestsCollection(first: 20) {
    edges {
      node {
        id
        name
        slug
        category
      }
    }
  }
}
```

The starter activation mutation is exposed as a Postgres function through `pg_graphql`:

```graphql
mutation ActivateInterest($interestId: UUID!) {
  activateInterest(interestId: $interestId)
}
```

Production mutations must rely on Supabase Auth, RLS, grants, and server-side validation. Never send service-role keys or provider secrets to Apollo clients.
