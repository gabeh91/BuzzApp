import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { AppProviders } from "@/app/AppProviders";
import { colors } from "@/theme/tokens";

const RootLayout = () => {
  return (
    <AppProviders>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          gestureEnabled: true,
          contentStyle: {
            backgroundColor: colors.cream
          }
        }}
      />
    </AppProviders>
  );
};

export default RootLayout;
