import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

import type { ChatMessage } from "@/features/chat/MessageList";

type GroupMessageRow = {
  id: string;
  activity_group_id: string;
  sender_id: string;
  body: string;
  moderation_status: string;
  created_at: string;
};

type UseGroupMessagesInput = {
  groupId: string;
  currentUserId: string;
  initialMessages: ChatMessage[];
  enabled: boolean;
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

const realtimeClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false
  }
});

const mapGroupMessageRow = (row: GroupMessageRow, currentUserId: string): ChatMessage => ({
  id: row.id,
  body: row.body,
  createdAt: row.created_at,
  isOwnMessage: row.sender_id === currentUserId,
  moderationStatus: row.moderation_status
});

export const useGroupMessages = ({
  currentUserId,
  enabled,
  groupId,
  initialMessages
}: UseGroupMessagesInput): ChatMessage[] => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const channel = realtimeClient
      .channel(`group-messages-${groupId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "group_messages",
          filter: `activity_group_id=eq.${groupId}`
        },
        (payload) => {
          const nextMessage = mapGroupMessageRow(payload.new as GroupMessageRow, currentUserId);

          setMessages((current) => {
            if (current.some((message) => message.id === nextMessage.id)) {
              return current;
            }

            return [...current, nextMessage];
          });
        }
      )
      .subscribe();

    return () => {
      void realtimeClient.removeChannel(channel);
    };
  }, [currentUserId, enabled, groupId]);

  return messages;
};
