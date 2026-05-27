# UI Component Guidelines for Agents

Buzz UI work should prefer reusable, categorized componentry over one-off screen styling.

The goal is visual conformity across screens and faster iteration without copying card padding,
border radius, typography, shadows, button treatment, or layout chrome into each feature screen.

## Core Rule

If two screens render the same UI pattern, extract or reuse a component before tuning local styles.

Do not let screens independently define the same card, hero, header, action row, status badge,
list item, or CTA treatment. Small visual drift compounds quickly and makes the app feel less
designed.

## Component Categories

Use these categories when deciding where UI should live.

### Primitives

Primitives live in `apps/mobile/src/ui` and wrap design-system tokens.

Examples:

- `Screen`
- `Header`
- `Text`
- `Panel`
- `Button`
- `HeroPanel`

Use primitives for repeated chrome and visual rules: spacing, radius, shadows, borders,
typography variants, button variants, and standard safe-area/scroll behavior.

### Composites

Composites combine primitives into repeated product patterns.

Good candidates:

- hero panels
- section headers
- checklist rows
- profile summary blocks
- status banners
- empty states
- suburb/activity cards
- plan cards
- timeline/progress rows
- tab/navigation affordances

If the same structure appears in more than one screen, create a composite and drive differences
through props.

### Feature Components

Feature components live near their feature when they encode feature-specific behavior, but they
should still compose primitives and composites.

Examples:

- group attendance controls
- post-plan feedback controls
- landing-plan checklist
- suburb-fit recommendation list

Feature components may own data mapping and interactions. They should not redefine shared card,
button, heading, or hero styling from scratch.

## Screen-Building Workflow

Before building or editing a screen:

1. Check `apps/mobile/src/ui` for an existing primitive or composite.
2. Scan nearby screens for the same visual pattern.
3. If a pattern repeats, extract it first or use the existing component.
4. Keep screen-local styles limited to layout composition, not repeated chrome.
5. Add or update tests that enforce reuse when the pattern is important.

For mobile screen work, treat this as a required pre-flight check, not a cleanup task at the
end. Reusable structure should be part of the first implementation, not something agents add
only after drift is visible.

## Feed and List Performance

App performance and memory management are high-priority design constraints.

Use the shared `List` primitive from `apps/mobile/src/ui` for unbounded or server-backed list
surfaces. `List` wraps Shopify FlashList so long feeds recycle rows instead of mounting every card
at once.

Use `List` for:

- people/discover feeds
- activity feeds
- chat/message timelines
- search results
- notification/request lists
- any server-backed list that can grow over time

Do not use array `.map()` in screen JSX for unbounded data. Mapping a long feed mounts every row,
re-runs row construction on render, and increases memory pressure on mobile devices.

Keep `.map()` only for small, bounded UI collections such as:

- quiz answer options
- short chip rows
- bottom tab metadata
- two or three action buttons
- fixed local summary rows

Virtualized list rules:

- Do not nest `List`/FlashList inside `ScrollView`. Set `Screen` to `scroll={false}` and let the
  list own scrolling.
- Use a stable `keyExtractor`.
- Keep `renderItem` stable with `useCallback` when it closes over state or handlers.
- Pass external row state through `extraData` when the list needs to re-render rows.
- Put page chrome in `ListHeaderComponent`/`ListFooterComponent` instead of wrapping the list in
  another scroll container.
- Prefer shared row/card components over defining row layout directly inside `renderItem`.

## UI Testing Strategy

Prefer component tests and feature-level tests for meaningful UI behavior.

- Test that shared components, navigation surfaces, auth gates, and feature flows render and behave
  correctly.
- Avoid adding a new brittle regression test for every small visual permutation, tuning constant,
  copy tweak, or animation micro-adjustment.
- Use exact-value tests only when the value is part of a real contract, such as accessibility,
  route structure, auth gating, persistence, or a design-system primitive that other screens depend
  on.
- For visual polish changes, keep verification lightweight unless the change fixes a user-visible
  regression that is likely to recur.

## Hooks and State Guidelines

Use hooks deliberately and consistently.

- Use existing provider hooks before introducing new state paths: `useI18n`, `useBuzzTheme`,
  `useBuzzAuth`, `useQuiz`, `useInterestFlow`, and `useSettlingProgressState`.
- Keep hooks at the top of React components. Do not call hooks conditionally, inside callbacks,
  loops, or nested helpers.
- Extract repeated state/data behavior into a custom hook before duplicating it across screens.
- Keep reusable visual components mostly presentational. Pass content and event handlers through
  props instead of making every component reach into feature providers.
- Keep screen components responsible for assembling feature data, route actions, and top-level
  interactions.
- Do not surface hook/provider/library names in rendered copy. Technical implementation terms
  belong in code, tests, and docs, not user-facing UI.

Good hook extraction candidates:

- repeated route/navigation logic
- repeated progress or status derivation
- repeated API action state such as `idle`, `saving`, `error`
- repeated feature data mapping before rendering a shared component

Avoid:

