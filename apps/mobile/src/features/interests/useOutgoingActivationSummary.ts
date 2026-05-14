import { useEffect, useMemo } from "react";

import { useOutgoingActivationSummaryQuery } from "@graphql/generated";
import { buzzSupabase } from "@/lib/supabase";

export type ActivationResponseSummary = {
  yes: number;
  maybe: number;
  no: number;
  pending: number;
};

export type OutgoingActivationSummary = {
  activationId: string;
  interestId: string;
  interestName: string;
  status: string;
  expiresAt?: string | null;
  activityGroupId?: string | null;
  responseSummary: ActivationResponseSummary;
};

const emptyResponseSummary: ActivationResponseSummary = {
  maybe: 0,
  no: 0,
  pending: 0,
  yes: 0,
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const readString = (
  source: Record<string, unknown>,
  key: string,
  fallback = "",
) => {
  const value = source[key];
  return typeof value === "string" ? value : fallback;
};

const readNumber = (source: Record<string, unknown>, key: string) => {
  const value = source[key];
  return typeof value === "number" ? value : 0;
};

const normalizeResponseSummary = (
  value: unknown,
): ActivationResponseSummary => {
  if (!isRecord(value)) return emptyResponseSummary;

  return {
    maybe: readNumber(value, "maybe"),
    no: readNumber(value, "no"),
    pending: readNumber(value, "pending"),
    yes: readNumber(value, "yes"),
  };
};

const normalizeOutgoingActivation = (
  value: unknown,
): OutgoingActivationSummary | null => {
  if (!isRecord(value)) return null;

  const activationId = readString(value, "activationId");
  const interestId = readString(value, "interestId");

  if (!activationId || !interestId) return null;

  return {
    activationId,
    activityGroupId:
      typeof value.activityGroupId === "string" ? value.activityGroupId : null,
    expiresAt: typeof value.expiresAt === "string" ? value.expiresAt : null,
    interestId,
    interestName: readString(value, "interestName", "Activity"),
    responseSummary: normalizeResponseSummary(value.responseSummary),
    status: readString(value, "status", "active"),
  };
};

const normalizeOutgoingActivations = (
  value: unknown,
): OutgoingActivationSummary[] =>
  Array.isArray(value)
    ? value.flatMap((item) => {
        const activation = normalizeOutgoingActivation(item);
        return activation ? [activation] : [];
      })
    : [];

type UseOutgoingActivationSummaryInput = {
  enabled: boolean;
  userId?: string;
};

export const useOutgoingActivationSummary = ({
  enabled,
  userId,
}: UseOutgoingActivationSummaryInput) => {
  const query = useOutgoingActivationSummaryQuery({
    skip: !enabled || !userId,
  });
  const { data, loading, refetch } = query;
  const activations = useMemo(
    () => normalizeOutgoingActivations(data?.getOutgoingActivationSummary),
    [data?.getOutgoingActivationSummary],
  );

  useEffect(() => {
    if (!enabled || !userId) {
      return undefined;
    }

    const channel = buzzSupabase
      .channel(`activation-responses-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "activation_pings",
          filter: `sender_id=eq.${userId}`,
        },
        () => {
          void refetch();
        },
      )
      .subscribe();

    return () => {
      void buzzSupabase.removeChannel(channel);
    };
  }, [enabled, refetch, userId]);

  return {
    activations,
    loading,
    refetch,
  };
};
