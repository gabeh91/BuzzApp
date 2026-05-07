# Buzz MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the smallest polished Buzz product loop where a Melbourne newcomer creates a profile, completes onboarding, activates an interest, receives deterministic match candidates, forms an activity group, and chats to coordinate.

**Architecture:** Keep the MVP Supabase-first. Mobile reads through Apollo/Supabase GraphQL where practical, writes core business actions through explicit Postgres functions or Supabase Edge Functions, and keeps AI/payments/push mocked or disabled. Demo auth remains a replaceable adapter until Supabase Auth is wired, so screens keep the same hook/context contract.

**Tech Stack:** Expo Router, React Native, React Context hooks, react-native-reanimated, StyleSheet-based screens, typesafe-i18n, Apollo Client, GraphQL Codegen, Supabase Postgres/Auth/Realtime/Edge Functions, pnpm, Turborepo.

## Where We Are Now

### Product Context

- `docs/PROJECT_CONTEXT.md` defines the MVP loop: profile -> quiz -> interests -> activate interest -> match -> group -> chat.
- Melbourne is the first/default city.
- Deterministic matching is the MVP source of truth. AI can enrich later, but must not decide eligibility.
- Rendered UI copy must be user-facing only. Implementation terms belong in code comments, tests, docs, and plans.

### Mobile App

- Expo Router is in place:
  - `apps/mobile/app/_layout.tsx`
  - `apps/mobile/app/index.tsx`
  - `apps/mobile/app/home.tsx`
- App-level providers are in place:
  - `apps/mobile/src/providers/AppProviders.tsx`
  - `apps/mobile/src/auth/AuthProvider.tsx`
  - `apps/mobile/src/features/onboarding/OnboardingProvider.tsx`
  - `apps/mobile/src/features/quiz/QuizProvider.tsx`
  - `apps/mobile/src/features/interests/InterestFlowProvider.tsx`
  - `apps/mobile/src/i18n/I18nProvider.tsx`
  - `apps/mobile/src/theme/ThemeProvider.tsx`
- The current onboarding flow already has:
  - Intro/profile framing.
  - A 20-question quiz model in `apps/mobile/src/features/quiz/quizModel.ts`.
  - Interest selection from Supabase GraphQL with fallback data.
  - Interest activation through generated Apollo hooks.
  - A local deterministic match preview in `apps/mobile/src/features/matching/demoMatch.ts`.
  - Reanimated card/progress transitions.
  - Typesafe i18n strings in `apps/mobile/src/i18n/en.ts`.
- Current mobile gaps:
  - Demo profile is not persisted as a real Supabase profile yet.
  - Quiz answers/traits are local only.
  - Interest activation still falls back to local state if backend auth/action fails.
  - Match candidates are preview-only, not persisted/retrieved from Supabase.
  - No group creation UI.
  - No group chat UI.
  - No settled toggle, block, or report UX.

### Admin App

- `apps/admin/app/page.tsx` is a minimal Apollo-powered dashboard.
- It lists starter interests, businesses, and events through GraphQL.
- Current admin gaps:
  - No profiles, activations, match candidates, groups, messages, reports, or feature flag views.
  - No moderation tooling yet.

### Supabase

- Existing migrations:
  - `supabase/migrations/000001_initial_extensions.sql`
  - `supabase/migrations/000002_initial_schema.sql`
  - `supabase/migrations/000003_initial_rls.sql`
  - `supabase/migrations/000004_graphql_api.sql`
  - `supabase/migrations/000005_expand_starter_interests.sql`
  - `supabase/migrations/000006_mvp_profile_quiz_matching.sql`
- Existing schema already includes core MVP tables such as `profiles`, `interests`, `user_interests`, `interest_activations`, `match_candidates`, `activity_groups`, `activity_group_members`, `group_messages`, `blocks`, `reports`, and `feature_flags`.
- `000006_mvp_profile_quiz_matching.sql` adds persisted onboarding/profile state, deterministic match lifecycle state, group lifecycle state, and chat moderation state.
- Seed data includes Melbourne, starter interests, sample businesses, and sample events.
- Existing Edge Function folders are scaffolded but mostly placeholder-level:
  - `supabase/functions/activate-interest/index.ts`
  - `supabase/functions/accept-match/index.ts`
  - `supabase/functions/decline-match/index.ts`
  - `supabase/functions/create-activity-group/index.ts`
  - shared helpers under `supabase/functions/_shared/`
