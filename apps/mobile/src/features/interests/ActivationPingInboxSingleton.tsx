import { useRouter } from "expo-router";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";

import { useBuzzAuth } from "@/auth/AuthProvider";
import { useConnectionRequestInbox } from "@/features/chat/ConnectionRequestInboxSingleton";
import { useI18n } from "@/i18n/I18nProvider";
import { routes } from "@/navigation/routes";
import { useBuzzTheme } from "@/theme/ThemeProvider";
import type { BuzzTheme } from "@/theme/tokens";
import { Button, Sheet, Text as UiText } from "@/ui";

import {
  useIncomingActivationPings,
  type IncomingActivationPing,
} from "./useIncomingActivationPings";
import {
  useRespondToActivationPing,
  type ActivationPingResponse,
  type ActivationPingResponseResult,
} from "./useRespondToActivationPing";

export type { IncomingActivationPing };

type ActivationPingInboxContextValue = {
  loading: boolean;
  pings: IncomingActivationPing[];
  responding: boolean;
  respondToPing: (
    ping: IncomingActivationPing,
    response: ActivationPingResponse,
  ) => Promise<ActivationPingResponseResult>;
};

const ActivationPingInboxContext =
  createContext<ActivationPingInboxContextValue | null>(null);

const nudgeFreshnessMs = 48 * 60 * 60 * 1000;
const nudgeSheetSnapPoints = ["42%", "72%"];

const isFreshForNudge = (createdAt: string) => {
  const createdAtMs = Date.parse(createdAt);

  return (
    Number.isFinite(createdAtMs) && Date.now() - createdAtMs <= nudgeFreshnessMs
  );
};

export const ActivationPingInboxSingleton = ({
  children,
}: {
  children: ReactNode;
}) => {
  const router = useRouter();
  const { isAuthenticated, user } = useBuzzAuth();
  const connectionRequestInbox = useConnectionRequestInbox();
  const { theme } = useBuzzTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [dismissedNudgeKeys, setDismissedNudgeKeys] = useState<
    ReadonlySet<string>
  >(new Set());
  const incomingPings = useIncomingActivationPings({
    enabled: isAuthenticated,
    userId: user.id,
  });
  const { loading: responding, respondToPing: runRespondToPing } =
    useRespondToActivationPing();
  const freshConnectionRequests = useMemo(
    () =>
      connectionRequestInbox.requests.filter((request) =>
        isFreshForNudge(request.createdAt),
      ),
    [connectionRequestInbox.requests],
  );
  const freshIncomingPings = useMemo(
    () => incomingPings.pings.filter((ping) => isFreshForNudge(ping.createdAt)),
    [incomingPings.pings],
  );
  const activeNudgeKeys = useMemo(
    () => [
      ...freshConnectionRequests.map((request) => `connection:${request.id}`),
      ...freshIncomingPings.map((ping) => `ping:${ping.id}`),
    ],
    [freshConnectionRequests, freshIncomingPings],
  );
  const connectionRequestCount = freshConnectionRequests.length;
  const pendingCount = freshIncomingPings.length + connectionRequestCount;
  const visible = Boolean(
    isAuthenticated &&
    pendingCount > 0 &&
    activeNudgeKeys.some((itemKey) => !dismissedNudgeKeys.has(itemKey)),
  );

  useEffect(() => {
    setDismissedNudgeKeys(new Set());
  }, [user.id]);

  const dismissNudge = useCallback(() => {
    setDismissedNudgeKeys(
      (current) => new Set([...current, ...activeNudgeKeys]),
    );
  }, [activeNudgeKeys]);

  const respondToPing = useCallback(
    async (
      ping: IncomingActivationPing,
      response: ActivationPingResponse,
    ): Promise<ActivationPingResponseResult> => {
      const result = await runRespondToPing(ping.id, response);

      await incomingPings.refetch();
      return result;
    },
    [incomingPings, runRespondToPing],
  );

  const handleViewAll = useCallback(() => {
    dismissNudge();
    router.push(routes.chats);
  }, [dismissNudge, router]);

  const value = useMemo(
    () => ({
      loading: incomingPings.loading,
      pings: incomingPings.pings,
      responding,
      respondToPing,
    }),
    [incomingPings.loading, incomingPings.pings, responding, respondToPing],
  );

  return (
    <ActivationPingInboxContext.Provider value={value}>
      {children}
      <InboxNudgeSheet
        freshConnectionRequests={freshConnectionRequests}
        freshPings={freshIncomingPings}
        onDismiss={dismissNudge}
        onViewAll={handleViewAll}
        pendingCount={pendingCount}
        styles={styles}
        visible={visible}
      />
    </ActivationPingInboxContext.Provider>
  );
};

export const useActivationPingInbox = (): ActivationPingInboxContextValue => {
  const value = useContext(ActivationPingInboxContext);

  if (!value) {
    throw new Error(
      "useActivationPingInbox must be used within ActivationPingInboxSingleton",
    );
  }

  return value;
};

