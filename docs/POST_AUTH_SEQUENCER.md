# Post-auth continuation (“sequencer”)

This document explains how Buzz runs **gated work after the user finishes signing in** (or unlocks a stored session), especially when that work must wait behind **other UI** first. It is written for engineers and AI agents changing mobile auth or gated flows.

## Why this exists

Some product actions are only valid for a **Supabase-authenticated** user. `requireAuth` in `BuzzAuthProvider` either:

- runs the action immediately (allowed / biometric-unlocked), or
- stores a **pending callback** in `pendingActionRef`, navigates to the auth modal (`/auth?intent=…`), and runs that callback later after success.

After the auth **modal** closes, more than one thing may still need to happen **before** the pending callback runs—for example resolving a **profile quiz overwrite** conflict. The **post-auth sequencer** centralises that ordering so we do not scatter “if overwrite then return” logic across auth screens.

## Ordered pipeline (conceptual)

| Step | Who is responsible | What happens |
|------|--------------------|----------------|
| 1 | Auth screens (`AuthStartScreen`, `AuthCodeScreen`) | User completes sign-in / OTP. Screen calls `closeAuthModal()` then `await completePendingAuthAction()`. |
| 2 | `drainPostAuthPendingAction` in `postAuthContinuation.ts` | Validates Supabase user, applies **deferring gates** (today: profile quiz overwrite), then runs the **pending gated action** if not deferred. |
| 3 | `AuthProvider` / feature code | Pending action runs (e.g. open Activities activate confirm sheet). |

**Important:** Step 1 is **not** inside the drain function. The modal must dismiss first so navigation and layout settle; the drain only models **continuation after** that.

## Key code locations

| Piece | Path | Role |
|-------|------|------|
| Gate + drain implementation | `apps/mobile/src/auth/postAuthContinuation.ts` | `drainPostAuthPendingAction`, outcomes, extension notes in file header |
| Session + pending ref + API surface | `apps/mobile/src/auth/AuthProvider.tsx` | `requireAuth`, `pendingActionRef`, `completePendingAuthAction`, `resolveProfileQuizOverwrite`, `runPendingAction` |
| Auth intent routing | `apps/mobile/src/auth/authGate.ts` | `AuthInteractionIntent`, `getAuthGateDecision` |
| Modal dismiss helper | `apps/mobile/src/auth/authNavigation.ts` | `closeAuthModal`, `useCloseAuthModal` |
| Unit tests for drain | `apps/mobile/src/auth/postAuthContinuation.test.ts` | Defer / proceed / skip behaviour |

## Outcomes (`PostAuthDrainOutcome`)

Agents extending the drain should add outcomes when adding new **defer** reasons.

| Outcome | Meaning |
|---------|---------|
| `skipped_not_supabase_user` | Current user is not a Supabase session user; nothing to drain. |
| `deferred_for_profile_quiz_overwrite` | Overwrite UI is still required; pending action **not** consumed. |
| `completed_pending_action` | `runPendingAction` ran a stored callback and it reported success (`true`). |
| `no_pending_action` | No callback was stored (or runner reported `false`). |

`completePendingAuthAction` currently returns `Promise<void>` and ignores the outcome; callers may be extended later to branch on outcome if product needs it.

## `requireAuth` contract (for new gated features)

1. Choose an **`AuthInteractionIntent`** in `authGate.ts` (or reuse an existing one if the gate policy matches).
2. Call `await requireAuth(intent, async (user, accessToken) => { … })`.
3. If the decision is **`show_auth`**, the callback is stored in `pendingActionRef` and auth opens. After the user signs in, **`completePendingAuthAction`** eventually runs the callback—**unless** a sequencer gate defers (see below).
4. If the decision is **`allow`** or biometric unlock succeeded, the callback runs immediately.

Anonymous / locked-without-biometric users hit **`show_auth`** for non-`browse` intents (see `getAuthGateDecision`).

## Profile quiz overwrite (first sequencer gate)