- copying the same `useState`/`try`/`catch` action flow into multiple screens
- creating hooks that only wrap a single local variable
- making shared UI primitives depend on feature-specific providers

## Async Code Style

Prefer `async`/`await` over promise chaining in application code.

- Use small inner async functions inside effects and event handlers when async work is needed.
- Keep cancellation guards explicit in effects, for example `let active = true` plus an `if (active)`
  check after awaited work.
- Avoid `.then(...)` chains for flow control; they make loading, error, and cancellation paths harder
  to scan.
- Reserve promise chaining for narrow cases where an API specifically benefits from it, and keep the
  reason obvious in the local code.

## User-Facing Copy

Write UI copy for what the user can do, see, or decide next.

- Do not use translations to describe Buzz's product positioning, implementation, or strategy.
- Avoid phrases like "without turning Buzz into...", "Buzz can shape...", or "Buzz avoids...".
- Prefer direct user value: nearby areas, useful interests, next actions, availability, safety,
  and plan status.
- Do not mention implementation services, provider names, hooks, storage, GraphQL, Supabase, or
  feature flags in rendered copy.

## Context and Provider Guidelines

Use React context for app-level or feature-level state that genuinely needs to be shared across
multiple branches of the component tree.

Good context candidates:

- authenticated user/session boundary
- theme and design tokens
- i18n/locale access
- onboarding flow state
- quiz answers and derived traits
- active interest flow state
- settling progress state shared across Home/Profile/Group

Avoid context for:

- state used by only one component or one tightly scoped subtree
- temporary form field state
- one-off loading/error flags local to a button or card
- values that can be passed cleanly as props through one or two levels
- purely visual component configuration

Provider rules:

- Keep providers focused on one domain. Do not create a broad catch-all app context.
- Expose domain-specific hooks such as `useQuiz()` or `useInterestFlow()` rather than raw context
  objects.
- Throw a clear error if a provider hook is used outside its provider.
- Keep provider values small and stable. Memoize derived values when churn causes unnecessary
  renders.
- Split providers when unrelated state changes would cause large parts of the app to re-render.
- Do not put server persistence details directly into shared visual components through context.
  Screens or feature components should coordinate persistence and pass props down.
- Prefer props for reusable UI primitives and composites. Context dependencies make shared UI
  harder to reuse and test.

When adding a new context, document why props or a local hook are not enough.

## StyleSheet and Token Guidelines

Use `StyleSheet.create` and theme tokens for React Native styling.

- Prefer styles created from `useBuzzTheme()` and `BuzzTheme` tokens.
- Use shared primitives/composites for repeated visual treatment before adding screen-local
  styles.
- Keep screen-local `StyleSheet` objects focused on layout: section gaps, rows, grids, and
  feature-specific list alignment.
- Do not hardcode repeated padding, border radius, shadows, colors, or typography values in
  feature screens.
- Do not inline large style objects in JSX. Inline styles should be limited to truly dynamic
  values.
- Do not add one-off styling props such as `horizontalInset`, `inlinePadding`, `radius`, or
  `gap` to reusable components. Expose generic style props instead, such as `style`,
  `containerStyle`, `contentStyle`, `labelStyle`, or another clearly scoped `StyleProp<ViewStyle>`
  / `StyleProp<TextStyle>` escape hatch.
- Keep component props for behavior, content, and semantic variants. Screen-specific spacing,
  alignment, and layout tweaks should be passed through tokenized `StyleSheet` styles.
- Do not hardcode font families or weights in screens. Use `Text` variants or theme font
  styles.
- Do not copy a style block from one screen to another. Extract it into a component.
- Remove dead local styles when a screen moves to shared components.

When reviewing a screen, search for repeated local style names such as:

- `heroCard`
- `primaryAction`
- `secondaryAction`
- `statusBadge`
- `sectionHeader`
- `planItem`
- `card`

If the same name or visual treatment appears in more than one place, prefer a shared component.

## Navigation and Information Architecture

Root-level navigation should use the bottom tab bar.

- Use bottom tabs for root destinations: `Discover`, `Activities`, `Chats`, and `Profile`.
- Keep `Discover` as the home/default surface for finding people and activities. It should not become narrowly named around one temporary MVP feed.
- Keep `Activities` focused on active interest availability, activate/deactivate flows, current plans, accepted activities, and plan status.
- Keep `Chats` focused on connection requests, accepted request threads, group chats, and plan coordination conversations.
- Keep `Profile` focused on personal state: quiz/profile context, landing or starting-point content, matching availability, auth/account state, and settings.
- Do not add top-button navigation between root screens when the tab bar already owns that job.
- Keep detail or workflow routes, such as groups and invite joins, outside the root tabs when
  they are contextual.
- Put content where users expect it: connection requests can start from Discover/profile detail,
  but their ongoing state belongs in Chats; landing/progress and personal plan context belong in
  Profile; activation and plan state belong in Activities.

## UX Density and Onboarding

Keep onboarding compact and low-friction.

