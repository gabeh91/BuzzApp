# BuzzApp Agent Handover

Last updated: 2026-05-12, after commit `3992d9c`.

## Start Here

Work in `/Users/gabeh/Desktop/BuzzApp`.

Do not switch to `/Users/gabeh/Desktop/SwingPal`; that path appeared from an unrelated inherited context and is not the active project.

Before changing code:

```sh
cd /Users/gabeh/Desktop/BuzzApp
git status --short
```

At handover time, the only known unstaged files were pre-existing user changes outside the latest work:

- `apps/mobile/src/ui/Button.tsx`
- `packages/create-buzz-stack/src/generators/workspaceGenerator.ts`

Do not stage, revert, or overwrite those unless the user explicitly asks.

## Key Context Docs

Read these first:

- `docs/PROJECT_CONTEXT.md`
- `docs/UI_COMPONENT_GUIDELINES.md`
- `docs/HIGH_LEVEL_SOLUTION_ARCHITECT.md`
- `docs/POST_COMPETITOR_VALIDATION.md`
- `docs/plans/2026-05-06-mvp-implementation.md`
- `docs/plans/2026-05-08-city-landing-safety-backfill.md`

The founder PDF that has been driving screen-alignment discussions is outside the repo:

- `/Users/gabeh/Desktop/Buzz MVP — Screen Specification.pdf`

If it is missing, ask the user for it rather than guessing.

## Product Direction

Buzz is an activity-first social app for people settling into a new city. The MVP should help a user:

1. browse anonymously,
2. answer the quiz,
3. get suburb/city fit context,
4. discover compatible people and activities,
5. authenticate only when they interact,
6. activate an interest or say hi,
7. form or join a small group,
8. chat and coordinate around a plan.

Core rule: anonymous browsing is allowed; meaningful interactions are auth-gated. Activating an interest, saying hi, accepting invites, joining plans, toggling profile availability, and similar actions should require auth.

The MVP should remain deterministic and Supabase-first. Do not add AI as eligibility/source-of-truth logic. AI can later improve wording or recommendations, but MVP matching should stay transparent and testable.

## UX And Code Standards From User

- Reusable componentry matters. Prefer shared primitives/composites with props over per-screen duplicated cards/buttons/headers/text.
- Do not prefix UI primitives with `Buzz`; names like `Button`, `Screen`, `Panel`, `Header`, `HeroPanel`, `Text`, `List` are preferred.
- Use theme tokens and `StyleSheet.create`; avoid one-off magic styling when a token or shared primitive exists.
- Use hooks to extract behavior when screen files get large.
- Use React context/providers for cross-cutting app state where appropriate.
- Prefer `async`/`await` over promise chaining.
- Use Jest and `@testing-library/react-native` for component and feature tests, but do not add excessive tiny permutation tests for every small visual tweak.
- Performance and memory are high priority. Unbounded feeds/chats/server-backed lists should use the shared `List` primitive backed by Shopify FlashList. Do not render long lists with `.map()` in screen JSX.
- Keep translations user-useful. Avoid copy that describes the app mechanics to itself, such as “without turning Buzz into...” or “Buzz has enough context...”.
- Frontend should feel polished and intentional. Good UX is paramount.

## Current App State

### Onboarding

Recent commits:

- `9a62400 refactor(onboarding): split screen modules`
- `3992d9c refactor(onboarding): remove low value intro steps`

The onboarding flow is now compact:

```text
welcome -> howItWorks -> quizIntro -> quiz -> interests -> activation -> matchPreview
```

Removed steps:

- `intent`
- `profile`

The onboarding implementation is split across:

- `apps/mobile/src/features/onboarding/OnboardingScreen.tsx`
- `apps/mobile/src/features/onboarding/OnboardingChrome.tsx`
- `apps/mobile/src/features/onboarding/OnboardingStepContent.tsx`
- `apps/mobile/src/features/onboarding/OnboardingScreen.styles.ts`
- `apps/mobile/src/features/onboarding/OnboardingTheme.tsx`
- `apps/mobile/src/features/onboarding/onboardingInterests.ts`
- `apps/mobile/src/features/onboarding/onboardingFlow.ts`

Behavior to preserve:

- First onboarding step has no Back button.
- First onboarding step has “Already have an account? Sign in” as the tonal secondary action.
- Anonymous quiz progress is persisted and resumes.
- Anonymous draft can be claimed after auth.
- Signing out resets the claimed draft so a new account in the same session can be sent back through onboarding.
- Activation requires auth.
- The activation step still allows “Browse Buzz for now” so users are not blocked from exploring.
- Authenticated users with incomplete quiz context see the global completion prompt and enter the exitable profile quiz route, not the locked first-run onboarding.

### Auth

Auth uses a native Expo Router modal stack, not the old inline primitive modal:

- `app/auth/_layout.tsx`
- `app/auth/index.tsx`
- `app/auth/code.tsx`
- `apps/mobile/src/auth/AuthStartScreen.tsx`
- `apps/mobile/src/auth/AuthCodeScreen.tsx`
- `apps/mobile/src/auth/AuthModalFrame.tsx`
- `apps/mobile/src/auth/AuthProvider.tsx`

