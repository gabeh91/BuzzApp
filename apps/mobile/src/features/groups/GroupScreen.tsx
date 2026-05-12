import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Share, StyleSheet, View } from "react-native";

import {
  useActivityGroupSummaryQuery,
  useGroupMessagesQuery,
  useSendGroupMessageMutation,
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
import { useSettlingProgressState } from "@/features/progress/SettlingProgressProvider";
import {
  canShowExactLocation,
  createBlockPayload,
  createReportDraft,
} from "@/features/safety/safetyActions";
import { useI18n } from "@/i18n/I18nProvider";
import {
  runAttendanceAction,
  runBlockAction,
  runCreateInviteAction,
  runFeedbackAction,
  runLeaveGroupAction,
  runReportAction,
} from "@/lib/functions";
import { routes } from "@/navigation/routes";
import { useBuzzTheme } from "@/theme/ThemeProvider";
import type { BuzzTheme } from "@/theme/tokens";
import {
  Button,
  Header,
  List,
  Screen,
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

type GroupScreenRow =
  | { type: "context" }
  | { type: "plan" }
  | { type: "safety" }
  | { type: "invite" }
  | { type: "attendance" }
  | { type: "chatHeader" }
  | { type: "chatEmpty" }
  | { type: "chatMessage"; message: ChatMessage }
  | { type: "chatFooter" }
  | { type: "backHome" };

export const GroupScreen = ({ groupId }: GroupScreenProps) => {
  const router = useRouter();
  const { requireAuth, user } = useBuzzAuth();
  const { state } = useInterestFlow();
  const { LL } = useI18n();
  const { theme } = useBuzzTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const match = state.matchPreview;
  const isLocalGroup = groupId.startsWith("local-");
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [inviteFeedback, setInviteFeedback] = useState<string | null>(null);
  const [inviteCreating, setInviteCreating] = useState(false);
  const [attendanceFeedback, setAttendanceFeedback] = useState<string | null>(
    null,
  );
  const [attendanceSubmitting, setAttendanceSubmitting] = useState(false);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [safetyFeedback, setSafetyFeedback] = useState<string | null>(null);
  const [safetySubmitting, setSafetySubmitting] = useState(false);
  const [confirmationStatus, setConfirmationStatus] =
    useState<ActivityPlanConfirmationStatus>("pending");
  const { markAttendanceConfirmed, markFeedbackCompleted, markGroupJoined } =
    useSettlingProgressState();
  const { data: groupSummaryData } = useActivityGroupSummaryQuery({
    variables: { groupId },
    skip: isLocalGroup,
  });
  const { data: messagesData } = useGroupMessagesQuery({
    variables: { groupId },
    skip: isLocalGroup,
  });
  const [sendGroupMessage, { loading: sendingMessage }] =
    useSendGroupMessageMutation();
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
  const remoteMessages: ChatMessage[] = useMemo(
    () => {
      const edges = messagesData?.groupMessagesCollection?.edges ?? [];
      const mappedMessages: ChatMessage[] = [];

      for (const { node } of edges) {
        mappedMessages.push({
          id: node.id,
          body: node.body,
          createdAt: node.createdAt,
          isOwnMessage: node.senderId === user.id,
          moderationStatus: node.moderationStatus,
        });
      }

      return mappedMessages;
    },
    [messagesData?.groupMessagesCollection?.edges, user.id],
  );
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

    await requireAuth("chat", async (authUser) => {
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

      await sendGroupMessage({
        variables: {
          activityGroupId: groupId,
          body: draft.body,
          moderationStatus: draft.moderationStatus,
          senderId: authUser.id,
        },
      });
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

  const confirmAttendance = async () => {
    await requireAuth("attend_activity", async (authUser, accessToken) => {
      markGroupJoined();

      if (isLocalGroup) {
        markAttendanceConfirmed();
        setAttendanceFeedback(LL.groups.attendance.attendanceConfirmed());
        return;
      }

      setAttendanceSubmitting(true);

      try {
        await runAttendanceAction({
          accessToken,
          activityGroupId: group.id,
          profileId: authUser.id,
        });
        markAttendanceConfirmed();
        setAttendanceFeedback(LL.groups.attendance.attendanceConfirmed());
      } catch {
        setAttendanceFeedback(LL.groups.attendance.attendanceFailed());
      } finally {
        setAttendanceSubmitting(false);
      }
    });
  };

  const postPlanSafety = async () => {
    await requireAuth(
      "post_activity_feedback",
      async (authUser, accessToken) => {
        markGroupJoined();

        if (isLocalGroup) {
          markFeedbackCompleted();
          setAttendanceFeedback(LL.groups.attendance.safetyCompleted());
          return;
        }

        setFeedbackSubmitting(true);

        try {
          await runFeedbackAction({
            accessToken,
            activityGroupId: group.id,
            feltSafe: true,
            profileId: authUser.id,
            wouldMeetAgain: true,
          });
          markFeedbackCompleted();
          setAttendanceFeedback(LL.groups.attendance.safetyCompleted());
        } catch {
          setAttendanceFeedback(LL.groups.attendance.feedbackFailed());
        } finally {
          setFeedbackSubmitting(false);
        }
      },
    );
  };

  const postPlanIssue = async () => {
    await requireAuth(
      "post_activity_feedback",
      async (authUser, accessToken) => {
        markGroupJoined();

        if (isLocalGroup) {
          markFeedbackCompleted();
          setAttendanceFeedback(LL.groups.attendance.issueReported());
          return;
        }

        setFeedbackSubmitting(true);

        try {
          await runFeedbackAction({
            accessToken,
            activityGroupId: group.id,
            feltSafe: false,
            profileId: authUser.id,
            wouldMeetAgain: false,
          });
          await runReportAction({
            accessToken,
            activityGroupId: group.id,
            category: "unsafe",
            profileId: authUser.id,
            reason: "Post-plan safety issue",
          });
          markFeedbackCompleted();
          setAttendanceFeedback(LL.groups.attendance.issueReported());
        } catch {
          setAttendanceFeedback(LL.groups.attendance.feedbackFailed());
        } finally {
          setFeedbackSubmitting(false);
        }
      },
    );
  };

  const handlePlanConfirmation = async (
    nextStatus: ActivityPlanConfirmationStatus,
  ) => {
    await requireAuth("attend_activity", async () => {
      setConfirmationStatus(nextStatus);
    });
  };

  const groupRows = useMemo<GroupScreenRow[]>(() => {
    const rows: GroupScreenRow[] = [
      { type: "context" },
      { type: "plan" },
      { type: "safety" },
      { type: "invite" },
      { type: "attendance" },
      { type: "chatHeader" },
    ];

    if (messages.length === 0) {
      rows.push({ type: "chatEmpty" });
    } else {
      for (const message of messages) {
        rows.push({ type: "chatMessage", message });
      }
    }

    rows.push({ type: "chatFooter" }, { type: "backHome" });

    return rows;
  }, [messages]);

  const getGroupRowKey = useCallback((row: GroupScreenRow) => {
    if (row.type === "chatMessage") {
      return `message-${row.message.id}`;
    }

    return row.type;
  }, []);

  const listHeader = useMemo(
    () => (
      <View style={styles.headerStack}>
        <Header
          left={<UiText variant="eyebrow">{LL.groups.eyebrow()}</UiText>}
          right={
            <UiText variant="status" style={styles.status}>
              {LL.groups.formingStatus()}
            </UiText>
          }
        />

        <View style={styles.hero}>
          <UiText style={styles.title}>
            {LL.groups.title({ interest: group.interestName })}
          </UiText>
          <UiText style={styles.body}>{LL.groups.formingBody()}</UiText>
        </View>
      </View>
    ),
    [
      LL,
      group.interestName,
      styles.body,
      styles.headerStack,
      styles.hero,
      styles.status,
      styles.title,
    ],
  );

  const listExtraData = useMemo(
    () => ({
      attendanceFeedback,
      attendanceSubmitting,
      confirmationStatus,
      feedbackSubmitting,
      inviteCreating,
      inviteFeedback,
      inviteLink,
      safetyFeedback,
      safetySubmitting,
      sendingMessage,
    }),
    [
      attendanceFeedback,
      attendanceSubmitting,
      confirmationStatus,
      feedbackSubmitting,
      inviteCreating,
      inviteFeedback,
      inviteLink,
      safetyFeedback,
      safetySubmitting,
      sendingMessage,
    ],
  );

  const renderGroupRow = useCallback<ListRenderItem<GroupScreenRow>>(
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
              <UiText style={styles.planCardTitle}>
                {activityPlan.title}
              </UiText>
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
                  style={styles.confirmationAction}
                  variant="neutral"
                />
                <Button
                  label={LL.groups.planCard.requestChanges()}
                  onPress={() => void handlePlanConfirmation("needs_changes")}
                  style={styles.confirmationAction}
                  variant="neutral"
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
              <View style={styles.safetyActions}>
                <Button
                  disabled={safetySubmitting}
                  label={LL.groups.safety.report()}
                  onPress={handlePrepareReport}
                  style={styles.safetyAction}
                  variant="neutral"
                />
                <Button
                  disabled={safetySubmitting}
                  label={LL.groups.safety.block()}
                  onPress={handlePrepareBlock}
                  style={styles.safetyAction}
                  variant="neutral"
                />
                <Button
                  disabled={safetySubmitting}
                  label={LL.groups.safety.leave()}
                  onPress={handlePrepareLeave}
                  style={styles.safetyAction}
                  variant="neutral"
                />
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
              <Button
                disabled={inviteCreating}
                label={
                  inviteCreating
                    ? LL.groups.invites.creating()
                    : LL.groups.invites.create()
                }
                onPress={handlePrepareInvite}
                style={styles.inviteAction}
                variant="neutral"
              />
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
                <UiText style={styles.safetyFeedback}>
                  {inviteFeedback}
                </UiText>
              ) : null}
            </View>
          );

        case "attendance":
          return (
            <View style={[styles.attendancePanel, styles.section]}>
              <View style={styles.detailStack}>
                <UiText style={styles.detailTitle}>
                  {LL.groups.attendance.title()}
                </UiText>
                <UiText style={styles.detailBody}>
                  {LL.groups.attendance.body()}
                </UiText>
              </View>
              <View style={styles.safetyActions}>
                <Button
                  disabled={attendanceSubmitting}
                  label={LL.groups.attendance.confirmAttendance()}
                  onPress={confirmAttendance}
                  style={styles.safetyAction}
                  variant="neutral"
                />
                <Button
                  disabled={feedbackSubmitting}
                  label={LL.groups.attendance.postPlanSafety()}
                  onPress={postPlanSafety}
                  style={styles.safetyAction}
                  variant="neutral"
                />
                <Button
                  disabled={feedbackSubmitting}
                  label={LL.groups.attendance.reportIssue()}
                  onPress={postPlanIssue}
                  style={styles.safetyAction}
                  variant="neutral"
                />
              </View>
              {attendanceFeedback ? (
                <UiText style={styles.safetyFeedback}>
                  {attendanceFeedback}
                </UiText>
              ) : null}
            </View>
          );

        case "chatHeader":
          return <View style={styles.chatPanelHeader} />;

        case "chatEmpty":
          return (
            <View style={styles.chatEmptyRow}>
              <UiText style={styles.chatEmpty}>{LL.chat.empty()}</UiText>
            </View>
          );

        case "chatMessage":
          return (
            <View style={styles.chatMessageRow}>
              <MessageBubble message={item.message} />
            </View>
          );

        case "chatFooter":
          return (
            <View style={[styles.chatPanelFooter, styles.section]}>
              <ChatComposer
                blockedLabel={LL.chat.blocked()}
                disabled={sendingMessage}
                onSend={handleSendMessage}
                placeholder={LL.chat.composerPlaceholder()}
                sendLabel={LL.chat.send()}
                sendingLabel={LL.chat.sending()}
              />
            </View>
          );

        case "backHome":
          return (
            <Button
              label={LL.groups.backHome()}
              onPress={() => {
                router.replace(routes.home);
              }}
              style={styles.button}
            />
          );
      }

      return null;
    },
    [
      LL,
      activityPlan,
      attendanceFeedback,
      attendanceSubmitting,
      confirmAttendance,
      exactLocationVisible,
      feedbackSubmitting,
      getConfirmationStatusCopy,
      group.matchName,
      group.suggestedPlan,
      handlePlanConfirmation,
      handlePrepareBlock,
      handlePrepareInvite,
      handlePrepareLeave,
      handlePrepareReport,
      handleSendMessage,
      inviteCreating,
      inviteFeedback,
      inviteLink,
      postPlanIssue,
      postPlanSafety,
      router,
      safetyFeedback,
      safetySubmitting,
      sendingMessage,
      styles,
    ],
  );

  return (
    <Screen contentStyle={styles.content} scroll={false}>
      <List
        contentContainerStyle={styles.listContent}
        data={groupRows}
        extraData={listExtraData}
        keyExtractor={getGroupRowKey}
        ListHeaderComponent={listHeader}
        renderItem={renderGroupRow}
        style={styles.list}
      />
    </Screen>
  );
};

