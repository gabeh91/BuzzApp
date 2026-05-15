import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Pressable, StyleSheet, View, type LayoutChangeEvent } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { useBuzzAuth } from "@/auth/AuthProvider";
import { createCityContextFallback } from "@/features/city/cityContext";
import {
  useActivationPingInbox,
  type IncomingActivationPing,
} from "@/features/interests/ActivationPingInboxSingleton";
import { useI18n } from "@/i18n/I18nProvider";
import { routes } from "@/navigation/routes";
import { tabBarTotalHeight } from "@/navigation/tabBarLayout";
import { useBuzzTheme } from "@/theme/ThemeProvider";
import {
  SCREEN_CONTENT_GUTTER_SPACING,
  type BuzzTheme,
} from "@/theme/tokens";
import {
  AppBrandedCityHeader,
  Button,
  HeroPanel,
  List,
  Panel,
  Screen,
  Sheet,
  Text as UiText,
} from "@/ui";
import { useChatSummaries, type ChatSummary } from "./useChatSummaries";
import {
  useConnectionRequestInbox,
  type ConnectionRequestResponse,
  type ConnectionRequestSummary,
} from "./ConnectionRequestInboxSingleton";

type ChatsListItem =
  | { kind: "pingRequest"; ping: IncomingActivationPing }
  | { connectionRequest: ConnectionRequestSummary; kind: "connectionRequest" }
  | { kind: "group"; chat: ChatSummary };

const requestRemovalAnimationMs = 220;

const wait = (durationMs: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, durationMs);
  });

