import { useCallback } from "react";

import { useRespondToActivationPingMutation } from "@graphql/generated";

export type ActivationPingResponse = "yes" | "maybe" | "no";

export type ActivationPingResponseResult = {
  ok: boolean;
  pingId: string;
  status: ActivationPingResponse;
  activityGroupId?: string | null;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const parseJsonScalar = (value: unknown): unknown => {
  if (typeof value !== "string") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const normalizeResponseResult = (
  value: unknown,
  fallbackStatus: ActivationPingResponse,
): ActivationPingResponseResult => {
  if (!isRecord(value)) {
    return {
      ok: false,
      pingId: "",
      status: fallbackStatus,
    };
  }

  return {
    activityGroupId:
      typeof value.activityGroupId === "string" ? value.activityGroupId : null,
    ok: value.ok === true,
    pingId: typeof value.pingId === "string" ? value.pingId : "",
    status:
      value.status === "yes" || value.status === "maybe" || value.status === "no"
        ? value.status
        : fallbackStatus,
  };
};

export const useRespondToActivationPing = () => {
  const [mutate, state] = useRespondToActivationPingMutation();

  const respondToPing = useCallback(
    async (pingId: string, response: ActivationPingResponse) => {
      const result = await mutate({
        variables: {
          pingId,
          response,
        },
      });

      return normalizeResponseResult(
        parseJsonScalar(result.data?.respondToActivationPing),
        response,
      );
    },
    [mutate],
  );

  return {
    error: state.error,
    loading: state.loading,
    respondToPing,
  };
};
