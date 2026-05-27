# Realtime Activation Pings Spec

Source: Buzz MVP Screen Specification PDF, especially Screen 9 Activate, Screen 10 Activation Response, Screen 11 Activity Group, and Screen 13 Chats.

## Goal

When a user activates an interest, Buzz should broadcast that intent to compatible authenticated users in the same city, let recipients respond in realtime, and turn positive responses into an activity group with live messages.

The product loop should feel like:

1. User picks an interest in Activities and confirms the ping.
2. Compatible people receive a realtime in-app ping, and later a push notification.
3. Recipients choose `Yes`, `Maybe`, or `Not for me`.
4. The first `Yes` creates or opens an activity group because the initiator plus one respondent is enough to coordinate.
5. Group chat updates live through Supabase Realtime.

Anonymous users can browse people and activities, but they cannot send pings, receive user-specific pings, respond, or join groups until authenticated.

## Current Codebase Fit

Already present:

- `interest_activations` stores active user interest signals.
- `match_candidates` stores deterministic matches for an activation.
- `activateInterest(interestId)` creates or refreshes an activation and upserts match candidates.
- `activity_groups`, `activity_group_members`, and `group_messages` exist.
- `useGroupMessages` subscribes to realtime inserts on `group_messages`.
- Activities tab has a confirm/success sheet around activation.

Missing:

- A first-class per-recipient ping table.
- Recipient response state separate from generic match candidate state.
- Realtime subscriptions for incoming pings and outgoing activation responses.
- Backend function to respond to a ping and create/join a group atomically.
- Push notification outbox/device token model.
- Chat list summaries and unread counts driven by real message state.

## Product Naming

Use the app's current tab language rather than the PDF's older labels:

- `Discover` is the People/Home feed.
- `Activities` is the Activate/Big Button flow.
- `Chats` contains group and direct conversations.
- `Profile` contains account, quiz/profile state, and availability controls.

## Data Model

### `activation_pings`

Create a durable row for each recipient of an activation.

```sql
create table public.activation_pings (
  id uuid primary key default gen_random_uuid(),
  activation_id uuid not null references public.interest_activations(id) on delete cascade,
  match_candidate_id uuid references public.match_candidates(id) on delete set null,
  interest_id uuid not null references public.interests(id) on delete cascade,
  city_id uuid not null references public.cities(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  activity_group_id uuid references public.activity_groups(id) on delete set null,
  status text not null default 'pending',
  delivered_at timestamptz,
  responded_at timestamptz,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint activation_pings_status_check
    check (status in ('pending', 'yes', 'maybe', 'no', 'expired', 'cancelled')),
  constraint activation_pings_no_self_ping_check
    check (sender_id <> recipient_id),
  unique (activation_id, recipient_id)
);
```

Indexes:

- `(recipient_id, status, created_at desc)` for incoming pings.
- `(sender_id, created_at desc)` for outgoing activation updates.
- `(activation_id, status)` for response counts.
- `(activity_group_id)` for group joins.

### `activation_ping_events`

Optional but useful for analytics, debugging, and audit.

```sql
create table public.activation_ping_events (
  id uuid primary key default gen_random_uuid(),
  ping_id uuid not null references public.activation_pings(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint activation_ping_events_type_check
    check (event_type in ('created', 'delivered', 'responded', 'group_created', 'group_joined', 'expired', 'cancelled'))
);
```

### `notification_outbox`

Queue push work instead of sending directly from client code.

```sql
create table public.notification_outbox (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending',
  provider_message_id text,
  error text,
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  constraint notification_outbox_status_check
    check (status in ('pending', 'sent', 'failed', 'skipped'))
);
```

### `profile_devices`

Needed before real push notifications can ship.

```sql
create table public.profile_devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  platform text not null,
  expo_push_token text not null,
  push_enabled boolean not null default true,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, expo_push_token)
);
```

### Existing Table Extensions

- Add `metadata jsonb not null default '{}'::jsonb` to `group_messages`.
- Add `source_ping_id uuid references public.activation_pings(id)` to `activity_group_members`.
- Keep `group_messages.message_type = 'system'` for activation events rather than adding new message types for MVP.