- Current backend gaps:
  - Profile, quiz, matching, group, and chat flows have initial data columns, but still need real write/read functions and UI integration.
  - RLS policies need to be completed for authenticated MVP usage.
  - Local demo auth bypass must remain local-only and easy to remove.

### CLI / Local Development

- The repo is plug-and-play oriented with `pnpm bootstrap:dev`, `pnpm dev`, Supabase CLI, Docker, Expo, and Next.
- CLI/bootstrap applies pending local Supabase migrations without resetting, and generated repos include the expanded interest and MVP profile/matching migrations.
- Before starting feature work, keep unrelated local changes separated so MVP commits stay reviewable.

## Execution Rules

- Use TDD for each task. Write a failing test first, run it, implement the smallest passing change, then run the target tests again.
- Prefer arrow functions for components and functions.
- Prefer hooks inside components and context for shared state.
- Prefer StyleSheet-based styles, not inline styles.
- Prefer import aliases over relative `../` imports in app code.
- Keep rendered strings in `apps/mobile/src/i18n/en.ts` and consume through `useI18n()`.
- Do not put server-only secrets in mobile env files.
- Do not require production services for local development.
- Commit frequently with focused messages, for example `feat(mobile): persist onboarding profile`.

## Phase 0: Stabilize The Branch

### Task 0.1: Separate Current Work

**Files:**
- Inspect: `git status --short`
- Inspect: `git diff --name-only`

**Steps:**

1. Review the current dirty worktree.
2. Commit migration/framework changes separately from onboarding visual changes.
3. Leave unrelated deleted/renamed home/doc files out of migration commits unless they are intentionally part of the MVP work.

**Verification:**

```bash
git status --short
pnpm --filter create-buzz-stack test
pnpm --filter mobile exec tsx --test 'src/features/interests/interestsCatalog.test.ts' 'src/features/onboarding/onboardingPresentation.test.ts'
pnpm env:validate
```

**Commit:**

```bash
git commit -m "feat(supabase): add starter interest migration"
```

### Task 0.2: Establish MVP Test Commands

**Files:**
- Modify if needed: `package.json`
- Modify if needed: `apps/mobile/package.json`
- Modify if needed: `apps/admin/package.json`

**Goal:** Make it obvious which commands prove MVP slices.

**Verification commands:**

```bash
pnpm --filter mobile test
pnpm --filter mobile typecheck
pnpm --filter admin typecheck
pnpm --filter create-buzz-stack test
pnpm env:validate
git diff --check
```

## Phase 1: Data Contracts And Migrations

### Task 1.1: Add MVP Profile And Quiz Fields

**Files:**
- Create: `supabase/migrations/000006_mvp_profile_quiz_matching.sql`
- Modify: `supabase/seed.sql`
- Test: `apps/mobile/src/features/quiz/quizModel.test.ts`
- Test: `apps/mobile/src/features/interests/interestFlow.test.ts`

**Migration intent:**

- Add profile fields needed by onboarding and matching:
  - `profiles.display_name`
  - `profiles.city_id`
  - `profiles.bio`
  - `profiles.settled`
  - `profiles.visible`
  - `profiles.quiz_answers jsonb`
  - `profiles.quiz_traits jsonb`
  - `profiles.last_active_at`
- Keep fields additive and idempotent.

**Verification:**

```bash
supabase migration up
supabase db lint
pnpm --filter mobile test
```

**Commit:**

```bash
git commit -m "feat(supabase): add mvp profile quiz fields"
```

### Task 1.2: Add Match And Group State Fields

**Files:**
- Modify: `supabase/migrations/000006_mvp_profile_quiz_matching.sql`
- Test: `apps/mobile/src/features/matching/demoMatch.test.ts`

**Migration intent:**

- Extend `match_candidates` with status fields:
  - `status text default 'pending'`
  - `responded_at timestamptz`
  - `source text default 'deterministic'`
- Extend `activity_groups` with:
  - `interest_id uuid references public.interests(id)`
  - `status text default 'forming'`
  - `created_by uuid references public.profiles(id)`
- Extend `group_messages` with:
  - `message_type text default 'text'`
  - `moderation_status text default 'clean'`

**Verification:**

```bash
supabase migration up
pnpm --filter mobile test
```

## Phase 2: Replaceable Auth And Profile Persistence

