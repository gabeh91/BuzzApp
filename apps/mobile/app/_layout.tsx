import "react-native-gesture-handler";

import { Stack } from "expo-router";
import { Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native";

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
    <GestureHandlerRootView style={styles.gestureRoot}>
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
          <Stack.Screen name="auth" options={modalOptions} />
        </Stack>
      </AppProviders>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  gestureRoot: {
    flex: 1,
  },
});

export default RootLayout;
