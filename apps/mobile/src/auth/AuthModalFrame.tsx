import { FontAwesome } from "@expo/vector-icons";
import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useBuzzTheme } from "@/theme/ThemeProvider";
import type { BuzzTheme } from "@/theme/tokens";
import { Screen, Text as UiText } from "@/ui";
import { useCloseAuthModal } from "./authNavigation";

type AuthModalFrameProps = {
  body: string;
  children: ReactNode;
  closeAccessibilityLabel?: string;
  eyebrow?: string;
  title: string;
};

export const AuthModalFrame = ({
  body,
  children,
  closeAccessibilityLabel = "Close sign-in",
  eyebrow = "Sign in to continue",
  title,
}: AuthModalFrameProps) => {
  const closeAuthModal = useCloseAuthModal();
  const { theme } = useBuzzTheme();
  const styles = createStyles(theme);

  return (
    <Screen style={styles.screen} edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardRoot}
      >
        <ScrollView
          automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
          contentContainerStyle={styles.content}
          contentInsetAdjustmentBehavior="always"
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerRow}>
            <View style={styles.headerCopy}>
              <UiText variant="eyebrow">{eyebrow}</UiText>
              <UiText variant="title" style={styles.title}>
                {title}
              </UiText>
            </View>
            <Pressable
              accessibilityLabel={closeAccessibilityLabel}
              accessibilityRole="button"
              onPress={closeAuthModal}
              style={styles.closeButton}
            >
              <FontAwesome color={theme.colors.text} name="close" size={17} />
            </Pressable>
          </View>

          <UiText variant="body" style={styles.body}>
            {body}
          </UiText>

          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
};

const createStyles = (theme: BuzzTheme) => {
  const { colors, radii, spacing } = theme;

  return StyleSheet.create({
    screen: {
      backgroundColor: colors.background,
      flex: 1,
    },
    keyboardRoot: {
      flex: 1,
    },
    content: {
      flexGrow: 1,
      gap: spacing[6],
      justifyContent: "flex-start",
      paddingBottom: spacing[16],
    },
    headerRow: {
      alignItems: "flex-start",
      flexDirection: "row",
      gap: spacing[3],
      justifyContent: "space-between",
    },
    headerCopy: {
      flex: 1,
      gap: spacing[2],
    },
    title: {
      fontSize: 40,
      lineHeight: 44,
    },
    body: {
      fontSize: 18,
      lineHeight: 27,
    },
    closeButton: {
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: radii.full,
      height: 42,
      justifyContent: "center",
      width: 42,
    },
  });
};