### Task 2.1: Formalize The Auth Contract

**Files:**
- Modify: `apps/mobile/src/auth/auth.types.ts`
- Modify: `apps/mobile/src/auth/AuthProvider.tsx`
- Modify: `apps/mobile/src/auth/demoAuth.ts`
- Test: `apps/mobile/src/auth/demoAuth.test.ts`

**Goal:** Keep demo auth local but make Supabase Auth replacement mechanical.

**Contract shape:**

```ts
export type BuzzAuthUser = {
  id: string;
  displayName: string;
  cityName: string;
  cityId: string;
  authSource: "demo" | "supabase";
};
```

**Verification:**

```bash
pnpm --filter mobile exec tsx --test src/auth/demoAuth.test.ts
pnpm --filter mobile typecheck
```

**Commit:**

```bash
git commit -m "feat(mobile): formalize replaceable auth contract"
```

### Task 2.2: Persist Profile And Quiz Traits

**Files:**
- Modify: `apps/mobile/graphql/operations.graphql`
- Regenerate: `apps/mobile/graphql/generated.tsx`
- Modify: `apps/mobile/src/features/onboarding/OnboardingScreen.tsx`
- Modify: `apps/mobile/src/features/quiz/QuizProvider.tsx`
- Test: `apps/mobile/src/features/quiz/quizModel.test.ts`

**Goal:** When onboarding quiz finishes, save quiz answers and derived traits against the current profile.

**Implementation direction:**

- Prefer a Postgres function exposed through GraphQL for profile persistence.
- Keep local state updates optimistic.
- Keep demo user replacement isolated to `useBuzzAuth()`.

**Verification:**

```bash
pnpm graphql:codegen
pnpm --filter mobile test
pnpm --filter mobile typecheck
```

## Phase 3: Interest Activation And Deterministic Matching

### Task 3.1: Make Activation A Backend Action

**Files:**
- Modify: `supabase/migrations/000004_graphql_api.sql` or create `supabase/migrations/000007_mvp_activation_matching.sql`
- Modify: `apps/mobile/graphql/operations.graphql`
- Regenerate: `apps/mobile/graphql/generated.tsx`
- Modify: `apps/mobile/src/features/interests/interestFlow.ts`
- Modify: `apps/mobile/src/features/onboarding/OnboardingScreen.tsx`
- Test: `apps/mobile/src/features/interests/interestFlow.test.ts`

**Goal:** Activating an interest persists `interest_activations` and returns match candidates from Supabase.

**Business rules:**

- User must have a profile.
- Interest must exist.
- City defaults to Melbourne for MVP.
- Duplicate active activations for the same profile/interest should be reused or cleanly replaced.
- Local auth bypass can work only when `APP_ENV=local`.

**Verification:**

```bash
supabase migration up
pnpm graphql:codegen
pnpm --filter mobile test
pnpm --filter mobile typecheck
```

**Commit:**

```bash
git commit -m "feat(mvp): activate interests through supabase"
```

### Task 3.2: Generate Deterministic Match Candidates

**Files:**
- Create: `apps/mobile/src/features/matching/matchCandidate.types.ts`
- Modify: `apps/mobile/src/features/matching/demoMatch.ts`
- Modify: `supabase/migrations/000007_mvp_activation_matching.sql`
- Modify: `supabase/seed.sql`
- Test: `apps/mobile/src/features/matching/demoMatch.test.ts`

**Goal:** Replace preview-only matching with persisted deterministic candidate rows.

**Rules:**

- Match same city.
- Match same activated interest.
- Exclude self.
- Exclude blocked users.
- Exclude settled or invisible profiles.
- Prefer compatible quiz traits when available.

**Verification:**

```bash
supabase migration up
pnpm --filter mobile exec tsx --test src/features/matching/demoMatch.test.ts
pnpm --filter mobile typecheck
```

## Phase 4: Activity Agreement And Group Creation

> **Current handoff:** Completed through Task 4.1 (`feat(mvp): accept and decline match candidates`). Continue from Task 4.2.

### Task 4.1: Implement Accept And Decline Match Actions

**Files:**
- Modify: `supabase/functions/accept-match/index.ts`
- Modify: `supabase/functions/decline-match/index.ts`
- Modify: `supabase/functions/_shared/auth.ts`
- Modify: `apps/mobile/graphql/operations.graphql` or create `apps/mobile/src/lib/functions.ts`
- Test: `apps/mobile/src/features/interests/interestFlow.test.ts`

