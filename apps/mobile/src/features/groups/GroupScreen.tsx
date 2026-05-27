import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  useActivityGroupSummaryQuery,
  useGroupMessagesQuery,
} from "@graphql/generated";
import { useBuzzAuth } from "@/auth/AuthProvider";
import { ChatComposer } from "@/features/chat/ChatComposer";
import { createChatDraft } from "@/features/chat/chatModel";
import { MessageBubble, type ChatMessage } from "@/features/chat/MessageBubble";
import { useGroupMessages } from "@/features/chat/useGroupMessages";
import { createCityContextFallback } from "@/features/city/cityContext";
import { useInterestFlow } from "@/features/interests/InterestFlowProvider";
import {
  createGroupInviteLink,
  createInviteDraft,
} from "@/features/invites/inviteModel";
import {
  createDefaultActivityPlan,
  type ActivityPlanConfirmationStatus,
} from "@/features/plans/activityPlan";
import {
  canShowExactLocation,
  createBlockPayload,
  createReportDraft,
} from "@/features/safety/safetyActions";
import { useI18n } from "@/i18n/I18nProvider";
import {
  runBlockAction,
  runCreateInviteAction,
  runLeaveGroupAction,
  runReportAction,
} from "@/lib/functions";
import { buzzSupabase } from "@/lib/supabase";
import { routes } from "@/navigation/routes";
import { tabBarTotalHeight } from "@/navigation/tabBarLayout";
import { useBuzzTheme } from "@/theme/ThemeProvider";
import { type BuzzTheme } from "@/theme/tokens";
import {
  Avatar,
  BackHeader,
  Button,
  List,
  Panel,
  Screen,
  SegmentedTwoTabs,
  Sheet,
  Text as UiText,
  type ListRenderItem,
} from "@/ui";

import type { ActivityGroupSummary } from "./group.types";

export type GroupScreenProps = {
  groupId: string;
};

const createGroupSummary = ({
  groupId,
  fallbackInterest,
  matchName,
  selectedInterestName,
  suggestedPlan,
}: {
  groupId: string;
  fallbackInterest: string;
  matchName?: string;
  selectedInterestName?: string;
  suggestedPlan?: string;
}): ActivityGroupSummary => {
  const summary: ActivityGroupSummary = {
    id: groupId,
    interestName: selectedInterestName ?? fallbackInterest,
    status: "forming",
  };

  if (matchName) {
    summary.matchName = matchName;
  }

  if (suggestedPlan) {
    summary.suggestedPlan = suggestedPlan;
  }

  return summary;
};

const normalizeGroupStatus = (
  status: string | undefined,
): ActivityGroupSummary["status"] => {
  if (status === "active" || status === "archived" || status === "forming") {
    return status;
  }

  return "forming";
};

type DetailGroupRow =
  | { type: "context" }
  | { type: "plan" }
  | { type: "safety" }
  | { type: "invite" };

type ChatGroupRow =
  | { type: "chatEmpty" }
  | { type: "chatMessage"; message: ChatMessage; showAvatar: boolean };

