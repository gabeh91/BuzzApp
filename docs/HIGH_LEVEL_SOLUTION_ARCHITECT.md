Buzz — High-Level Solution Architecture Plan

1. Purpose

This document outlines a high-level solution architecture for implementing the expanded Buzz product direction, including:

- personalised city Landing Plans
- neighbourhood matching
- interest activation
- small-group matching
- group chat and plan coordination
- safety protocols
- Bring a Friend deep links
- attendance/reliability progression
- host pathway
- starter plans and business-backed activities
- city configuration for future rollouts
- optional Railway-hosted services later

The goal is to define the best infrastructure and implementation approach without overengineering the MVP.
⸻
2. Architecture Principles

Buzz should be designed around these principles:

Local-first development
Supabase-first backend
Expo/React Native app
Configuration-driven city rollout
Server-side safety and matching logic
AI as enhancement, not core dependency
Feature flags for roadmap modules
Railway only when runtime services justify it
GitHub Actions for CI/CD


The MVP should prove the core loop before adding heavy infrastructure:

quiz
→ Landing Plan
→ suburb recommendations
→ interest activation
→ small-group matching
→ group chat
→ plan attendance
→ feedback/reliability

⸻
3. Recommended Stack

Mobile App

React Native / Expo
TypeScript
Expo Router
Supabase client
EAS builds


Why:

- fastest path to iOS + Android
- strong fit for MVP iteration
- good for onboarding, quiz, lists, group chat, plan cards, profile, and settings
- can remain in the monorepo with shared types/config
⸻
Backend and Database

Supabase
- Auth
- Postgres
- PostGIS
- Storage
- Realtime
- Edge Functions
- Row Level Security


Why:

- Auth, database, storage, realtime, and functions in one platform
- Postgres is suitable for relational social marketplace data
- PostGIS supports city/suburb/location matching
- Edge Functions can protect matching, AI, safety, invites, and lead attribution logic
⸻
CI/CD

GitHub Actions
GitHub Environments
GitHub Secrets


Why:

- sufficient for early-stage CI/CD
- simpler than Buildkite
- supports PR checks, deployment workflows, secrets, manual production approvals
- integrates naturally with GitHub-hosted monorepo
⸻
Hosting

Railway, optional


Use Railway for:

admin app hosting
future API service
future worker service
webhook processors
background jobs
Redis/queue if needed


Do not require Railway for local MVP. Railway should be added through:

buzz-stack configure railway

⸻
Admin Dashboard

Next.js
Supabase server client
Railway or Vercel hosting later


Initial admin dashboard should support:

city config
suburb data
interests
feature flags
reports/moderation
starter plans
business partners
hosts

⸻
Monorepo

pnpm
Turborepo


Suggested structure:

apps/
  mobile/
  admin/
  api/       optional later
  worker/    optional later

packages/
  shared-types/
  validation/
  config/
  ui/

supabase/
  migrations/
  functions/

scripts/
docs/

⸻
4. System Context

High-level system flow:

Mobile App
  ↕
Supabase Auth / Postgres / Realtime / Storage
  ↕
Supabase Edge Functions
  ↕
External providers:
- AI provider, later
- push provider
- email provider
- Stripe, later
- Railway-hosted API/workers, later


Core data remains in Supabase Postgres.

Sensitive operations should go through server-side functions:

interest activation
matching
invite creation/acceptance
safety checks
reporting/moderation
AI calls
business lead attribution
host eligibility
city config writes

⸻
5. Core Product Modules

5.1 City Configuration Layer

Purpose

Buzz should behave like one app with many city configurations.

Do not hardcode Melbourne into the app.

The backend should provide:

get-city-context


The app uses this to determine:

active city
launch status
timezone
currency
suburbs
city-specific interests
feature flags
starter plan availability
copy
matching radius
default group size


Key Tables

cities
city_settings
city_feature_flags
city_interests
suburbs
suburb_tags
city_launch_checklist


MVP Implementation

Seed Melbourne as the default city.

Add waitlist support for inactive cities.

