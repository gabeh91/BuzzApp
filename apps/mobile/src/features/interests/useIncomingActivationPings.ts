import { useEffect, useMemo, useState } from "react";

import { useIncomingActivationPingsQuery } from "@graphql/generated";
import { buzzSupabase } from "@/lib/supabase";

export type IncomingActivationPing = {
  id: string;
  activationId: string;
  interestId: string;
  interestName: string;
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
    expiresAt: readString(value, "expiresAt"),
    interestId,
    interestName: readString(value, "interestName", "Activity"),
    senderId,
    senderName: readString(value, "senderName", "Buzz Member"),
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

const normalizeIncomingPings = (value: unknown): IncomingActivationPing[] =>
  Array.isArray(value)
    ? value.flatMap((item) => {
        const ping = normalizeIncomingPing(item);
        return ping ? [ping] : [];
      })
    : [];

const mapRealtimeRowToPatch = (
  row: ActivationPingRealtimeRow,
): IncomingActivationPing => ({
  activationId: row.activation_id,
  cityId: row.city_id,
  createdAt: row.created_at,
  expiresAt: row.expires_at,
  id: row.id,
  interestId: row.interest_id,
  interestName: "Activity",
  senderId: row.sender_id,
  senderName: "Buzz Member",
  senderPhotoUrl: null,
  status: row.status,
});

type UseIncomingActivationPingsInput = {
  enabled: boolean;
  userId?: string;
};

export const useIncomingActivationPings = ({
  enabled,
  userId,
}: UseIncomingActivationPingsInput) => {
  const query = useIncomingActivationPingsQuery({
    skip: !enabled || !userId,
  });
  const initialPings = useMemo(
    () => normalizeIncomingPings(query.data?.getIncomingActivationPings),
    [query.data?.getIncomingActivationPings],
  );
  const [pings, setPings] = useState<IncomingActivationPing[]>(initialPings);

  useEffect(() => {
    setPings(initialPings);
  }, [initialPings]);

  useEffect(() => {
    if (!enabled || !userId) {
      return undefined;
    }

    const channel = buzzSupabase
      .channel(`activation-pings-${userId}`)
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

          setPings((current) => {
            if (row.status !== "pending") {
              return current.filter((ping) => ping.id !== row.id);
            }

            const nextPing = mapRealtimeRowToPatch(row);
            const existingIndex = current.findIndex(
              (ping) => ping.id === nextPing.id,
            );

            if (existingIndex === -1) {
              return [nextPing, ...current];
            }

            return current.map((ping, index) =>
              index === existingIndex ? { ...ping, ...nextPing } : ping,
            );
          });
        },
      )
      .subscribe();

    return () => {
      void buzzSupabase.removeChannel(channel);
    };
  }, [enabled, userId]);

  return {
    loading: query.loading,
    pings,
    refetch: query.refetch,
  };
};