**Goal:** User can accept or decline a candidate from the match preview/home flow.

**Rules:**

- Decline marks candidate declined and does not create a group.
- Accept marks candidate accepted and creates or returns an activity group.
- All writes require current profile identity.
- Local demo bypass remains local-only.

**Verification:**

```bash
supabase functions serve --env-file .env.local
pnpm --filter mobile test
```

**Commit:**

```bash
git commit -m "feat(mvp): accept and decline match candidates"
```

### Task 4.2: Add Group Creation UI

**Files:**
- Create: `apps/mobile/app/groups/[id].tsx`
- Create: `apps/mobile/src/features/groups/GroupScreen.tsx`
- Create: `apps/mobile/src/features/groups/group.types.ts`
- Modify: `apps/mobile/src/navigation/routes.ts`
- Modify: `apps/mobile/src/i18n/en.ts`
- Test: `apps/mobile/src/navigation/routes.test.ts`

**Goal:** After accepting a match, navigate to a group screen for the activity.

**Verification:**

```bash
pnpm --filter mobile test
pnpm --filter mobile typecheck
```

## Phase 5: Group Chat

### Task 5.1: Implement Group Message Reads And Sends

**Files:**
- Modify: `apps/mobile/graphql/operations.graphql`
- Regenerate: `apps/mobile/graphql/generated.tsx`
- Create: `apps/mobile/src/features/chat/ChatComposer.tsx`
- Create: `apps/mobile/src/features/chat/MessageList.tsx`
- Modify: `apps/mobile/src/features/groups/GroupScreen.tsx`
- Test: `apps/mobile/src/features/chat/chatModel.test.ts`

**Goal:** Group members can see and send basic text messages.

**Rules:**

- Message body cannot be empty.
- Message body should be trimmed.
- Basic rude/bad-word moderation can mark or reject messages.
- Do not render implementation terms.

**Verification:**

```bash
pnpm graphql:codegen
pnpm --filter mobile test
pnpm --filter mobile typecheck
```

### Task 5.2: Add Supabase Realtime Subscription

**Files:**
- Create: `apps/mobile/src/features/chat/useGroupMessages.ts`
- Modify: `apps/mobile/src/features/groups/GroupScreen.tsx`
- Test: `apps/mobile/src/features/chat/useGroupMessages.test.ts`

**Goal:** Messages update live when another group member sends one.

**Verification:**

```bash
pnpm --filter mobile test
pnpm --filter mobile typecheck
```

## Phase 6: Home, Settled Toggle, Safety

### Task 6.1: Build The MVP Home State

**Files:**
- Modify: `apps/mobile/src/features/home/HomeScreen.tsx`
- Modify: `apps/mobile/src/i18n/en.ts`
- Test: `apps/mobile/src/features/home/homeScreenState.test.ts`

**Goal:** Home shows current active interest, current match/group state, and next best action.

**Verification:**

```bash
pnpm --filter mobile test
pnpm --filter mobile typecheck
```

### Task 6.2: Add Settled Toggle

**Files:**
- Create: `apps/mobile/app/settings.tsx`
- Create: `apps/mobile/src/features/profile/ProfileSettingsScreen.tsx`
- Modify: `apps/mobile/src/navigation/routes.ts`
- Modify: `apps/mobile/src/i18n/en.ts`
- Modify: `apps/mobile/graphql/operations.graphql`
- Test: `apps/mobile/src/features/profile/profileSettings.test.ts`

**Goal:** User can mark themselves settled/inactive so matching excludes them.

**Verification:**

```bash
pnpm graphql:codegen
pnpm --filter mobile test
pnpm --filter mobile typecheck
```

### Task 6.3: Add Block And Report Placeholders

**Files:**
- Create: `apps/mobile/src/features/safety/safetyActions.ts`
- Create: `apps/mobile/src/features/safety/safetyActions.test.ts`
- Modify: `apps/mobile/src/features/groups/GroupScreen.tsx`
- Modify: `apps/mobile/src/i18n/en.ts`

**Goal:** Basic block/report actions exist and write placeholder records.

**Verification:**

```bash
pnpm --filter mobile test
pnpm --filter mobile typecheck
```

## Phase 7: Admin Visibility

### Task 7.1: Expand Admin Dashboard

