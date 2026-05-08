# City Landing Safety Backfill Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Backfill the current Buzz MVP so it matches the updated product direction: city config, neighbourhood matching, Landing Plan, safety, structured plans, Realtime chat, Bring a Friend, and trust/progress primitives.

**Architecture:** Keep the existing Supabase-first Expo monorepo. Add data/config foundations in small migrations, expose sensitive logic through Postgres functions or Edge Functions, and keep mobile UI deterministic/local-friendly before adding AI or paid infrastructure. Preserve the existing old MVP work through group chat, but reshape it around city context -> Landing Plan -> suburb fit -> interest activation -> small public plan -> safety/reliability.

**Tech Stack:** Expo Router, React Native, TypeScript, Apollo GraphQL, Supabase Postgres/RLS/Edge Functions, pnpm, Node test runner.

## Current Baseline

- Current old plan handoff: `docs/plans/2026-05-06-mvp-implementation.md` says completed through Task 5.1, next old task is Realtime chat.
- Current backend has: `cities`, `interests`, `profiles`, `interest_activations`, `match_candidates`, `activity_groups`, `activity_group_members`, `group_messages`, minimal `blocks`, minimal `reports`.
- Current mobile has: onboarding quiz, interest selection/activation, deterministic match preview, accept/decline, group route, basic text chat.
- Current gaps from the new docs: city config, suburbs, Landing Plan, safety settings/actions, structured activity plans, availability/risk/rate limits, Realtime chat, Bring a Friend, attendance/reliability, starter plan placeholders.

## Task 1: City Config Foundation

**Files:**
- Create: `supabase/migrations/000010_city_config_backfill.sql`
- Modify: `supabase/seed.sql`
- Test: `apps/mobile/src/features/city/cityConfigSchema.test.ts`

**Goal:** Add configuration-driven city rollout primitives and Melbourne defaults.

**Step 1: Write the failing test**

Create `apps/mobile/src/features/city/cityConfigSchema.test.ts` with assertions that:
- `000010_city_config_backfill.sql` creates `city_settings`, `city_feature_flags`, and `city_interests`.
- `cities` gains launch/config columns needed by the docs.
- Melbourne seed data includes default matching radius, group size, active launch status, and MVP feature flags.
- Mobile code should not hardcode city feature flags.

**Step 2: Run test to verify it fails**

Run:

```bash
pnpm --filter mobile exec tsx --test src/features/city/cityConfigSchema.test.ts
```

Expected: FAIL because the migration/test file or tables do not exist yet.

**Step 3: Implement minimal migration and seed**

Add:
- `cities.default_latitude`
- `cities.default_longitude`
- `cities.launch_status`
- `cities.updated_at`
- `city_settings`
- `city_feature_flags`
- `city_interests`

Seed:
- Melbourne `launch_status = 'active'`
- `matching_radius_km = 10`
- `default_group_size_min = 3`
- `default_group_size_max = 5`
- `activation_expiry_hours = 168`
- flags: `neighbourhood_matching=true`, `landing_plan=true`, `bring_friend=true`, `safety_checks=true`, `starter_plans=false`
- all current starter interests mapped into `city_interests`

**Step 4: Run test to verify it passes**

Run:

```bash
pnpm --filter mobile exec tsx --test src/features/city/cityConfigSchema.test.ts
```

Expected: PASS.

**Step 5: Verify mobile suite**

Run:

```bash
pnpm --filter mobile test
pnpm --filter mobile typecheck
git diff --check
```

**Step 6: Commit**

```bash
git add supabase/migrations/000010_city_config_backfill.sql supabase/seed.sql apps/mobile/src/features/city/cityConfigSchema.test.ts
git commit -m "feat(mvp): add city config foundation"
```

## Task 2: Suburb Matching Foundation

**Files:**
- Create: `supabase/migrations/000011_suburb_matching_backfill.sql`
- Modify: `supabase/seed.sql`
- Create: `apps/mobile/src/features/city/suburbMatchingSchema.test.ts`
- Create: `apps/mobile/src/features/city/suburbMatching.ts`
- Create: `apps/mobile/src/features/city/suburbMatching.test.ts`

**Goal:** Add deterministic neighbourhood matching primitives.

**Steps:**
1. Write schema test asserting `suburbs`, `suburb_tags`, and `user_suburb_matches` exist with `city_id`, score/reasons, indexes, and Melbourne seed suburbs.
2. Run schema test and confirm it fails.
3. Add migration and seed 15-30 Melbourne suburbs with tag weights.
4. Write unit test for deterministic `scoreSuburbsForTraits({ traits, suburbs })` returning top 3 with reasons.
5. Run unit test and confirm it fails.
6. Implement minimal scoring helper.
7. Run targeted tests, mobile tests, typecheck, `git diff --check`.
8. Commit with `feat(mvp): add suburb matching foundation`.

## Task 3: City Context Function And Mobile Consumption

