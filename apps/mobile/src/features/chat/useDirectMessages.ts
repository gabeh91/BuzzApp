import { useCallback, useEffect, useMemo, useState } from "react";
import * as Haptics from "expo-haptics";

import type { ChatMessage } from "@/features/chat/MessageBubble";
import type { ReportCategory } from "@/features/safety/safetyActions";
import { buzzSupabase } from "@/lib/supabase";

export type DirectConversationSummary = {
  id: string;
  otherUserId: string;
  otherName: string;
  otherPhotoUrl?: string | null;
  status: "active" | "closed";
};

type DirectMessageRow = {
  id: string;
  directConversationId: string;
  senderId: string;
  body: string;
  moderationStatus: string;
  createdAt: string;
};

type UseDirectMessagesInput = {
  conversationId: string;
  currentUserId: string;
  enabled: boolean;
};

export type DirectConversationReportInput = {
  category: ReportCategory;
  details?: string;
  reason: string;
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

const normalizeConversation = (
  value: unknown,
): DirectConversationSummary | null => {
  if (!isRecord(value)) return null;

  const id = readString(value, "id");
  const otherUserId = readString(value, "otherUserId");

  if (!id || !otherUserId) return null;

  return {
    id,
    otherName: readString(value, "otherName", "Buzz Member"),
    otherPhotoUrl: readNullableString(value, "otherPhotoUrl"),
    otherUserId,
    status:
      readString(value, "status", "active") === "closed" ? "closed" : "active",
  };
};

const normalizeMessageRows = (value: unknown): DirectMessageRow[] => {
  return Array.isArray(value)
    ? value.flatMap((item) => {
        if (!isRecord(item)) return [];

        const id = readString(item, "id");
        const directConversationId = readString(item, "directConversationId");
        const senderId = readString(item, "senderId");
        const body = readString(item, "body");
        const createdAt = readString(item, "createdAt");

        if (!id || !directConversationId || !senderId || !body || !createdAt) {
          return [];
        }

        return [
          {
            body,
            createdAt,
            directConversationId,
            id,
            moderationStatus: readString(item, "moderationStatus", "pending"),
            senderId,
          },
        ];
      })
    : [];
};

const mapDirectMessageRow = (
  row: DirectMessageRow,
  currentUserId: string,
): ChatMessage => ({
  body: row.body,
  createdAt: row.createdAt,
  id: row.id,
  isOwnMessage: row.senderId === currentUserId,
  moderationStatus: row.moderationStatus,
  senderId: row.senderId,
});

const triggerSendHaptic = async () => {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // Haptics can be unavailable on some simulator/device settings.
  }
};

export const useDirectMessages = ({
  conversationId,
  currentUserId,
  enabled,
}: UseDirectMessagesInput) => {
  const channelInstanceId = useMemo(
    () => Math.random().toString(36).slice(2),
    [],
  );
  const [conversation, setConversation] =
    useState<DirectConversationSummary | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [reporting, setReporting] = useState(false);
  const [sending, setSending] = useState(false);

  const appendMessageRow = useCallback(
    (row: DirectMessageRow) => {
      const nextMessage = mapDirectMessageRow(row, currentUserId);

      setMessages((current) => {
        if (current.some((message) => message.id === nextMessage.id)) {
          return current;
        }

        return [...current, nextMessage];
      });
    },
    [currentUserId],
  );

  const refetch = useCallback(async () => {
    if (!enabled || !conversationId) {
      setConversation(null);
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const { data, error: rpcError } = await buzzSupabase.rpc(
        "getDirectMessages",
        {
          conversationId,
        },
      );

      if (rpcError) {
        throw new Error(rpcError.message ?? "Unable to load messages");
      }

      const parsedData = parseJsonScalar(data);
      const parsedRecord = isRecord(parsedData) ? parsedData : {};
      const normalizedConversation = normalizeConversation(
        parsedRecord.conversation,
      );
      const normalizedMessages = normalizeMessageRows(
        parsedRecord.messages,
      ).map((message) => mapDirectMessageRow(message, currentUserId));

      setConversation(normalizedConversation);
      setError(null);
      setMessages(normalizedMessages);
    } catch (cause) {
      setConversation(null);
      setError(
        cause instanceof Error ? cause : new Error("Unable to load messages"),
      );
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [conversationId, currentUserId, enabled]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  useEffect(() => {
    if (!enabled || !conversationId) {
      return undefined;
    }

    const channel = buzzSupabase
      .channel(`direct-messages-${conversationId}-${channelInstanceId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          filter: `direct_conversation_id=eq.${conversationId}`,
          schema: "public",
          table: "direct_messages",
        },
        (payload) => {
          const row = payload.new as Record<string, unknown>;
          const messageRow = normalizeMessageRows([
            {
              body: row.body,
              createdAt: row.created_at,
              directConversationId: row.direct_conversation_id,
              id: row.id,
              moderationStatus: row.moderation_status,
              senderId: row.sender_id,
            },
          ])[0];

          if (!messageRow) return;

          appendMessageRow(messageRow);
        },
      )
      .subscribe();

    return () => {
      void buzzSupabase.removeChannel(channel);
    };
  }, [appendMessageRow, channelInstanceId, conversationId, enabled]);

  const sendMessage = useCallback(
    async (body: string) => {
      setSending(true);

      try {
        await triggerSendHaptic();

        const { data, error: rpcError } = await buzzSupabase.rpc(
          "sendDirectMessage",
          {
            body,
            conversationId,
          },
        );

        if (rpcError) {
          throw new Error(rpcError.message ?? "Unable to send message");
        }

        const parsedData = parseJsonScalar(data);
        const messageRow = normalizeMessageRows([parsedData])[0];

        if (messageRow) {
          appendMessageRow(messageRow);
        } else {
          await refetch();
        }
      } finally {
        setSending(false);
      }
    },
    [appendMessageRow, conversationId, refetch],
  );

  const reportConversation = useCallback(
    async ({ category, details, reason }: DirectConversationReportInput) => {
      setReporting(true);

      try {
        const { error: rpcError } = await buzzSupabase.rpc(
          "reportDirectConversation",
          {
            category,
            conversationId,
            details: details ?? null,
            reason,
          },
        );

        if (rpcError) {
          throw new Error(rpcError.message ?? "Unable to submit report");
        }
      } finally {
        setReporting(false);
      }
    },
    [conversationId],
  );

  const leaveConversation = useCallback(async () => {
    setLeaving(true);

    try {
      const { error: rpcError } = await buzzSupabase.rpc(
        "leaveDirectConversation",
        {
          conversationId,
        },
      );

      if (rpcError) {
        throw new Error(rpcError.message ?? "Unable to leave chat");
      }

      setConversation((current) =>
        current ? { ...current, status: "closed" } : current,
      );
    } finally {
      setLeaving(false);
    }
  }, [conversationId]);

  return {
    conversation,
    error,
    leaveConversation,
    leaving,
    loading,
    messages,
    refetch,
    reportConversation,
    reporting,
    sendMessage,
    sending,
  };
};
