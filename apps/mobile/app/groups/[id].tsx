import { useLocalSearchParams } from "expo-router";

import { GroupScreen } from "@/features/groups/GroupScreen";

const GroupRoute = () => {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const groupId = Array.isArray(id) ? id[0] : id;

  return <GroupScreen groupId={groupId ?? "local-group"} />;
};

export default GroupRoute;