When `completeSession` detects a draft vs server quiz conflict, it sets `pendingProfileQuizOverwriteRef` and shows `ProfileQuizOverwritePrompt`.

- **`completePendingAuthAction`** calls `drainPostAuthPendingAction` with `isProfileQuizOverwritePending: true` when that ref is set.
- The drain returns **`deferred_for_profile_quiz_overwrite`** and does **not** clear `pendingActionRef`.
- After the user chooses overwrite vs keep, **`resolveProfileQuizOverwrite`** clears the conflict, then calls `drainPostAuthPendingAction` again with `profileQuizOverwriteResolution` set so the pending action receives `AuthenticatedActionContext`.

## Agent-oriented use cases

These are the scenarios another agent should reason about when touching auth or post-auth UI.

### A. Anonymous user taps a gated control (e.g. Activate on Activities)

1. `requireAuth("activate_interest", openConfirmCallback)` → `show_auth`, callback stored, `router.push` auth.
2. User signs in on `AuthStartScreen` / `AuthCodeScreen` → `closeAuthModal()` → `completePendingAuthAction()`.
3. **No** profile overwrite conflict → drain runs `runPendingAction` → confirm sheet opens.
4. **With** overwrite conflict → drain defers; user resolves overwrite sheet → `resolveProfileQuizOverwrite` → drain runs pending action → confirm sheet opens.

### B. Already signed-in user taps the same control

`requireAuth` → `allow` → callback runs **immediately**; sequencer is not involved.

### C. Locked device, biometrics enabled

`requireAuth` → `biometric_unlock` → user passes Face ID / fingerprint → callback runs immediately.

### D. User opens auth from a gated intent then abandons (back / close)

`pendingActionRef` may still hold the callback until another successful auth clears it or overwrites it. Product-wise this is acceptable for MVP; a future improvement could clear pending on explicit “cancel auth”.

### E. `completePendingAuthAction` called while still `loading`

`getAuthGateDecision` can return `wait` for loading; `requireAuth` does not handle `wait` explicitly and falls through—agents should not rely on draining during `loading` without checking `BuzzAuthProvider` behaviour when changing that path.

### F. Adding a second deferring gate (future)

Two extension patterns (also described in `postAuthContinuation.ts`):

1. **Same shape as profile quiz:** new `isFooPending` / `fooResolution` params, new `deferred_for_foo` outcome, new resolver in `AuthProvider` that calls drain again with resolution.
2. **Generic gate list:** optional `ReadonlyArray<PostAuthSequencerGate>` evaluated in order before `runPendingAction` (type `PostAuthSequencerGate` is exported as a hook for that future refactor).

### G. Side effects that must not block the pending action

Run them **after** `completePendingAuthAction()` resolves, or from `AuthProvider` after a successful drain, not inside the pending callback unless they must share the same transaction as opening UI.

## Activities example (reference)

`ActivitiesScreen` uses `requireAuth("activate_interest", …)` **twice**:

- **Open confirm sheet:** first gate so anonymous users never see the sheet until authed.
- **Run activation mutation:** second gate inside `confirmActivate` for defence in depth.

Both share the same intent string; the **pending** callback for the first is “open sheet”; the second runs only from the sheet’s confirm button.

## Related documentation

- `docs/PROJECT_CONTEXT.md` — product context; see Architecture Guardrails for mobile.
- `docs/ONBOARDING.md` — anonymous draft and quiz overlap with auth (if present).
- `apps/mobile/src/auth/postAuthContinuation.ts` — inline “Extending the sequencer” notes next to implementation.

## Changelog discipline

When changing defer order or outcomes:

- Update this doc and the header comment in `postAuthContinuation.ts`.
- Extend `postAuthContinuation.test.ts` for new branches.
- If `BuzzAuthState` public API changes, update `apps/mobile/src/auth/auth.types.ts` and any Jest mocks in `jest.setup.ts` that stub auth.
