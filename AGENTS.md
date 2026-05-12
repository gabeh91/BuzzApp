# Agent Instructions

## Project Context

Before making product, architecture, or mobile UI changes, read:

- `docs/PROJECT_CONTEXT.md`
- `docs/UI_COMPONENT_GUIDELINES.md`

## Mobile UI Expectations

When building or editing mobile screens:

- Treat app performance and memory management as high-priority code design constraints, especially
  on mobile feeds, chats, and repeated card surfaces.
- Prefer reusable, categorized componentry over one-off screen styling.
- Extract repeated UI patterns into shared primitives/composites and drive differences through props.
- Use the shared `List` primitive backed by Shopify FlashList for unbounded or server-backed lists
  and feeds. Do not render long data sets with array `.map()` in screen JSX.
- Keep `.map()` for small, bounded static UI such as option chips, tabs, and short metadata rows.
- Do not nest virtualized lists inside `ScrollView`; make the screen non-scrolling and let the
  virtualized list own scrolling.
- Use existing hooks and extract repeated hook/state logic instead of duplicating it across screens.
- Use React context only for focused app/feature state that must be shared across branches; keep providers domain-specific and prefer props for reusable UI.
- Use `StyleSheet.create` with theme tokens; avoid ad hoc repeated padding, radius, shadows, colors, typography, or font choices in screens.
- Keep root navigation in the bottom tab bar, not top cross-navigation buttons.
- Keep rendered copy in i18n and avoid implementation terms in user-facing UI.
- Use Jest and `@testing-library/react-native` for reusable UI coverage.

Commit cohesive sections separately when asked to continue MVP work in slices.
