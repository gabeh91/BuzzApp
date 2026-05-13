# Activate Interest FAB Interaction Spec

Companion docs:

- `docs/REALTIME_ACTIVATION_PINGS_SPEC.md`
- `docs/REALTIME_ACTIVATION_PINGS_UXUI_SPEC.md`

## Intent

The Activate Interest FAB is one of Buzz's signature moments. It should feel tactile, energetic, and premium, not like a normal floating action button that opens a form.

The interaction should turn "activate an interest" into a memorable ritual:

1. Tap the FAB.
2. Activities fan out in a radial wheel.
3. Select one activity.
4. The FAB expands and absorbs the selected activity label.
5. User presses and holds to charge the ping.
6. After a short hold, the prompt changes to release.
7. On release, a ripple travels upward through the screen and the normal activation/ping logic fires.

This should replace the current sheet-first FAB path where possible, while still keeping sheets available for edge cases, errors, auth, and detailed confirmation states.

## Current Codebase Starting Point

Relevant files:

- `apps/mobile/src/features/interests/ActivateInterestFab.tsx`
- `apps/mobile/src/features/interests/InterestToggleGrid.tsx`
- `apps/mobile/src/features/interests/useActivateInterestActions.ts`
- `apps/mobile/src/features/activities/ActivitiesScreen.tsx`
- `apps/mobile/src/features/home/HomeScreen.tsx`
- i18n copy in `apps/mobile/src/i18n/en.ts` under `common.activateInterestFab`, `home.activateFab`, and `activities.activate`.

Current behavior:

- `ActivateInterestFab` is a static circular yellow button.
- `ActivitiesScreen` already has an interest picker in page content, then the FAB opens a confirm sheet.
- `HomeScreen` opens a pick sheet first, then a confirm sheet.
- `useActivateInterestActions().confirmActivate(closeSheet)` owns auth gating and the actual mutation/local activation fallback.

## Interaction Model

### State Machine

Use explicit states rather than boolean piles:

```ts
type ActivateFabState =
  | "idle"
  | "wheel_open"
  | "activity_selected"
  | "charging"
  | "ready_to_release"
  | "released"
  | "success"
  | "error";
```

Additional state:

```ts
type ActivateFabSelection = {
  id: string;
  name: string;
  iconName?: string;
} | null;
```

### Idle

Visual:

- Circular yellow FAB.
- Flash/ticket/activity icon.
- Minimal label: `Activate`.
- Positioned above tab bar with safe-area clearance.

Behavior:

- Tap opens the radial wheel.
- If activation is busy, show loading/disabled state.
- If no interests exist, open a helpful empty sheet rather than an empty wheel.

### Wheel Open

Visual:

- FAB remains the anchor.
- Available interests fan out from the FAB in a radial arc.
- Use a semi-circle/arc that stays inside the viewport and above the bottom tab bar.
- Background can dim very lightly or blur only if it helps focus; avoid making the rest of the screen feel blocked.
- Each activity item should be a compact circular/rounded chip with icon plus short label where space allows.

Behavior:

- Tap an activity to select it.
- Tap outside or tap FAB again to collapse back to idle.
- Wheel items should stagger in with spring/scale/opacity.
- Keep touch targets at least 44px.

### Activity Selected

Visual:

- Selected activity animates back into the FAB.
- FAB expands from a circle into a larger pill/blob.
- The selected activity label appears inside the expanded FAB.
- Prompt text changes to: `Press and hold to activate`.

Behavior:

- User must press and hold on the expanded FAB.
- A simple tap after selection should not send the ping.
- The user can dismiss/cancel by tapping outside or dragging/cancelling the press.

### Charging

Visual:

- While pressed, the FAB should look like it is charging energy:
  - radial fill or ring progress,
  - subtle glow,
  - scale breathing,
  - small inner pulse,
  - optional tiny particles/sparks if performance remains solid.
- Label remains selected activity name.
- Prompt can remain `Press and hold to activate` until threshold.

Timing:

- Hold threshold target: around 1.5-2.0 seconds.
- Charging should feel responsive immediately, not delayed.

Behavior:

- Release before threshold cancels and returns to `activity_selected`.
- If the user drags outside/cancels, return to `activity_selected`.

### Ready To Release

Visual:

- Charging reaches full.
- Prompt changes to: `Release to ping nearby people`.
- FAB can stretch slightly or glow more strongly.
- Haptic feedback should fire once when threshold is reached if haptics are available.

Behavior:

- Releasing now triggers activation.
- Continuing to hold should keep the charged state stable without looping aggressively.

### Released

Visual:

- FAB emits a ripple/wave that travels upward through the phone.
- Ripple should start at the FAB center and expand upward/mostly full-width.
- The ripple should feel like a ping being sent, not a confetti celebration.
- Keep it quick: roughly 600-900ms.

Behavior:

- Fire the existing activation logic when release happens after threshold.
- Do not fire twice if the animation or mutation re-renders.
- During mutation, block additional activation gestures.

### Success

Visual:

- Small success state, toast, or result sheet depending on backend result.
- If backend returns a ping count:
  - `Pinged {count} people`
- If zero:
  - `No one to ping yet`

Behavior:

- Return FAB to idle after the result state is acknowledged or after a short non-blocking success.
- If at least one positive response arrives later, use the realtime ping UX spec.

### Error

Visual:

- FAB settles back into selected state or idle.
- Show a useful error sheet/toast:
  - `Couldn't send that ping`
  - `Try again in a moment.`

Behavior:

- Do not lose the selected activity if the mutation failed.

## Auth Behavior

Activation still requires auth.

Recommended flow:

1. Anonymous user can open wheel and choose an activity.
2. On press-and-hold release, auth gate opens.
3. After successful auth, return to the selected/charged flow or a confirm state.
4. Do not silently fire activation while the auth modal is still onscreen.

Implementation note:

- The existing post-auth continuation work should be used so the pending action resumes cleanly.
- If preserving the exact "release to ping" moment after auth is awkward, resume to `activity_selected` with the same activity and prompt the user to hold again. That is safer than firing a user-impacting action unexpectedly after auth.

## Accessibility

The gesture cannot be the only way to activate.

Requirements:

- FAB has clear accessibility label and hint.
- Radial wheel items are accessible buttons.
- Expose an accessible fallback action after selecting an interest:
  - Button/action label: `Activate {interest}`
  - Hint: `Sends a ping to nearby people who are open to this activity.`
- Do not require a precision drag.
- Respect reduced motion:
  - No particle effects.
  - Shorten or simplify ripple.
  - Use direct state transitions.

## Component Shape

Prefer one orchestrating component plus small presentational pieces:

- `ActivateInterestFab`
  - Owns local interaction state and gesture animations.
  - Receives interests, selected interest, busy state, and callbacks as props.
- `ActivityRadialWheel`
  - Renders wheel items.
  - Presentational and token-driven.
- `ChargingFab`
  - Renders expanded FAB/hold progress.
  - Presentational and token-driven.
- `PingRippleOverlay`
  - Renders the release ripple.
  - Does not own activation logic.

Avoid baking `useInterestFlow`, GraphQL, auth, or mutation logic into the visual primitives. Screens/hooks should pass data and actions down.

## Props Direction

Target `ActivateInterestFab` API:

```ts
type ActivateInterestFabProps = {
  accessibilityHint?: string;
  accessibilityLabel: string;
  bottomInset: number;
  disabled?: boolean;
  interests: BuzzInterest[];
  selectedInterest: BuzzInterest | null;
  activationBusy: boolean;
  onSelectInterest: (interest: BuzzInterest) => void;
  onActivateSelectedInterest: () => Promise<void>;
  onRequestAuth?: () => void;
};
```

This moves the component away from a plain `label` + `onPress` button and toward owning the intended activation interaction.

## Animation Implementation Notes

Use `react-native-reanimated` for:

- wheel item scale/opacity/translation,
- FAB morph scale/width/height/border radius,
- charge progress,
- ripple expansion and opacity,
- prompt text fade/swap.

Use `Pressable` or gesture-handler depending on implementation complexity. If long-press progress needs tight control and cancel handling, prefer `react-native-gesture-handler`.

Suggested constants:

```ts
const HOLD_TO_ACTIVATE_MS = 1800;
const RIPPLE_DURATION_MS = 750;
const WHEEL_RADIUS = 128;
const MAX_VISIBLE_WHEEL_ITEMS = 6;
```

If there are more interests than fit cleanly in the wheel:

- Show the first 5-6 most relevant/user-selected interests.
- Include a final `More` item that opens the existing bottom sheet picker.

## Copy

Add i18n keys; do not hardcode strings in the component.

Suggested strings:

- `Activate`
- `Choose an activity`
- `Press and hold to activate`
- `Release to ping nearby people`
- `Keep holding`
- `Pinged {count} people`
- `No one to ping yet`
- `Couldn't send that ping`

## Testing

Test the behavior contracts, not every animation constant:

- Tapping FAB opens the wheel.
- Selecting an activity changes the prompt to press-and-hold.
- Releasing before hold threshold does not call activation.
- Releasing after threshold calls activation once.
- Disabled/busy state blocks interaction.
- Reduced-motion mode still exposes activation.
- Anonymous activation path invokes auth continuation instead of firing immediately.

Avoid brittle tests for exact spring values, ripple dimensions, or per-frame animation details.

## Implementation Order

1. Refactor `ActivateInterestFab` props to accept interests, selected interest, activation state, select callback, and activate callback.
2. Add i18n strings for the new prompts.
3. Build the radial wheel with a small bounded interest set.
4. Add selected expanded FAB state.
5. Add hold-to-charge logic with early-release cancel.
6. Add release ripple overlay.
7. Wire Activities and Discover/Home to the new prop API.
8. Preserve the existing sheet as fallback for `More`, errors, and detailed result states.
9. Add focused component/feature tests for the interaction state contracts.
