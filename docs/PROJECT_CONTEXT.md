# Buzz Project Context for AI Agents

## 1. Project Summary

Buzz is a city integration platform for people who have recently moved to a new city.

The product helps new arrivals:

- find people with shared interests
- organise low-pressure activities
- discover relevant events and experiences
- eventually understand which neighbourhoods and local businesses suit them

The core insight is that people who move cities do not just need generic “friends”. They need organic, low-pressure reasons to do things with other people. The activity comes first; friendship may follow.

The MVP should prove whether users will:

1. create a profile
2. complete a quiz
3. choose interests
4. activate an interest
5. match with nearby people
6. accept or organise an activity
7. use a group chat to coordinate

Everything else is secondary until that loop is proven.

### HOWEVER

A High fidelity, highly-polished, intuitive, modern, clean, user-friendly UI and UX is PARAMOUNT. We're talking shared element transitions for pages that need it. Amazing animations, interpolated user scroll experiences, that sort of thing.
This is the only thing which will set Buzz apart from other mobile apps. This is VERY important during Component/Screen building.

### Product Copy Guardrail

Rendered product copy must be user-facing, not implementation-facing. Do not show terms like hook names, provider names, GraphQL, mock/demo mode, deterministic matching, route libraries, auth boundaries, or fallback data in mobile/admin UI. Those details belong in code comments, tests, docs, and implementation plans only.

Mobile rendered strings should live in the `typesafe-i18n` locale layer and be consumed through the app i18n hook/context. Avoid hardcoded screen copy in components or flow models unless it is temporary implementation scaffolding that will never render.

### UI Component Reuse Guardrail

Before building mobile screens or UI, read `docs/UI_COMPONENT_GUIDELINES.md`.

Prefer reusable, categorized componentry over per-screen styling. If two screens render the same UI pattern, extract or reuse a component and drive differences through props. Screens should compose shared primitives/composites and keep local styles limited to feature layout, not repeated card/header/button/hero treatment.

---

## 2. Product Elevator Pitch

Buzz helps people who have just moved to a new city find their people, places, and activities faster.

Users complete a short personality quiz, choose interests they want to try, and activate those interests to connect with nearby people who want to do the same thing.

Instead of awkward friend-swiping or cold messaging, Buzz creates a shared starting point: surfing, tennis, singing, climbing, cooking classes, coffee, or any other activity.

Longer term, Buzz also connects that intent to local businesses. If someone says they want to learn to surf, join a gym, take a cooking class, or learn guitar, the relevant local business can be surfaced at that exact moment.

---

## 3. MVP Scope

Build the smallest useful product that proves the core loop.

### In Scope for MVP

- Sign up / profile flow
- Basic profile creation
- Personality, lifestyle and hobbies quiz, approximately 20 questions
- Interest selection, 8–10 starter interests
- Melbourne as the first/default city
- Same-city and same-interest matching
- Interest activation button
- Invite/ping matched users
- Accept as friend or agree to organise activity
- Automatic group creation once users agree
- In-app group chat for coordination
- Settled/inactive toggle on profile.
- Basic safety primitives: block/report placeholders
- Moderation: Bad-word censores, rude message filters etc

### Out of Scope for MVP / Feature-Flagged

These should have schema placeholders ready to drop-in, but should not dominate the first build:

- Neighbourhood recommender
- AI matching cards
- Local knowledge Q&A
- Verified locals marketplace
- Business monetisation layer
- Promoted events
- Paid lead attribution
- User subscriptions
- Advanced admin/business portal
- Heavy recommendation engine
- On-device AI

---

## 4. Default Feature Flags

Use feature flags so later-stage platform features can be added without blocking the MVP.

Recommended default local/MVP flags:

```txt
business_recommendations=false
promoted_events=false
lead_attribution=false
ai_match_cards=false
local_knowledge_qa=false
verified_locals=false
subscriptions=false
neighbourhood_recommender=false
```

Recommended enabled MVP flags:

```txt
interest_activation=true
group_chat=true
basic_matching=true
settled_toggle=true
```

---

## 5. Technical Direction

The project should optimise for speed, clean architecture, and reversibility.

### Chosen Stack

```txt
Mobile: React Native / Expo
Admin: Next.js
Backend: Supabase-first
Database: Supabase Postgres
Location: PostGIS
Realtime/chat: Supabase Realtime initially
Server functions: Supabase Edge Functions
AI: backend-only, mocked locally by default
CI/CD: GitHub Actions
Hosting: Railway optional, configured later if needed
Package manager: pnpm
Monorepo orchestration: Turborepo
Local infra: Docker + Supabase CLI
```

### Core Principle

Do not build a heavy custom monolith before the product is validated.

Use hosted infrastructure and a thin trusted backend layer:

```txt
Expo app
  -> Supabase Auth/Postgres/Storage/Realtime
  -> Supabase Edge Functions
  -> AI/push/payments/analytics providers later
```

---

## 6. Architecture Guardrails

### Do

- Keep Expo inside the monorepo under `apps/mobile`.
- Use Supabase for auth, Postgres, realtime, storage, and Edge Functions.
- Use deterministic matching first.
- Keep AI server-side only.
- Mock AI locally by default.
- Keep Railway optional at first.
- Use GitHub Actions instead of Buildkite.
- Generate plug-and-play local development scripts.
- Keep the first launch Melbourne-only.
- Optimise for the interest activation loop.

### Do Not

- Do not put AI provider keys in the mobile app.
- Do not put Supabase service-role keys in the mobile app.
- Do not build a heavy monolithic backend on day one.
- Do not make Railway mandatory for local development.
- Do not require production credentials to run locally.
- Do not make AI responsible for core matching in v1.
- Do not build business monetisation UI before the core loop works.
- Do not add Kubernetes or heavy infrastructure.