export const GroupScreen = ({ groupId }: GroupScreenProps) => {
  const router = useRouter();
  const handleLeaveGroupScreen = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(routes.chats);
  }, [router]);
  const { requireAuth, user } = useBuzzAuth();
  const { state } = useInterestFlow();
  const { LL } = useI18n();
  const { theme } = useBuzzTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(
    () => createStyles(theme, insets.bottom),
    [theme, insets.bottom],
  );
  const match = state.matchPreview;
  const isLocalGroup = groupId.startsWith("local-");
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [inviteFeedback, setInviteFeedback] = useState<string | null>(null);
  const [inviteCreating, setInviteCreating] = useState(false);
  const [safetyFeedback, setSafetyFeedback] = useState<string | null>(null);
  const [safetySubmitting, setSafetySubmitting] = useState(false);
  const [confirmationStatus, setConfirmationStatus] =
    useState<ActivityPlanConfirmationStatus>("pending");
  const { data: groupSummaryData } = useActivityGroupSummaryQuery({
    variables: { groupId },
    skip: isLocalGroup,
  });
  const { data: messagesData } = useGroupMessagesQuery({
    variables: { groupId },
    skip: isLocalGroup,
  });
  const [sendingMessage, setSendingMessage] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "chat">("details");
  const [groupMenuVisible, setGroupMenuVisible] = useState(false);
  const [groupMenuRemountKey, setGroupMenuRemountKey] = useState(0);
  const remoteGroup =
    groupSummaryData?.activityGroupsCollection?.edges[0]?.node ?? null;
  const remotePlan =
    remoteGroup?.activityPlansCollection?.edges[0]?.node ?? null;
  const groupInput: Parameters<typeof createGroupSummary>[0] = {
    groupId,
    fallbackInterest: remoteGroup?.title ?? LL.home.fallbackInterest(),
  };

  if (match?.displayName) {
    groupInput.matchName = match.displayName;
  }

  if (state.selectedInterest?.name) {
    groupInput.selectedInterestName = state.selectedInterest.name;
  }

  if (remoteGroup?.interest?.name) {
    groupInput.selectedInterestName = remoteGroup.interest.name;
  }

  if (match?.suggestedPlan) {
    groupInput.suggestedPlan = match.suggestedPlan;
  }

  if (remotePlan?.description) {
    groupInput.suggestedPlan = remotePlan.description;
  }

  const group = createGroupSummary(groupInput);
  group.status = normalizeGroupStatus(remoteGroup?.status);
  const cityContext = createCityContextFallback({
    cityId: remoteGroup?.city?.id ?? user.cityId,
    cityName: remoteGroup?.city?.name ?? user.cityName,
  });
  const defaultActivityPlan = createDefaultActivityPlan({
    cityContext,
    interestName: group.interestName,
    matchSuggestion: group.suggestedPlan ?? LL.groups.nextStepBody(),
  });
  const activityPlan = remotePlan
    ? {
        ...defaultActivityPlan,
        capacityMax: remotePlan.capacityMax,
        capacityMin: remotePlan.capacityMin,
        matchSuggestion:
          remotePlan.description ??
          group.suggestedPlan ??
          LL.groups.nextStepBody(),
        publicLocationName: remotePlan.publicLocationName,
        safetyGuidance: remotePlan.safetyGuidance,
        suggestedTiming: remotePlan.startsAt ?? remotePlan.venueType,
        title: remotePlan.title,
      }
    : defaultActivityPlan;
  const exactLocationVisible = canShowExactLocation(false);
  const remoteMessages: ChatMessage[] = useMemo(() => {
    const edges = messagesData?.groupMessagesCollection?.edges ?? [];
    const mappedMessages: ChatMessage[] = [];

    for (const { node } of edges) {
      mappedMessages.push({
        id: node.id,
        body: node.body,
        createdAt: node.createdAt,
        isOwnMessage: node.senderId === user.id,
        moderationStatus: node.moderationStatus,
        senderId: node.senderId,
        senderName:
          node.sender?.firstName ??
          node.sender?.displayName ??
          LL.chat.directTitleFallback(),
        senderPhotoUrl: node.sender?.profilePhotoUrl ?? null,
      });
    }

    return mappedMessages;
  }, [LL, messagesData?.groupMessagesCollection?.edges, user.id]);
  const realtimeMessages = useGroupMessages({
    currentUserId: user.id,
    enabled: !isLocalGroup,
    groupId,
    initialMessages: remoteMessages,
  });
  const messages = isLocalGroup ? localMessages : realtimeMessages;

  const handleSendMessage = async (body: string) => {
    const draft = createChatDraft(body);
    if (!draft.canSend) return;

    await requireAuth("chat", async () => {
      if (isLocalGroup) {
        setLocalMessages((current) => [
          ...current,
          {
            id: `local-message-${current.length + 1}`,
            body: draft.body,
            createdAt: new Date().toISOString(),
            isOwnMessage: true,
            moderationStatus: draft.moderationStatus,
          },
        ]);
        return;
      }

      setSendingMessage(true);

      try {
        const { error } = await buzzSupabase.rpc("sendGroupMessage", {
          activityGroupId: groupId,
          body: draft.body,
          moderationStatus: draft.moderationStatus,
        });

        if (error) {
          throw new Error(error.message ?? "Unable to send message");
        }
      } finally {
        setSendingMessage(false);
      }
    });
  };

  const getConfirmationStatusCopy = () => {
    if (confirmationStatus === "confirmed") {
      return LL.groups.planCard.confirmed();
    }

    if (confirmationStatus === "needs_changes") {
      return LL.groups.planCard.needsChanges();
    }

    return LL.groups.planCard.pending();
  };

  const handlePrepareReport = async () => {
    await requireAuth("safety_action", async (authUser, accessToken) => {
      const draft = createReportDraft({
        activityGroupId: group.id,
        category: "unsafe",
        reason: "Group safety check",
        reporterId: authUser.id,
      });

      if (!draft.canSubmit) {
        setSafetyFeedback(LL.groups.safety.reportUnavailable());
        return;
      }

      if (isLocalGroup) {
        setSafetyFeedback(LL.groups.safety.reportSubmitted());
        return;
      }

      setSafetySubmitting(true);

      try {
        await runReportAction({
          accessToken,
          activityGroupId: group.id,
          category: draft.category,
          profileId: authUser.id,
          reason: draft.reason,
        });
        setSafetyFeedback(LL.groups.safety.reportSubmitted());
      } catch {
        setSafetyFeedback(LL.groups.safety.reportFailed());
      } finally {
        setSafetySubmitting(false);
      }
    });
  };

  const handlePrepareBlock = async () => {
    if (!match) {
      setSafetyFeedback(LL.groups.safety.blockUnavailable());
      return;
    }

    await requireAuth("safety_action", async (authUser, accessToken) => {
      const payload = createBlockPayload({
        activityGroupId: group.id,
        blockedId: match.id,
        blockerId: authUser.id,
      });

      if (payload.source !== "group") {
        setSafetyFeedback(LL.groups.safety.blockUnavailable());
        return;
      }

      if (isLocalGroup) {
        setSafetyFeedback(
          LL.groups.safety.blockSaved({ name: match.displayName }),
        );
        return;
      }

      setSafetySubmitting(true);

      try {
        await runBlockAction({
          accessToken,
          activityGroupId: group.id,
          blockedId: payload.blockedId,
          profileId: authUser.id,
        });
        setSafetyFeedback(
          LL.groups.safety.blockSaved({ name: match.displayName }),
        );
      } catch {
        setSafetyFeedback(LL.groups.safety.blockFailed());
      } finally {
        setSafetySubmitting(false);
      }
    });
  };

  const handlePrepareLeave = async () => {
    await requireAuth("safety_action", async (authUser, accessToken) => {
      if (isLocalGroup) {
        setSafetyFeedback(LL.groups.safety.leaveConfirmed());
        return;
      }

      setSafetySubmitting(true);

      try {
        await runLeaveGroupAction({
          accessToken,
          activityGroupId: group.id,
          profileId: authUser.id,
        });
        setSafetyFeedback(LL.groups.safety.leaveConfirmed());
      } catch {
        setSafetyFeedback(LL.groups.safety.leaveFailed());
      } finally {
        setSafetySubmitting(false);
      }
    });
  };

  const handlePrepareInvite = async () => {
    await requireAuth("invite_friend", async (authUser, accessToken) => {
      const inviteDraft = createInviteDraft({
        activityGroupId: group.id,
        inviterId: authUser.id,
      });

      setInviteCreating(true);
      setInviteFeedback(null);

      try {
        const token = isLocalGroup
          ? `${inviteDraft.activityGroupId}:${inviteDraft.inviterId}`
          : (
              await runCreateInviteAction({
                accessToken,
                activityGroupId: inviteDraft.activityGroupId,
                profileId: authUser.id,
              })
            ).token;
        const link = createGroupInviteLink({
          origin: process.env.EXPO_PUBLIC_INVITE_ORIGIN ?? "https://buzz.local",
          token,
        });

        setInviteLink(link);
        await Share.share({ message: link });
        setInviteFeedback(LL.groups.invites.shared());
      } catch {
        setInviteFeedback(LL.groups.invites.failed());
      } finally {
        setInviteCreating(false);
      }
    });
  };

  const handlePlanConfirmation = async (
    nextStatus: ActivityPlanConfirmationStatus,
  ) => {
    await requireAuth("attend_activity", async () => {
      setConfirmationStatus(nextStatus);
    });
  };

  const openGroupMenu = useCallback(() => {
    setGroupMenuRemountKey((key) => key + 1);
    setGroupMenuVisible(true);
  }, []);

  const closeGroupMenu = useCallback(() => {
    setGroupMenuVisible(false);
  }, []);

  const detailRows = useMemo<DetailGroupRow[]>(
    () => [
      { type: "context" },
      { type: "plan" },
      { type: "safety" },
      { type: "invite" },
    ],
    [],
  );

  const chatRows = useMemo<ChatGroupRow[]>(() => {
    if (messages.length === 0) {
      return [{ type: "chatEmpty" }];
    }

    const rows: ChatGroupRow[] = [];

    for (let index = 0; index < messages.length; index += 1) {
      const message = messages[index];
      const nextMessage = messages[index + 1];

      if (!message) continue;

      rows.push({
        type: "chatMessage",
        message,
        showAvatar:
          !message.isOwnMessage &&
          (!nextMessage || nextMessage.senderId !== message.senderId),
      });
    }

    return rows;
  }, [messages]);

  const getDetailRowKey = useCallback((row: DetailGroupRow) => row.type, []);

  const getChatRowKey = useCallback((row: ChatGroupRow) => {
    if (row.type === "chatMessage") {
      return `message-${row.message.id}`;
    }

    return row.type;
  }, []);

  const detailListHeader = useMemo(
    () => (
      <View style={styles.headerStack}>
        <View style={styles.hero}>
          <UiText variant="eyebrow">{LL.groups.eyebrow()}</UiText>
          <UiText style={styles.title}>
            {LL.groups.title({ interest: group.interestName })}
          </UiText>
          <UiText style={styles.body}>{LL.groups.formingBody()}</UiText>
        </View>
      </View>
    ),
    [LL, group.interestName, styles.body, styles.headerStack, styles.hero, styles.title],
  );

  const fixedChrome = useMemo(
    () => (
      <View style={styles.chromeStack}>
        <BackHeader
          backLabel={LL.common.back()}
          onBack={handleLeaveGroupScreen}
          right={
            <View style={styles.chromeHeaderRow}>
              <Pressable
                accessibilityLabel={LL.groups.openMoreMenu()}
                accessibilityRole="button"
                hitSlop={12}
                onPress={openGroupMenu}
                style={({ pressed }) => [
                  styles.chromeIconButton,
                  pressed ? styles.chromeIconButtonPressed : null,
                ]}
              >
                <Ionicons
                  color={theme.colors.text}
                  name="settings-outline"
                  size={22}
                />
              </Pressable>
            </View>
          }
        />

        <SegmentedTwoTabs
          left={{
            accessibilityHint: LL.groups.tabDetailsHint(),
            label: LL.groups.tabDetails(),
          }}
          right={{
            accessibilityHint: LL.groups.tabChatHint(),
            label: LL.groups.tabChat(),
          }}
          style={styles.segmentedTabs}
          value={activeTab === "details" ? "left" : "right"}
          onChange={(next) => {
            setActiveTab(next === "left" ? "details" : "chat");
          }}
        />
      </View>
    ),
    [
      LL,
      activeTab,
      handleLeaveGroupScreen,
      openGroupMenu,
      styles.chromeHeaderRow,
      styles.chromeIconButton,
      styles.chromeIconButtonPressed,
      styles.chromeStack,
      styles.segmentedTabs,
      styles.status,
      styles.statusShrink,
      theme.colors.text,
    ],
  );

  const listExtraData = useMemo(
    () => ({
      confirmationStatus,
      inviteFeedback,
      inviteLink,
      safetyFeedback,
      safetySubmitting,
    }),
    [
      confirmationStatus,
      inviteFeedback,
      inviteLink,
      safetyFeedback,
      safetySubmitting,
    ],
  );

  const renderDetailRow = useCallback<ListRenderItem<DetailGroupRow>>(
    ({ item }) => {
      switch (item.type) {
        case "context":
          return (
            <View style={[styles.panel, styles.section]}>
              <UiText style={styles.panelLabel}>
                {group.matchName
                  ? LL.groups.matchedWith({ name: group.matchName })
                  : LL.groups.emptyMatch()}
              </UiText>
              {group.suggestedPlan ? (
                <View style={styles.detailStack}>
                  <UiText style={styles.detailTitle}>
                    {LL.groups.suggestedPlan()}
                  </UiText>
                  <UiText style={styles.detailBody}>
                    {group.suggestedPlan}
                  </UiText>
                </View>
              ) : null}
              <View style={styles.detailStack}>
                <UiText style={styles.detailTitle}>
                  {LL.groups.nextStep()}
                </UiText>
                <UiText style={styles.detailBody}>
                  {LL.groups.nextStepBody()}
                </UiText>
              </View>
            </View>
          );

        case "plan":
          return (
            <View style={[styles.planCard, styles.section]}>
              <UiText style={styles.detailTitle}>
                {LL.groups.planCard.title()}
              </UiText>
              <UiText style={styles.planCardTitle}>{activityPlan.title}</UiText>
              <View style={styles.planMetaRow}>
                <UiText style={styles.planMeta}>
                  {LL.groups.planCard.timing({
                    timing: activityPlan.suggestedTiming,
                  })}
                </UiText>
                <UiText style={styles.planMeta}>
                  {LL.groups.planCard.capacity({
                    min: activityPlan.capacityMin,
                    max: activityPlan.capacityMax,
                  })}
                </UiText>
              </View>
              <UiText style={styles.detailBody}>
                {LL.groups.planCard.location({
                  location: activityPlan.publicLocationName,
                })}
              </UiText>
              <UiText style={styles.detailBody}>
                {activityPlan.matchSuggestion}
              </UiText>
              <UiText style={styles.planSafety}>
                {activityPlan.safetyGuidance}
              </UiText>
              <View style={styles.confirmationActions}>
                <Button
                  label={LL.groups.planCard.confirm()}
                  onPress={() => void handlePlanConfirmation("confirmed")}
                  style={styles.confirmationPrimary}
                />
                <Button
                  label={LL.groups.planCard.requestChanges()}
                  onPress={() => void handlePlanConfirmation("needs_changes")}
                  style={styles.confirmationSecondary}
                  variant="bordered"
                />
              </View>
              <UiText style={styles.safetyFeedback}>
                {getConfirmationStatusCopy()}
              </UiText>
            </View>
          );

        case "safety":
          return (
            <View style={[styles.safetyPanel, styles.section]}>
              <View style={styles.detailStack}>
                <UiText style={styles.detailTitle}>
                  {LL.groups.safety.title()}
                </UiText>
                <UiText style={styles.detailBody}>
                  {exactLocationVisible
                    ? LL.groups.safety.locationVisible()
                    : LL.groups.safety.locationHidden()}
                </UiText>
              </View>
              {safetyFeedback ? (
                <UiText style={styles.safetyFeedback}>{safetyFeedback}</UiText>
              ) : null}
            </View>
          );

        case "invite":
          return (
            <View style={[styles.invitePanel, styles.section]}>
              <View style={styles.detailStack}>
                <UiText style={styles.detailTitle}>
                  {LL.groups.invites.bringFriend()}
                </UiText>
                <UiText style={styles.detailBody}>
                  {LL.groups.invites.body()}
                </UiText>
              </View>
              {inviteLink ? (
                <View style={styles.inviteLinkBox}>
                  <UiText style={styles.detailTitle}>
                    {LL.groups.invites.ready()}
                  </UiText>
                  <UiText selectable style={styles.inviteLink}>
                    {inviteLink}
                  </UiText>
                </View>
              ) : null}
              {inviteFeedback ? (
                <UiText style={styles.safetyFeedback}>{inviteFeedback}</UiText>
              ) : null}
            </View>
          );

      }

      return null;
    },
    [
      LL,
      activityPlan,
      exactLocationVisible,
      getConfirmationStatusCopy,
      group.matchName,
      group.suggestedPlan,
      handlePlanConfirmation,
      inviteFeedback,
      inviteLink,
      safetyFeedback,
      styles,
    ],
  );

  const renderChatRow = useCallback<ListRenderItem<ChatGroupRow>>(
    ({ item }) => {
      if (item.type === "chatEmpty") {
        return (
          <Panel variant="muted" style={styles.chatEmptyPanel}>
            <UiText variant="panelTitle">{LL.chat.empty()}</UiText>
          </Panel>
        );
      }

      return (
        <View
          style={[
            styles.chatMessageRow,
            item.message.isOwnMessage ? styles.chatMessageOwnRow : null,
          ]}
        >
          {!item.message.isOwnMessage ? (
            <View style={styles.chatMessageAvatarSlot}>
              {item.showAvatar ? (
                <Avatar
                  accessibilityLabel={
                    item.message.senderName ?? LL.chat.directTitleFallback()
                  }
                  fallbackInitial={
                    item.message.senderName ?? item.message.senderId
                  }
                  size={30}
                  uri={item.message.senderPhotoUrl ?? undefined}
                />
              ) : null}
            </View>
          ) : null}
          <MessageBubble message={item.message} />
        </View>
      );
    },
    [LL, styles],
  );

  return (
    <Screen
      contentStyle={styles.content}
      edges={["top", "bottom", "left", "right"]}
      scroll={false}
      stickyHeader={fixedChrome}
    >
      <View style={styles.screenBody}>
        {activeTab === "details" ? (
          <List<DetailGroupRow>
            contentContainerStyle={styles.listContent}
            data={detailRows}
            extraData={listExtraData}
            keyExtractor={getDetailRowKey}
            ListHeaderComponent={detailListHeader}
            renderItem={renderDetailRow}
            style={styles.list}
          />
        ) : (
          <KeyboardAvoidingView
            behavior={Platform.select({ ios: "padding", default: undefined })}
            keyboardVerticalOffset={Platform.select({ ios: 10, default: 0 })}
            style={styles.keyboardRoot}
          >
            <List<ChatGroupRow>
              contentContainerStyle={styles.chatListContent}
              data={chatRows}
              itemGap={theme.spacing[3]}
              keyExtractor={getChatRowKey}
              renderItem={renderChatRow}
              style={styles.list}
            />
            <View style={styles.composerDock}>
              <Panel variant="plain" style={styles.composerPanel}>
                <ChatComposer
                  blockedLabel={LL.chat.blocked()}
                  disabled={sendingMessage}
                  onSend={handleSendMessage}
                  placeholder={LL.chat.composerPlaceholder()}
                  sendLabel={LL.chat.send()}
                  sendingLabel={LL.chat.sending()}
                />
              </Panel>
            </View>
          </KeyboardAvoidingView>
        )}
      </View>

      <Sheet
        contentStyle={styles.menuSheetContent}
        onDismiss={closeGroupMenu}
        remountKey={groupMenuRemountKey}
        snapPoints={["48%"]}
        testID="group-options-sheet"
        visible={groupMenuVisible}
      >
        <View style={styles.menuSheetStack}>
          <UiText variant="panelTitle">{LL.groups.moreMenuTitle()}</UiText>
          <UiText variant="panelBody">{LL.groups.moreMenuBody()}</UiText>
          <View style={styles.menuSheetActions}>
            <Button
              disabled={inviteCreating}
              label={
                inviteCreating
                  ? LL.groups.invites.creating()
                  : LL.groups.invites.create()
              }
              onPress={() => {
                closeGroupMenu();
                void handlePrepareInvite();
              }}
              style={styles.actionButton}
            />
            <Button
              disabled={safetySubmitting}
              label={LL.groups.safety.report()}
              onPress={() => {
                closeGroupMenu();
                void handlePrepareReport();
              }}
              style={styles.actionButton}
              variant="secondary"
            />
            <Button
              disabled={safetySubmitting}
              label={LL.groups.safety.block()}
              onPress={() => {
                closeGroupMenu();
                void handlePrepareBlock();
              }}
              style={styles.actionButton}
              variant="bordered"
            />
            <Button
              disabled={safetySubmitting}
              label={LL.groups.safety.leave()}
              onPress={() => {
                closeGroupMenu();
                void handlePrepareLeave();
              }}
              style={styles.actionButton}
              variant="bordered"
            />
          </View>
        </View>
      </Sheet>
    </Screen>
  );
};

