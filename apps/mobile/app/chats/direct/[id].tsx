import { useLocalSearchParams } from "expo-router";

import { DirectChatScreen } from "@/features/chat/DirectChatScreen";

const DirectChatRoute = () => {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const conversationId = Array.isArray(id) ? id[0] : id;

  return <DirectChatScreen conversationId={conversationId ?? ""} />;
};

export default DirectChatRoute;
