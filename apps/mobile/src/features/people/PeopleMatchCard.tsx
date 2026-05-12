import { Image, StyleSheet, View } from "react-native";

import { useBuzzTheme } from "@/theme/ThemeProvider";
import type { BuzzTheme } from "@/theme/tokens";
import { Button, Panel, Text as UiText } from "@/ui";
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
        <View style={styles.avatar}>
          {match.profilePhotoUrl ? (
            <Image
              accessibilityIgnoresInvertColors
              source={{ uri: match.profilePhotoUrl }}
              style={styles.avatarImage}
            />
          ) : (
            <UiText style={styles.avatarInitial}>{avatarInitial}</UiText>
          )}
        </View>
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
            <UiText key={interest.id} style={styles.interestPill}>
              {interest.name}
            </UiText>
          ))}
        </View>
      ) : null}

      <UiText variant="panelBody">{match.compatibilityLine}</UiText>

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
  const { colors, fontSizes, lineHeights, radii, spacing } = theme;

  return StyleSheet.create({
    card: {
      gap: spacing[4],
    },
    headerRow: {
      alignItems: "center",
      flexDirection: "row",
      gap: spacing[3],
    },
    avatar: {
      alignItems: "center",
      backgroundColor: colors.surfaceMuted,
      borderRadius: radii.full,
      height: 58,
      justifyContent: "center",
      overflow: "hidden",
      width: 58,
    },
    avatarImage: {
      height: "100%",
      width: "100%",
    },
    avatarInitial: {
      color: colors.brand,
      fontSize: fontSizes["2xl"],
      fontWeight: "900",
      lineHeight: lineHeights.title,
    },
    headerCopy: {
      flex: 1,
      gap: spacing[1],
    },
    interestRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing[2],
    },
    interestPill: {
      backgroundColor: colors.surfaceMuted,
      borderRadius: radii.full,
      color: colors.brand,
      fontSize: fontSizes.xs,
      fontWeight: "900",
      lineHeight: lineHeights.tight,
      overflow: "hidden",
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[1],
    },
  });
};
