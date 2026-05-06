import React, { useMemo, useState } from "react";
import { Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";

const interests = [
  "Surfing",
  "Tennis",
  "Singing",
  "Running",
  "Climbing",
  "Language Exchange",
  "Board Games",
  "Coffee"
];

const tabs = ["Home", "Interests", "Settings"] as const;

export default function App() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Home");
  const [activationMessage, setActivationMessage] = useState("Tap the button to simulate a local interest activation.");
  const env = process.env.EXPO_PUBLIC_APP_ENV ?? "local";
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321";
  const connectionStatus = useMemo(
    () => (supabaseUrl ? "Configured for local Supabase" : "Missing Supabase URL"),
    [supabaseUrl]
  );

  async function activateInterest(): Promise<void> {
    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/activate-interest`, {
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
            <Text style={{ fontSize: 22, fontWeight: "600", color: "#16324f" }}>
              Local development is ready
            </Text>
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
