import { Ionicons } from "@expo/vector-icons";
import { useCallback, useMemo, useRef } from "react";
import {
  StyleSheet,
  View,
  type GestureResponderEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { activityIconForInterest } from "@/features/interests/activateFab/activateFabActivityIcon";
import { useBuzzTheme } from "@/theme/ThemeProvider";
import type { BuzzTheme } from "@/theme/tokens";
import { Text as UiText } from "@/ui";

type ActivityMatchTone = "live" | "nearby" | "ready";

type ActivityMatchInterest = {
  name: string;
  slug?: string | undefined;
};

type ActivityMatchCardProps = {
  body?: string | undefined;
  eyebrow?: string | undefined;
  interest?: ActivityMatchInterest | undefined;
  socialMeta?: readonly {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
  }[];
  statusAccessibilityLabel?: string | undefined;
  statusDisabled?: boolean | undefined;
  statusLabel?: string | undefined;
  onStatusPress?: (() => void) | undefined;
  style?: StyleProp<ViewStyle>;
  title: string;
  tone?: ActivityMatchTone | undefined;
};

const toneIconName = (tone: ActivityMatchTone) => {
  if (tone === "nearby") {
    return "compass-outline";
  }

  if (tone === "ready") {
    return "chatbubbles-outline";
  }

  return "flash-outline";
};

const tapSlop = 12;

export const ActivityMatchCard = ({
  body,
  eyebrow,
  interest,
  socialMeta = [],
  statusAccessibilityLabel,
  statusDisabled = false,
  statusLabel,
  onStatusPress,
  style,
  title,
  tone = "live",
}: ActivityMatchCardProps) => {
  const { theme } = useBuzzTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const iconName = interest
    ? activityIconForInterest({
        name: interest.name,
        slug: interest.slug ?? "",
      })
    : toneIconName(tone);
  const canManageStatus = onStatusPress != null && !statusDisabled;
  const tapStartRef = useRef<{ x: number; y: number } | null>(null);
  const handleManageTouchStart = useCallback(
    (event: GestureResponderEvent) => {
      if (!canManageStatus) {
        tapStartRef.current = null;
        return;
      }

      tapStartRef.current = {
        x: event.nativeEvent.pageX,
        y: event.nativeEvent.pageY,
      };
    },
    [canManageStatus],
  );
  const handleManageTouchEnd = useCallback(
    (event: GestureResponderEvent) => {
      if (!canManageStatus || !tapStartRef.current) {
        return;
      }

      const deltaX = Math.abs(event.nativeEvent.pageX - tapStartRef.current.x);
      const deltaY = Math.abs(event.nativeEvent.pageY - tapStartRef.current.y);
      tapStartRef.current = null;

      if (deltaX <= tapSlop && deltaY <= tapSlop) {
        onStatusPress?.();
      }
    },
    [canManageStatus, onStatusPress],
  );
  const renderStatusPill = () => {
    if (!statusLabel) {
      return null;
    }

    if (!onStatusPress) {
      return (
        <View style={styles.statusPill}>
          <UiText variant="status" style={styles.statusText}>
            {statusLabel}
          </UiText>
        </View>
      );
    }

    return (
      <View
        accessibilityLabel={statusAccessibilityLabel ?? statusLabel}
        accessibilityRole="button"
        accessible
        onTouchEnd={handleManageTouchEnd}
        onTouchStart={handleManageTouchStart}
        style={[
          styles.statusPill,
          styles.statusPillPressable,
          statusDisabled ? styles.statusPillDisabled : null,
        ]}
      >
        <UiText variant="status" style={styles.statusText}>
          {statusLabel}
        </UiText>
        <Ionicons
          color={theme.colors.textMuted}
          name="chevron-down"
          size={14}
        />
      </View>
    );
  };

  return (
    <View
      style={[
        styles.section,
        statusDisabled ? styles.sectionDisabled : null,
        style,
      ]}
    >
      <View style={styles.media}>
        <View style={styles.mediaIcon}>
          <Ionicons color={theme.colors.text} name={iconName} size={36} />
        </View>
        {eyebrow ? (
          <View style={styles.mediaEyebrow}>
            <UiText variant="eyebrow" style={styles.eyebrow}>
              {eyebrow}
            </UiText>
          </View>
        ) : null}
      </View>

      <View style={styles.contentSection}>
        <View style={styles.headerRow}>
          <UiText variant="panelTitle" style={styles.title}>
            {title}
          </UiText>

          {statusLabel ? (
            <View style={styles.headerActions}>{renderStatusPill()}</View>
          ) : null}
        </View>

        {body ? (
          <View style={styles.summaryPanel}>
            <UiText variant="panelBody" style={styles.summaryText}>
              {body}
            </UiText>
          </View>
        ) : null}
      </View>

      {socialMeta.length > 0 ? (
        <View style={styles.socialSection}>
          {socialMeta.map((item) => (
            <View key={`${item.icon}-${item.label}`} style={styles.socialItem}>
              <Ionicons
                color={theme.colors.textMuted}
                name={item.icon}
                size={16}
              />
              <UiText variant="status" style={styles.socialText}>
                {item.label}
              </UiText>
            </View>
          ))}
        </View>
      ) : null}
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
    sectionDisabled: {
      opacity: 0.55,
    },
    media: {
      alignItems: "center",
      backgroundColor: colors.surfaceMuted,
      borderBottomColor: colors.border,
      borderBottomWidth: borderWidths.hairline,
      flexShrink: 1,
      height: spacing[16] * 3,
      justifyContent: "center",
      minHeight: spacing[16] * 2,
      position: "relative",
      width: "100%",
    },
    mediaIcon: {
      alignItems: "center",
      height: 66,
      justifyContent: "center",
      width: 66,
    },
    mediaEyebrow: {
      left: spacing[4],
      position: "absolute",
      top: spacing[4],
    },
    contentSection: {
      gap: spacing[4],
      padding: spacing[5],
    },
    headerRow: {
      alignItems: "flex-start",
      flexDirection: "row",
      gap: spacing[3],
    },
    eyebrow: {
      color: colors.accent,
    },
    title: {
      color: colors.text,
      flex: 1,
      fontSize: fontSizes["2xl"],
      lineHeight: lineHeights.title,
    },
    headerActions: {
      alignItems: "center",
      flexDirection: "row",
      gap: spacing[2],
      zIndex: 1,
    },
    statusPill: {
      alignItems: "center",
      backgroundColor: colors.background,
      borderColor: colors.border,
      borderWidth: borderWidths.hairline,
      flexDirection: "row",
      gap: spacing[1],
      maxWidth: 116,
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[1],
    },
    statusPillDisabled: {
      opacity: 0.55,
    },
    statusPillPressable: {
      backgroundColor: colors.surfaceMuted,
      minHeight: spacing[7],
    },
    statusText: {
      color: colors.textMuted,
      textAlign: "center",
    },
    summaryPanel: {
      borderTopColor: colors.border,
      borderTopWidth: borderWidths.hairline,
      paddingTop: spacing[3],
    },
    summaryText: {
      color: colors.text,
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
  });
};
