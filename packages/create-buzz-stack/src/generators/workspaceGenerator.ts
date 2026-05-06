import type { BuzzStackConfig } from "../schema/configSchema.js";
import type { GeneratedFile } from "./types.js";

export function generateWorkspaceFiles(config: BuzzStackConfig): GeneratedFile[] {
  return [
    {
      path: "apps/mobile/package.json",
      contents: `{
  "name": "mobile",
  "version": "0.1.0",
  "private": true,
  "main": "index.ts",
  "scripts": {
    "start": "expo start",
    "lint": "echo \\"mobile lint placeholder\\"",
    "typecheck": "tsc --noEmit",
    "test": "echo \\"mobile tests placeholder\\""
  },
  "dependencies": {
    "@apollo/client": "latest",
    "@babel/runtime": "7.29.2",
    "@supabase/supabase-js": "latest",
    "expo": "~52.0.0",
    "graphql": "latest",
    "react": "18.3.1",
    "react-native": "0.76.3"
  },
  "devDependencies": {
    "@types/react": "latest",
    "typescript": "latest"
  }
}
`
    },
    {
      path: "apps/mobile/index.ts",
      contents: `import { registerRootComponent } from "expo";

import App from "./App";

registerRootComponent(App);
`
    },
    {
      path: "apps/mobile/tsconfig.json",
      contents: `{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "jsx": "react-jsx"
  },
  "include": ["**/*.ts", "**/*.tsx"]
}
`
    },
    {
      path: "apps/mobile/app.json",
      contents: `{
  "expo": {
    "name": "${config.mobile.appName}",
    "slug": "buzz",
    "version": "1.0.0",
    "orientation": "portrait",
    "ios": {
      "bundleIdentifier": "${config.mobile.ios.devBundleId}"
    },
    "android": {
      "package": "${config.mobile.android.devPackage}"
    }
  }
}
`
    },
    {
      path: "apps/mobile/eas.json",
      contents: `{
  "cli": {
    "version": ">= 12.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_APP_ENV": "development"
      }
    },
    "staging": {
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_APP_ENV": "staging"
      }
    },
    "production": {
      "autoIncrement": true,
      "env": {
        "EXPO_PUBLIC_APP_ENV": "production"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
`
    },
    {
      path: "apps/mobile/metro.config.js",
      contents: `const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules")
];

module.exports = config;
`
    },
    {
      path: "apps/mobile/App.tsx",
      contents: `import { ApolloClient, gql, HttpLink, InMemoryCache } from "@apollo/client";
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
const graphqlUrl = supabaseUrl.replace(/\\/$/, "") + "/graphql/v1";

const BUZZ_HOME_QUERY = gql\`
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
\`;

const ACTIVATE_INTEREST_MUTATION = gql\`
  mutation ActivateInterest($interestId: UUID!) {
    activateInterest(interestId: $interestId)
  }
\`;

function createBuzzApolloClient() {
  return new ApolloClient({
    link: new HttpLink({
      uri: graphqlUrl,
      headers: {
        apikey: supabaseAnonKey,
        authorization: supabaseAnonKey ? \`Bearer \${supabaseAnonKey}\` : ""
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
            <Text style={{ fontSize: 22, fontWeight: "600", color: "#16324f" }}>Apollo GraphQL local development</Text>
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
`
    },
    {
      path: "apps/mobile/env.d.ts",
      contents: `declare const process: {
  env: {
    EXPO_PUBLIC_APP_ENV?: string;
    EXPO_PUBLIC_SUPABASE_URL?: string;
    EXPO_PUBLIC_SUPABASE_ANON_KEY?: string;
    EXPO_PUBLIC_SENTRY_DSN?: string;
    EXPO_PUBLIC_POSTHOG_PUBLIC_KEY?: string;
    EXPO_PUBLIC_POSTHOG_HOST?: string;
  };
};
`
    },
    {
      path: "apps/admin/package.json",
      contents: `{
  "name": "admin",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "echo \\"admin lint placeholder\\"",
    "typecheck": "tsc --noEmit",
    "test": "echo \\"admin tests placeholder\\""
  },
  "dependencies": {
    "@apollo/client": "latest",
    "@supabase/supabase-js": "latest",
    "graphql": "latest",
    "next": "14.2.20",
    "react": "18.3.1",
    "react-dom": "18.3.1"
  },
  "devDependencies": {
    "@types/react": "latest",
    "@types/react-dom": "latest",
    "typescript": "latest"
  }
}
`
    },
    {
      path: "apps/admin/tsconfig.json",
      contents: `{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "jsx": "preserve",
    "plugins": [
      {
        "name": "next"
      }
    ],
    "allowJs": true,
    "noEmit": true,
    "incremental": true,
    "isolatedModules": true
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": [
    "node_modules"
  ]
}
`
    },
    {
      path: "apps/admin/next-env.d.ts",
      contents: `/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/building-your-application/configuring/typescript for more information.
`
    },
    {
      path: "apps/admin/next.config.mjs",
      contents: `/** @type {import("next").NextConfig} */
const nextConfig = {};

export default nextConfig;
`
    },
    {
      path: "apps/admin/app/layout.tsx",
      contents: `import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "Georgia, serif", background: "#f7f3e8", color: "#16324f" }}>{children}</body>
    </html>
  );
}
`
    },
    {
      path: "apps/admin/app/page.tsx",
      contents: `"use client";

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
const graphqlUrl = supabaseUrl.replace(/\\/$/, "") + "/graphql/v1";

const ADMIN_DASHBOARD_QUERY = gql\`
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
\`;

function createBuzzApolloClient() {
  return new ApolloClient({
    link: new HttpLink({
      uri: graphqlUrl,
      headers: {
        apikey: supabaseAnonKey,
        authorization: supabaseAnonKey ? \`Bearer \${supabaseAnonKey}\` : ""
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
`
    },
    {
      path: "apps/api/package.json",
      contents: `{
  "name": "api",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "node src/index.js",
    "start": "node src/index.js",
    "lint": "echo \\"api lint placeholder\\"",
    "typecheck": "echo \\"api typecheck placeholder\\"",
    "test": "echo \\"api tests placeholder\\""
  }
}
`
    },
    {
      path: "apps/api/src/index.js",
      contents: `console.log("Buzz API placeholder service");\n`
    },
    {
      path: "apps/worker/package.json",
      contents: `{
  "name": "worker",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "node src/index.js",
    "start": "node src/index.js",
    "lint": "echo \\"worker lint placeholder\\"",
    "typecheck": "echo \\"worker typecheck placeholder\\"",
    "test": "echo \\"worker tests placeholder\\""
  }
}
`
    },
    {
      path: "apps/worker/src/index.js",
      contents: `console.log("Buzz worker placeholder service");\n`
    },
    {
      path: "packages/create-buzz-stack/README.md",
      contents: "# create-buzz-stack\n\nInternal Buzz CLI for repo scaffolding, bootstrap, configuration, validation, and platform generation.\n"
    }
  ];
}
