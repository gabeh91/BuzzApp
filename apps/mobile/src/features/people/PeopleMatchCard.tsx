import { Ionicons } from "@expo/vector-icons";
import {
  Image,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import {
  InterestPill,
  InterestPillRow,
} from "@/features/interests/InterestPill";
import { useBuzzTheme } from "@/theme/ThemeProvider";
import type { BuzzTheme } from "@/theme/tokens";
import { Button, Text as UiText } from "@/ui";
import type { PeopleMatch } from "./peopleFeed";

type ConnectionStatus = "idle" | "sending" | "sent" | "error";

type PeopleMatchCardProps = {
  connectionFailedLabel: string;
  connectionStatus?: ConnectionStatus;
  match: PeopleMatch;
  onSayHi: () => void;
  sayHiLabel: string;
  sharedMetaLabel: string;
  sendingLabel: string;
  sentLabel: string;
  notesMetaLabel: string;
  style?: StyleProp<ViewStyle>;
};

export const PeopleMatchCard = ({
  connectionFailedLabel,
  connectionStatus = "idle",
  match,
  onSayHi,
  sayHiLabel,
  sharedMetaLabel,
  sendingLabel,
  sentLabel,
  notesMetaLabel,
  style,
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
    <View style={[styles.section, style]}>
      <View style={styles.media}>
        {match.profilePhotoUrl ? (
          <Image
            accessibilityIgnoresInvertColors
            accessibilityLabel={`${match.displayName} profile photo`}
            source={{ uri: match.profilePhotoUrl }}
            style={styles.mediaImage}
          />
        ) : (
          <View style={styles.mediaPlaceholder}>
            <UiText style={styles.mediaInitial}>{avatarInitial}</UiText>
            <View style={styles.uploadHint}>
              <Ionicons
                color={theme.colors.textMuted}
                name="camera-outline"
                size={16}
              />
            </View>
          </View>
        )}
      </View>

      <View style={styles.contentSection}>
        <View style={styles.headerRow}>
          <View style={styles.headerCopy}>
            <UiText variant="panelTitle" style={styles.name}>
              {nameLabel}
            </UiText>
            {match.inCityDurationLabel ? (
              <View style={styles.metaPill}>
                <UiText variant="status" style={styles.metaText}>
                  {match.inCityDurationLabel}
                </UiText>
              </View>
            ) : null}
          </View>
        </View>

        {match.sharedInterests.length > 0 ? (
          <InterestPillRow>
            {match.sharedInterests.slice(0, 3).map((interest) => (
              <InterestPill key={interest.id} interest={interest} />
            ))}
          </InterestPillRow>
        ) : null}

        <View style={styles.compatibilityPanel}>
          <View style={styles.compatibilityIcon}>
            <Ionicons
              color={theme.colors.text}
              name="sparkles-outline"
              size={18}
            />
          </View>
          <UiText variant="panelBody" style={styles.compatibilityText}>
            {match.compatibilityLine}
          </UiText>
        </View>

        {match.compatibilityHighlights.length > 0 ? (
          <View style={styles.highlightStack}>
            {match.compatibilityHighlights.slice(0, 2).map((highlight) => (
              <View key={highlight} style={styles.highlightRow}>
                <View style={styles.highlightIcon}>
                  <Ionicons
                    color={theme.colors.brand}
                    name="checkmark"
                    size={13}
                  />
                </View>
                <UiText variant="feedback" style={styles.highlightText}>
                  {highlight}
                </UiText>
              </View>
            ))}
          </View>
        ) : null}
      </View>

      <View style={styles.socialSection}>
        <View style={styles.socialItem}>
          <Ionicons
            color={theme.colors.textMuted}
            name="heart-outline"
            size={16}
          />
          <UiText variant="status" style={styles.socialText}>
            {sharedMetaLabel}
          </UiText>
        </View>
        <View style={styles.socialItem}>
          <Ionicons
            color={theme.colors.textMuted}
            name="chatbubble-ellipses-outline"
            size={16}
          />
          <UiText variant="status" style={styles.socialText}>
            {notesMetaLabel}
          </UiText>
        </View>
      </View>

      <View style={styles.actionSection}>
        <Button
          disabled={actionDisabled}
          label={actionLabel}
          onPress={onSayHi}
          variant={connectionStatus === "sent" ? "neutral" : "tonal"}
        />

        {connectionStatus === "error" ? (
          <UiText variant="feedback">{connectionFailedLabel}</UiText>
        ) : null}
      </View>
    </View>
  );
};

const createStyles = (theme: BuzzTheme) => {
  const { borderWidths, colors, fontSizes, lineHeights, radii, spacing } =
    theme;

  return StyleSheet.create({
    section: {
      backgroundColor: colors.surface,
      borderBottomColor: colors.border,
      borderBottomWidth: borderWidths.hairline,
      borderTopColor: colors.border,
      borderTopWidth: borderWidths.hairline,
      gap: 0,
    },
    media: {
      backgroundColor: colors.surfaceMuted,
      borderBottomColor: colors.border,
      borderBottomWidth: borderWidths.hairline,
      flexShrink: 1,
      height: spacing[16] * 3,
      minHeight: spacing[16] * 2,
      overflow: "hidden",
      width: "100%",
    },
    mediaImage: {
      height: "100%",
      width: "100%",
    },
    mediaPlaceholder: {
      alignItems: "center",
      flex: 1,
      justifyContent: "center",
    },
    mediaInitial: {
      color: colors.brand,
      fontSize: 56,
      ...theme.fontStyles.black,
      lineHeight: 64,
    },
    uploadHint: {
      alignItems: "center",
      backgroundColor: colors.background,
      borderColor: colors.border,
      borderRadius: radii.full,
      borderWidth: borderWidths.hairline,
      bottom: spacing[4],
      height: 34,
      justifyContent: "center",
      position: "absolute",
      right: spacing[4],
      width: 34,
    },
    contentSection: {
      gap: spacing[4],
      padding: spacing[5],
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
    name: {
      color: colors.text,
      fontSize: fontSizes["2xl"],
      lineHeight: lineHeights.title,
    },
    metaPill: {
      alignSelf: "flex-start",
      backgroundColor: colors.background,
      borderColor: colors.border,
      borderWidth: borderWidths.hairline,
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[1],
    },
    metaText: {
      color: colors.textMuted,
    },
    compatibilityPanel: {
      alignItems: "flex-start",
      borderTopColor: colors.border,
      borderTopWidth: borderWidths.hairline,
      flexDirection: "row",
      gap: spacing[3],
      paddingTop: spacing[3],
    },
    compatibilityIcon: {
      alignItems: "center",
      backgroundColor: colors.warningSoft,
      borderRadius: radii.full,
      height: 32,
      justifyContent: "center",
      width: 32,
    },
    compatibilityText: {
      color: colors.text,
      flex: 1,
    },
    highlightStack: {
      gap: spacing[2],
    },
    highlightRow: {
      alignItems: "center",
      flexDirection: "row",
      gap: spacing[2],
    },
    highlightIcon: {
      alignItems: "center",
      backgroundColor: colors.background,
      borderColor: colors.border,
      borderRadius: radii.full,
      borderWidth: borderWidths.hairline,
      height: 22,
      justifyContent: "center",
      width: 22,
    },
    highlightText: {
      flex: 1,
    },
    socialSection: {
      borderTopColor: colors.border,
      borderTopWidth: borderWidths.hairline,
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing[2],
      paddingHorizontal: spacing[5],
      paddingVertical: spacing[3],
    },
    socialItem: {
      alignItems: "center",
      flexDirection: "row",
      gap: spacing[1],
    },
    socialText: {
      color: colors.textMuted,
    },
    actionSection: {
      borderTopColor: colors.border,
      borderTopWidth: borderWidths.hairline,
      gap: spacing[3],
      padding: spacing[5],
    },
  });
};
