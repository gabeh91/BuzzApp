import type {
  AuthenticatedActionContext,
  BuzzAuthUser,
  ProfileQuizOverwriteDecision,
} from "./auth.types";

/**
 * After the auth UI is dismissed, up to three things may need to happen, in order:
 *
 * 1. **Session is Supabase-authenticated** — otherwise there is no pending action to drain.
 * 2. **Profile quiz overwrite** — if required, we defer the pending action until the user
 *    resolves the overwrite sheet (`resolveProfileQuizOverwrite`), then call this again
 *    with `profileQuizOverwriteResolution` set.
 * 3. **Pending gated action** — e.g. open the Activities activate confirmation sheet.
 *
 * Auth screens should dismiss the modal (`closeAuthModal`) before calling
 * `completePendingAuthAction`, which invokes this drain.
 *
 * **Human/agent guide:** `docs/POST_AUTH_SEQUENCER.md`
 *
 * ## Extending the sequencer
 *
 * - **Another blocking sheet / gate (like profile quiz overwrite)**  
 *   Add parallel inputs to {@link DrainPostAuthPendingActionParams} (e.g. `isFooPending` +
 *   optional `fooResolution`), extend {@link PostAuthDrainOutcome} with a `deferred_for_foo`
 *   variant, and branch in {@link drainPostAuthPendingAction} before `runPendingAction`.  
 *   Add a resolver in `AuthProvider` (like `resolveProfileQuizOverwrite`) that clears the gate
 *   then calls `drainPostAuthPendingAction` again with the resolution filled in.
 *
 * - **Ordered hooks without new outcomes yet**  
 *   Prefer adding an optional `ReadonlyArray<PostAuthSequencerGate>` parameter to this module
 *   and loop: first `"defer"` wins; otherwise continue. That keeps gates “drop-in” without
 *   editing the core branch logic each time.
 *
 * - **Work that is not “defer pending action”** (e.g. fire-and-forget analytics)  
 *   Run it from `AuthProvider` after a successful drain, or from the auth screen after
 *   `completePendingAuthAction()`, depending on whether it must see the drained outcome.
 */
export type PostAuthDrainOutcome =
  | "skipped_not_supabase_user"
  | "deferred_for_profile_quiz_overwrite"
  | "completed_pending_action"
  | "no_pending_action";

/**
 * Future “drop-in” gate: async check that may defer running the pending action until a later
 * drain call (after the user resolves some UI). Not invoked yet — use when a second
 * deferrable step is added, or thread through `drainPostAuthPendingAction` as `extraGates`.
 */
export type PostAuthSequencerGate = (input: {
  user: BuzzAuthUser;
  accessToken: string | undefined;
}) => Promise<"proceed" | "defer">;

export type DrainPostAuthPendingActionParams = {
  user: BuzzAuthUser;
  /** Pass `undefined` when no session token is available yet. */
  accessToken: string | undefined;
  /** True while the profile-quiz overwrite gate is still active. */
  isProfileQuizOverwritePending: boolean;
  /**
   * When draining right after the user chose overwrite vs keep, pass the decision so the
   * pending action receives `AuthenticatedActionContext`.
   */
  profileQuizOverwriteResolution?: ProfileQuizOverwriteDecision;
  /** Consumes and runs the pending action if any. Returns whether an action ran. */
  runPendingAction: (
    user: BuzzAuthUser,
    accessToken?: string,
    context?: AuthenticatedActionContext,
  ) => Promise<boolean>;
};

export const drainPostAuthPendingAction = async ({
  user,
  accessToken,
  isProfileQuizOverwritePending,
  profileQuizOverwriteResolution,
  runPendingAction,
}: DrainPostAuthPendingActionParams): Promise<PostAuthDrainOutcome> => {
  if (user.authSource !== "supabase") {
    return "skipped_not_supabase_user";
  }

  const deferredForOverwrite =
    isProfileQuizOverwritePending && profileQuizOverwriteResolution === undefined;

  if (deferredForOverwrite) {
    return "deferred_for_profile_quiz_overwrite";
  }

  const context: AuthenticatedActionContext | undefined =
    profileQuizOverwriteResolution === undefined
      ? undefined
      : { profileQuizOverwriteDecision: profileQuizOverwriteResolution };

  const ran = await runPendingAction(user, accessToken, context);
  return ran ? "completed_pending_action" : "no_pending_action";
};
