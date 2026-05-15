import { useCallback, useEffect, useMemo, useState } from "react";

import { buzzSupabase } from "@/lib/supabase";

export type ConnectionRequestSummary = {
  id: string;
  requesterId: string;
  recipientId: string;
  otherUserId: string;
  otherName: string;
  otherPhotoUrl?: string | null;
  message?: string | null;
  status: "pending";
  expiresAt: string;
  createdAt: string;
};

export type ConnectionRequestResponse = "accepted" | "declined";

export type ConnectionRequestResponseResult = {
  ok: boolean;
  connectionRequestId: string;
  directConversationId?: string | null;
  requesterId: string;
  recipientId: string;
  status: ConnectionRequestResponse;
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

const readNullableString = (source: Record<string, unknown>, key: string) => {
  const value = source[key];
  return typeof value === "string" ? value : null;
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

const normalizeConnectionRequest = (
  value: unknown,
): ConnectionRequestSummary | null => {
  if (!isRecord(value)) return null;

  const id = readString(value, "id");
  const requesterId = readString(value, "requesterId");
  const recipientId = readString(value, "recipientId");
  const otherUserId = readString(value, "otherUserId");

  if (!id || !requesterId || !recipientId || !otherUserId) return null;

  return {
    createdAt: readString(value, "createdAt"),
    expiresAt: readString(value, "expiresAt"),
    id,
    message: readNullableString(value, "message"),
    otherName: readString(value, "otherName", "Buzz Member"),
    otherPhotoUrl: readNullableString(value, "otherPhotoUrl"),
    otherUserId,
    recipientId,
    requesterId,
    status: "pending",
  };
};

const normalizeConnectionRequests = (
  value: unknown,
): ConnectionRequestSummary[] => {
  const parsedValue = parseJsonScalar(value);

  return Array.isArray(parsedValue)
    ? parsedValue.flatMap((item) => {
        const request = normalizeConnectionRequest(item);
        return request ? [request] : [];
      })
    : [];
};

const normalizeConnectionRequestResponse = (
  value: unknown,
  fallbackStatus: ConnectionRequestResponse,
): ConnectionRequestResponseResult => {
  if (!isRecord(value)) {
    return {
      connectionRequestId: "",
      directConversationId: null,
      ok: false,
      recipientId: "",
      requesterId: "",
      status: fallbackStatus,
    };
  }

  return {
    connectionRequestId: readString(value, "connectionRequestId"),
    directConversationId: readNullableString(value, "directConversationId"),
    ok: value.ok === true,
    recipientId: readString(value, "recipientId"),
    requesterId: readString(value, "requesterId"),
    status:
      value.status === "accepted" || value.status === "declined"
        ? value.status
        : fallbackStatus,
  };
};

type UseConnectionRequestsInput = {
  enabled: boolean;
  userId?: string;
};

export const useConnectionRequests = ({
  enabled,
  userId,
}: UseConnectionRequestsInput) => {
  const channelInstanceId = useMemo(
    () => Math.random().toString(36).slice(2),
    [],
  );
  const [loading, setLoading] = useState(false);
  const [responding, setResponding] = useState(false);
  const [requests, setRequests] = useState<ConnectionRequestSummary[]>([]);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (!enabled || !userId) {
      setRequests([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await buzzSupabase.rpc("getConnectionRequests");

      if (error) {
        throw new Error(error.message ?? "Unable to load connection requests");
      }

      const normalizedRequests = normalizeConnectionRequests(data);
      setError(null);
      setRequests(normalizedRequests);
    } catch (cause) {
      const nextError =
        cause instanceof Error
          ? cause
          : new Error("Unable to load connection requests");

      setError(
        nextError,
      );
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [enabled, userId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  useEffect(() => {
    if (!enabled || !userId) {
      return undefined;
    }

    const channel = buzzSupabase
      .channel(`connection-requests-${userId}-${channelInstanceId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          filter: `recipient_id=eq.${userId}`,
          schema: "public",
          table: "connection_requests",
        },
        () => {
          void refetch();
        },
      )
      .subscribe(() => undefined);

    return () => {
      void buzzSupabase.removeChannel(channel);
    };
  }, [channelInstanceId, enabled, refetch, userId]);

  const respondToConnectionRequest = useCallback(
    async (
      requestId: string,
      response: ConnectionRequestResponse,
    ): Promise<ConnectionRequestResponseResult> => {
      setResponding(true);

      try {
        const { data, error } = await buzzSupabase.rpc(
          "respondConnectionRequest",
          {
            requestId,
            response,
          },
        );

        if (error) {
          throw new Error(error.message ?? "Unable to update request");
        }

        const result = normalizeConnectionRequestResponse(data, response);
        await refetch();
        return result;
      } finally {
        setResponding(false);
      }
    },
    [refetch],
  );

  return {
    error,
    loading,
    refetch,
    responding,
    respondToConnectionRequest,
    requests,
  };
};
