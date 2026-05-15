import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

import { activityIconForInterest } from "@/features/interests/activateFab/activateFabActivityIcon";
import { useBuzzTheme } from "@/theme/ThemeProvider";
import type { BuzzTheme } from "@/theme/tokens";
import { Avatar, Button, Panel, Text as UiText } from "@/ui";
import type { PeopleMatch } from "./peopleFeed";

type ConnectionStatus = "idle" | "sending" | "sent" | "error";

type PeopleMatchCardProps = {
  connectionFailedLabel: string;
  connectionStatus?: ConnectionStatus;
  match: PeopleMatch;
  onSayHi: () => void;
  sayHiLabel: string;
  sendingLabel: string;
  sentLabel: string;
};

export const PeopleMatchCard = ({
  connectionFailedLabel,
  connectionStatus = "idle",
  match,
  onSayHi,
  sayHiLabel,
  sendingLabel,
  sentLabel,
}: PeopleMatchCardProps) => {
  const { theme } = useBuzzTheme();
  const styles = createStyles(theme);
  const nameLabel = match.age
    ? `${match.firstName}, ${match.age}`
    : match.firstName;
  const actionLabel =
    connectionStatus === "sent"
      ? sentLabel
      : connectionStatus === "sending"
        ? sendingLabel
        : sayHiLabel;
  const actionDisabled =
    connectionStatus === "sending" || connectionStatus === "sent";
  const avatarInitial = match.firstName.slice(0, 1).toUpperCase();

  return (
    <Panel variant="surface" style={styles.card}>
      <View style={styles.headerRow}>
        <Avatar
          accessibilityLabel={`${match.displayName} avatar`}
          fallbackInitial={avatarInitial}
          size={58}
          uri={match.profilePhotoUrl}
        />
        <View style={styles.headerCopy}>
          <UiText variant="panelTitle">{nameLabel}</UiText>
          {match.inCityDurationLabel ? (
            <UiText variant="feedback">{match.inCityDurationLabel}</UiText>
          ) : null}
        </View>
      </View>

      {match.sharedInterests.length > 0 ? (
        <View style={styles.interestRow}>
          {match.sharedInterests.slice(0, 3).map((interest) => (
            <View
              key={interest.id}
              accessibilityLabel={interest.name}
              accessibilityRole="none"
              accessible
              style={styles.interestPill}
            >
              <Ionicons
                color={theme.colors.brand}
                name={activityIconForInterest(interest)}
                size={15}
              />
              <UiText numberOfLines={1} style={styles.interestPillLabel}>
                {interest.name}
              </UiText>
            </View>
          ))}
        </View>
      ) : null}

      <UiText variant="panelBody">{match.compatibilityLine}</UiText>

      {match.compatibilityHighlights.length > 0 ? (
        <View style={styles.highlightStack}>
          {match.compatibilityHighlights.slice(0, 2).map((highlight) => (
            <View key={highlight} style={styles.highlightRow}>
              <View style={styles.highlightDot} />
              <UiText variant="feedback" style={styles.highlightText}>
                {highlight}
              </UiText>
            </View>
          ))}
        </View>
      ) : null}

      <Button
        disabled={actionDisabled}
        label={actionLabel}
        onPress={onSayHi}
        variant={connectionStatus === "sent" ? "neutral" : "tonal"}
      />

      {connectionStatus === "error" ? (
        <UiText variant="feedback">{connectionFailedLabel}</UiText>
      ) : null}
    </Panel>
  );
};

const createStyles = (theme: BuzzTheme) => {
  const { borderWidths, colors, fontSizes, lineHeights, radii, spacing } = theme;

  return StyleSheet.create({
    card: {
      gap: spacing[4],
    },
    headerRow: {
      alignItems: "center",
      flexDirection: "row",
      gap: spacing[3],
    },
    headerCopy: {
      flex: 1,
      gap: spacing[1],
    },
    interestRow: {
      alignContent: "flex-start",
      alignItems: "center",
      alignSelf: "stretch",
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing[2],
      width: "100%",
    },
    interestPill: {
      alignItems: "center",
      alignSelf: "flex-start",
      backgroundColor: colors.background,
      borderColor: colors.border,
      borderRadius: radii.full,
      borderWidth: borderWidths.hairline,
      flexDirection: "row",
      flexGrow: 0,
      gap: spacing[1],
      maxWidth: "100%",
      paddingLeft: spacing[2],
      paddingRight: spacing[3],
      paddingVertical: spacing[1],
    },
    interestPillLabel: {
      color: colors.text,
      flexShrink: 1,
      fontSize: fontSizes.sm,
      fontWeight: "700",
      letterSpacing: 0.15,
      lineHeight: lineHeights.tight,
      minWidth: 0,
    },
    highlightStack: {
      gap: spacing[2],
    },
    highlightRow: {
      alignItems: "center",
      flexDirection: "row",
      gap: spacing[2],
    },
    highlightDot: {
      backgroundColor: colors.brand,
      borderRadius: radii.full,
      height: 6,
      width: 6,
    },
    highlightText: {
      flex: 1,
    },
  });
};
