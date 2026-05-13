# Realtime Activation Pings UX/UI Spec

Companion doc: `docs/REALTIME_ACTIVATION_PINGS_SPEC.md`.

This spec translates the activation ping backend model into the frontend screens, routes, components, states, and interaction rules needed for MVP.

## UX Principle

Activation should feel lightweight and immediate:

- The sender should understand who is being pinged without seeing a fake or over-detailed recipient list.
- The recipient should be able to answer quickly without feeling forced into chat.
- A `Yes` response should move naturally into a group, because that is where planning happens.
- Anonymous users can browse, but any interaction that affects another user requires auth.

## Navigation Placement

Keep the current app navigation language:

- `Discover`: browse compatible people and nearby activity context.
- `Activities`: activate an interest, respond to incoming pings, and review active outgoing pings.
- `Chats`: group chats and direct conversations only.
- `Profile`: profile, quiz state, account, availability, and logout.

Badges:

- Activities badge: pending incoming pings plus outgoing activation updates that need attention.
- Chats badge: unread chat messages only.
- Profile badge: incomplete authenticated profile/quiz prompts only.

## Routes

Required routes:

- `/activities`: primary activation surface.
- `/pings/[pingId]`: route-safe incoming ping response screen for push/deep links.
- `/groups/[groupId]`: existing group chat and coordination screen.
- `/profile/[profileId]`: sender/recipient profile detail from ping response and Discover cards.

Modal/sheet surfaces:

- `ActivationConfirmSheet`: sender confirms ping.
- `ActivationResultSheet`: sender sees success, no-match, or error result.
- `IncomingPingSheet`: recipient answers while already inside the app.
- `PingResponseResultSheet`: recipient sees what happened after `Yes`, `Maybe`, or `No`.

Use a bottom sheet primitive backed by the selected bottom sheet library. Do not use React Native's primitive `Modal` for these interaction-heavy flows.

## Screen 1: Activities

### Purpose

Activities owns the Big Button flow, the user's active interest signals, and incoming pings that need action.

### Layout

Top to bottom:

1. Standard `Header`.
2. `HeroPanel`:
   - Eyebrow: city name or `Activities`.
   - Title: `What do you want to do?`
   - Body: `Choose an interest and Buzz will look for people nearby who are open to it too.`
3. `IncomingPingsTray`, shown only when authenticated and there are pending pings.
4. `InterestActivationPicker`.
5. `ActiveSignalsSummary`.
6. Sticky bottom action bar.

Use `Screen scroll={false}` and `List` for this screen. Header and trays should live in `ListHeaderComponent`; active signals can become list rows once there is real data.

### IncomingPingsTray

Shown above the interest picker because responding to someone else is more time-sensitive than starting a new ping.

States:

- Empty: hidden.
- One pending ping: compact card with sender avatar, interest, and `Reply`.
- Multiple pending pings: stacked/summary card with `View pings`.

Card copy:

- Title: `{name} is keen for {interest}`
- Body: `Reply when you have a moment.`
- CTA: `Reply`

### InterestActivationPicker

Use reusable chip/button components. Do not map a large unbounded server list directly in JSX; for MVP starter interests are bounded, but this should become `List` if the interest catalogue grows.

Selected chip:

- Tonal yellow secondary style.
- Clear selected state.
- No custom one-off padding/radius in the screen.

### Sticky Action Bar

States:

- No selected interest:
  - Caption: `Choose one interest to ping people nearby.`
  - Button disabled: `Activate`
- Selected interest:
  - Caption: `Ready to ping people for {interest}.`
  - Button enabled: `Activate`
- Loading:
  - Caption: `Checking who's open to this.`
  - Button loading: `Activating`
- Active:
  - Caption: `{interest} is active.`
  - Button: `Activate again`

Auth gate:

- Pressing `Activate` while anonymous opens auth.
- After successful auth, return to the confirmation sheet for the selected interest.
- Do not silently activate while the auth modal is still on screen.

## Flow A: Sender Activates Interest

### ActivationConfirmSheet

Open after an authenticated user presses `Activate`.

Content:

- Icon/avatar cluster: small neutral people avatars or count bubble.
- Title: `Ping people for {interest}?`
- Body when count is known: `{count} people nearby are open to this too.`
- Body while count is unknown: `We'll check who's open to this now.`
- Primary: `Ping them`
- Secondary: `Not now`