**Files:**
- Create: `supabase/functions/get-city-context/index.ts`
- Create: `apps/mobile/src/features/city/cityContext.ts`
- Create: `apps/mobile/src/features/city/cityContext.test.ts`
- Modify: `apps/mobile/graphql/operations.graphql` only if using GraphQL function exposure instead of Edge Function.
- Modify: `apps/mobile/src/auth/demoAuth.ts`
- Modify: `apps/mobile/src/features/home/HomeScreen.tsx`
- Modify: `apps/mobile/src/features/onboarding/OnboardingScreen.tsx`

**Goal:** Mobile loads city context from backend/default config instead of hardcoding Melbourne feature behaviour.

**Steps:**
1. Write test for `createCityContextFallback` and `normalizeCityContext` shape: city, timezone, currency, launch status, features, default group size, active interests.
2. Run test and confirm it fails.
3. Implement `cityContext.ts`.
4. Write Edge Function test by source assertion that the function reads `cities`, `city_settings`, `city_feature_flags`, `city_interests`, `suburbs` and returns a safe config object.
5. Add `get-city-context` function.
6. Wire demo/mobile screens to read from fallback context first; keep local dev working without network.
7. Run targeted tests, mobile tests, typecheck, `git diff --check`.
8. Commit with `feat(mvp): add city context`.

## Task 4: Landing Plan Schema And Deterministic Generator

**Files:**
- Create: `supabase/migrations/000012_landing_plan_backfill.sql`
- Create: `apps/mobile/src/features/landingPlan/landingPlan.ts`
- Create: `apps/mobile/src/features/landingPlan/landingPlan.test.ts`
- Modify: `apps/mobile/src/features/onboarding/OnboardingScreen.tsx`
- Modify: `apps/mobile/src/features/home/HomeScreen.tsx`
- Modify: `apps/mobile/src/i18n/en.ts`

**Goal:** Add deterministic first-30-days Landing Plan as the product wrapper.

**Steps:**
1. Write schema test asserting `landing_plans`, `landing_plan_items`, `plan_recipes`, `user_social_preferences`, `repeat_connection_preferences`.
2. Run schema test and confirm it fails.
3. Add migration with status/type checks and indexes.
4. Write generator test: quiz traits + city context + selected interests + top suburbs produces a 30-day checklist with Week 1-4 items.
5. Run generator test and confirm it fails.
6. Implement deterministic generator.
7. Add simple checklist UI after onboarding/home, behind `landing_plan` feature flag fallback.
8. Run tests/typecheck.
9. Commit with `feat(mvp): add landing plan foundation`.

## Task 5: Safety Schema And Basic Actions

**Files:**
- Create: `supabase/migrations/000013_safety_backfill.sql`
- Create: `apps/mobile/src/features/safety/safetyActions.ts`
- Create: `apps/mobile/src/features/safety/safetyActions.test.ts`
- Modify: `apps/mobile/src/features/groups/GroupScreen.tsx`
- Modify: `apps/mobile/src/i18n/en.ts`

**Goal:** Add MVP safety primitives before expanding plan/group flows.

**Steps:**
1. Write schema test asserting `user_safety_settings`, `user_verifications`, expanded `reports`, `moderation_actions`, `plan_safety_checks`, `user_reliability`, `activity_risk_levels`.
2. Run schema test and confirm it fails.
3. Add migration with idempotent column/table creation.
4. Write action tests for `createReportDraft`, `createBlockPayload`, `canShowExactLocation(false)`.
5. Run tests and confirm fail.
6. Implement `safetyActions.ts`.
7. Add report/leave/block placeholders to group UI without overbuilding admin review.
8. Run tests/typecheck.
9. Commit with `feat(mvp): add safety primitives`.

## Task 6: Structured Activity Plans And Pre-Plan Confirmation

**Files:**
- Create: `supabase/migrations/000014_activity_plans_backfill.sql`
- Create: `apps/mobile/src/features/plans/activityPlan.ts`
- Create: `apps/mobile/src/features/plans/activityPlan.test.ts`
- Modify: `supabase/functions/accept-match/index.ts`
- Modify: `apps/mobile/src/features/groups/GroupScreen.tsx`
- Modify: `apps/mobile/src/i18n/en.ts`

**Goal:** Replace loose suggested plan copy with a structured plan card and confirmation state.

**Steps:**
1. Write schema test asserting `activity_plans` with activity, date/time, public location, capacity, min group size, status, safety guidance.
2. Run schema test and confirm it fails.
3. Add migration.
4. Write `createDefaultActivityPlan` test from interest + city settings + match suggestion.
5. Run test and confirm fail.
6. Implement plan helper.
7. Update `accept-match` to create/return plan metadata when group is created.
8. Render plan card and pre-plan confirmation on group screen.
9. Run tests/typecheck.
10. Commit with `feat(mvp): add structured activity plans`.

## Task 7: Matching Backfill For Availability, Risk, And Group Defaults