export const ChatsScreen = () => {
  const router = useRouter();
  const { LL } = useI18n();
  const { theme } = useBuzzTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(
    () => createStyles(theme, insets.bottom),
    [theme, insets.bottom],
  );
  const { isAuthenticated, user } = useBuzzAuth();
  const [activeTab, setActiveTab] = useState<"requests" | "groups">("requests");
  const [tabWidth, setTabWidth] = useState(0);
  const [removingItemKeys, setRemovingItemKeys] = useState<
    ReadonlySet<string>
  >(new Set());
  const [acceptingPing, setAcceptingPing] =
    useState<IncomingActivationPing | null>(null);
  const [acceptedActivityGroupId, setAcceptedActivityGroupId] = useState<
    string | null
  >(null);
  const [acceptFlowError, setAcceptFlowError] = useState<string | null>(null);
  const [acceptSheetVisible, setAcceptSheetVisible] = useState(false);
  const [acceptSheetRemountKey, setAcceptSheetRemountKey] = useState(0);
  const pingInbox = useActivationPingInbox();
  const connectionRequests = useConnectionRequestInbox();
  const chatSummaries = useChatSummaries({
    enabled: isAuthenticated,
    userId: user.id,
  });
  const cityContext = createCityContextFallback({
    cityId: user.cityId,
    cityName: user.cityName,
  });

  const activeIndex = useSharedValue(activeTab === "requests" ? 0 : 1);

  useEffect(() => {
    activeIndex.value =
      tabWidth <= 0
        ? activeTab === "requests"
          ? 0
          : 1
        : withSequence(
            withTiming(activeTab === "requests" ? 0 : 1, {
              duration: 240,
              easing: Easing.out(Easing.cubic),
            }),
            withSpring(activeTab === "requests" ? 0 : 1, {
              damping: 16,
              mass: 0.55,
              stiffness: 200,
            }),
          );
  }, [activeIndex, activeTab, tabWidth]);

  const pillStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: activeIndex.value * tabWidth }],
    };
  }, [tabWidth]);

  const requestsLabelStyle = useAnimatedStyle(() => {
    return {
      color: interpolateColor(
        activeIndex.value,
        [0, 1],
        [theme.colors.text, theme.colors.textMuted],
      ),
    };
  }, [theme.colors.text, theme.colors.textMuted]);

  const groupsLabelStyle = useAnimatedStyle(() => {
    return {
      color: interpolateColor(
        activeIndex.value,
        [0, 1],
        [theme.colors.textMuted, theme.colors.text],
      ),
    };
  }, [theme.colors.text, theme.colors.textMuted]);

  const handleTabLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    setTabWidth(width > 0 ? width / 2 : 0);
  };

  const header = useMemo(
    () => (
      <View style={styles.headerStack}>
        <HeroPanel
          body={LL.chats.subtitle()}
          eyebrow={LL.chats.eyebrow()}
          title={LL.chats.title()}
        />

        <View onLayout={handleTabLayout} style={styles.tabRow}>
          <Animated.View style={[styles.tabPill, pillStyle]} />
          <Pressable
            accessibilityRole="button"
            onPress={() => setActiveTab("requests")}
            style={[
              styles.tabButton,
              activeTab === "requests" ? styles.tabButtonPressed : null,
            ]}
          >
            <Animated.Text style={[styles.tabLabel, requestsLabelStyle]}>
              {LL.chats.requests.title()}
            </Animated.Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => setActiveTab("groups")}
            style={[
              styles.tabButton,
              activeTab === "groups" ? styles.tabButtonPressed : null,
            ]}
          >
            <Animated.Text style={[styles.tabLabel, groupsLabelStyle]}>
              {LL.chats.groups.title()}
            </Animated.Text>
          </Pressable>
        </View>
      </View>
    ),
    [
      LL,
      activeTab,
      groupsLabelStyle,
      pillStyle,
      requestsLabelStyle,
      styles,
    ],
  );

  const visibleItems = useMemo<ChatsListItem[]>(() => {
    if (activeTab === "groups") {
      return chatSummaries.summaries.map((chat) => ({
        chat,
        kind: "group",
      }));
    }

    return [
      ...pingInbox.pings.map((ping) => ({
        kind: "pingRequest" as const,
        ping,
      })),
      ...connectionRequests.requests.map((connectionRequest) => ({
        connectionRequest,
        kind: "connectionRequest" as const,
      })),
    ];
  }, [
    activeTab,
    chatSummaries.summaries,
    connectionRequests.requests,
    pingInbox.pings,
  ]);

  useEffect(() => {
    const visibleRequestKeys = new Set([
      ...pingInbox.pings.map((ping) => `ping:${ping.id}`),
      ...connectionRequests.requests.map(
        (connectionRequest) => `connection:${connectionRequest.id}`,
      ),
    ]);

    setRemovingItemKeys((current) => {
      const next = new Set(
        [...current].filter((itemKey) => visibleRequestKeys.has(itemKey)),
      );

      return next.size === current.size ? current : next;
    });
  }, [connectionRequests.requests, pingInbox.pings]);

  const openAcceptFlow = useCallback((ping: IncomingActivationPing) => {
    setAcceptingPing(ping);
    setAcceptedActivityGroupId(null);
    setAcceptFlowError(null);
    setAcceptSheetRemountKey((current) => current + 1);
    setAcceptSheetVisible(true);
  }, []);

  const closeAcceptFlow = useCallback(() => {
    setAcceptSheetVisible(false);
  }, []);

  const confirmAcceptFlow = useCallback(async () => {
    if (!acceptingPing) return;

    setAcceptFlowError(null);

    try {
      const result = await pingInbox.respondToPing(acceptingPing, "yes");

      if (!result.ok || !result.activityGroupId) {
        throw new Error("Unable to join activity");
      }

      setAcceptedActivityGroupId(result.activityGroupId);
      setRemovingItemKeys((current) =>
        new Set(current).add(`ping:${acceptingPing.id}`),
      );
      await chatSummaries.refetch();
    } catch {
      setAcceptFlowError(LL.chats.activityAccept.failed());
    }
  }, [LL, acceptingPing, chatSummaries, pingInbox]);

  const openAcceptedActivity = useCallback(() => {
    if (!acceptedActivityGroupId) return;

    setAcceptSheetVisible(false);
    router.push(routes.group(acceptedActivityGroupId));
  }, [acceptedActivityGroupId, router]);

  const empty = useMemo(() => {
    if (activeTab === "groups") {
      return (
        <Panel variant="plain" style={styles.emptyPanel}>
          <UiText variant="panelTitle">{LL.chats.groups.title()}</UiText>
          <UiText variant="panelBody">{LL.chats.groups.empty()}</UiText>
        </Panel>
      );
    }

    return (
      <Panel variant="muted" style={styles.emptyPanel}>
        <UiText variant="panelTitle">{LL.chats.requests.title()}</UiText>
        <UiText variant="panelBody">
          {pingInbox.loading || connectionRequests.loading
            ? LL.chats.requests.loading()
            : LL.chats.requests.empty()}
        </UiText>
      </Panel>
    );
  }, [
    LL,
    activeTab,
    connectionRequests.loading,
    pingInbox.loading,
    styles.emptyPanel,
  ]);

  const renderChatSummary = ({ item }: { item: ChatSummary }) => (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        if (item.kind === "direct" && item.directConversationId) {
          router.push(routes.directChat(item.directConversationId));
          return;
        }

        if (item.activityGroupId) {
          router.push(routes.group(item.activityGroupId));
        }
      }}
      style={({ pressed }) => [
        styles.chatCard,
        pressed ? styles.chatCardPressed : null,
      ]}
    >
      <View style={styles.chatTitleRow}>
        <View style={styles.chatTitleStack}>
          <UiText variant="panelTitle" style={styles.chatTitle}>
            {item.title}
          </UiText>
          <UiText variant="panelBody" style={styles.chatMeta}>
            {LL.chats.groups.members({ count: item.memberCount })}
          </UiText>
        </View>
        {item.unreadCount > 0 ? (
          <UiText variant="status" style={styles.unreadBadge}>
            {LL.chats.groups.unread({ count: item.unreadCount })}
          </UiText>
        ) : null}
      </View>

      <UiText variant="panelBody" style={styles.lastMessage}>
        {item.lastMessageBody ?? LL.chats.groups.noMessages()}
      </UiText>
    </Pressable>
  );

  const renderPingRequest = ({ item }: { item: IncomingActivationPing }) => {
    const handleResponse = async (response: "yes" | "maybe" | "no") => {
      if (response === "yes") {
        openAcceptFlow(item);
        return;
      }

      const itemKey = `ping:${item.id}`;
      setRemovingItemKeys((current) => new Set(current).add(itemKey));
      await wait(requestRemovalAnimationMs);

      try {
        await pingInbox.respondToPing(item, response);
      } catch {
        setRemovingItemKeys((current) => {
          const next = new Set(current);
          next.delete(itemKey);
          return next;
        });
      }
    };
    const isRemoving = removingItemKeys.has(`ping:${item.id}`);
    const hasExistingChat = Boolean(item.existingDirectConversationId);

    return (
      <AnimatedListItem isRemoving={isRemoving}>
        <View style={styles.requestCard}>
          <View style={styles.chatTitleStack}>
            <UiText variant="eyebrow">{LL.activities.pings.title()}</UiText>
            <UiText variant="panelTitle" style={styles.chatTitle}>
              {LL.activities.pings.body({
                interest: item.interestName,
                name: item.senderName,
              })}
            </UiText>
            <UiText variant="panelBody" style={styles.chatMeta}>
              {hasExistingChat
                ? LL.chats.requests.existingChatPingBody()
                : LL.chats.requests.pendingBody()}
            </UiText>
          </View>

          <View style={styles.requestActions}>
            <Button
              disabled={pingInbox.responding || isRemoving}
              label={
                pingInbox.responding || isRemoving
                  ? LL.activities.pings.responding()
                  : LL.activities.pings.yes()
              }
              onPress={() => {
                openAcceptFlow(item);
              }}
              style={styles.requestPrimaryAction}
            />
            <View style={styles.requestSecondaryActions}>
              {item.existingDirectConversationId ? (
                <Button
                  disabled={pingInbox.responding || isRemoving}
                  label={LL.chats.requests.openExistingChat()}
                  onPress={() => {
                    if (!item.existingDirectConversationId) return;

                    router.push(routes.directChat(item.existingDirectConversationId));
                  }}
                  style={styles.requestSecondaryAction}
                  variant="tonal"
                />
              ) : null}
              <Button
                disabled={pingInbox.responding || isRemoving}
                label={LL.activities.pings.maybe()}
                onPress={() => {
                  void handleResponse("maybe");
                }}
                style={styles.requestSecondaryAction}
                variant="tonal"
              />
              <Button
                disabled={pingInbox.responding || isRemoving}
                label={LL.activities.pings.no()}
                onPress={() => {
                  void handleResponse("no");
                }}
                style={styles.requestSecondaryAction}
                variant="bordered"
              />
            </View>
          </View>
        </View>
      </AnimatedListItem>
    );
  };

  const renderConnectionRequest = ({
    item,
  }: {
    item: ConnectionRequestSummary;
  }) => {
    const itemKey = `connection:${item.id}`;
    const isRemoving = removingItemKeys.has(itemKey);
    const handleResponse = async (response: ConnectionRequestResponse) => {
      setRemovingItemKeys((current) => new Set(current).add(itemKey));
      await wait(requestRemovalAnimationMs);

      try {
        const result = await connectionRequests.respondToConnectionRequest(
          item.id,
          response,
        );
        await chatSummaries.refetch();

        if (
          response === "accepted" &&
          result.ok &&
          result.directConversationId
        ) {
          router.push(routes.directChat(result.directConversationId));
        }
      } catch {
        setRemovingItemKeys((current) => {
          const next = new Set(current);
          next.delete(itemKey);
          return next;
        });
      }
    };

    return (
      <AnimatedListItem isRemoving={isRemoving}>
        <View style={styles.requestCard}>
          <View style={styles.chatTitleStack}>
            <UiText variant="eyebrow">{LL.peopleConnect.eyebrow()}</UiText>
            <UiText variant="panelTitle" style={styles.chatTitle}>
              {LL.chats.requests.connectionTitle({ name: item.otherName })}
            </UiText>
            <UiText variant="panelBody" style={styles.chatMeta}>
              {LL.chats.requests.connectionBody()}
            </UiText>
          </View>

          <Panel variant="muted" style={styles.requestMessagePanel}>
            <UiText variant="panelBody" style={styles.lastMessage}>
              {item.message ?? LL.chats.requests.connectionMessageFallback()}
            </UiText>
          </Panel>

          <View style={styles.requestActions}>
            <Button
              disabled={connectionRequests.responding || isRemoving}
              label={
                connectionRequests.responding || isRemoving
                  ? LL.chats.requests.responding()
                  : LL.chats.requests.accept()
              }
              onPress={() => {
                void handleResponse("accepted");
              }}
              style={styles.requestPrimaryAction}
            />
            <Button
              disabled={connectionRequests.responding || isRemoving}
              label={LL.chats.requests.decline()}
              onPress={() => {
                void handleResponse("declined");
              }}
              variant="bordered"
            />
          </View>
        </View>
      </AnimatedListItem>
    );
  };

  const renderListItem = ({ item }: { item: ChatsListItem }) => {
    if (item.kind === "pingRequest") {
      return renderPingRequest({ item: item.ping });
    }

    if (item.kind === "connectionRequest") {
      return renderConnectionRequest({ item: item.connectionRequest });
    }

    return renderChatSummary({ item: item.chat });
  };

  return (
    <Screen
      contentStyle={styles.screenContent}
      edges={["top"]}
      scroll={false}
      stickyHeader={
        <AppBrandedCityHeader cityName={cityContext.city.name} />
      }
    >
      <List<ChatsListItem>
        contentContainerStyle={styles.listContent}
        data={visibleItems}
        itemGap={theme.spacing[3]}
        keyExtractor={(item) =>
          item.kind === "pingRequest"
            ? `ping:${item.ping.id}`
            : item.kind === "connectionRequest"
              ? `connection:${item.connectionRequest.id}`
              : `chat:${item.chat.kind}:${item.chat.id}`
        }
        ListEmptyComponent={empty}
        ListHeaderComponent={header}
        renderItem={renderListItem}
        style={styles.list}
      />
      <Sheet
        contentStyle={styles.acceptSheetContent}
        onDismiss={closeAcceptFlow}
        remountKey={acceptSheetRemountKey}
        snapPoints={["44%"]}
        testID="activity-accept-flow-sheet"
        visible={acceptSheetVisible}
      >
        <View style={styles.acceptSheetStack}>
          <View style={styles.acceptSheetIcon}>
            <Ionicons
              color={theme.colors.text}
              name={acceptedActivityGroupId ? "checkmark" : "sparkles"}
              size={24}
            />
          </View>

          <View style={styles.acceptSheetCopy}>
            <UiText variant="eyebrow">{LL.chats.activityAccept.eyebrow()}</UiText>
            <UiText variant="panelTitle" style={styles.acceptSheetTitle}>
              {acceptedActivityGroupId
                ? LL.chats.activityAccept.joinedTitle()
                : acceptingPing
                  ? LL.chats.activityAccept.title({
                      interest: acceptingPing.interestName,
                      name: acceptingPing.senderName,
                    })
                  : LL.chats.activityAccept.joinedTitle()}
            </UiText>
            <UiText variant="panelBody" style={styles.acceptSheetBody}>
              {acceptedActivityGroupId
                ? LL.chats.activityAccept.joinedBody()
                : LL.chats.activityAccept.body()}
            </UiText>
          </View>

          {acceptFlowError ? (
            <UiText variant="feedback" style={styles.acceptSheetFeedback}>
              {acceptFlowError}
            </UiText>
          ) : null}

          <View style={styles.acceptSheetActions}>
            <Button
              disabled={pingInbox.responding}
              label={
                acceptedActivityGroupId
                  ? LL.chats.activityAccept.openChat()
                  : pingInbox.responding
                    ? LL.chats.activityAccept.confirming()
                    : LL.chats.activityAccept.confirm()
              }
              onPress={() => {
                if (acceptedActivityGroupId) {
                  openAcceptedActivity();
                  return;
                }

                void confirmAcceptFlow();
              }}
            />
            {!acceptedActivityGroupId ? (
              <Button
                disabled={pingInbox.responding}
                label={LL.chats.activityAccept.cancel()}
                onPress={closeAcceptFlow}
                variant="tonal"
              />
            ) : null}
          </View>
        </View>
      </Sheet>
    </Screen>
  );
};