- Avoid adding extra screens or barriers before a user has joined.
- Prefer collecting additional matching signals inside existing quiz/profile steps when possible.
- If new city or lifestyle signals are needed, add them without bloating the visible onboarding
  flow.
- Keep first-run screens focused on the next practical action, not broad explanation.

## Copy and i18n

Rendered strings should use the locale layer.

- Put mobile copy in `apps/mobile/src/i18n`.
- Consume copy through the app i18n hook/context.
- Avoid hardcoded rendered copy in screens, shared components, and flow models.
- Keep user-facing copy product-focused, not implementation-focused.

## Typography and Fonts

Use the app typography system.

- iOS and Android both use bundled **Nunito Sans** static faces (SIL OFL) through `theme.fontStyles`.
  Each semantic role (`body`, `labelStrong`, `display`, etc.) maps to its own registered `fontFamily`
  so weights stay legible on both platforms—do not rely on `fontWeight` with a single variable file.
- iOS matches fonts by **PostScript name** inside each `.ttf`. If you regenerate cuts from the variable
  font, run `pnpm --filter mobile patch-fonts` so every file gets a unique name (otherwise iOS can render
  every weight as ExtraLight).
- Mono text should use the bundled Menlo faces through theme tokens.
- Screens should not pick platform fonts directly.
- Prefer `theme.fontStyles` (`body`, `labelStrong`, `display`, `heavy`, `black`) over raw `fontWeight`
  in feature styles.

## What Belongs in Shared Components

Shared components should own:

- repeated border radius
- repeated padding
- repeated shadows/elevation
- repeated background/border colors
- typography variants
- button shape and states
- common content slots such as `eyebrow`, `title`, `body`, `action`, and `meta`
- accessibility roles/labels where the pattern is known

Screens should pass content and behavior through props.

## What Can Stay Local

Screen-local styles are acceptable for:

- page-level spacing between sections
- feature-specific layout grids
- one-off alignment needed by a unique section
- small wrappers around data-driven lists

Screen-local styles should not duplicate shared component visual identity.

## Modal Surfaces

Use the shared `Sheet` primitive from `apps/mobile/src/ui` for bottom-sheet prompts,
confirmation flows, and lightweight interruptive UI.

- Do not import React Native's primitive `Modal` directly in feature screens.
- Keep auth inside the native Expo Router auth modal stack.
- Use `Sheet` props such as `dismissible`, `onDismiss`, and `contentStyle` instead of
  rebuilding scrims, handles, and sheet cards locally.
- If a flow needs a full route or multi-step stack, use Expo Router. If it is a focused
  prompt or confirmation surface, use `Sheet`.

## Naming

Do not prefix primitives with `Buzz`.

Use plain component names:

- `HeroPanel`, not `BuzzHeroPanel`
- `Button`, not `BuzzButton`
- `StatusBanner`, not `BuzzStatusBanner`

## Testing Expectations

When adding reusable UI:

- Add a React Native Testing Library test for rendered content and basic accessibility.
- Use Jest and `@testing-library/react-native` for component behavior and rendering tests.
- Add source-level guard tests only when useful to prevent architectural drift.
- Prefer testing real components. Do not assert on mock component existence.

When fixing repeated UI drift:

- Add a test that fails while screens are using separate local styles.
- Refactor the screens to consume the shared component.
- Keep the test focused on the architectural rule: reuse the component, not a brittle pixel value.

When changing navigation:

- Add or update route/source tests for the Expo Router file structure.
- Add component tests for reusable navigation visuals when practical.

When changing feature behavior:

- Prefer TDD: write the failing test first, watch it fail, then implement.
- Cover shared logic with focused logic tests.
- Cover reusable UI with React Native Testing Library tests.

## Examples

Bad:

```tsx
<Panel style={styles.heroCard}>
  <Text variant="eyebrow">Melbourne</Text>
  <Text variant="title">Your profile</Text>
  <Text variant="body">Keep your local plan in one place.</Text>
</Panel>
```

Repeated on another screen with a different `heroCard` style.

Good:

```tsx
<HeroPanel
  eyebrow="Melbourne"
  title="Your profile"
  body="Keep your local plan in one place."
/>
```

The screen owns content; `HeroPanel` owns the repeated visual treatment.

## Review Checklist

Before finishing screen/UI work, check:

- Did I reuse existing primitives and composites?
- Did I create a shared component for repeated patterns?
- Did I avoid hardcoding repeated padding/radius/shadow values in screen styles?
- Are differences between screens driven by props rather than copied styles?
- Did I use `List`/FlashList for unbounded feeds instead of `.map()`?
- Did I avoid nesting a virtualized list inside `ScrollView`?
- Did I use theme tokens and `StyleSheet.create` instead of ad hoc styling?
- Did I extract repeated hook/state logic instead of copying it between screens?
- Is root navigation handled by the bottom tabs rather than top buttons?
- Is the screen contextually placed in the right area of the app?
- Are rendered strings still coming from i18n where appropriate?
- Did I add Jest/React Native Testing Library coverage for reusable UI?
- Did I add tests that make the reuse expectation clear?