Current capabilities:

- Email/password sign in.
- Email/password account creation.
- Email OTP/code route.
- Supabase OAuth buttons for Apple, Google, and Facebook.
- Biometric app-unlock for stored Supabase sessions after first auth.
- Pending auth actions resume after successful auth.

Important caveat:

- Apple/Google/Facebook provider setup is external in Supabase and Apple/Google/Facebook consoles. The buttons are wired, but provider credentials/config may not be complete.
- Do not commit Supabase keys or provider secrets. Use local env files and Supabase dashboard.

### Navigation

Root tabs are:

- `Discover`
- `Activities`
- `Chats`
- `Profile`

Current UX decisions:

- Keep `Discover` as the home/default surface because it can contain people and activities.
- `Activities` should own current plans/activity state and the activate/deactivate style flows.
- `Chats` should own connection requests, accepted request threads, group chats, and plan coordination.
- `Profile` owns profile state, city starting point, matching availability, landing plan when enabled, quiz completion, biometrics, and logout.
- Detail/workflow routes like group detail, public profile detail, auth, onboarding, invite join, and profile quiz should remain outside the root tabs.

Tab bar notes:

- Chats icon should be a speech bubble.
- Activities icon should be ticket-like.
- Chats unread dot should only render when unread count is present.
- Active tab highlight has a soft bubble/stretch animation.

### Discover And People Feed

Discover is currently backed by people feed work:

- It should use `List`/FlashList, not `.map()` for the server-backed feed.
- People feed is anonymous-safe.
- “Say hi” / connection request starts from Discover or profile detail and is auth-gated.
- Local/demo test people live in `supabase/seed.demo.sql`.
- Production-safe seed data stays in `supabase/seed.sql`.

If local Discover is empty:

```sh
pnpm supabase:start
pnpm supabase:migrate
pnpm supabase:seed:demo
pnpm --filter mobile start
```

For Android emulator local Supabase, local URL selection should use Android host handling rather than iOS loopback.

### Profile

Profile currently owns:

- compact city starting point when `city_starting_point_enabled` is true,
- full Landing Plan only behind `landing_plan_enabled`,
- settling progress,
- matching availability controls for authenticated users only,
- sign out for authenticated users only,
- biometric login enablement.

Do not hardcode Melbourne-specific UI. City starting point should be city-config driven so MVP scope can change to another city.

### Backend And Data

Architecture:

- Supabase local/hosted is the MVP backend.
- GraphQL/Apollo reads are used where practical.
- Explicit Postgres functions and Supabase Edge Functions own sensitive writes.
- Deterministic matching is the MVP source of truth.
- Demo people are split into `supabase/seed.demo.sql` so they do not creep into production.

Feature flags are city/config driven. Important flags include:

- `city_starting_point_enabled`
- `landing_plan_enabled`
- activity/group/chat/safety/invite-related MVP flags in city config and feature flag migrations

## Recent Verified Commands

These passed after the latest onboarding changes:

```sh
pnpm --filter mobile typecheck
pnpm --filter mobile test
```

Focused checks also passed around onboarding, i18n, and theme/token tests.

## Useful Commands

```sh
pnpm --filter mobile start
pnpm --filter mobile typecheck
pnpm --filter mobile test
pnpm --filter mobile exec tsx --test src/features/onboarding/onboardingFlow.test.ts
pnpm supabase:start
pnpm supabase:migrate
pnpm supabase:seed:demo
pnpm graphql:codegen
```

Use `pnpm supabase:reset` only when a reset is intended. Prefer non-destructive migration/seed commands during normal work.

## Recommended Next Work

1. Continue front-end screen alignment against the founder PDF using the “best of both worlds” approach: keep working functionality, reshape screens/routes where the spec improves UX.
2. Build out actual `Activities` and `Chats` screen content. `Discover` already leans into people matching; Activities should not be a duplicate Discover surface.
3. Exercise and polish the full authenticated path with a real Supabase account: onboarding draft -> auth -> claim quiz -> activate interest -> say hi -> group/invite/chat.
4. Review auth UX where Supabase requires email confirmation. Current create-account flow shows a notice and asks the user to return/sign in; improve only if the user asks or if Supabase settings require it.
5. Continue extracting reusable components for repeated cards/panels/headers/list rows as screens are touched.
6. Keep checking anonymous-vs-auth behavior. Hide controls that cannot work anonymously instead of showing disabled or misleading actions.
7. Keep long feeds on `List`/FlashList.

## Do Not Regress

- Do not reintroduce hardcoded fake “Sam is also open to X” match screens unless a real backend match candidate exists.
- Do not block anonymous browsing just because interaction actions require auth.
- Do not put Landing Plan as the main Home/Discover content; it belongs more naturally on Profile and behind flags.
- Do not hardcode Melbourne into feature logic.
- Do not add local/demo users to production seed.
- Do not use raw React Native `Text` in feature screens where the shared UI `Text` primitive is appropriate, except where a file is still being migrated or has a specific reason.
- Do not weaken performance by replacing `List`/FlashList with array `.map()` for feeds.
- Do not stage unrelated user changes.