City rollout should eventually be possible through admin configuration, not app releases.
⸻
5.2 Landing Plan Module

Purpose

The Landing Plan is the core product wrapper.

It turns Buzz from a collection of social features into a guided settling-in journey.

Flow:

quiz
→ city context
→ suburb recommendations
→ interests
→ first 30-day Landing Plan


Key Tables

landing_plans
landing_plan_items
plan_recipes
user_social_preferences
repeat_connection_preferences


MVP Implementation

Use deterministic templates.

Do not require AI.

Example plan items:

complete quiz
explore top suburb
activate first interest
join first plan
attend first activity
bring a friend
meet someone again

⸻
5.3 Neighbourhood Matching

Purpose

Recommend Melbourne suburbs based on quiz answers, interests, lifestyle, and social preferences.

Approach

Use deterministic tag scoring.

Example:

quiz answers
→ lifestyle tags
→ suburb tag weights
→ top 3 suburb matches


Key Tables

suburbs
suburb_tags
user_suburb_matches


MVP Implementation

Seed 15–30 Melbourne suburbs with tags.

Return top 3 recommendations with plain-language reasons.

Avoid saying “you should live here.” Use:

best-fit areas to explore
suburbs you may enjoy
places you might feel at home

⸻
5.4 Interest Activation and Matching

Purpose

Allow users to declare an activity they want to try and form small groups around shared intent.

Matching Inputs

city
interest
availability
suburb/distance
social comfort mode
activity risk level
trust/safety filters
blocked users


Key Tables

interests
city_interests
user_interests
interest_activations
match_candidates
activity_groups
activity_group_members


MVP Implementation

Matching should be deterministic.

Do not use AI for core matching at first.

Hard filters:

same city
same interest
visible profile
not settled
not blocked
not suspended
activity safety rules satisfied


Ranking signals:

availability overlap
suburb proximity
quiz/lifestyle similarity
shared interests
reliability
profile completeness

Implementation contract:

Interest slugs are stable product/config identifiers and database UUIDs are storage identifiers. Mobile may hold either real Supabase UUIDs or fallback catalog interests during local/offline flows. Matching and Discover feed RPCs should accept both UUIDs and slugs, resolve slugs in Postgres, and never require hardcoded Melbourne or fixture IDs in mobile code.

⸻
5.5 Group Chat and Plan Coordination

Purpose

Once users agree to organise an activity, Buzz should help them form a practical plan.

Key Tables

activity_groups
activity_group_members
group_messages
plans or activity_plans
plan_safety_checks


MVP Implementation

Use Supabase Realtime for text-only group chat.

Restrict MVP chat:

text only
no media uploads
report message
leave group
block user


Every group should have a structured plan card:

activity
date/time
public location
members
host, if any
confirmation state
safety guidance

⸻
5.6 Safety and Trust Layer

Purpose

Safety must be built into matching, groups, plans, chat, reports, invites, and host eligibility.

MVP Safety Features

18+ only
group-first matching
public-place guidance
no exact location exposure
block user
report user
leave group
profile visibility controls
rate-limited activations
text-only chat
structured plan card
pre-plan confirmation
post-plan safety check
attendance/reliability primitives
manual admin moderation
activity risk levels


Key Tables

user_safety_settings
user_verifications
blocks
reports
moderation_actions
plan_safety_checks
user_reliability
activity_risk_levels


Matching Safety Rules

Every matching query should check:

not blocked either direction
not suspended
profile visible
same city
age constraints satisfied
trust constraints satisfied
activity risk constraints satisfied
no recent report conflict

⸻
5.7 Bring a Friend Invite System

Purpose

Bring a Friend allows users to invite someone they already know into a specific plan, group, or starter activity via a deep link.

This supports:

cold start
safety
conversion
group momentum
organic growth


Product Principle

Users should not invite people to an app. They should invite them to a plan.

Key Tables

invites
invite_events


Backend Functions

create-invite
resolve-invite
accept-invite
revoke-invite
track-invite-event


MVP Flow