---

## 7. Matching Approach

### MVP Matching Should Be Deterministic

Use simple, explainable signals first:

- same city
- same interest
- user is active / not settled
- profile is visible
- not blocked
- compatible availability if available
- quiz/personality tags if available

### AI Matching Later

AI should initially be used only for enrichment:

- “why you matched” explanations
- icebreaker suggestions
- activity suggestions
- neighbourhood descriptions
- recommendation summaries

AI should not be the source of truth for match eligibility in the MVP.

---

## 8. Local Development Requirements

The repo should be plug-and-play.

From a new generated repo:

```bash
pnpm dlx create-buzz-stack
cd buzz
pnpm dev
```

From a cloned repo:

```bash
git clone <repo-url>
cd buzz
pnpm install
pnpm bootstrap:dev
pnpm dev
```

`pnpm dev` should start:

- local Supabase
- Supabase Studio
- Expo dev server
- Next.js admin dashboard
- local Edge Function serving where practical

Local development must not require real AI, Stripe, Sentry, PostHog, Railway, Apple, Google, or production Supabase credentials.

---

## 9. CLI Requirements

The project includes an internal CLI package:

```txt
packages/create-buzz-stack
```

Expose binaries:

```txt
create-buzz-stack
buzz-stack
```

### Commands

```bash
buzz-stack init
buzz-stack bootstrap
buzz-stack configure
buzz-stack configure railway
buzz-stack configure github-actions
buzz-stack configure supabase
buzz-stack configure mobile
buzz-stack configure observability
buzz-stack configure payments
buzz-stack configure ai
buzz-stack configure push
buzz-stack doctor
buzz-stack env validate
buzz-stack secrets print-required
buzz-stack generate github-actions
buzz-stack generate railway
buzz-stack generate docs
buzz-stack generate functions
```

### Critical CLI Behaviour

`buzz-stack init` creates a brand-new repo only.

It must create:

```txt
.buzz-stack.json
```

After repo creation, running `buzz-stack init` again must fail with:

```txt
This directory already appears to be an initialized Buzz repository.

Use:
  buzz-stack bootstrap

instead of:
  buzz-stack init
```

`buzz-stack bootstrap` is for developers who clone the repo.

`buzz-stack configure` is for adding optional infrastructure later, such as Railway.

---

## 10. Recommended Repository Structure

```txt
buzz/
  apps/
    mobile/
    admin/
    api/
    worker/

  packages/
    shared-types/
    validation/
    config/
    ui/
    create-buzz-stack/

  supabase/
    config.toml
    seed.sql
    migrations/
    functions/

  scripts/
    ci/
    deploy/
    db/
    mobile/
    railway/
    secrets/

  docker/
  docs/
  .github/workflows/
  railway.json
  turbo.json
  .buzz-stack.json
  package.json
  pnpm-workspace.yaml
```

Notes:

- `apps/api` and `apps/worker` can be placeholders initially.
- Railway can be added later with `buzz-stack configure railway`.
- Supabase Edge Functions are the MVP backend function layer.

---

## 11. Initial Database Entities

The initial Supabase schema should include:

```txt
profiles
cities
neighbourhoods
interests
user_interests
interest_activations
match_candidates
activity_groups
activity_group_members
group_messages
businesses
business_categories
business_impressions
business_leads
events
event_interests
blocks
reports
ai_profile_summaries
feature_flags
```

Business and AI tables may exist early, but corresponding product features should be disabled by default.

---

## 12. Seed Data Defaults

Default assumptions:

```txt
city=Melbourne
launch_mode=single_city
matching_scope=same_city_same_interest
ai_provider=mock
payments=disabled
push=mock
```

Starter interests:

```txt
Surfing
Tennis
Singing
Running
Climbing
Language Exchange
Board Games
Coffee
Cooking Classes
Gym / Fitness
```

---

## 13. Security Rules

### Client-Safe Values

```txt
SUPABASE_URL
SUPABASE_ANON_KEY
POSTHOG_PUBLIC_KEY
POSTHOG_HOST
SENTRY_DSN
APP_ENV
```

### Server-Only Values

```txt
SUPABASE_SERVICE_ROLE_KEY
ANTHROPIC_API_KEY
OPENAI_API_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
ONESIGNAL_REST_API_KEY
EXPO_ACCESS_TOKEN
POSTHOG_PROJECT_API_KEY
RAILWAY_TOKEN
```

### Forbidden in Mobile Env

The following must never appear in `apps/mobile/.env*`:

```txt
SUPABASE_SERVICE_ROLE_KEY
ANTHROPIC_API_KEY
OPENAI_API_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
ONESIGNAL_REST_API_KEY
POSTHOG_PROJECT_API_KEY
RAILWAY_TOKEN
```

---

## 14. Success Criteria

### Product Success Criteria for MVP

The MVP is successful if users can:

1. create a profile
2. complete a quiz
3. select interests
4. activate an interest
5. see or generate a match candidate
6. accept/agree to organise an activity
7. form a group
8. chat in that group

### Technical Success Criteria

This must work from an empty directory:

```bash
pnpm dlx create-buzz-stack
cd buzz
pnpm dev
```

This must work from a cloned repo:

```bash
git clone <repo-url>
cd buzz
pnpm install
pnpm bootstrap:dev
pnpm dev
```

No production credentials should be required for local development.

---

## 15. Current Strategic Recommendation

Build fast, keep the architecture clean, and avoid overengineering.

The technical priority is to prove the behavioural loop:

```txt
interest selected -> interest activated -> people matched -> group formed -> activity organised
```

Everything else should be added only after this loop shows real user engagement.
