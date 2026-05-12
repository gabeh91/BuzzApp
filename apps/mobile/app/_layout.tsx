import { Stack } from "expo-router";
import { Platform } from "react-native";
import { StatusBar } from "expo-status-bar";

import { AppProviders } from "@/providers/AppProviders";
import { colors } from "@/theme/tokens";

export const unstable_settings = {
  initialRouteName: "index",
};

export const modalOptions = {
  ...Platform.select({
    ios: {
      presentation: "modal",
    },
    android: {
      presentation: "containedTransparentModal",
      animation: "fade_from_bottom",
    },
  }),
};

const RootLayout = () => {
  return (
    <AppProviders>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: colors.cream,
          },
        }}
      >
        <Stack.Screen
          name="auth"
          options={modalOptions}
        />
      </Stack>
    </AppProviders>
  );
};

export default RootLayout;