user taps Bring a friend
→ backend creates invite token
→ app opens share sheet
→ friend opens link
→ web/app resolves token
→ plan preview shown
→ signup/login
→ safety/capacity checks
→ friend joins group/plan


Safety Checks

Before accepting invite:

invite active
not expired
target exists
target has capacity
inviter is still a member
invitee is not blocked by group members
invitee is not suspended
activity allows external invites
plan has not started
age/risk rules satisfied

⸻
5.8 Attendance, Reliability, and Host Pathway

Purpose

Reward real-world contribution and reliability without gimmicky gamification.

MVP Features

attendance status
attendance streak
settling milestones
trust tier placeholder
host eligibility placeholder
post-activity feedback


Key Tables

user_reliability
plan_safety_checks
landing_plan_items
repeat_connection_preferences


Suggested Progression

New Arrival
→ Active Member
→ Reliable Regular
→ Community Host
→ Verified / Paid Host


Avoid public numeric scores.

Prefer labels:

Attendance streak
Reliable Regular
Trusted Member
Host Eligible

⸻
5.9 Business-Backed Starter Plans

Purpose

Starter plans are useful beginner-friendly plans backed by businesses, hosts, or Buzz.

They should feel like:

Beginner climbing night
4 newcomer spots
Hosted at a public partner venue


Not:

Sponsored ad for a climbing gym


Recommended Phase

Phase 1.5, not first MVP.

Key Tables

starter_plans
starter_plan_members
starter_plan_hosts
businesses
business_leads


Monetisation Models

cost per joined user
cost per confirmed attendee
cost per group formed
sponsored starter plan
exclusive category partner

⸻
6. Feature Flags

Feature flags should be city-scoped and environment-scoped.

Suggested default flags:

neighbourhood_matching=true
landing_plan=true
bring_friend=true
safety_checks=true
starter_plans=false
business_recommendations=false
promoted_events=false
lead_attribution=false
ai_match_cards=false
local_knowledge_qa=false
verified_locals=false
paid_hosts=false
subscriptions=false


Use feature flags to avoid overbuilding and to support staged city rollouts.
⸻
7. AI Strategy

AI should be server-side only and disabled/mocked locally by default.

MVP

AI_PROVIDER=mock


Do not use AI for core matching initially.

Later

AI can enhance:

why you matched explanations
Landing Plan wording
local Q&A
starter plan recommendations
neighbourhood explanations
moderation assistance


All AI calls should go through Supabase Edge Functions or a future backend API.

Never expose AI provider keys to the mobile app.
⸻
8. Infrastructure Environments

Recommended environments:

local
development
staging
production


Local

Supabase CLI
local Postgres
local Edge Functions
mock AI
disabled Stripe
mock push
disabled Sentry/PostHog unless configured


Development

Supabase dev project
GitHub Actions deploy
optional Railway dev environment


Staging

Supabase staging project
GitHub Environment: staging
Railway staging environment if enabled
EAS staging builds


Production

Supabase production project
GitHub Environment: production with approval
Railway production environment if enabled
EAS production builds

⸻
9. CI/CD Architecture

Use GitHub Actions.

Workflows:

ci.yml
deploy-dev.yml
deploy-staging.yml
deploy-prod.yml
mobile-build.yml


CI Checks

install
typecheck
lint
tests
migration validation
mobile checks
admin build
env validation


Production Rules

Production deploy scripts must only run in GitHub Actions:

if [ "${GITHUB_ACTIONS:-}" != "true" ]; then
  echo "Production deploys should run through GitHub Actions only"
  exit 1
fi


Use GitHub Environment approvals for production.
⸻
10. Railway Usage

Railway is optional.

Use Railway when Buzz needs:

admin app hosting
custom API
worker processes
webhook processors
background jobs
Redis/queues


Do not require Railway for local MVP.

Railway should be addable later through:

buzz-stack configure railway

⸻
11. Local Plug-and-Play Developer Experience

The generated repo should support:

pnpm dlx create-buzz-stack
cd buzz
pnpm dev


For cloned repos:

git clone <repo-url>
cd buzz
pnpm install
pnpm bootstrap:dev
pnpm dev


pnpm dev should start:

local Supabase
Supabase Studio
Expo dev server
Next.js admin dashboard
local Edge Functions where practical


No real production credentials should be needed for local development.

Local Supabase notes:

- Use `supabase status` as the source of truth for the local Project URL and publishable key.
- Set `EXPO_PUBLIC_SUPABASE_URL` to the local Project URL and `EXPO_PUBLIC_SUPABASE_ANDROID_URL` to `http://10.0.2.2:54321`; the mobile app should select the correct local URL from React Native platform at runtime.
- Keep `seed.sql` production-safe and put test people in an explicit local/demo seed such as `seed.demo.sql`.
- Demo people should exercise the MVP Discover loop with shared starter interests, but must not leak into hosted production.
⸻
12. Implementation Roadmap

Phase 1 — Local Runnable Foundation

Expo app
Next.js admin
Supabase local config
schema/migrations
seed data
local env/bootstrap
city config model
Melbourne seed city
basic profile
interests list
safety settings
blocks/reports tables


Phase 2 — Quiz, City Context, Suburb Matching, Landing Plan

get-city-context function
20-question quiz placeholder
quiz answer storage
social comfort mode
suburb tag scoring
top 3 suburb UI
Landing Plan generation
Landing Plan checklist UI


Phase 3 — Interest Activation and Matching

user interests
activate interest
same-city/same-interest matching
availability capture
candidate records
rate limits
block-aware matching
activity risk rules
accept/decline


Phase 4 — Groups, Chat, and Safety

activity groups
group members
text-only group chat
structured plan card
leave group
report from chat/group
pre-plan confirmation
post-plan safety check


Phase 5 — Bring a Friend

invite friend button
create-invite function
resolve-invite function
accept-invite function
deep link routes
web fallback preview
share sheet
capacity checks
safety checks
invite analytics


Phase 6 — Attendance, Trust, and Progress

RSVP confirmation
attendance status
post-activity feedback
attendance streak
settling journey milestones
repeat connection prompt
trust tier placeholder
host eligibility placeholder


Phase 7 — Starter Plans and Business Layer

starter plan schema
admin/manual plan creation
business-backed plan placeholders
lead tracking schema
feature-flagged UI


Phase 8 — City Rollout Tooling

admin city manager placeholder
city feature flags
city launch checklist
waitlist mode
city templates


Phase 9 — Optional Infrastructure and Integrations

Railway hosting
AI provider configuration
Sentry/PostHog
Stripe
push provider
EAS production setup

⸻
13. Key Non-Functional Requirements

Safety

Safety must be enforced server-side, not only in UI.

Privacy

Do not expose exact location, private contact details, or sensitive keys.

Configurability

City-specific behaviour must be data/config-driven.

Maintainability

Use shared types and Zod schemas across app, admin, and functions.

Reversibility

Avoid infrastructure decisions that make the MVP hard to pivot.

Scalability

Design database models for later scale, but do not prematurely introduce heavy distributed systems.
⸻
14. Recommended Technical Guardrails

Do:

use Supabase RLS
keep sensitive logic server-side
use feature flags
seed Melbourne as default city
build city config early
build invite and safety primitives early
keep AI mocked locally
keep Railway optional


Avoid:

hardcoding Melbourne in mobile app
putting business logic in the client
putting service role keys in mobile
building a custom monolith too early
requiring real AI/Stripe/Railway credentials for local dev
building full booking/payment systems in MVP
building leaderboards or gimmicky gamification

⸻
15. Summary

Buzz should be implemented as a configurable, safety-first, Supabase-backed social landing system.

The architecture should make the following loop easy to build and iterate:

new city arrival
→ quiz
→ city config
→ Landing Plan
→ suburb fit
→ interest activation
→ small public plan
→ Bring a Friend
→ attendance
→ feedback/safety
→ repeat connection
→ reliability/host pathway
→ starter plans and partners


The MVP should be lean, local-dev friendly, and designed for rapid iteration in Melbourne first.