**Files:**
- Modify: `supabase/migrations/000009_mvp_deterministic_candidates.sql` or create `000015_matching_safety_backfill.sql`
- Modify: `supabase/functions/activate-interest/index.ts` if function wrapper needs new payload
- Modify: `apps/mobile/src/features/interests/interestFlow.ts`
- Modify: `apps/mobile/src/features/interests/InterestFlowProvider.tsx`
- Modify: `apps/mobile/src/features/onboarding/OnboardingScreen.tsx`
- Test: `apps/mobile/src/features/interests/interestActivationSchema.test.ts`
- Test: `apps/mobile/src/features/interests/interestFlow.test.ts`

**Goal:** Make activation availability-aware, group-first, and safety/risk-aware.

**Steps:**
1. Write failing schema/source test for activation availability fields, rate limit fields, activity risk checks, city settings group size usage, and block/report exclusion.
2. Run test and confirm fail.
3. Add fields: availability window/preferred time/urgency to activation or profile/social preferences.
4. Update matching function to filter by same city, visible, not settled, not blocked, not suspended/limited, activity risk constraints, and rank by availability overlap.
5. Add minimal mobile availability capture before activation.
6. Run tests/typecheck.
7. Commit with `feat(mvp): make activation availability and safety aware`.

## Task 8: Supabase Realtime Group Chat

**Files:**
- Create: `apps/mobile/src/features/chat/useGroupMessages.ts`
- Create: `apps/mobile/src/features/chat/useGroupMessages.test.ts`
- Modify: `apps/mobile/src/features/groups/GroupScreen.tsx`
- Modify: `apps/mobile/src/lib/apollo.ts` or Supabase client wrapper if needed.

**Goal:** Complete old Task 5.2 so group messages update live.

**Steps:**
1. Write failing test for source contract: hook subscribes to `group_messages`, filters by `activity_group_id`, handles insert payload, and cleans up channel.
2. Run test and confirm fail.
3. Implement hook with Supabase Realtime client.
4. Wire group screen to use hook and remove manual `refetch` as the only update path.
5. Run targeted tests, mobile tests, typecheck.
6. Commit with `feat(mobile): add realtime group chat`.

## Task 9: Bring A Friend Invite System

**Files:**
- Create: `supabase/migrations/000016_invites_backfill.sql`
- Create: `supabase/functions/create-invite/index.ts`
- Create: `supabase/functions/resolve-invite/index.ts`
- Create: `supabase/functions/accept-invite/index.ts`
- Create: `apps/mobile/src/features/invites/inviteModel.ts`
- Create: `apps/mobile/src/features/invites/inviteModel.test.ts`
- Create: `apps/mobile/app/join/group/[token].tsx`
- Modify: `apps/mobile/src/features/groups/GroupScreen.tsx`
- Modify: `apps/mobile/src/i18n/en.ts`

**Goal:** Add MVP contextual invite tokens for groups/plans.

**Steps:**
1. Write schema test for `invites` and `invite_events`.
2. Run and confirm fail.
3. Add migration.
4. Write invite model tests: create share copy, normalize preview, block expired/capacity-full statuses.
5. Implement model.
6. Add Edge Functions with source tests for active/expired/capacity/block/safety checks.
7. Add mobile button and deep link preview route.
8. Run tests/typecheck.
9. Commit with `feat(mvp): add bring a friend invites`.

## Task 10: Attendance, Reliability, Starter Plan Placeholders, And Admin Visibility

**Files:**
- Create: `supabase/migrations/000017_attendance_starter_admin_backfill.sql`
- Create: `apps/mobile/src/features/progress/settlingProgress.ts`
- Create: `apps/mobile/src/features/progress/settlingProgress.test.ts`
- Modify: `apps/mobile/src/features/groups/GroupScreen.tsx`
- Modify: `apps/mobile/src/features/home/HomeScreen.tsx`
- Modify: `apps/admin/graphql/operations.graphql`
- Modify: `apps/admin/app/page.tsx`
- Modify: `apps/mobile/src/i18n/en.ts`

**Goal:** Add attendance/reliability progress primitives, feature-flagged starter plan schema, and admin visibility.

**Steps:**
1. Write schema test for RSVP/attendance fields, reliability counters, starter plan placeholders, and admin-readable moderation/report/city config records.
2. Run and confirm fail.
3. Add migration or complete fields from prior migrations.
4. Write `settlingProgress` test: quiz complete, suburb fit viewed, interest activated, group joined, attendance confirmed, feedback completed.
5. Implement progress helper.
6. Add simple UI for attendance confirm and post-plan safety check.
7. Expand admin dashboard to show city config, reports, groups, attendance/reliability, starter plan placeholders.
8. Run codegen if GraphQL changed, tests/typecheck/admin build if available.
9. Commit with `feat(mvp): add attendance progress and admin visibility`.

## Final Verification

Run:

```bash
pnpm env:validate
pnpm --filter mobile test
pnpm --filter mobile typecheck
pnpm --filter admin build
git diff --check
```

If Supabase is available locally, also run:

```bash
supabase db lint
supabase db reset
```

## Notes

- Keep AI mocked/absent from the MVP path.
- Do not add Stripe, paid hosts, booking, or Railway requirements in these tasks.
- Keep all city-specific behaviour config/data-driven.
- Do not expose exact home location or private user details.
- Keep safety checks server-side where they affect matching/invites/plans.
