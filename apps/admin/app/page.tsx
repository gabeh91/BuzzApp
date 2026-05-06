"use client";

import { ApolloClient, gql, HttpLink, InMemoryCache } from "@apollo/client";
import { ApolloProvider, useQuery } from "@apollo/client/react";
import { useMemo } from "react";

type Edge<T> = {
  node: T;
};

type Interest = {
  id: string;
  name: string;
  slug: string;
  category: string;
};

type Business = {
  id: string;
  name: string;
  description?: string | null;
};

type Event = {
  id: string;
  title: string;
};

type AdminDashboardQuery = {
  interestsCollection?: {
    edges: Array<Edge<Interest>>;
  };
  businessesCollection?: {
    edges: Array<Edge<Business>>;
  };
  eventsCollection?: {
    edges: Array<Edge<Event>>;
  };
};

const fallbackInterests: Interest[] = [
  { id: "interest-surfing", name: "Surfing", slug: "surfing", category: "sport" },
  { id: "interest-tennis", name: "Tennis", slug: "tennis", category: "sport" },
  { id: "interest-singing", name: "Singing", slug: "singing", category: "music" },
  { id: "interest-running", name: "Running", slug: "running", category: "fitness" }
];

const fallbackBusinesses: Business[] = [
  { id: "business-ocean-club", name: "Ocean Club", description: "Local partner placeholder" },
  { id: "business-northside-tennis", name: "Northside Tennis", description: "Local partner placeholder" },
  { id: "business-laneway-coffee", name: "Laneway Coffee", description: "Local partner placeholder" }
];

const fallbackEvents: Event[] = [
  { id: "event-welcome-picnic", title: "Welcome Picnic" },
  { id: "event-climbing-night", title: "Climbing Night" },
  { id: "event-board-game-social", title: "Board Game Social" }
];

const appEnv = process.env.NEXT_PUBLIC_APP_ENV ?? "local";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const graphqlUrl = supabaseUrl.replace(/\/$/, "") + "/graphql/v1";

const ADMIN_DASHBOARD_QUERY = gql`
  query AdminDashboard {
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
    businessesCollection(first: 10) {
      edges {
        node {
          id
          name
          description
        }
      }
    }
    eventsCollection(first: 10) {
      edges {
        node {
          id
          title
        }
      }
    }
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

function AdminDashboard() {
  const { data, loading, error } = useQuery<AdminDashboardQuery>(ADMIN_DASHBOARD_QUERY);
  const interests = data?.interestsCollection?.edges.map((edge) => edge.node) ?? fallbackInterests;
  const businesses = data?.businessesCollection?.edges.map((edge) => edge.node) ?? fallbackBusinesses;
  const events = data?.eventsCollection?.edges.map((edge) => edge.node) ?? fallbackEvents;
  const connectionStatus = loading
    ? "Loading from Supabase GraphQL"
    : error
      ? "Using local fallback data until Supabase GraphQL is reachable"
      : "Connected to Supabase GraphQL";

  return (
    <main style={{ padding: 32 }}>
      <h1>Buzz Admin</h1>
      <p>Environment: {appEnv}</p>
      <p>Supabase URL: {supabaseUrl}</p>
      <p>GraphQL endpoint: {graphqlUrl}</p>
      <p>Connection status: {connectionStatus}</p>
      <section>
        <h2>Seeded interests</h2>
        <ul>
          {interests.map((interest) => (
            <li key={interest.id}>
              {interest.name} <span style={{ color: "#667" }}>({interest.category})</span>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Sample businesses</h2>
        <ul>
          {businesses.map((business) => (
            <li key={business.id}>
              {business.name}
              {business.description ? <span style={{ color: "#667" }}> - {business.description}</span> : null}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Sample events</h2>
        <ul>
          {events.map((event) => (
            <li key={event.id}>{event.title}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}

export default function HomePage() {
  const client = useMemo(() => createBuzzApolloClient(), []);

  return (
    <ApolloProvider client={client}>
      <AdminDashboard />
    </ApolloProvider>
  );
}