## Backend Functions

### `activateInterest(interestId uuid)`

Extend the current function rather than replacing the concept.

Responsibilities:

- Require auth and profile.
- Resolve `city_id` from the authenticated profile, falling back only through city config.
- Create or refresh the user's `interest_activations` row.
- Reuse the current deterministic matching rules:
  - same city,
  - visible and not settled,
  - same interest,
  - availability overlap,
  - personality proximity,
  - block/report/moderation exclusions.
- Upsert `match_candidates`.
- Upsert `activation_pings` for eligible recipients in the same transaction.
- Queue `notification_outbox` rows for pending pings.
- Enforce activation rate limits server-side before creating pings:
  - one activation attempt per user and interest every 10 minutes,
  - 20 total activation attempts per user per rolling 24 hours.
- Return:

```ts
type ActivationPingResult = {
  ok: true;
  activationId: string;
  interestId: string;
  interestName: string;
  pingCount: number;
  expiresAt: string;
  responseSummary: {
    yes: number;
    maybe: number;
    no: number;
    pending: number;
  };
};
```

Rate-limited responses return `ok: false`, a stable `code` (`rate_limited_activity` or `rate_limited_daily`), and `retryAfterSeconds` so the client can show useful copy without guessing.

Do not return fake people in production. Local/demo seed data may create test recipients, but the hosted project should only return real matched profiles.

### `respondToActivationPing(pingId uuid, response text)`

New `security definer` function.

Rules:

- Require auth.
- Only the ping recipient can respond.
- Only pending, non-expired pings can be answered.
- Valid responses: `yes`, `maybe`, `no`.
- Response must be idempotent if the same response is retried after a network failure.

`yes` behavior:

- Find or create one `activity_groups` row for the activation.
- Add the sender and recipient to `activity_group_members`.
- Set `activation_pings.status = 'yes'`.
- Set `activation_pings.activity_group_id`.
- Set linked `match_candidates.status = 'accepted'`.
- Insert a system `group_messages` row, with metadata containing `pingId`, `activationId`, and `interestId`.
- Return the `activityGroupId` and a lightweight group summary.

`maybe` behavior:

- Set `activation_pings.status = 'maybe'`.
- Set linked `match_candidates.status = 'pending'`.
- Notify the sender in realtime through response summary updates, but do not push loudly.

`no` behavior:

- Set `activation_pings.status = 'no'`.
- Set linked `match_candidates.status = 'declined'`.
- Do not notify the sender with a prominent UI interruption.

### Read Models

Expose these through GraphQL views or explicit functions:

- `getIncomingActivationPings()` returns pending pings for the current user with safe sender profile fields.
- `getOutgoingActivationSummary()` returns active activations and response counts for the current user.
- `getChatSummaries()` returns group/direct chat rows with last message, timestamp, member avatars, and unread count.

## Realtime Channels

Realtime should patch already-fetched state. Initial data must still come from normal queries on app launch and foreground.

### MVP Technical Approach

Use GraphQL for the source-of-truth reads and mutations:

- `getIncomingActivationPings()` fetches pending pings for the signed-in recipient.
- `getOutgoingActivationSummary()` fetches the sender's active activations and response counts.
- `respondToActivationPing(pingId, response)` applies `yes`, `maybe`, or `no` and returns the next group context when relevant.
- `getChatSummaries()` fetches group chat summaries after accepted pings form a group.

Use Supabase Realtime only as a live patch signal. Realtime callbacks should refetch or patch state already backed by the GraphQL functions; they should not become the only source of truth. This keeps app reload, hard refresh, and background/foreground recovery reliable.

Supabase GraphQL can return JSONB function results as stringified JSON scalars. Mobile hooks must accept both object/array values and stringified JSON, parse defensively, and normalize into typed feature models before rendering.

The mobile app owns one global `ActivationPingInboxSingleton` under `AppProviders`. It creates one incoming-ping subscription per authenticated user session, exposes the pending backlog through context, and renders a single app-level nudge wherever the user currently is. Feature screens should consume that provider rather than creating independent ping subscriptions.

