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
      // `pageSheet` / default modal often read full-screen on phones. `formSheet`
      // + detents uses UISheetPresentationController so the presenting screen stays
      // visibly behind the sheet and users can drag between stops.
      presentation: "formSheet",
      sheetAllowedDetents: [0.5, 1],
      sheetInitialDetentIndex: "last",
      sheetGrabberVisible: true,
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