const InboxNudgeSheet = ({
  freshConnectionRequests,
  freshPings,
  onDismiss,
  onViewAll,
  pendingCount,
  styles,
  visible,
}: {
  freshConnectionRequests: ReturnType<
    typeof useConnectionRequestInbox
  >["requests"];
  freshPings: IncomingActivationPing[];
  onDismiss: () => void;
  onViewAll: () => void;
  pendingCount: number;
  styles: ReturnType<typeof createStyles>;
  visible: boolean;
}) => {
  const { LL } = useI18n();
  const { theme } = useBuzzTheme();
  const summaryRows = [
    ...freshConnectionRequests.slice(0, 2).map((request) => ({
      body: request.message ?? LL.chats.requests.connectionBody(),
      icon: "chatbubble-ellipses" as const,
      id: `connection-${request.id}`,
      title: LL.chats.nudge.messageRow({ name: request.otherName }),
    })),
    ...freshPings
      .slice(0, Math.max(0, 2 - Math.min(freshConnectionRequests.length, 2)))
      .map((ping) => ({
        body: LL.chats.requests.pendingBody(),
        icon: "sparkles" as const,
        id: `ping-${ping.id}`,
        title: LL.chats.nudge.activityRow({
          interest: ping.interestName,
          name: ping.senderName,
        }),
      })),
  ];
  const hiddenCount = Math.max(0, pendingCount - summaryRows.length);

  return (
    <Sheet
      contentStyle={styles.sheetContent}
      onDismiss={onDismiss}
      snapPoints={nudgeSheetSnapPoints}
      testID="inbox-nudge-sheet"
      visible={visible}
    >
      <View style={styles.headerRow}>
        <View style={styles.titleStack}>
          <UiText variant="eyebrow">{LL.chats.nudge.eyebrow()}</UiText>
          <UiText variant="panelTitle" style={styles.title}>
            {pendingCount === 1
              ? LL.chats.nudge.titleOne()
              : LL.chats.nudge.titleMany({ count: pendingCount })}
          </UiText>
          <UiText
            numberOfLines={2}
            textBreakStrategy="balanced"
            variant="panelBody"
            style={styles.body}
          >
            {LL.chats.nudge.body()}
          </UiText>
        </View>
        <Pressable
          accessibilityLabel={LL.common.dismiss()}
          accessibilityRole="button"
          onPress={onDismiss}
          style={({ pressed }) => [
            styles.closeButton,
            pressed ? styles.closeButtonPressed : null,
          ]}
        >
          <Ionicons color={theme.colors.text} name="close" size={20} />
        </Pressable>
      </View>

      <View style={styles.summaryList}>
        {summaryRows.map((row) => (
          <View key={row.id} style={styles.summaryRow}>
            <View style={styles.summaryIcon}>
              <Ionicons color={theme.colors.text} name={row.icon} size={18} />
            </View>
            <View style={styles.summaryCopy}>
              <UiText
                numberOfLines={2}
                textBreakStrategy="balanced"
                variant="button"
                style={styles.summaryTitle}
              >
                {row.title}
              </UiText>
              <UiText
                numberOfLines={2}
                textBreakStrategy="balanced"
                variant="panelBody"
                style={styles.summaryBody}
              >
                {row.body}
              </UiText>
            </View>
          </View>
        ))}
        {hiddenCount > 0 ? (
          <View style={styles.moreRow}>
            <UiText variant="status" style={styles.count}>
              {LL.chats.nudge.more({ count: hiddenCount })}
            </UiText>
          </View>
        ) : null}
      </View>

      <View style={styles.actions}>
        <Button label={LL.chats.nudge.viewRequests()} onPress={onViewAll} />
        <Button
          label={LL.activities.pings.notNow()}
          onPress={onDismiss}
          variant="plain"
        />
      </View>
    </Sheet>
  );
};

const createStyles = (theme: BuzzTheme) => {
  const { colors, radii, spacing } = theme;

  return StyleSheet.create({
    sheetContent: {
      gap: spacing[4],
      paddingTop: spacing[2],
    },
    headerRow: {
      alignItems: "flex-start",
      flexDirection: "row",
      gap: spacing[3],
      justifyContent: "space-between",
    },
    titleStack: {
      flex: 1,
      gap: spacing[1],
      minWidth: 0,
    },
    title: {
      color: colors.text,
    },
    body: {
      color: colors.textMuted,
      flexShrink: 1,
    },
    count: {
      color: colors.textMuted,
    },
    summaryList: {
      gap: spacing[2],
    },
    summaryRow: {
      alignItems: "center",
      backgroundColor: colors.background,
      borderRadius: radii.lg,
      flexDirection: "row",
      gap: spacing[3],
      padding: spacing[3],
    },
    summaryIcon: {
      alignItems: "center",
      backgroundColor: colors.warningSoft,
      borderRadius: radii.full,
      height: 38,
      justifyContent: "center",
      width: 38,
    },
    summaryCopy: {
      flex: 1,
      gap: spacing[1],
      minWidth: 0,
    },
    summaryTitle: {
      color: colors.text,
      flexShrink: 1,
    },
    summaryBody: {
      color: colors.textMuted,
      flexShrink: 1,
    },
    moreRow: {
      alignItems: "center",
      backgroundColor: colors.surfaceMuted,
      borderRadius: radii.full,
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[2],
    },
    actions: {
      gap: spacing[2],
    },
    closeButton: {
      alignItems: "center",
      backgroundColor: colors.warningSoft,
      borderRadius: radii.full,
      height: 34,
      justifyContent: "center",
      width: 34,
    },
    closeButtonPressed: {
      opacity: 0.75,
    },
  });
};