High-volume behavior:

- Do not show one modal/sheet per incoming ping.
- Show at most one global nudge per user session/app launch.
- Keep all pending pings available in `Chats > Requests`.
- The global nudge can say that more pings are waiting and route to the backlog.
- Dismissal suppresses further global nudges for that user session, but it must not delete or hide pending pings from the backlog.

Future backend lifecycle fields should include `seen_at`, `dismissed_at`, and `last_prompted_at` so the server can coordinate prompt frequency across devices.

### Expiry Semantics

Activity pings are ephemeral current intent. MVP activity pings expire through `activation_pings.expires_at` and `getIncomingActivationPings()` must only return rows where `status = 'pending'` and `expires_at > now()`.

Say Hi connection requests are longer-lived, but not permanent. MVP connection requests expire after 14 days through `connection_requests.expires_at`; `getConnectionRequests()` must only return rows where `status = 'pending'` and `expires_at > now()`.

Foreground nudges are stricter than inbox visibility. The app should only interrupt for fresh items, currently those created within 48 hours. Older valid pending items can remain in `Chats > Requests` without opening the global nudge on app launch.

### Future Priority Score

Consider adding `priority_score numeric` to `activation_pings` or to a computed ping inbox read model. This is business-owned matching/ranking logic, so the backend should remain the source of truth and the client should only sort/display the normalized result.

MVP can leave `priority_score` nullable. When added, inbox ordering should be:

1. `priority_score desc nulls last`
2. `created_at desc`

Potential score inputs:

- compatibility score from quiz traits,
- suburb/city proximity and current location fit,
- shared interest strength and activity rarity,
- sender/recipient freshness and recent activity,
- prior positive interactions,
- safety/trust signals,
- group capacity and whether a plan is already close to viable.

Do not expose the raw score in UI. User-facing copy should explain concrete reasons, not ranking mechanics.

### Incoming Pings

Hook/provider: `ActivationPingInboxSingleton` using `useIncomingActivationPings`.

Subscribe:

```ts
channel(`activation-pings-${userId}`)
  .on("postgres_changes", {
    event: "*",
    schema: "public",
    table: "activation_pings",
    filter: `recipient_id=eq.${userId}`
  }, handlePingPatch)
```

Use this to show:

- one app-level ping nudge if the app is foregrounded,
- a pending backlog in `Chats > Requests`,
- a deep-link target when opened from push.

### Outgoing Activation Responses

Hook: `useActivationResponses`.

Subscribe:

```ts
channel(`activation-responses-${userId}`)
  .on("postgres_changes", {
    event: "*",
    schema: "public",
    table: "activation_pings",
    filter: `sender_id=eq.${userId}`
  }, handleResponsePatch)
```

Use this to update:

- "Pinged X people" confirmation state,
- response counts on the active activity,
- the prompt to open a group once someone says yes.

### Group Messages

Keep the existing `useGroupMessages` pattern for `group_messages`, but ensure system messages render cleanly and chat lists update unread state.

## Mobile UX

### Activities Tab

Primary activation flow:

1. User selects one of their interests.
2. Big yellow activate button opens a bottom sheet:
   - Title: `Ping people for {interest}?`
   - Body: `{count} nearby people are open to this too.`
   - Primary: `Ping them`
   - Secondary: `Not now`
3. Success state:
   - Title: `Pinged {count} people`
   - Body: `We'll let you know who's keen.`
   - Primary: `Done`

If `count = 0`, do not fake recipients:

- Title: `No one to ping yet`
- Body: `Keep {interest} active and Buzz will watch for new matches.`

### Incoming Ping Surface

Use a proper bottom sheet, not React Native's primitive modal.

Content:

- sender avatar and first name,
- headline: `{name} wants to do {interest}. Keen?`
- context line: shared city, shared interest, or compatibility reason,
- actions:
  - `Yes, I'm in`
  - `Maybe`
  - `Not for me`
- link/button: `View profile`.

If the app is opened from a push notification, route to `/pings/[pingId]` and present the same sheet content in a full route-safe layout.

