import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { useBuzzAuth } from "@/auth/AuthProvider";
import { createCityContextFallback } from "@/features/city/cityContext";
import {
  useActivationPingInbox,
  type IncomingActivationPing,
} from "@/features/interests/ActivationPingInboxSingleton";
import { activityIconForInterest } from "@/features/interests/activateFab/activateFabActivityIcon";
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
  CompactIntro,
  List,
  Panel,
  Screen,
  Sheet,
  StickySegmentedTabs,
  Text as UiText,
  useSegmentedTabSwipe,
  useToast,
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
  | { kind: "groupChat"; chat: ChatSummary }
  | { kind: "directChat"; chat: ChatSummary };

const requestRemovalAnimationMs = 220;
const chatTabOrder = ["requests", "groups", "direct"] as const;
type ChatTab = (typeof chatTabOrder)[number];

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
  const { showToast } = useToast();
  const { isAuthenticated, user } = useBuzzAuth();
  const [activeTab, setActiveTab] = useState<ChatTab>("requests");
  const {
    contentDragStyle,
    contentPanHandlers,
    onContentLayout,
    tabDragProgress,
  } = useSegmentedTabSwipe<ChatTab>({
    activeTab,
    setActiveTab,
    tabOrder: chatTabOrder,
  });
  const [removingItemKeys, setRemovingItemKeys] = useState<
    ReadonlySet<string>
  >(new Set());
  const [acceptingPing, setAcceptingPing] =
    useState<IncomingActivationPing | null>(null);
  const [acceptedActivityGroupId, setAcceptedActivityGroupId] = useState<
    string | null
  >(null);
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

  const requestCount = useMemo(
    () => pingInbox.pings.length + connectionRequests.requests.length,
    [connectionRequests.requests, pingInbox.pings],
  );

  const groupChatCount = useMemo(
    () =>
      chatSummaries.summaries.filter((summary) => summary.kind === "group")
        .length,
    [chatSummaries.summaries],
  );

  const directChatCount = useMemo(
    () =>
      chatSummaries.summaries.filter((summary) => summary.kind === "direct")
        .length,
    [chatSummaries.summaries],
  );

  const tabItems = useMemo(
    () => [
      {
        accessibilityHint: LL.chats.tabHints.requests(),
        count: requestCount,
        icon: (
          <Ionicons
            color={activeTab === "requests" ? theme.colors.text : theme.colors.textMuted}
            name="notifications-outline"
            size={16}
          />
        ),
        label: LL.chats.requests.title(),
        value: "requests" as const,
      },
      {
        accessibilityHint: LL.chats.tabHints.groups(),
        count: groupChatCount,
        icon: (
          <Ionicons
            color={activeTab === "groups" ? theme.colors.text : theme.colors.textMuted}
            name="chatbubbles-outline"
            size={16}
          />
        ),
        label: LL.chats.groups.title(),
        value: "groups" as const,
      },
      {
        accessibilityHint: LL.chats.tabHints.direct(),
        count: directChatCount,
        icon: (
          <Ionicons
            color={activeTab === "direct" ? theme.colors.text : theme.colors.textMuted}
            name="paper-plane-outline"
            size={16}
          />
        ),
        label: LL.chats.direct.title(),
        value: "direct" as const,
      },
    ],
    [
      LL.chats.direct.title,
      LL.chats.groups.title,
      LL.chats.requests.title,
      LL.chats.tabHints.direct,
      LL.chats.tabHints.groups,
      LL.chats.tabHints.requests,
      activeTab,
      directChatCount,
      groupChatCount,
      requestCount,
      theme.colors.text,
      theme.colors.textMuted,
    ],
  );

  const header = useMemo(
    () => (
      <View style={styles.preTabsSection}>
        <CompactIntro
          body={
            activeTab === "groups"
              ? LL.chats.tabSubtitles.groups()
              : activeTab === "direct"
                ? LL.chats.tabSubtitles.direct()
                : LL.chats.tabSubtitles.requests()
          }
          eyebrow={LL.chats.eyebrow()}
          style={styles.headerIntro}
          title={
            activeTab === "groups"
              ? LL.chats.groups.title()
              : activeTab === "direct"
                ? LL.chats.direct.title()
                : LL.chats.requests.title()
          }
        />
      </View>
    ),
    [LL, activeTab, styles.headerIntro, styles.preTabsSection],
  );

  const visibleItems = useMemo<ChatsListItem[]>(() => {
    if (activeTab === "groups") {
      return chatSummaries.summaries
        .filter((chat) => chat.kind === "group")
        .map((chat) => ({
          chat,
          kind: "groupChat" as const,
        }));
    }

    if (activeTab === "direct") {
      return chatSummaries.summaries
        .filter((chat) => chat.kind === "direct")
        .map((chat) => ({
        chat,
        kind: "directChat" as const,
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

  const pingInterestDemandCounts = useMemo(() => {
    const counts = new Map<string, number>();

    for (const ping of pingInbox.pings) {
      counts.set(ping.interestId, (counts.get(ping.interestId) ?? 0) + 1);
    }

    return counts;
  }, [pingInbox.pings]);

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
    setAcceptSheetRemountKey((current) => current + 1);
    setAcceptSheetVisible(true);
  }, []);

  const closeAcceptFlow = useCallback(() => {
    setAcceptSheetVisible(false);
  }, []);

  const confirmAcceptFlow = useCallback(async () => {
    if (!acceptingPing) return;

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
      setAcceptSheetVisible(false);
      showToast({
        message: LL.chats.activityAccept.failed(),
        placement: "bottom",
        variant: "error",
      });
    }
  }, [LL, acceptingPing, chatSummaries, pingInbox, showToast]);

  const openAcceptedActivity = useCallback(() => {
    if (!acceptedActivityGroupId) return;

    setAcceptSheetVisible(false);
    router.push(routes.group(acceptedActivityGroupId));
  }, [acceptedActivityGroupId, router]);

  const empty = useMemo(() => {
    if (activeTab === "groups") {
      return (
        <Panel variant="muted" style={styles.emptyPanel}>
          <UiText variant="panelTitle">{LL.chats.groups.title()}</UiText>
          <UiText variant="panelBody">{LL.chats.groups.empty()}</UiText>
        </Panel>
      );
    }

    if (activeTab === "direct") {
      return (
        <Panel variant="muted" style={styles.emptyPanel}>
          <UiText variant="panelTitle">{LL.chats.direct.title()}</UiText>
          <UiText variant="panelBody">
            {chatSummaries.loading ? LL.chats.direct.loading() : LL.chats.direct.empty()}
          </UiText>
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
    chatSummaries.loading,
    connectionRequests.loading,
    pingInbox.loading,
    styles.emptyPanel,
  ]);

  const renderChatSummary = ({
    isLastItem,
    item,
  }: {
    isLastItem: boolean;
    item: ChatSummary;
  }) => (
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
        styles.chatSection,
        isLastItem ? styles.lastFeedSection : null,
        pressed ? styles.chatCardPressed : null,
      ]}
    >
      <View style={styles.sectionContent}>
        <View style={styles.itemIcon}>
          <Ionicons
            color={theme.colors.text}
            name={item.kind === "direct" ? "paper-plane-outline" : "chatbubbles-outline"}
            size={22}
          />
        </View>
        <View style={styles.itemCopy}>
          <View style={styles.chatTitleRow}>
            <UiText variant="panelTitle" style={styles.chatTitle}>
              {item.title}
            </UiText>
            {item.unreadCount > 0 ? (
              <UiText variant="status" style={styles.unreadBadge}>
                {item.unreadCount}
              </UiText>
            ) : null}
          </View>
          <UiText variant="panelBody" style={styles.chatMeta}>
            {item.kind === "direct"
              ? item.unreadCount > 0
                ? LL.chats.groups.newMessages({ count: item.unreadCount })
                : LL.chats.direct.title()
              : item.unreadCount > 0
                ? `${LL.chats.groups.members({ count: item.memberCount })} · ${LL.chats.groups.newMessages({ count: item.unreadCount })}`
                : LL.chats.groups.members({ count: item.memberCount })}
          </UiText>
          {item.lastMessageBody ? (
            <UiText variant="feedback" style={styles.lastMessage}>
              {item.lastMessageBody}
            </UiText>
          ) : null}
        </View>
        <Ionicons color={theme.colors.textMuted} name="chevron-forward" size={20} />
      </View>
    </Pressable>
  );

  const renderPingRequest = ({
    isLastItem,
    item,
  }: {
    isLastItem: boolean;
    item: IncomingActivationPing;
  }) => {
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
    const interestDemandCount =
      pingInterestDemandCounts.get(item.interestId) ?? 1;
    const interestDemandLabel =
      interestDemandCount === 1
        ? LL.activities.pings.interestDemandOne({
            interest: item.interestName,
          })
        : LL.activities.pings.interestDemandMany({
            count: interestDemandCount,
            interest: item.interestName,
          });
    const activityIcon = activityIconForInterest({
      name: item.interestName,
      slug: item.interestSlug ?? "",
    });

    return (
      <AnimatedListItem isRemoving={isRemoving}>
        <View
          style={[
            styles.requestSection,
            isLastItem ? styles.lastFeedSection : null,
          ]}
        >
          <View style={styles.sectionContent}>
            <View style={styles.itemIcon}>
              <Ionicons color={theme.colors.text} name={activityIcon} size={24} />
            </View>
            <View style={styles.itemCopy}>
              <UiText variant="eyebrow">{interestDemandLabel}</UiText>
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
          </View>

          <View style={styles.requestResponseStack}>
            <View style={styles.requestResponseRow}>
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
                style={styles.requestResponsePrimaryAction}
              />
              {item.existingDirectConversationId ? (
                <Button
                  disabled={pingInbox.responding || isRemoving}
                  label={LL.chats.requests.openExistingChat()}
                  onPress={() => {
                    if (!item.existingDirectConversationId) return;

                    router.push(
                      routes.directChat(item.existingDirectConversationId),
                    );
                  }}
                  style={styles.requestResponseSecondaryAction}
                  variant="tonal"
                />
              ) : (
                <Button
                  disabled={pingInbox.responding || isRemoving}
                  label={LL.activities.pings.maybe()}
                  onPress={() => {
                    void handleResponse("maybe");
                  }}
                  style={styles.requestResponseSecondaryAction}
                  variant="tonal"
                />
              )}
            </View>
            <Pressable
              accessibilityRole="button"
              disabled={pingInbox.responding || isRemoving}
              onPress={() => {
                void handleResponse("no");
              }}
              style={styles.requestDeclineAction}
            >
              <UiText variant="button" style={styles.requestDeclineText}>
                {LL.activities.pings.no()}
              </UiText>
            </Pressable>
          </View>
        </View>
      </AnimatedListItem>
    );
  };

  const renderConnectionRequest = ({
    isLastItem,
    item,
  }: {
    isLastItem: boolean;
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
        <View style={[styles.requestSection, isLastItem ? styles.lastFeedSection : null]}>
          <View style={styles.sectionContent}>
            <View style={styles.itemIcon}>
              <Ionicons color={theme.colors.text} name="person-add-outline" size={23} />
            </View>
            <View style={styles.itemCopy}>
              <UiText variant="eyebrow">{LL.peopleConnect.eyebrow()}</UiText>
              <UiText variant="panelTitle" style={styles.chatTitle}>
                {LL.chats.requests.connectionTitle({ name: item.otherName })}
              </UiText>
              <UiText variant="panelBody" style={styles.chatMeta}>
                {LL.chats.requests.connectionBody()}
              </UiText>
            </View>
          </View>

          <View style={styles.requestMessagePanel}>
            <UiText variant="panelBody" style={styles.lastMessage}>
              {item.message ?? LL.chats.requests.connectionMessageFallback()}
            </UiText>
          </View>

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

  const renderListItem = ({
    index,
    item,
  }: {
    index: number;
    item: ChatsListItem;
  }) => {
    const isLastItem = index === visibleItems.length - 1;

    if (item.kind === "pingRequest") {
      return renderPingRequest({ isLastItem, item: item.ping });
    }

    if (item.kind === "connectionRequest") {
      return renderConnectionRequest({
        isLastItem,
        item: item.connectionRequest,
      });
    }

    return renderChatSummary({ isLastItem, item: item.chat });
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
      <Animated.View
        onLayout={onContentLayout}
        style={[styles.contentSwipeZone, contentDragStyle]}
        {...contentPanHandlers}
      >
        <StickySegmentedTabs
          items={tabItems}
          pinnedTabsContainerStyle={styles.chatsPinnedTabsContainer}
          preTabsContent={header}
          tabsContainerStyle={styles.chatsTabsContainer}
          testID="chats-inbox-tabs"
          value={activeTab}
          onChange={setActiveTab}
          {...(tabDragProgress == null ? {} : { dragProgress: tabDragProgress })}
        >
          {({ header: stickyHeader, onScroll, overlay }) => (
            <>
              {overlay}
              <List<ChatsListItem>
                contentContainerStyle={styles.listContent}
                data={visibleItems}
                itemGap={0}
                keyExtractor={(item) =>
                  item.kind === "pingRequest"
                    ? `ping:${item.ping.id}`
                    : item.kind === "connectionRequest"
                      ? `connection:${item.connectionRequest.id}`
                      : `chat:${item.chat.kind}:${item.chat.id}`
                }
                ListEmptyComponent={empty}
                ListHeaderComponent={stickyHeader}
                onScroll={onScroll}
                renderItem={renderListItem}
                scrollEventThrottle={16}
                style={styles.list}
              />
            </>
          )}
        </StickySegmentedTabs>
      </Animated.View>
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
  const { borderWidths, colors, fontSizes, lineHeights, radii, spacing } = theme;

  const feedSection = {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderTopWidth: borderWidths.hairline,
  };

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
    contentSwipeZone: {
      flex: 1,
      position: "relative",
    },
    listContent: {
      paddingBottom: tabBarTotalHeight(theme, bottomInset) + spacing[4],
      paddingHorizontal: 0,
      paddingTop: spacing[4],
    },
    preTabsSection: {
      gap: spacing[1],
    },
    headerIntro: {
      maxWidth: "92%",
      paddingHorizontal: spacing[SCREEN_CONTENT_GUTTER_SPACING],
    },
    emptyPanel: {
      gap: spacing[3],
      marginHorizontal: spacing[SCREEN_CONTENT_GUTTER_SPACING],
      paddingVertical: spacing[1],
    },
    chatsTabsContainer: {
      backgroundColor: colors.background,
      paddingHorizontal: spacing[SCREEN_CONTENT_GUTTER_SPACING],
    },
    chatsPinnedTabsContainer: {
      paddingBottom: 0,
      paddingTop: 0,
    },
    chatSection: {
      ...feedSection,
    },
    requestSection: {
      ...feedSection,
    },
    lastFeedSection: {
      borderBottomWidth: borderWidths.hairline,
    },
    chatCardPressed: {
      opacity: 0.9,
    },
    sectionContent: {
      alignItems: "flex-start",
      flexDirection: "row",
      gap: spacing[3],
      paddingHorizontal: spacing[SCREEN_CONTENT_GUTTER_SPACING],
      paddingVertical: spacing[5],
    },
    itemIcon: {
      alignItems: "center",
      backgroundColor: colors.surfaceMuted,
      borderRadius: radii.full,
      height: 46,
      justifyContent: "center",
      width: 46,
    },
    itemCopy: {
      flex: 1,
      gap: spacing[1],
      minWidth: 0,
    },
    chatTitleRow: {
      alignItems: "flex-start",
      flexDirection: "row",
      gap: spacing[2],
    },
    chatTitle: {
      color: colors.text,
      flex: 1,
    },
    chatMeta: {
      color: colors.textMuted,
    },
    unreadBadge: {
      backgroundColor: colors.warningSoft,
      borderRadius: radii.full,
      color: colors.text,
      minWidth: 28,
      overflow: "hidden",
      paddingHorizontal: spacing[2],
      paddingVertical: spacing[0.5],
      textAlign: "center",
    },
    lastMessage: {
      color: colors.brand,
    },
    requestActions: {
      gap: spacing[3],
      paddingBottom: spacing[5],
      paddingHorizontal: spacing[SCREEN_CONTENT_GUTTER_SPACING],
    },
    requestResponseStack: {
      gap: spacing[2],
      paddingBottom: spacing[5],
      paddingHorizontal: spacing[SCREEN_CONTENT_GUTTER_SPACING],
    },
    requestResponseRow: {
      flexDirection: "row",
      gap: spacing[2],
    },
    requestPrimaryAction: {
      alignSelf: "stretch",
    },
    requestResponsePrimaryAction: {
      flex: 1.15,
      minHeight: 44,
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[2],
    },
    requestResponseSecondaryAction: {
      flex: 1,
      minHeight: 44,
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[2],
    },
    requestDeclineAction: {
      alignItems: "center",
      alignSelf: "center",
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[2],
    },
    requestDeclineText: {
      color: colors.textMuted,
      textDecorationLine: "underline",
    },
    requestMessagePanel: {
      backgroundColor: colors.background,
      borderColor: colors.border,
      borderTopWidth: borderWidths.hairline,
      padding: spacing[4],
      paddingHorizontal: spacing[SCREEN_CONTENT_GUTTER_SPACING],
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
      backgroundColor: colors.surfaceMuted,
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
    acceptSheetActions: {
      gap: spacing[2],
    },
  });
};
