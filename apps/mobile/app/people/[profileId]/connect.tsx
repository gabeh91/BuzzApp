import { useLocalSearchParams } from "expo-router";

import { PeopleConnectionRequestScreen } from "@/features/people/PeopleConnectionRequestScreen";

const PeopleConnectRoute = () => {
  const params = useLocalSearchParams<{
    age?: string | string[];
    displayName?: string | string[];
    firstName?: string | string[];
    profileId?: string | string[];
    profilePhotoUrl?: string | string[];
    sharedInterests?: string | string[];
  }>();

  return <PeopleConnectionRequestScreen params={params} />;
};

export default PeopleConnectRoute;
