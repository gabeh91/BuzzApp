import { useEffect, useMemo } from "react";

import { useChatSummariesQuery } from "@graphql/generated";
import { buzzSupabase } from "@/lib/supabase";

export type ChatSummary = {
  activityGroupId: string;
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

  const activityGroupId = readString(value, "activityGroupId");
  if (!activityGroupId) return null;

  return {
    activityGroupId,
    interestName: readNullableString(value, "interestName"),
    lastMessageAt: readNullableString(value, "lastMessageAt"),
    lastMessageBody: readNullableString(value, "lastMessageBody"),
    lastMessageType: readNullableString(value, "lastMessageType"),
    memberCount: readNumber(value, "memberCount"),
    status: readString(value, "status", "forming"),
    title: readString(value, "title", "Activity group"),
    unreadCount: readNumber(value, "unreadCount"),
  };
};

const normalizeChatSummaries = (value: unknown): ChatSummary[] =>
  Array.isArray(value)
    ? value.flatMap((item) => {
        const summary = normalizeChatSummary(item);
        return summary ? [summary] : [];
      })
    : [];

type UseChatSummariesInput = {
  enabled: boolean;
  userId?: string;
};

export const useChatSummaries = ({ enabled, userId }: UseChatSummariesInput) => {
  const query = useChatSummariesQuery({
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
      .channel(`chat-summaries-${userId}`)
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
      .subscribe();

    return () => {
      void buzzSupabase.removeChannel(channel);
    };
  }, [enabled, refetch, userId]);

  return {
    loading,
    refetch,
    summaries,
  };
};