Do not show a list of recipient names in MVP. Count is enough and keeps the interaction low-pressure.

### ActivationResultSheet

Success with recipients:

- Title: `Pinged {count} people`
- Body: `We'll let you know who's keen.`
- Primary: `Done`
- Secondary: `View activity`

No recipients:

- Title: `No one to ping yet`
- Body: `Keep {interest} active and Buzz will watch for new matches.`
- Primary: `Done`

Error:

- Title: `Couldn't send that ping`
- Body: `Try again in a moment.`
- Primary: `Try again`
- Secondary: `Close`

### Outgoing Activation Card

After activation, show a compact card in Activities.

Fields:

- Interest name.
- Status: `Active until {time}` or `Active this week`.
- Response counts: `{yes} in`, `{maybe} maybe`, `{pending} pending`.
- CTA:
  - If at least one `yes`: `Open group`.
  - If no `yes`: `Keep active`.

The sender should not get intrusive popups for every `Maybe` or `No`. A `Yes` can show a small non-blocking banner: `{name} is in for {interest}.`

## Flow B: Recipient Receives Ping

### Realtime Foreground Behavior

When a pending ping arrives while the app is foregrounded:

- If the user is on Activities, insert it into `IncomingPingsTray`.
- If the user is elsewhere, show a small top/bottom in-app banner first:
  - Title: `{name} wants to do {interest}`
  - CTA: `Reply`
- Tapping the banner opens `IncomingPingSheet`.
- Do not interrupt critical typing states such as chat composer input with an immediate full sheet.

### Push / Deep Link Behavior

Push opens `/pings/[pingId]`.

The route should:

- Fetch the ping by ID.
- Respect expired/cancelled states.
- Present the same content as the sheet in a full route layout.
- Let the user back out to the previous tab.

### IncomingPingSheet

Content hierarchy:

1. Sender avatar.
2. Eyebrow: `{city} ping`.
3. Title: `{name} wants to do {interest}. Keen?`
4. Context line:
   - Prefer shared user value: `You both picked {interest}.`
   - Optional: `Your availability looks similar.`
5. Actions:
   - Primary: `Yes, I'm in`
   - Secondary tonal: `Maybe`
   - Tertiary/bordered: `Not for me`
6. Link: `View profile`

Do not use implementation language such as activation, realtime, recipient, match candidate, or backend in rendered copy.

### Response Result States

`Yes`:

- Sheet title: `You're in`
- Body: `We've opened a group for {interest}.`
- Primary: `Open group`
- Secondary: `Later`

`Maybe`:

- Sheet title: `We'll keep you posted`
- Body: `You can still join if the plan comes together.`
- Primary: `Done`

`No`:

- Sheet title: `No problem`
- Body: `We'll show you other plans.`
- Primary: `Done`

Expired:

- Title: `This ping has expired`
- Body: `The activity window has passed.`
- Primary: `Browse activities`

Cancelled:

- Title: `This ping is no longer active`
- Body: `The activity is no longer looking for replies.`
- Primary: `Done`

## Flow C: Group Chat Handoff

When a recipient chooses `Yes`:

1. Call `respondToActivationPing`.
2. Show `You're in`.
3. Route to `/groups/[groupId]` on `Open group`.
4. Group screen shows:
   - interest title,
   - member avatars,
   - simple status: `Planning now`,
   - system message: `{name} joined for {interest}.`

The group should feel like the next step, not a separate feature. Keep the transition short and concrete.

## Chats Screen

Chats should not become the place for generic pings.

Tabs:

- `Groups`: activity groups from accepted pings.
- `People`: direct messages and connection requests.

Group row:

- Interest/title.
- Member avatar stack.
- Last message preview.
- Timestamp.
- Unread count.

Empty state:

- Title: `No group chats yet`
- Body: `Say yes to an activity or ping people from Activities.`

Use `List`/FlashList for all chat summaries.

## Discover Screen

Discover can support the ping loop without owning it.

People cards:

- Keep `Say hi` as direct connection behavior.
- If a person shares an active interest, optionally show a small label: `Also open to {interest}`.
- Do not auto-open pings from Discover unless the user taps a clear activity CTA.

Future CTA:

- `Plan {interest}` can deep link to Activities with that interest preselected.

## Profile Screen

Profile owns user readiness, not ping execution.

Authenticated only controls:

- Availability / pause new matches.
- Active interests overview.
- Quiz completion prompt.
- Logout.

Anonymous state:

- Show sign-in CTA.
- Hide pause-matching controls and any other user-specific interaction.

## Component Plan

Add or reuse these components:

- `PingCard`: compact pending ping summary.
- `IncomingPingsTray`: Activities section for pending pings.
- `IncomingPingSheet`: response sheet content.
- `ActivationConfirmSheet`: sender confirmation.
- `ActivationResultSheet`: sender result state.
- `OutgoingActivationCard`: active signal and response counts.
- `ChatSummaryRow`: reusable row for Chats.
- `AvatarStack`: member/recipient avatar group.
- `StatusCountRow`: response counters for yes/maybe/pending.

Rules:

- Components should compose `Screen`, `Header`, `HeroPanel`, `Panel`, `Button`, `Text`, `List`, `Avatar`, and `Sheet`.
- Do not create one-off card paddings/radii inside feature screens.
- Keep feature data hooks separate from presentational components.
- Keep copy in `apps/mobile/src/i18n/en.ts`.

## Hook Plan

Add feature hooks:

- `useIncomingActivationPings()`
  - Fetch initial pending pings.
  - Subscribe to recipient realtime changes.
  - Expose sorted pending pings and dismiss/mark-read helpers.
- `useOutgoingActivationSummary()`
  - Fetch active outgoing activations.
  - Subscribe to sender realtime changes.
  - Expose response counts and group-ready state.
- `useRespondToActivationPing()`
  - Wrap mutation state.
  - Return result variants for `yes`, `maybe`, `no`, expired, cancelled, and error.
- `usePingDeepLink()`
  - Resolve `/pings/[pingId]` state and back behavior.

Keep these hooks feature-scoped. Do not put ping state into a broad app context unless multiple independent branches need live access.

## Loading And Empty States

Activities:

- Initial loading should still render the hero and sticky action disabled.
- Incoming pings skeleton: one compact panel skeleton, not a full-screen spinner.
- Activation result should never leave the user on an indefinite loading button.

Ping route:

- Loading: centered panel with `Loading ping`.
- Not found: `This ping is no longer available.`
- Expired/cancelled: use terminal state copy above.

Chats:

- Empty groups and people tabs should be separate.
- Unread counts should update without remounting the list.

## Accessibility

- All response actions must have accessible labels.
- The bottom sheet should trap focus while open and restore focus after dismiss where supported.
- Buttons must have at least 44px touch targets.
- Do not rely on color alone for `Yes`, `Maybe`, and `No`.
- Use readable status text with counters.

## Animation

Use restrained motion:

- Incoming banner slides/fades in and out.
- Bottom sheet uses standard spring presentation from the sheet library.
- Response success can use a small scale/fade on the result icon.
- Avoid playful animation that delays the user from replying.

## Test Coverage

Component/feature tests:

- Activities hides incoming pings for anonymous users.
- Activities shows pending pings for authenticated users.
- Activating while anonymous opens auth and returns to confirmation after sign-in.
- Activation result handles `pingCount > 0` and `pingCount = 0`.
- Incoming ping sheet sends `yes`, `maybe`, and `no`.
- `yes` response routes to group only after the backend returns a group ID.
- Chats unread badge is message-only, not pending pings.
- `/pings/[pingId]` handles pending, expired, cancelled, and not-found states.

Avoid micro-tests for every visual tuning constant. Test reusable components and the actual user flows.

## Implementation Order

1. Build presentational components for ping cards, response sheets, outgoing activation cards, and chat rows.
2. Add i18n keys for all activation ping copy.
3. Add hooks with mocked/static data adapters while backend migration is in flight.
4. Wire Activities to incoming pings and outgoing activation summaries.
5. Add `/pings/[pingId]` route and deep-link-safe response layout.
6. Wire `respondToActivationPing` once the backend function exists.
7. Wire `yes` response to `/groups/[groupId]`.
8. Update Chats group summaries and unread message counts.
9. Add push notification registration and foreground banner behavior.

## UX Decisions To Carry Forward

- First `Yes` creates a group.
- `Maybe` is low-pressure and does not create a group.
- Pending pings belong in Activities, not Chats.
- Chats badge means unread messages only.
- Sender sees response counts, not a pressure-heavy recipient list.
- No fake people in production states.
