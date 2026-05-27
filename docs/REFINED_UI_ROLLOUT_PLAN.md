# Refined UI Rollout Plan (Low-Risk First)

## Goals

- Reduce playful/cartoony styling in favor of a premium, calm finish.
- Keep brand personality via accent eyebrows and selective accent moments.
- Improve perceived quality through typography, restraint, and consistency.

## Constraints

- Preserve existing product flows and information architecture.
- Keep changes token-driven and primitive-first to minimize regressions.
- Avoid garish or spring-heavy motion for standard interactions.

## Phase 1: Low-Risk Rollout (Now)

1. **Theme Token Baseline**
   - Tighten neutral palette for `background`, `surface`, `surfaceMuted`, and `textMuted`.
   - Keep accent color for eyebrow labels and key highlights.
   - Soften default card shadow and border contrast.

2. **Typography Refinement**
   - Reduce heavy font weights in shared text variants (`panelTitle`, `button`, `status`, `feedback`).
   - Keep hierarchy, but remove “shouty” defaults.
   - Use a more refined base font treatment in theme tokens before screen-level overrides.

3. **Primitive Polish**
   - Keep max roundness anchored at `radii.xl` for major containers.
   - Prefer `radii.lg`/`md` for buttons and chips.
   - Ensure selection states use border-first emphasis before saturated fills.

4. **Pilot Surfaces**
   - Apply and validate on:
     - `ProfileScreen` starting point panel and interest pills
     - People connect flow cards
     - People match card typography
   - Confirm consistency in both light and dark themes.

5. **Motion Guidance (Low-Risk)**
   - Default transitions: `180-260ms`, cubic easing.
   - Prefer opacity + subtle translate over spring/bounce for routine interactions.
   - Keep spring only for explicitly branded moments.

## Phase 2: Wider Spec + Implementation

1. **Image-Led Surface Spec**
   - Introduce cover image slots with fixed aspect ratios and neutral placeholders.
   - Add gradient scrims for text legibility and consistency.

2. **Motion Spec**
   - Gesture-interpolated transitions for headers, cards, and tabs.
   - Shared interaction curves/durations by component class.

3. **Typography System Expansion**
   - Evaluate and finalize cross-platform font family choices.
   - Introduce semantic text roles for display/title/body/caption with strict usage rules.

4. **Selection Pattern Standardization**
   - Build shared `SelectableCard`/`SelectablePill` primitives.
   - Replace ad hoc selection visuals across onboarding, interests, and quiz surfaces.

5. **QA + Benchmarking**
   - Screen-by-screen visual audit against “golden” reference surfaces.
   - Record before/after captures for light + dark mode.
   - Ensure all theme-token and primitive tests pass.