const createStyles = (theme: BuzzTheme, bottomInset: number) => {
  const {
    colors,
    fontStyles,
    fontSizes,
    lineHeights,
    radii,
    spacing,
    borderWidths,
    shadows,
  } = theme;

  const horizontalGutter = spacing[4];

  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      flexGrow: 1,
      gap: 0,
      paddingBottom: 0,
      paddingHorizontal: 0,
      paddingTop: 0,
    },
    screenBody: {
      flex: 1,
    },
    chromeStack: {
      borderBottomColor: colors.overlay,
      borderBottomWidth: borderWidths.hairline,
      gap: spacing[3],
      paddingBottom: spacing[3],
    },
    chromeHeaderRow: {
      alignItems: "center",
      flexDirection: "row",
      flexShrink: 1,
      gap: spacing[2],
      justifyContent: "flex-end",
      marginLeft: spacing[2],
      maxWidth: "100%",
    },
    chromeIconButton: {
      alignItems: "center",
      height: 40,
      justifyContent: "center",
      width: 40,
    },
    chromeIconButtonPressed: {
      opacity: 0.72,
    },
    statusShrink: {
      flexShrink: 1,
      minWidth: 0,
    },
    segmentedTabs: {
      alignSelf: "stretch",
      marginBottom: spacing[1],
    },
    keyboardRoot: {
      flex: 1,
    },
    list: {
      flex: 1,
    },
    listContent: {
      paddingBottom: tabBarTotalHeight(theme, bottomInset) + spacing[6],
      paddingHorizontal: horizontalGutter,
      paddingTop: spacing[4],
    },
    chatListContent: {
      flexGrow: 1,
      paddingBottom: tabBarTotalHeight(theme, bottomInset) + spacing[4],
      paddingHorizontal: horizontalGutter,
      paddingTop: spacing[2],
    },
    composerDock: {
      backgroundColor: colors.background,
      borderTopColor: colors.overlay,
      borderTopWidth: borderWidths.hairline,
      paddingBottom: Math.max(bottomInset, spacing[3]),
      paddingHorizontal: horizontalGutter,
      paddingTop: spacing[3],
    },
    composerPanel: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: radii.xl,
      borderWidth: borderWidths.hairline,
      gap: spacing[3],
      padding: spacing[3],
    },
    menuSheetContent: {
      paddingHorizontal: spacing[5],
    },
    menuSheetStack: {
      gap: spacing[4],
      paddingTop: spacing[2],
    },
    menuSheetActions: {
      gap: spacing[2],
    },
    headerStack: {
      gap: spacing[5],
      marginBottom: spacing[5],
    },
    section: {
      marginBottom: spacing[5],
    },
    header: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
    },
    eyebrow: {
      color: colors.accent,
      fontSize: fontSizes.xs,
      ...theme.fontStyles.black,
      letterSpacing: 1,
      textTransform: "uppercase",
    },
    status: {
      backgroundColor: colors.accentSoft,
      borderRadius: radii.full,
      color: colors.accent,
      fontSize: fontSizes.xs,
      ...theme.fontStyles.display,
      overflow: "hidden",
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[2],
    },
    hero: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: radii["2xl"],
      borderWidth: borderWidths.hairline,
      gap: spacing[3],
      padding: spacing[6],
      ...shadows.card,
    },
    title: {
      color: colors.text,
      ...fontStyles.display,
      fontSize: fontSizes.hero,
      lineHeight: lineHeights.hero,
    },
    body: {
      color: colors.textMuted,
      fontSize: fontSizes.md,
      lineHeight: lineHeights.body,
    },
    panel: {
      backgroundColor: colors.surfaceMuted,
      borderRadius: radii.xl,
      gap: spacing[5],
      padding: spacing[5],
    },
    chatEmptyPanel: {
      gap: spacing[2],
    },
    chatMessageRow: {
      alignItems: "flex-end",
      flexDirection: "row",
      gap: spacing[2],
      paddingBottom: spacing[2],
      paddingHorizontal: spacing[1],
    },
    chatMessageOwnRow: {
      justifyContent: "flex-end",
    },
    chatMessageAvatarSlot: {
      alignItems: "center",
      width: 30,
    },
    planCard: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: radii.xl,
      borderWidth: borderWidths.hairline,
      gap: spacing[3],
      padding: spacing[5],
    },
    planCardTitle: {
      color: colors.text,
      fontSize: fontSizes.xl,
      ...theme.fontStyles.display,
      lineHeight: lineHeights.title,
    },
    planMetaRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing[2],
    },
    planMeta: {
      backgroundColor: colors.surfaceMuted,
      borderRadius: radii.sm,
      color: colors.brand,
      fontSize: fontSizes.sm,
      ...theme.fontStyles.labelStrong,
      overflow: "hidden",
      paddingHorizontal: spacing[2],
      paddingVertical: spacing[1],
    },
    planSafety: {
      color: colors.textMuted,
      fontSize: fontSizes.sm,
      ...theme.fontStyles.labelStrong,
      lineHeight: lineHeights.tight,
    },
    confirmationActions: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing[2],
    },
    confirmationPrimary: {
      flex: 1,
      minWidth: 140,
    },
    confirmationSecondary: {
      flex: 1,
      minWidth: 140,
    },
    actionButton: {
      alignSelf: "stretch",
    },
    safetyPanel: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: radii.xl,
      borderWidth: borderWidths.hairline,
      gap: spacing[4],
      padding: spacing[5],
    },
    safetyFeedback: {
      color: colors.textMuted,
      fontSize: fontSizes.sm,
      ...theme.fontStyles.labelStrong,
      lineHeight: lineHeights.tight,
    },
    invitePanel: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: radii.xl,
      borderWidth: borderWidths.hairline,
      gap: spacing[4],
      padding: spacing[5],
    },
    inviteLinkBox: {
      backgroundColor: colors.background,
      borderRadius: radii.sm,
      gap: spacing[2],
      padding: spacing[3],
    },
    inviteLink: {
      color: colors.text,
      fontSize: fontSizes.sm,
      ...theme.fontStyles.labelStrong,
      lineHeight: lineHeights.tight,
    },
    panelLabel: {
      color: colors.brand,
      fontSize: fontSizes["2xl"],
      ...theme.fontStyles.display,
      lineHeight: lineHeights.title,
    },
    detailStack: {
      gap: spacing[2],
    },
    detailTitle: {
      color: colors.brand,
      fontSize: fontSizes.sm,
      ...theme.fontStyles.display,
      letterSpacing: 0.6,
      textTransform: "uppercase",
    },
    detailBody: {
      color: colors.brand,
      fontSize: fontSizes.base,
      lineHeight: lineHeights.body,
    },
  });
};
