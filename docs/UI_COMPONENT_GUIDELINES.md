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

## Naming

Do not prefix primitives with `Buzz`.

Use plain component names:

- `HeroPanel`, not `BuzzHeroPanel`
- `Button`, not `BuzzButton`
- `StatusBanner`, not `BuzzStatusBanner`

## Testing Expectations

When adding reusable UI:

- Add a React Native Testing Library test for rendered content and basic accessibility.
- Add source-level guard tests only when useful to prevent architectural drift.
- Prefer testing real components. Do not assert on mock component existence.

When fixing repeated UI drift:

- Add a test that fails while screens are using separate local styles.
- Refactor the screens to consume the shared component.
- Keep the test focused on the architectural rule: reuse the component, not a brittle pixel value.

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
- Are rendered strings still coming from i18n where appropriate?
- Did I add tests that make the reuse expectation clear?
