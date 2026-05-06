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
  "main": "App.tsx",
  "scripts": {
    "start": "expo start",
    "lint": "echo \\"mobile lint placeholder\\"",
    "typecheck": "tsc --noEmit",
    "test": "echo \\"mobile tests placeholder\\""
  },
  "dependencies": {
    "@babel/runtime": "7.29.2",
    "@supabase/supabase-js": "latest",
    "expo": "~52.0.0",
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
      contents: `import React, { useMemo, useState } from "react";
import { Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";

const interests = ["Surfing", "Tennis", "Singing", "Running", "Climbing", "Language Exchange", "Board Games", "Coffee"];
const tabs = ["Home", "Interests", "Settings"] as const;

export default function App() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Home");
  const [activationMessage, setActivationMessage] = useState("Tap the button to simulate a local interest activation.");
  const env = process.env.EXPO_PUBLIC_APP_ENV ?? "local";
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321";
  const connectionStatus = useMemo(() => (supabaseUrl ? "Configured for local Supabase" : "Missing Supabase URL"), [supabaseUrl]);

  async function activateInterest(): Promise<void> {
    try {
      const response = await fetch(\`\${supabaseUrl}/functions/v1/activate-interest\`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          interestId: "00000000-0000-0000-0000-000000000001"
        })
      });

      if (!response.ok) {
        throw new Error("Local function returned a non-200 response");
      }

      const payload = (await response.json()) as { message?: string };
      setActivationMessage(payload.message ?? "Local activation completed.");
    } catch {
      setActivationMessage("Local fallback: interest activation simulated without a live Edge Function.");
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
            <Text style={{ fontSize: 22, fontWeight: "600", color: "#16324f" }}>Local development is ready</Text>
            <Text>Environment: {env}</Text>
            <Text>Supabase: {connectionStatus}</Text>
            <Pressable
              onPress={() => {
                void activateInterest();
              }}
              style={{ backgroundColor: "#e67e22", padding: 14, borderRadius: 16 }}
            >
              <Text style={{ color: "white", fontWeight: "600" }}>Activate Interest</Text>
            </Pressable>
            <Text>{activationMessage}</Text>
          </View>
        ) : null}

        {tab === "Interests" ? (
          <View style={{ gap: 10 }}>
            {interests.map((interest) => (
              <View key={interest} style={{ backgroundColor: "white", borderRadius: 16, padding: 14 }}>
                <Text style={{ fontSize: 18, color: "#16324f" }}>{interest}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {tab === "Settings" ? (
          <View style={{ gap: 8 }}>
            <Text style={{ fontWeight: "600" }}>Environment Debug</Text>
            <Text>EXPO_PUBLIC_APP_ENV={env}</Text>
            <Text>EXPO_PUBLIC_SUPABASE_URL={supabaseUrl}</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
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
    "@supabase/supabase-js": "latest",
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
      contents: `const interests = ["Surfing", "Tennis", "Singing", "Running", "Climbing", "Language Exchange", "Board Games", "Coffee"];
const businesses = ["Ocean Club", "Northside Tennis", "Laneway Coffee"];
const events = ["Welcome Picnic", "Climbing Night", "Board Game Social"];

export default function HomePage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321";
  const connectionStatus = supabaseUrl ? "Configured for local Supabase" : "Missing Supabase URL";

  return (
    <main style={{ padding: 32 }}>
      <h1>Buzz Admin</h1>
      <p>Environment: {process.env.NEXT_PUBLIC_APP_ENV ?? "local"}</p>
      <p>Supabase URL: {supabaseUrl}</p>
      <p>Connection status: {connectionStatus}</p>
      <section>
        <h2>Seeded interests</h2>
        <ul>
          {interests.map((interest) => (
            <li key={interest}>{interest}</li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Sample businesses</h2>
        <ul>
          {businesses.map((business) => (
            <li key={business}>{business}</li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Sample events</h2>
        <ul>
          {events.map((event) => (
            <li key={event}>{event}</li>
          ))}
        </ul>
      </section>
    </main>
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
