import { useRouter } from "expo-router";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import { useBuzzAuth } from "@/auth/AuthProvider";
import { useInterestFlow } from "@/features/interests/InterestFlowProvider";
import { useQuiz } from "@/features/quiz/QuizProvider";
import { routes } from "@/navigation/routes";
import { useBuzzTheme } from "@/theme/ThemeProvider";
import type { BuzzTheme } from "@/theme/tokens";

export const BuzzHomeScreen = () => {
  const router = useRouter();
  const { theme } = useBuzzTheme();
  const styles = createStyles(theme);
  const { user } = useBuzzAuth();
  const { traits } = useQuiz();
  const { state } = useInterestFlow();
  const selectedInterestName = state.selectedInterest?.name ?? "your next interest";
  const match = state.matchPreview;

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.logo}>Buzz</Text>
          <Text style={styles.city}>{user.cityName}</Text>
        </View>

        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>Local demo loop</Text>
          <Text style={styles.title}>
            {match ? `You activated ${selectedInterestName}.` : "Your onboarding state is ready."}
          </Text>
          <Text style={styles.body}>
            {match
              ? "This is the first post-onboarding route. Expo Router owns route transitions; the product flow state stays in context."
              : "Complete onboarding to generate a deterministic match preview."}
          </Text>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Match preview</Text>
          <Text style={styles.panelBody}>{match?.headline ?? "No match preview yet."}</Text>
          <Text style={styles.panelBody}>{match?.reason ?? traits.summary}</Text>
        </View>

        <Pressable
          onPress={() => {
            router.replace(routes.onboarding);
          }}
          style={styles.secondaryAction}
        >
          <Text style={styles.secondaryActionText}>Review onboarding</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: BuzzTheme) => {
  const { colors, fontSizes, lineHeights, radii, spacing, borderWidths, shadows } = theme;

  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background
    },
    content: {
      flexGrow: 1,
      padding: spacing[6],
      gap: spacing[5]
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center"
    },
    logo: {
      color: colors.text,
      fontFamily: theme.fontFamilies.display,
      fontSize: fontSizes["5xl"],
      fontWeight: "900",
      letterSpacing: -1
    },
    city: {
      color: colors.textMuted,
      fontSize: fontSizes.sm,
      fontWeight: "800",
      letterSpacing: 1.1,
      textTransform: "uppercase"
    },
    heroCard: {
      backgroundColor: colors.surface,
      borderRadius: radii["2xl"],
      padding: spacing[6],
      borderWidth: borderWidths.hairline,
      borderColor: colors.border,
      gap: spacing[3],
      ...shadows.card
    },
    eyebrow: {
      color: colors.accent,
      fontSize: fontSizes.xs,
      fontWeight: "900",
      letterSpacing: 1.3,
      textTransform: "uppercase"
    },
    title: {
      color: colors.text,
      fontFamily: theme.fontFamilies.display,
      fontSize: fontSizes.hero,
      fontWeight: "900",
      lineHeight: lineHeights.hero,
      letterSpacing: -1.1
    },
    body: {
      color: colors.textMuted,
      fontSize: fontSizes.md,
      lineHeight: lineHeights.body
    },
    panel: {
      backgroundColor: colors.surfaceMuted,
      borderRadius: radii.xl,
      padding: spacing[5],
      gap: spacing[3]
    },
    panelTitle: {
      color: colors.brand,
      fontSize: fontSizes.xl,
      fontWeight: "900"
    },
    panelBody: {
      color: colors.brand,
      fontSize: fontSizes.base,
      lineHeight: lineHeights.tight
    },
    secondaryAction: {
      alignItems: "center",
      borderRadius: radii.lg,
      borderWidth: borderWidths.hairline,
      borderColor: colors.border,
      padding: spacing[4]
    },
    secondaryActionText: {
      color: colors.text,
      fontWeight: "900"
    }
  });
};
