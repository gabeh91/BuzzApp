import { useCallback, useEffect, useMemo, useState } from "react";

import { useIncomingActivationPingsQuery } from "@graphql/generated";
import { buzzSupabase } from "@/lib/supabase";

export type IncomingActivationPing = {
  id: string;
  activationId: string;
  interestId: string;
  interestName: string;
  interestSlug?: string | null;
  existingDirectConversationId?: string | null;
  senderId: string;
  senderName: string;
  senderPhotoUrl?: string | null;
  cityId: string;
  status: "pending" | "yes" | "maybe" | "no" | "expired" | "cancelled";
  expiresAt: string;
  createdAt: string;
};

type ActivationPingRealtimeRow = {
  id: string;
  activation_id: string;
  interest_id: string;
  city_id: string;
  sender_id: string;
  recipient_id: string;
  status: IncomingActivationPing["status"];
  expires_at: string;
  created_at: string;
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

const normalizeIncomingPing = (
  value: unknown,
): IncomingActivationPing | null => {
  if (!isRecord(value)) return null;

  const id = readString(value, "id");
  const activationId = readString(value, "activationId");
  const interestId = readString(value, "interestId");
  const senderId = readString(value, "senderId");

  if (!id || !activationId || !interestId || !senderId) return null;

  return {
    id,
    activationId,
    cityId: readString(value, "cityId"),
    createdAt: readString(value, "createdAt"),
    existingDirectConversationId:
      typeof value.existingDirectConversationId === "string"
        ? value.existingDirectConversationId
        : null,
    expiresAt: readString(value, "expiresAt"),
    interestId,
    interestName: readString(value, "interestName", "this activity"),
    interestSlug:
      typeof value.interestSlug === "string" ? value.interestSlug : null,
    senderId,
    senderName: readString(value, "senderName", "Someone nearby"),
    senderPhotoUrl:
      typeof value.senderPhotoUrl === "string" ? value.senderPhotoUrl : null,
    status:
      value.status === "yes" ||
      value.status === "maybe" ||
      value.status === "no" ||
      value.status === "expired" ||
      value.status === "cancelled"
        ? value.status
        : "pending",
  };
};

const normalizeIncomingPings = (value: unknown): IncomingActivationPing[] => {
  const parsedValue = parseJsonScalar(value);

  return Array.isArray(parsedValue)
    ? parsedValue.flatMap((item) => {
        const ping = normalizeIncomingPing(item);
        return ping ? [ping] : [];
      })
    : [];
};

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

type UseIncomingActivationPingsInput = {
  enabled: boolean;
  userId?: string;
};

export const useIncomingActivationPings = ({
  enabled,
  userId,
}: UseIncomingActivationPingsInput) => {
  const channelInstanceId = useMemo(
    () => Math.random().toString(36).slice(2),
    [],
  );
  const query = useIncomingActivationPingsQuery({
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-and-network",
    skip: !enabled || !userId,
  });
  const { data, error, loading, networkStatus, refetch } = query;
  const initialPings = useMemo(
    () => normalizeIncomingPings(data?.getIncomingActivationPings),
    [data?.getIncomingActivationPings],
  );
  const [pings, setPings] = useState<IncomingActivationPing[]>(initialPings);
  const refetchIncomingPings = useCallback(async () => {
    const result = await refetch();
    setPings(normalizeIncomingPings(result.data?.getIncomingActivationPings));
  }, [refetch]);

  useEffect(() => {
    setPings(initialPings);
  }, [
    enabled,
    initialPings,
    data,
    error?.message,
    loading,
    networkStatus,
    userId,
  ]);

  useEffect(() => {
    if (!enabled || !userId) {
      return undefined;
    }

    const channel = buzzSupabase
      .channel(`activation-pings-${userId}-${channelInstanceId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "activation_pings",
          filter: `recipient_id=eq.${userId}`,
        },
        (payload) => {
          const row =
            (payload.new as ActivationPingRealtimeRow | null) ??
            (payload.old as ActivationPingRealtimeRow | null);

          if (!row?.id) return;

          if (row.status !== "pending") {
            setPings((current) =>
              current.filter((ping) => ping.id !== row.id),
            );
            return;
          }

          void refetchIncomingPings();
        },
      )
      .subscribe(() => undefined);

    return () => {
      void buzzSupabase.removeChannel(channel);
    };
  }, [channelInstanceId, enabled, refetchIncomingPings, userId]);

  return {
    loading,
    pings,
    refetch: refetchIncomingPings,
  };
};
