import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { useMemo } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";

import { useBuzzTheme } from "@/theme/ThemeProvider";
import type { BuzzTheme } from "@/theme/tokens";
import { Text } from "@/ui";

import type { BuzzInterest } from "@/features/interests/interestFlow";

type InterestToggleGridProps = {
  interests: BuzzInterest[];
  onSelectInterest: (interest: BuzzInterest) => void;
  /** Empty string when nothing is selected. */
  selectedInterestId: string;
};

const ACTIVITY_CARD_MIN_HEIGHT = 112;
const ACTIVITY_CARD_LINE_HEIGHT = 19;
const ACTIVITY_CARD_ESTIMATED_CHARS_PER_LINE = 11;

const titleCaseCategory = (category: string) =>
  category
    ? category.charAt(0).toUpperCase() + category.slice(1).replaceAll("_", " ")
    : "";

const activityIconForInterest = (
  interest: BuzzInterest,
): ComponentProps<typeof Ionicons>["name"] => {
  const key = `${interest.slug} ${interest.name}`.toLowerCase();

  if (key.includes("coffee")) return "cafe";
  if (key.includes("golf")) return "golf";
  if (key.includes("run")) return "walk";
  if (key.includes("tennis")) return "tennisball";
  if (key.includes("surf")) return "water";
  if (key.includes("cook")) return "restaurant";
  if (key.includes("music") || key.includes("guitar")) return "musical-notes";
  if (key.includes("climb")) return "trending-up";
  if (key.includes("hack")) return "code-slash";

  return "sparkles";
};

const estimateCardLineCount = (interest: BuzzInterest) => {
  const longestWordLength = interest.name
    .split(/\s+/)
    .reduce((maxLength, word) => Math.max(maxLength, word.length), 0);
  const estimatedByFullName = Math.ceil(
    interest.name.length / ACTIVITY_CARD_ESTIMATED_CHARS_PER_LINE,
  );
  const estimatedByLongestWord = Math.ceil(
    longestWordLength / ACTIVITY_CARD_ESTIMATED_CHARS_PER_LINE,
  );

  return Math.max(1, estimatedByFullName, estimatedByLongestWord);
};

const estimateCardMinHeight = (interests: BuzzInterest[]) => {
  const maxLineCount = interests.reduce(
    (maxLines, interest) => Math.max(maxLines, estimateCardLineCount(interest)),
    1,
  );

  return (
    ACTIVITY_CARD_MIN_HEIGHT +
    Math.max(0, maxLineCount - 1) * ACTIVITY_CARD_LINE_HEIGHT
  );
};

export const InterestToggleGrid = ({
  interests,
  onSelectInterest,
  selectedInterestId,
}: InterestToggleGridProps) => {
  const { theme } = useBuzzTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);
  const cardMinHeight = useMemo(
    () => estimateCardMinHeight(interests),
    [interests],
  );
  const groupedInterests = useMemo(() => {
    const byCategory = new Map<string, BuzzInterest[]>();

    for (const interest of interests) {
      const bucket = byCategory.get(interest.category) ?? [];
      bucket.push(interest);
      byCategory.set(interest.category, bucket);
    }

    return Array.from(byCategory.entries())
      .map(([category, items]) => ({
        category,
        items: [...items].sort((a, b) => a.name.localeCompare(b.name)),
      }))
      .sort((a, b) => a.category.localeCompare(b.category));
  }, [interests]);

  return (
    <View style={styles.sections}>
      {groupedInterests.map((section) => {
        return (
          <View key={section.category} style={styles.section}>
            <Text style={styles.sectionTitle}>
              {titleCaseCategory(section.category)}
            </Text>
            <View style={styles.grid}>
              {section.items.map((interest) => {
                const isSelected =
                  selectedInterestId.length > 0 &&
                  selectedInterestId === interest.id;

                return (
                  <Pressable
                    accessibilityLabel={interest.name}
                    accessibilityRole="button"
                    key={interest.id}
                    onPress={() => onSelectInterest(interest)}
                    style={({ pressed }) => [
                      styles.card,
                      { minHeight: cardMinHeight },
                      isSelected ? styles.cardSelected : null,
                      pressed ? styles.cardPressed : null,
                    ]}
                  >
                    <View
                      style={[
                        styles.iconBadge,
                        isSelected ? styles.iconBadgeSelected : null,
                      ]}
                    >
                      <Ionicons
                        color={isSelected ? colors.surface : colors.text}
                        name={activityIconForInterest(interest)}
                        size={18}
                      />
                    </View>
                    <View style={styles.cardLabelWrap}>
                      <Text
                        maxFontSizeMultiplier={1.28}
                        style={[
                          styles.cardLabel,
                          isSelected ? styles.cardLabelSelected : null,
                        ]}
                        {...(Platform.OS === "android"
                          ? {
                              textBreakStrategy: "balanced" as const,
                            }
                          : {})}
                      >
                        {interest.name}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const createStyles = (theme: BuzzTheme) => {
  const { borderWidths, colors, fontSizes, radii, shadows, spacing } = theme;

  return StyleSheet.create({
    sections: {
      gap: spacing[5],
    },
    section: {
      gap: spacing[3],
    },
    sectionTitle: {
      color: colors.accent,
      fontSize: fontSizes.xs,
      fontWeight: "900",
      letterSpacing: 1,
      lineHeight: 16,
      textTransform: "uppercase",
    },
    grid: {
      alignContent: "flex-start",
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing[3],
    },
    card: {
      alignItems: "stretch",
      alignSelf: "stretch",
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: radii.lg,
      borderWidth: borderWidths.hairline,
      flexBasis: "30%",
      flexDirection: "column",
      flexGrow: 1,
      gap: spacing[3],
      minHeight: ACTIVITY_CARD_MIN_HEIGHT,
      minWidth: 104,
      padding: spacing[3],
      ...shadows.card,
    },
    cardSelected: {
      backgroundColor: colors.surfaceInverse,
      borderColor: colors.surfaceInverse,
    },
    cardPressed: {
      opacity: 0.78,
      transform: [{ scale: 0.98 }],
    },
    iconBadge: {
      alignItems: "center",
      alignSelf: "flex-start",
      backgroundColor: colors.warningSoft,
      borderRadius: radii.full,
      flexShrink: 0,
      height: 34,
      justifyContent: "center",
      width: 34,
    },
    iconBadgeSelected: {
      backgroundColor: "rgba(255, 252, 245, 0.22)",
    },
    cardLabelWrap: {
      flexGrow: 0,
      flexShrink: 0,
      justifyContent: "flex-start",
      minWidth: 0,
      width: "100%",
    },
    cardLabel: {
      color: colors.text,
      flexShrink: 1,
      fontSize: fontSizes.sm,
      fontWeight: "900",
      lineHeight: 19,
      width: "100%",
    },
    cardLabelSelected: {
      color: colors.surface,
    },
  });
};
