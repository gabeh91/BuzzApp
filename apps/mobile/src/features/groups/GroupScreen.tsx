import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Share, StyleSheet, Text, View } from "react-native";

import {
  useGroupMessagesQuery,
  useSendGroupMessageMutation,
} from "@graphql/generated";
import { useBuzzAuth } from "@/auth/AuthProvider";
import { ChatComposer } from "@/features/chat/ChatComposer";
import { createChatDraft } from "@/features/chat/chatModel";
import { MessageList, type ChatMessage } from "@/features/chat/MessageList";
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
import { Button, Header, Screen, Text as UiText } from "@/ui";

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

export const GroupScreen = ({ groupId }: GroupScreenProps) => {
  const router = useRouter();
  const { user } = useBuzzAuth();
  const { state } = useInterestFlow();
  const { LL } = useI18n();
  const { theme } = useBuzzTheme();
  const styles = createStyles(theme);
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
  const { data } = useGroupMessagesQuery({
    variables: { groupId },
    skip: isLocalGroup,
  });
  const [sendGroupMessage, { loading: sendingMessage }] =
    useSendGroupMessageMutation();
  const groupInput: Parameters<typeof createGroupSummary>[0] = {
    groupId,
    fallbackInterest: LL.home.fallbackInterest(),
  };

  if (match?.displayName) {
    groupInput.matchName = match.displayName;
  }

  if (state.selectedInterest?.name) {
    groupInput.selectedInterestName = state.selectedInterest.name;
  }

  if (match?.suggestedPlan) {
    groupInput.suggestedPlan = match.suggestedPlan;
  }

  const group = createGroupSummary(groupInput);
  const cityContext = createCityContextFallback({
    cityId: user.cityId,
    cityName: user.cityName,
  });
  const activityPlan = createDefaultActivityPlan({
    cityContext,
    interestName: group.interestName,
    matchSuggestion: group.suggestedPlan ?? LL.groups.nextStepBody(),
  });
  const exactLocationVisible = canShowExactLocation(false);
  const remoteMessages: ChatMessage[] = useMemo(
    () =>
      data?.groupMessagesCollection?.edges.map(({ node }) => ({
        id: node.id,
        body: node.body,
        createdAt: node.createdAt,
        isOwnMessage: node.senderId === user.id,
        moderationStatus: node.moderationStatus,
      })) ?? [],
    [data, user.id],
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
        senderId: user.id,
      },
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
    const draft = createReportDraft({
      activityGroupId: group.id,
      category: "unsafe",
      reason: "Group safety check",
      reporterId: user.id,
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
        activityGroupId: group.id,
        category: draft.category,
        profileId: user.id,
        reason: draft.reason,
      });
      setSafetyFeedback(LL.groups.safety.reportSubmitted());
    } catch {
      setSafetyFeedback(LL.groups.safety.reportFailed());
    } finally {
      setSafetySubmitting(false);
    }
  };

  const handlePrepareBlock = async () => {
    if (!match) {
      setSafetyFeedback(LL.groups.safety.blockUnavailable());
      return;
    }

    const payload = createBlockPayload({
      activityGroupId: group.id,
      blockedId: match.id,
      blockerId: user.id,
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
        activityGroupId: group.id,
        blockedId: payload.blockedId,
        profileId: user.id,
      });
      setSafetyFeedback(
        LL.groups.safety.blockSaved({ name: match.displayName }),
      );
    } catch {
      setSafetyFeedback(LL.groups.safety.blockFailed());
    } finally {
      setSafetySubmitting(false);
    }
  };

  const handlePrepareLeave = async () => {
    if (isLocalGroup) {
      setSafetyFeedback(LL.groups.safety.leaveConfirmed());
      return;
    }

    setSafetySubmitting(true);

    try {
      await runLeaveGroupAction({
        activityGroupId: group.id,
        profileId: user.id,
      });
      setSafetyFeedback(LL.groups.safety.leaveConfirmed());
    } catch {
      setSafetyFeedback(LL.groups.safety.leaveFailed());
    } finally {
      setSafetySubmitting(false);
    }
  };

  const handlePrepareInvite = async () => {
    const inviteDraft = createInviteDraft({
      activityGroupId: group.id,
      inviterId: user.id,
    });

    setInviteCreating(true);
    setInviteFeedback(null);

    try {
      const token = isLocalGroup
        ? `${inviteDraft.activityGroupId}:${inviteDraft.inviterId}`
        : (
            await runCreateInviteAction({
              activityGroupId: inviteDraft.activityGroupId,
              profileId: user.id,
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
  };

  const confirmAttendance = async () => {
    markGroupJoined();

    if (isLocalGroup) {
      markAttendanceConfirmed();
      setAttendanceFeedback(LL.groups.attendance.attendanceConfirmed());
      return;
    }

    setAttendanceSubmitting(true);

    try {
      await runAttendanceAction({
        activityGroupId: group.id,
        profileId: user.id,
      });
      markAttendanceConfirmed();
      setAttendanceFeedback(LL.groups.attendance.attendanceConfirmed());
    } catch {
      setAttendanceFeedback(LL.groups.attendance.attendanceFailed());
    } finally {
      setAttendanceSubmitting(false);
    }
  };

  const postPlanSafety = async () => {
    markGroupJoined();

    if (isLocalGroup) {
      markFeedbackCompleted();
      setAttendanceFeedback(LL.groups.attendance.safetyCompleted());
      return;
    }

    setFeedbackSubmitting(true);

    try {
      await runFeedbackAction({
        activityGroupId: group.id,
        feltSafe: true,
        profileId: user.id,
        wouldMeetAgain: true,
      });
      markFeedbackCompleted();
      setAttendanceFeedback(LL.groups.attendance.safetyCompleted());
    } catch {
      setAttendanceFeedback(LL.groups.attendance.feedbackFailed());
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  const postPlanIssue = async () => {
    markGroupJoined();

    if (isLocalGroup) {
      markFeedbackCompleted();
      setAttendanceFeedback(LL.groups.attendance.issueReported());
      return;
    }

    setFeedbackSubmitting(true);

    try {
      await runFeedbackAction({
        activityGroupId: group.id,
        feltSafe: false,
        profileId: user.id,
        wouldMeetAgain: false,
      });
      await runReportAction({
        activityGroupId: group.id,
        category: "unsafe",
        profileId: user.id,
        reason: "Post-plan safety issue",
      });
      markFeedbackCompleted();
      setAttendanceFeedback(LL.groups.attendance.issueReported());
    } catch {
      setAttendanceFeedback(LL.groups.attendance.feedbackFailed());
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  return (
    <Screen contentStyle={styles.content}>
      <Header
        left={<UiText variant="eyebrow">{LL.groups.eyebrow()}</UiText>}
        right={
          <UiText variant="status" style={styles.status}>
            {LL.groups.formingStatus()}
          </UiText>
        }
      />

      <View style={styles.hero}>
        <Text style={styles.title}>
          {LL.groups.title({ interest: group.interestName })}
        </Text>
        <Text style={styles.body}>{LL.groups.formingBody()}</Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelLabel}>
          {group.matchName
            ? LL.groups.matchedWith({ name: group.matchName })
            : LL.groups.emptyMatch()}
        </Text>
        {group.suggestedPlan ? (
          <View style={styles.detailStack}>
            <Text style={styles.detailTitle}>{LL.groups.suggestedPlan()}</Text>
            <Text style={styles.detailBody}>{group.suggestedPlan}</Text>
          </View>
        ) : null}
        <View style={styles.detailStack}>
          <Text style={styles.detailTitle}>{LL.groups.nextStep()}</Text>
          <Text style={styles.detailBody}>{LL.groups.nextStepBody()}</Text>
        </View>
      </View>

      <View style={styles.planCard}>
        <Text style={styles.detailTitle}>{LL.groups.planCard.title()}</Text>
        <Text style={styles.planCardTitle}>{activityPlan.title}</Text>
        <View style={styles.planMetaRow}>
          <Text style={styles.planMeta}>
            {LL.groups.planCard.timing({
              timing: activityPlan.suggestedTiming,
            })}
          </Text>
          <Text style={styles.planMeta}>
            {LL.groups.planCard.capacity({
              min: activityPlan.capacityMin,
              max: activityPlan.capacityMax,
            })}
          </Text>
        </View>
        <Text style={styles.detailBody}>
          {LL.groups.planCard.location({
            location: activityPlan.publicLocationName,
          })}
        </Text>
        <Text style={styles.detailBody}>{activityPlan.matchSuggestion}</Text>
        <Text style={styles.planSafety}>{activityPlan.safetyGuidance}</Text>
        <View style={styles.confirmationActions}>
          <Button
            label={LL.groups.planCard.confirm()}
            onPress={() => {
              setConfirmationStatus("confirmed");
            }}
            style={styles.confirmationAction}
            variant="neutral"
          />
          <Button
            label={LL.groups.planCard.requestChanges()}
            onPress={() => {
              setConfirmationStatus("needs_changes");
            }}
            style={styles.confirmationAction}
            variant="neutral"
          />
        </View>
        <Text style={styles.safetyFeedback}>{getConfirmationStatusCopy()}</Text>
      </View>

      <View style={styles.safetyPanel}>
        <View style={styles.detailStack}>
          <Text style={styles.detailTitle}>{LL.groups.safety.title()}</Text>
          <Text style={styles.detailBody}>
            {exactLocationVisible
              ? LL.groups.safety.locationVisible()
              : LL.groups.safety.locationHidden()}
          </Text>
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
          <Text style={styles.safetyFeedback}>{safetyFeedback}</Text>
        ) : null}
      </View>

      <View style={styles.invitePanel}>
        <View style={styles.detailStack}>
          <Text style={styles.detailTitle}>
            {LL.groups.invites.bringFriend()}
          </Text>
          <Text style={styles.detailBody}>{LL.groups.invites.body()}</Text>
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
            <Text style={styles.detailTitle}>{LL.groups.invites.ready()}</Text>
            <Text selectable style={styles.inviteLink}>
              {inviteLink}
            </Text>
          </View>
        ) : null}
        {inviteFeedback ? (
          <Text style={styles.safetyFeedback}>{inviteFeedback}</Text>
        ) : null}
      </View>

      <View style={styles.attendancePanel}>
        <View style={styles.detailStack}>
          <Text style={styles.detailTitle}>{LL.groups.attendance.title()}</Text>
          <Text style={styles.detailBody}>{LL.groups.attendance.body()}</Text>
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
          <Text style={styles.safetyFeedback}>{attendanceFeedback}</Text>
        ) : null}
      </View>

      <View style={styles.chatPanel}>
        <MessageList emptyLabel={LL.chat.empty()} messages={messages} />
        <ChatComposer
          blockedLabel={LL.chat.blocked()}
          disabled={sendingMessage}
          onSend={handleSendMessage}
          placeholder={LL.chat.composerPlaceholder()}
          sendLabel={LL.chat.send()}
          sendingLabel={LL.chat.sending()}
        />
      </View>

      <Button
        label={LL.groups.backHome()}
        onPress={() => {
          router.replace(routes.home);
        }}
        style={styles.button}
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
      flexGrow: 1,
      gap: spacing[5],
      padding: spacing[6],
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