const AnimatedListItem = ({
  children,
  isRemoving,
}: {
  children: ReactNode;
  isRemoving: boolean;
}) => {
  const [measuredHeight, setMeasuredHeight] = useState<number | null>(null);
  const progress = useSharedValue(isRemoving ? 0 : 1);

  useEffect(() => {
    progress.value = withTiming(isRemoving ? 0 : 1, {
      duration: requestRemovalAnimationMs,
      easing: Easing.out(Easing.cubic),
    });
  }, [isRemoving, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    maxHeight:
      measuredHeight === null ? undefined : measuredHeight * progress.value,
    opacity: progress.value,
    transform: [
      {
        scale: 0.98 + progress.value * 0.02,
      },
      {
        translateY: (1 - progress.value) * -8,
      },
    ],
  }));

  return (
    <Animated.View
      onLayout={(event) => {
        if (measuredHeight === null && !isRemoving) {
          setMeasuredHeight(event.nativeEvent.layout.height);
        }
      }}
      style={[stylesForAnimatedListItem.root, animatedStyle]}
    >
      {children}
    </Animated.View>
  );
};

const stylesForAnimatedListItem = StyleSheet.create({
  root: {
    overflow: "hidden",
  },
});

const createStyles = (theme: BuzzTheme, bottomInset: number) => {
  const { borderWidths, colors, fontSizes, radii, spacing } = theme;

  return StyleSheet.create({
    screenContent: {
      flex: 1,
      flexGrow: 1,
      gap: 0,
      paddingHorizontal: 0,
      paddingTop: 0,
    },
    list: {
      flex: 1,
    },
    listContent: {
      paddingBottom: tabBarTotalHeight(theme, bottomInset) + spacing[4],
      paddingHorizontal: spacing[SCREEN_CONTENT_GUTTER_SPACING],
      paddingTop: spacing[5],
    },
    headerStack: {
      gap: spacing[5],
      marginBottom: spacing[4],
    },
    tabRow: {
      backgroundColor: colors.surfaceMuted,
      borderRadius: radii.full,
      flexDirection: "row",
      padding: spacing[1],
      position: "relative",
    },
    tabPill: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: radii.full,
      borderWidth: borderWidths.hairline,
      bottom: spacing[1],
      left: spacing[1],
      position: "absolute",
      top: spacing[1],
      width: "50%",
    },
    tabButton: {
      alignItems: "center",
      borderRadius: radii.full,
      flex: 1,
      justifyContent: "center",
      minHeight: 40,
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[2],
      zIndex: 1,
    },
    tabButtonPressed: {
      opacity: 0.92,
    },
    tabLabel: {
      fontSize: fontSizes.sm,
      fontWeight: "900",
    },
    emptyPanel: {
      gap: spacing[3],
    },
    chatCard: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: radii.xl,
      borderWidth: borderWidths.hairline,
      gap: spacing[3],
      padding: spacing[5],
    },
    requestCard: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: radii.xl,
      borderWidth: borderWidths.hairline,
      gap: spacing[3],
      padding: spacing[5],
    },
    chatCardPressed: {
      opacity: 0.9,
    },
    chatTitleRow: {
      alignItems: "flex-start",
      flexDirection: "row",
      gap: spacing[3],
      justifyContent: "space-between",
    },
    chatTitleStack: {
      flex: 1,
      gap: spacing[1],
    },
    chatTitle: {
      color: colors.text,
    },
    chatMeta: {
      color: colors.textMuted,
    },
    unreadBadge: {
      backgroundColor: colors.warningSoft,
      borderRadius: radii.full,
      color: colors.text,
      overflow: "hidden",
      paddingHorizontal: spacing[2],
      paddingVertical: spacing[1],
    },
    lastMessage: {
      color: colors.brand,
    },
    requestActions: {
      gap: spacing[3],
    },
    requestPrimaryAction: {
      alignSelf: "stretch",
    },
    requestSecondaryActions: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing[2],
    },
    requestSecondaryAction: {
      flex: 1,
      minWidth: 140,
    },
    requestMessagePanel: {
      padding: spacing[4],
    },
    acceptSheetContent: {
      paddingHorizontal: spacing[5],
    },
    acceptSheetStack: {
      gap: spacing[4],
      paddingTop: spacing[2],
    },
    acceptSheetIcon: {
      alignItems: "center",
      alignSelf: "flex-start",
      backgroundColor: colors.warningSoft,
      borderRadius: radii.full,
      height: 48,
      justifyContent: "center",
      width: 48,
    },
    acceptSheetCopy: {
      gap: spacing[2],
    },
    acceptSheetTitle: {
      color: colors.text,
    },
    acceptSheetBody: {
      color: colors.textMuted,
    },
    acceptSheetFeedback: {
      color: colors.danger,
    },
    acceptSheetActions: {
      gap: spacing[2],
    },
  });
};
