import { ApolloClient, gql, HttpLink, InMemoryCache } from "@apollo/client";
import { ApolloProvider, useMutation, useQuery } from "@apollo/client/react";
import React, { useMemo, useState } from "react";
import { Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";

type Interest = {
  id: string;
  name: string;
  slug: string;
  category: string;
};

type BuzzHomeQuery = {
  interestsCollection?: {
    edges: Array<{
      node: Interest;
    }>;
  };
};

type ActivateInterestMutation = {
  activateInterest?: {
    ok?: boolean;
    message?: string;
    interestId?: string;
    matchedUsers?: unknown[];
  };
};

const fallbackInterests: Interest[] = [
  { id: "00000000-0000-0000-0000-000000000001", name: "Surfing", slug: "surfing", category: "sport" },
  { id: "00000000-0000-0000-0000-000000000002", name: "Tennis", slug: "tennis", category: "sport" },
  { id: "00000000-0000-0000-0000-000000000003", name: "Singing", slug: "singing", category: "music" },
  { id: "00000000-0000-0000-0000-000000000004", name: "Running", slug: "running", category: "fitness" },
  { id: "00000000-0000-0000-0000-000000000005", name: "Climbing", slug: "climbing", category: "fitness" },
  {
    id: "00000000-0000-0000-0000-000000000006",
    name: "Language Exchange",
    slug: "language-exchange",
    category: "learning"
  },
  { id: "00000000-0000-0000-0000-000000000007", name: "Board Games", slug: "board-games", category: "social" },
  { id: "00000000-0000-0000-0000-000000000008", name: "Coffee", slug: "coffee", category: "food" }
];

const fallbackInterestId = "00000000-0000-0000-0000-000000000001";
const tabs = ["Home", "Interests", "Settings"] as const;
const env = process.env.EXPO_PUBLIC_APP_ENV ?? "local";
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";
const graphqlUrl = supabaseUrl.replace(/\/$/, "") + "/graphql/v1";

const BUZZ_HOME_QUERY = gql`
  query BuzzHome {
    interestsCollection(first: 20) {
      edges {
        node {
          id
          name
          slug
          category
        }
      }
    }
  }
`;

const ACTIVATE_INTEREST_MUTATION = gql`
  mutation ActivateInterest($interestId: UUID!) {
    activateInterest(interestId: $interestId)
  }
`;

function createBuzzApolloClient() {
  return new ApolloClient({
    link: new HttpLink({
      uri: graphqlUrl,
      headers: {
        apikey: supabaseAnonKey,
        authorization: supabaseAnonKey ? `Bearer ${supabaseAnonKey}` : ""
      }
    }),
    cache: new InMemoryCache()
  });
}

function BuzzMobileApp() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Home");
  const [activationMessage, setActivationMessage] = useState("Tap the button to run an Apollo GraphQL mutation.");
  const { data, loading, error } = useQuery<BuzzHomeQuery>(BUZZ_HOME_QUERY);
  const [activateInterest, { loading: activating }] = useMutation<ActivateInterestMutation>(
    ACTIVATE_INTEREST_MUTATION
  );
  const interests = data?.interestsCollection?.edges.map((edge) => edge.node) ?? fallbackInterests;
  const firstInterestId = interests[0]?.id ?? fallbackInterestId;
  const connectionStatus = loading
    ? "Loading from Supabase GraphQL"
    : error
      ? "Using local fallback data until Supabase GraphQL is reachable"
      : "Connected to Supabase GraphQL";

  async function activateFirstInterest(): Promise<void> {
    try {
      const result = await activateInterest({
        variables: {
          interestId: firstInterestId
        }
      });

      const payload = result.data?.activateInterest;
      setActivationMessage(payload?.message ?? "GraphQL mutation completed.");
    } catch {
      setActivationMessage("Local fallback: authentication-backed activation is ready for Supabase Auth.");
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f6f3ea" }}>
      <ScrollView contentContainerStyle={{ padding: 24, gap: 20 }}>
        <Text style={{ fontSize: 32, fontWeight: "700", color: "#16324f" }}>Buzz</Text>
        <View style={{ flexDirection: "row", gap: 10 }}>
          {tabs.map((item) => (
            <Pressable
              key={item}
              onPress={() => setTab(item)}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 14,
                borderRadius: 999,
                backgroundColor: tab === item ? "#16324f" : "#d8cfbe"
              }}
            >
              <Text style={{ color: tab === item ? "#fff" : "#16324f" }}>{item}</Text>
            </Pressable>
          ))}
        </View>

        {tab === "Home" ? (
          <View style={{ gap: 12 }}>
            <Text style={{ fontSize: 22, fontWeight: "600", color: "#16324f" }}>
              Apollo GraphQL local development
            </Text>
            <Text>Environment: {env}</Text>
            <Text>Supabase GraphQL: {connectionStatus}</Text>
            <Pressable
              disabled={activating}
              onPress={() => {
                void activateFirstInterest();
              }}
              style={{ backgroundColor: activating ? "#9e6f42" : "#e67e22", padding: 14, borderRadius: 16 }}
            >
              <Text style={{ color: "white", fontWeight: "600" }}>
                {activating ? "Activating..." : "Activate Interest"}
              </Text>
            </Pressable>
            <Text>{activationMessage}</Text>
          </View>
        ) : null}

        {tab === "Interests" ? (
          <View style={{ gap: 10 }}>
            {interests.map((interest) => (
              <View key={interest.id} style={{ backgroundColor: "white", borderRadius: 16, padding: 14 }}>
                <Text style={{ fontSize: 18, color: "#16324f" }}>{interest.name}</Text>
                <Text style={{ color: "#536b7a" }}>{interest.category}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {tab === "Settings" ? (
          <View style={{ gap: 8 }}>
            <Text style={{ fontWeight: "600" }}>Environment Debug</Text>
            <Text>EXPO_PUBLIC_APP_ENV={env}</Text>
            <Text>EXPO_PUBLIC_SUPABASE_URL={supabaseUrl}</Text>
            <Text>GraphQL endpoint={graphqlUrl}</Text>
            <Text>Anon key={supabaseAnonKey ? "configured" : "missing"}</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

export default function App() {
  const client = useMemo(() => createBuzzApolloClient(), []);

  return (
    <ApolloProvider client={client}>
      <BuzzMobileApp />
    </ApolloProvider>
  );
}