**Files:**
- Modify: `apps/admin/graphql/operations.graphql`
- Regenerate: `apps/admin/graphql/generated.tsx`
- Modify: `apps/admin/app/page.tsx`
- Test: `apps/admin/app/adminDashboard.test.tsx` if test tooling exists, otherwise add model-level tests.

**Goal:** Admin can inspect MVP health locally.

**Admin sections:**

- Profiles.
- Interest activations.
- Match candidates.
- Activity groups.
- Recent group messages.
- Reports.
- Feature flags.

**Verification:**

```bash
pnpm graphql:codegen
pnpm --filter admin typecheck
pnpm --filter admin build
```

## Phase 8: End-To-End Local Demo Path

### Task 8.1: Seed A Realistic Local Demo Network

**Files:**
- Modify: `supabase/seed.sql`
- Create: `supabase/migrations/000008_mvp_demo_network.sql`
- Test: `apps/mobile/src/features/interests/interestsCatalog.test.ts`

**Goal:** Local development can demonstrate matching without production users.

**Seed data:**

- Several Melbourne profiles.
- Several overlapping active interests.
- A few existing groups/messages.
- Feature flags set for MVP enabled features.

**Verification:**

```bash
supabase migration up
pnpm --filter mobile test
```

### Task 8.2: Define MVP Acceptance Script

**Files:**
- Create: `docs/MVP_ACCEPTANCE.md`
- Modify: `docs/ONBOARDING.md`

**Manual acceptance path:**

1. `pnpm bootstrap:dev`
2. `pnpm dev`
3. Open Expo.
4. Complete intro and quiz.
5. Select an interest.
6. Activate the interest.
7. See match candidate.
8. Accept candidate.
9. Land in group.
10. Send and receive a message.
11. Toggle settled.
12. Confirm user is excluded from new matching.

**Verification:**

```bash
pnpm env:validate
pnpm --filter mobile typecheck
pnpm --filter admin typecheck
```

## Phase 9: CLI Backfill For Generated MVP Repos

Only update the CLI scaffolder for framework-level behavior and backend contracts that future generated repos must know about. Do not mirror one-off styling polish into the scaffolder unless it affects generated repo correctness.

### Task 9.1: Add New Migrations And Seed Data To CLI Generator

**Files:**
- Modify: `packages/create-buzz-stack/src/generators/supabaseGenerator.ts`
- Modify: `packages/create-buzz-stack/src/generators/supabaseGenerator.test.ts`

**Goal:** `buzz-stack init` creates a repo with all MVP migrations included.

**Verification:**

```bash
pnpm --filter create-buzz-stack test
pnpm --filter create-buzz-stack typecheck
```

### Task 9.2: Add Bootstrap Migration Awareness

**Files:**
- Modify: `packages/create-buzz-stack/src/bootstrap/runBootstrap.ts`
- Modify: `packages/create-buzz-stack/src/bootstrap/applyLocalSupabaseMigrations.ts`
- Modify: `packages/create-buzz-stack/src/bootstrap/runBootstrap.test.ts`

**Goal:** `buzz-stack bootstrap` applies pending migrations without forcing local data resets.

**Verification:**

```bash
pnpm --filter create-buzz-stack test
```

## MVP Definition Of Done

- `pnpm bootstrap:dev` prepares local env without production credentials.
- `pnpm dev` starts Supabase, admin, mobile, API placeholder, and worker placeholder.
- Mobile user can complete onboarding intro and quiz.
- Mobile user can select and activate an interest.
- Activation persists in Supabase.
- Deterministic candidate generation returns at least one local candidate with seeded data.
- User can accept a match and create/open an activity group.
- User can send and receive group chat messages.
- User can mark themselves settled/inactive.
- Block/report placeholders write records.
- Admin can inspect MVP entities.
- Mobile env validation blocks server-only secrets.
- Full targeted verification passes:

```bash
pnpm --filter mobile test
pnpm --filter mobile typecheck
pnpm --filter admin typecheck
pnpm --filter create-buzz-stack test
pnpm env:validate
git diff --check
```

## Suggested First Implementation Pass

Phase 1 now has its first migration contract in place. The next code-producing task should be:

```txt
Formalize the replaceable auth contract and wire onboarding profile/quiz persistence into the new MVP data columns.
```

Do not start with chat UI. The chat experience depends on profile identity, activation persistence, and group creation being real first.
