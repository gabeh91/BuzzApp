import { useEffect, useMemo } from "react";

import { useChatSummariesQuery } from "@graphql/generated";
import { buzzSupabase } from "@/lib/supabase";

export type ChatSummary = {
  id: string;
  kind: "direct" | "group";
  activityGroupId?: string | null;
  directConversationId?: string | null;
  otherUserId?: string | null;
  title: string;
  status: string;
  interestName?: string | null;
  lastMessageBody?: string | null;
  lastMessageAt?: string | null;
  lastMessageType?: string | null;
  unreadCount: number;
  memberCount: number;
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

const readNumber = (source: Record<string, unknown>, key: string) => {
  const value = source[key];
  return typeof value === "number" ? value : 0;
};

const normalizeChatSummary = (value: unknown): ChatSummary | null => {
  if (!isRecord(value)) return null;

  const rawKind = readString(value, "kind", "group");
  const kind = rawKind === "direct" ? "direct" : "group";
  const activityGroupId = readNullableString(value, "activityGroupId");
  const directConversationId = readNullableString(value, "directConversationId");
  const id =
    readString(value, "id") ||
    (kind === "direct" ? directConversationId : activityGroupId) ||
    "";

  if (!id) return null;
  if (kind === "group" && !activityGroupId) return null;
  if (kind === "direct" && !directConversationId) return null;

  return {
    activityGroupId,
    directConversationId,
    id,
    interestName: readNullableString(value, "interestName"),
    kind,
    lastMessageAt: readNullableString(value, "lastMessageAt"),
    lastMessageBody: readNullableString(value, "lastMessageBody"),
    lastMessageType: readNullableString(value, "lastMessageType"),
    memberCount: readNumber(value, "memberCount"),
    otherUserId: readNullableString(value, "otherUserId"),
    status: readString(value, "status", "forming"),
    title: readString(value, "title", "Activity group"),
    unreadCount: readNumber(value, "unreadCount"),
  };
};

const normalizeChatSummaries = (value: unknown): ChatSummary[] => {
  const parsedValue = parseJsonScalar(value);

  return Array.isArray(parsedValue)
    ? parsedValue.flatMap((item) => {
        const summary = normalizeChatSummary(item);
        return summary ? [summary] : [];
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

type UseChatSummariesInput = {
  enabled: boolean;
  userId?: string;
};

export const useChatSummaries = ({ enabled, userId }: UseChatSummariesInput) => {
  const channelInstanceId = useMemo(
    () => Math.random().toString(36).slice(2),
    [],
  );
  const query = useChatSummariesQuery({
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-and-network",
    skip: !enabled || !userId,
  });
  const { data, loading, refetch } = query;
  const summaries = useMemo(
    () => normalizeChatSummaries(data?.getChatSummaries),
    [data?.getChatSummaries],
  );

  useEffect(() => {
    if (!enabled || !userId) {
      return undefined;
    }

    const channel = buzzSupabase
      .channel(`chat-summaries-${userId}-${channelInstanceId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "group_messages",
        },
        () => {
          void refetch();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "direct_messages",
        },
        () => {
          void refetch();
        },
      )
      .subscribe();

    return () => {
      void buzzSupabase.removeChannel(channel);
    };
  }, [channelInstanceId, enabled, refetch, userId]);

  return {
    loading,
    refetch,
    summaries,
  };
};
