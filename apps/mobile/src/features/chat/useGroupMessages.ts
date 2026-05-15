import { useEffect, useState } from "react";

import type { ChatMessage } from "@/features/chat/MessageBubble";
import { buzzSupabase } from "@/lib/supabase";

type GroupMessageRow = {
  id: string;
  activity_group_id: string;
  sender_id: string;
  body: string;
  moderation_status: string;
  created_at: string;
  senderName?: string | null;
  senderPhotoUrl?: string | null;
};

type UseGroupMessagesInput = {
  groupId: string;
  currentUserId: string;
  initialMessages: ChatMessage[];
  enabled: boolean;
};

const mapGroupMessageRow = (
  row: GroupMessageRow,
  currentUserId: string,
): ChatMessage => ({
  id: row.id,
  body: row.body,
  createdAt: row.created_at,
  isOwnMessage: row.sender_id === currentUserId,
  moderationStatus: row.moderation_status,
  senderId: row.sender_id,
  senderName: row.senderName,
  senderPhotoUrl: row.senderPhotoUrl,
});

export const useGroupMessages = ({
  currentUserId,
  enabled,
  groupId,
  initialMessages,
}: UseGroupMessagesInput): ChatMessage[] => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const channel = buzzSupabase
      .channel(`group-messages-${groupId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "group_messages",
          filter: `activity_group_id=eq.${groupId}`,
        },
        (payload) => {
          const nextMessage = mapGroupMessageRow(
            payload.new as GroupMessageRow,
            currentUserId,
          );

          setMessages((current) => {
            if (current.some((message) => message.id === nextMessage.id)) {
              return current;
            }

            return [...current, nextMessage];
          });
        },
      )
      .subscribe();

    return () => {
      void buzzSupabase.removeChannel(channel);
    };
  }, [currentUserId, enabled, groupId]);

  return messages;
};
