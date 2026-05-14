import { useCallback, useMemo } from "react";

import { useActivateInterestMutation, useBuzzHomeQuery } from "@graphql/generated";
import { useBuzzAuth } from "@/auth/AuthProvider";
import { useI18n } from "@/i18n/I18nProvider";
import { useToast } from "@/ui";

import { useInterestFlow } from "@/features/interests/InterestFlowProvider";
import {
  isBackendActivationResult,
  parseActivateInterestJsonScalar,
  shouldActivateInterestThroughSupabase,
  type BuzzInterest,
} from "@/features/interests/interestFlow";
import { getInterestsFromGraphql } from "@/features/onboarding/onboardingInterests";

/**
 * Shared GraphQL interests list + activation mutation wired to {@link InterestFlowProvider}.
 * Used by Discover and Activities so selection and activation stay in one store.
 */
export const useActivateInterestActions = () => {
  const { LL } = useI18n();
  const { isAuthenticated, requireAuth } = useBuzzAuth();
  const { showToast } = useToast();
  const interestFlow = useInterestFlow();
  const { data } = useBuzzHomeQuery();
  const [activateInterest] = useActivateInterestMutation();

  const interests = useMemo(() => getInterestsFromGraphql(data), [data]);

  const selectedInterest = interestFlow.state.selectedInterest;
  const activationBusy = interestFlow.state.activation.status === "activating";

  const handleSelectInterest = useCallback(
    (interest: BuzzInterest) => {
      interestFlow.select(interest);
    },
    [interestFlow],
  );

  const handleClearSelectedInterest = useCallback(() => {
    interestFlow.clearSelection();
  }, [interestFlow]);

  const confirmActivate = useCallback(
    async (closeSheet: () => void) => {
      const selected = interestFlow.state.selectedInterest;

      if (!selected || interestFlow.state.activation.status === "activating") {
        return;
      }

      await requireAuth("activate_interest", async (authUser) => {
        interestFlow.markActivating();
        closeSheet();

        try {
          if (shouldActivateInterestThroughSupabase(authUser)) {
            const response = await activateInterest({
              variables: { interestId: selected.id },
            });

            if (response.errors?.length) {
              throw new Error(
                response.errors.map((graphError) => graphError.message).join("; "),
              );
            }

            const payload = parseActivateInterestJsonScalar(
              response.data?.activateInterest,
            );

            if (!isBackendActivationResult(payload)) {
              throw new Error("Activation response was invalid");
            }

            interestFlow.completeBackendActivation(payload);
            showToast({
              message: LL.activities.activate.pingSentToastWithCount({
                count: payload.matchCandidates.length,
                interest: selected.name,
              }),
            });
          } else {
            interestFlow.completeLocalActivation();
            showToast({
              message: LL.activities.activate.pingSentToast(),
            });
          }
        } catch {
          interestFlow.failActivation(LL.interests.activation.failed());
        }
      });
    },
    [
      activateInterest,
      interestFlow,
      LL,
      requireAuth,
      showToast,
    ],
  );

  const handleActivateSelectedInterest = useCallback(async () => {
    if (!selectedInterest || activationBusy) {
      return;
    }

    if (!isAuthenticated) {
      await requireAuth("activate_interest", async () => undefined);
      return;
    }

    await confirmActivate(() => undefined);
  }, [
    activationBusy,
    confirmActivate,
    isAuthenticated,
    requireAuth,
    selectedInterest,
  ]);

  return {
    activationBusy,
    confirmActivate,
    handleActivateSelectedInterest,
    handleClearSelectedInterest,
    handleSelectInterest,
    interests,
    selectedInterest,
  };
};