const createStyles = (theme: BuzzTheme) => {
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

  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      flexGrow: 1,
      gap: 0,
      padding: 0,
    },
    list: {
      flex: 1,
    },
    listContent: {
      padding: spacing[6],
      paddingBottom: spacing[8],
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
      fontWeight: "900",
      letterSpacing: 1,
      textTransform: "uppercase",
    },
    status: {
      backgroundColor: colors.accentSoft,
      borderRadius: radii.full,
      color: colors.accent,
      fontSize: fontSizes.xs,
      fontWeight: "900",
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
    chatPanel: {
      backgroundColor: colors.surfaceMuted,
      borderRadius: radii.xl,
      gap: spacing[5],
      padding: spacing[5],
    },
    chatPanelHeader: {
      backgroundColor: colors.surfaceMuted,
      borderTopLeftRadius: radii.xl,
      borderTopRightRadius: radii.xl,
      height: spacing[5],
    },
    chatEmptyRow: {
      backgroundColor: colors.surfaceMuted,
      paddingHorizontal: spacing[5],
      paddingBottom: spacing[3],
    },
    chatEmpty: {
      color: colors.brand,
      fontSize: fontSizes.base,
      lineHeight: lineHeights.body,
    },
    chatMessageRow: {
      backgroundColor: colors.surfaceMuted,
      paddingHorizontal: spacing[5],
      paddingBottom: spacing[3],
    },
    chatPanelFooter: {
      backgroundColor: colors.surfaceMuted,
      borderBottomLeftRadius: radii.xl,
      borderBottomRightRadius: radii.xl,
      paddingHorizontal: spacing[5],
      paddingTop: spacing[2],
      paddingBottom: spacing[5],
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
      fontWeight: "900",
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
      fontWeight: "800",
      overflow: "hidden",
      paddingHorizontal: spacing[2],
      paddingVertical: spacing[1],
    },
    planSafety: {
      color: colors.textMuted,
      fontSize: fontSizes.sm,
      fontWeight: "800",
      lineHeight: lineHeights.tight,
    },
    confirmationActions: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing[3],
    },
    confirmationAction: {
      alignItems: "center",
      backgroundColor: colors.surfaceMuted,
      borderRadius: radii.sm,
      minWidth: 128,
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[2],
    },
    safetyPanel: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: radii.xl,
      borderWidth: borderWidths.hairline,
      gap: spacing[4],
      padding: spacing[5],
    },
    safetyActions: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing[3],
    },
    safetyAction: {
      alignItems: "center",
      borderColor: colors.border,
      borderRadius: radii.sm,
      borderWidth: borderWidths.hairline,
      minWidth: 88,
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[2],
    },
    safetyActionText: {
      color: colors.text,
      fontSize: fontSizes.sm,
      fontWeight: "900",
    },
    safetyFeedback: {
      color: colors.textMuted,
      fontSize: fontSizes.sm,
      fontWeight: "800",
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
    attendancePanel: {
      backgroundColor: colors.surfaceMuted,
      borderRadius: radii.xl,
      gap: spacing[4],
      padding: spacing[5],
    },
    inviteAction: {
      alignItems: "center",
      alignSelf: "flex-start",
      backgroundColor: colors.surfaceMuted,
      borderRadius: radii.sm,
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[3],
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
      fontWeight: "800",
      lineHeight: lineHeights.tight,
    },
    panelLabel: {
      color: colors.brand,
      fontSize: fontSizes["2xl"],
      fontWeight: "900",
      lineHeight: lineHeights.title,
    },
    detailStack: {
      gap: spacing[2],
    },
    detailTitle: {
      color: colors.brand,
      fontSize: fontSizes.sm,
      fontWeight: "900",
      letterSpacing: 0.6,
      textTransform: "uppercase",
    },
    detailBody: {
      color: colors.brand,
      fontSize: fontSizes.base,
      lineHeight: lineHeights.body,
    },
    button: {
      alignItems: "center",
      backgroundColor: colors.surfaceInverse,
      borderRadius: radii.full,
      paddingHorizontal: spacing[5],
      paddingVertical: spacing[4],
    },
    buttonText: {
      color: colors.textInverse,
      fontSize: fontSizes.base,
      fontWeight: "900",
    },
  });
};
