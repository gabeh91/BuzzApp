import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

import { normalizeInviteToken } from "@/features/invites/inviteModel";
import { useI18n } from "@/i18n/I18nProvider";
import { routes } from "@/navigation/routes";
import { useBuzzTheme } from "@/theme/ThemeProvider";
import type { BuzzTheme } from "@/theme/tokens";

const JoinGroupInviteRoute = () => {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token?: string | string[] }>();
  const { LL } = useI18n();
  const { theme } = useBuzzTheme();
  const styles = createStyles(theme);
  const rawToken = Array.isArray(token) ? token[0] : token;
  const inviteToken = normalizeInviteToken(rawToken ?? "");

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>{LL.groups.invites.bringFriend()}</Text>
        <Text style={styles.title}>{LL.groups.invites.joinTitle()}</Text>
        <Text style={styles.body}>{inviteToken ? LL.groups.invites.joinBody() : LL.groups.invites.missingToken()}</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            router.replace(routes.home);
          }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>{LL.groups.backHome()}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const createStyles = (theme: BuzzTheme) => {
  const { colors, fontSizes, lineHeights, radii, spacing } = theme;

  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background
    },
    content: {
      flex: 1,
      gap: spacing[4],
      justifyContent: "center",
      padding: spacing[6]
    },
    eyebrow: {
      color: colors.accent,
      fontSize: fontSizes.xs,
      fontWeight: "900",
      letterSpacing: 1,
      textTransform: "uppercase"
    },
    title: {
      color: colors.text,
      fontSize: fontSizes["3xl"],
      fontWeight: "900",
      lineHeight: lineHeights.title
    },
    body: {
      color: colors.textMuted,
      fontSize: fontSizes.base,
      lineHeight: lineHeights.body
    },
    button: {
      alignItems: "center",
      backgroundColor: colors.surfaceInverse,
      borderRadius: radii.sm,
      paddingHorizontal: spacing[5],
      paddingVertical: spacing[4]
    },
    buttonText: {
      color: colors.textInverse,
      fontSize: fontSizes.base,
      fontWeight: "900"
    }
  });
};

export default JoinGroupInviteRoute;