### Chats Tab

- `Groups` shows activity groups created from accepted pings.
- `Requests` shows pending ping responses and direct connection requests.
- Chat unread dots should only represent unread messages, not generic pending pings.
- Pending pings should not generate unlimited global interruptions. They should remain actionable in the Requests backlog.

### Group Screen

When a recipient says yes:

- Open the activity group route.
- Show a system message like `{name} is in for {interest}.`
- Keep text messages realtime through `useGroupMessages`.
- Later MVP work can add `Suggest a time` and `Suggest a place` polls.

## Push Notifications

Push is critical to the intended feel, but the source of truth stays in Postgres.

MVP sequence:

1. Register Expo push tokens into `profile_devices`.
2. Insert `notification_outbox` rows when pings are created.
3. Send notifications from an Edge Function or scheduled worker.
4. Mark outbox rows `sent`, `failed`, or `skipped`.
5. Deep link to `/pings/[pingId]`.

Notification copy:

- Title: `{name} wants to do {interest}`
- Body: `Keen?`

## RLS And Safety

`activation_pings`:

- Sender can read pings they sent, including response status.
- Recipient can read pings addressed to them.
- Recipient can update only their own response through `respondToActivationPing`; direct table updates should not be granted.
- Inserts should happen only through `activateInterest`.

`notification_outbox`:

- Clients should not write directly.
- Users do not need to read raw outbox rows for MVP.

Safety requirements:

- Exclude blocked, reported, moderated, hidden, and settled users from new pings.
- If either party blocks the other after a ping, pending pings should become `cancelled`.
- Expired pings should not be answerable.

## Edge Cases

- Re-activating the same interest should refresh the current active activation and expire old pending pings that are no longer valid.
- Duplicate network submissions should return the existing response/group result.
- If the group reaches max size, further `yes` responses should either join a waitlist or return a clear "group full" result. For MVP, prefer returning a friendly full-state and leaving the ping as `maybe`.
- If push delivery fails, in-app realtime and foreground fetch still show the ping.
- If a recipient is anonymous, they cannot receive pings because there is no stable user identity.
- If a sender hides their profile or marks themselves settled, pending pings should be cancelled.

## Tests

Backend:

- Migration test or SQL smoke test for new tables, constraints, and indexes.
- `activateInterest` creates match candidates, activation pings, and outbox rows.
- `activateInterest` excludes blocked/reported/hidden/settled users.
- `respondToActivationPing('yes')` creates group membership and a system message.
- `respondToActivationPing('maybe'|'no')` updates status without creating a group.
- RLS prevents unrelated users from reading pings.

Mobile:

- `useActivationPings` patches incoming ping state without duplicating rows.
- `useActivationResponses` updates outgoing counts.
- Incoming ping sheet renders all three response actions.
- Activities success handles both `pingCount > 0` and `pingCount = 0`.
- Chats unread dot is based on unread messages only.

## Implementation Order

1. Add `activation_pings`, `activation_ping_events`, `notification_outbox`, `profile_devices`, and small table extensions.
2. Extend `activateInterest` to create pings and outbox rows.
3. Add `respondToActivationPing`.
4. Add GraphQL/read models for incoming pings, outgoing activation summaries, and chat summaries.
5. Add mobile hooks for incoming pings and outgoing response summaries.
6. Build the incoming ping bottom sheet and `/pings/[pingId]` route.
7. Connect `yes` responses to group creation and live chat.
8. Register Expo push tokens and process `notification_outbox`.
9. Add analytics around activation, delivery, response, group creation, and first group message.

## Open Decisions

- Should `Maybe` expire automatically with the ping, or should it remain as a lightweight follow-up state?
- Should a new group be created on the first `Yes`, or only after two recipients say yes? Recommendation: first `Yes`, because sender plus recipient is already a two-person group.
- Should outgoing activation summaries show recipient names before they respond? Recommendation: count only, to keep the flow low-pressure.
- Should pending incoming pings appear in Activities only, or also as a lightweight top card in Discover? Recommendation: Activities only plus push/deep link.
