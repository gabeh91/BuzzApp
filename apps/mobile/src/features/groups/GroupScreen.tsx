import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import { useGroupMessagesQuery, useSendGroupMessageMutation } from "@graphql/generated";
import { useBuzzAuth } from "@/auth/AuthProvider";
import { ChatComposer } from "@/features/chat/ChatComposer";
import { createChatDraft } from "@/features/chat/chatModel";
import { MessageList, type ChatMessage } from "@/features/chat/MessageList";
import { createCityContextFallback } from "@/features/city/cityContext";
import { useInterestFlow } from "@/features/interests/InterestFlowProvider";
import { createDefaultActivityPlan, type ActivityPlanConfirmationStatus } from "@/features/plans/activityPlan";
import { canShowExactLocation, createBlockPayload, createReportDraft } from "@/features/safety/safetyActions";
import { useI18n } from "@/i18n/I18nProvider";
import { routes } from "@/navigation/routes";
import { useBuzzTheme } from "@/theme/ThemeProvider";
import type { BuzzTheme } from "@/theme/tokens";

import type { ActivityGroupSummary } from "./group.types";

export type GroupScreenProps = {
  groupId: string;
};

const createGroupSummary = ({
  groupId,
  fallbackInterest,
  matchName,
  selectedInterestName,
  suggestedPlan
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
    status: "forming"
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
  const [safetyFeedback, setSafetyFeedback] = useState<string | null>(null);
  const [confirmationStatus, setConfirmationStatus] = useState<ActivityPlanConfirmationStatus>("pending");
  const { data, refetch } = useGroupMessagesQuery({
    variables: { groupId },
    skip: isLocalGroup
  });
  const [sendGroupMessage, { loading: sendingMessage }] = useSendGroupMessageMutation();
  const groupInput: Parameters<typeof createGroupSummary>[0] = {
    groupId,
    fallbackInterest: LL.home.fallbackInterest()
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
  const cityContext = createCityContextFallback({ cityId: user.cityId, cityName: user.cityName });
  const activityPlan = createDefaultActivityPlan({
    cityContext,
    interestName: group.interestName,
    matchSuggestion: group.suggestedPlan ?? LL.groups.nextStepBody()
  });
  const exactLocationVisible = canShowExactLocation(false);
  const remoteMessages: ChatMessage[] =
    data?.groupMessagesCollection?.edges.map(({ node }) => ({
      id: node.id,
      body: node.body,
      createdAt: node.createdAt,
      isOwnMessage: node.senderId === user.id,
      moderationStatus: node.moderationStatus
    })) ?? [];
  const messages = isLocalGroup ? localMessages : remoteMessages;

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
          moderationStatus: draft.moderationStatus
        }
      ]);
      return;
    }

    await sendGroupMessage({
      variables: {
        activityGroupId: groupId,
        body: draft.body,
        moderationStatus: draft.moderationStatus,
        senderId: user.id
      }
    });
    await refetch();
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

  const handlePrepareReport = () => {
    const draft = createReportDraft({
      activityGroupId: group.id,
      category: "unsafe",
      reason: "Group safety check",
      reporterId: user.id
    });

    setSafetyFeedback(draft.canSubmit ? LL.groups.safety.reportReady() : LL.groups.safety.reportUnavailable());
  };

  const handlePrepareBlock = () => {
    if (!match) {
      setSafetyFeedback(LL.groups.safety.blockUnavailable());
      return;
    }

    const payload = createBlockPayload({
      activityGroupId: group.id,
      blockedId: match.id,
      blockerId: user.id
    });

    setSafetyFeedback(
      payload.source === "group"
        ? LL.groups.safety.blockReady({ name: match.displayName })
        : LL.groups.safety.blockUnavailable()
    );
  };

  const handlePrepareLeave = () => {
    setSafetyFeedback(LL.groups.safety.leaveReady());
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>{LL.groups.eyebrow()}</Text>
          <Text style={styles.status}>{LL.groups.formingStatus()}</Text>
        </View>

        <View style={styles.hero}>
          <Text style={styles.title}>{LL.groups.title({ interest: group.interestName })}</Text>
          <Text style={styles.body}>{LL.groups.formingBody()}</Text>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelLabel}>{group.matchName ? LL.groups.matchedWith({ name: group.matchName }) : LL.groups.emptyMatch()}</Text>
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
            <Text style={styles.planMeta}>{LL.groups.planCard.timing({ timing: activityPlan.suggestedTiming })}</Text>
            <Text style={styles.planMeta}>{LL.groups.planCard.capacity({ min: activityPlan.capacityMin, max: activityPlan.capacityMax })}</Text>
          </View>
          <Text style={styles.detailBody}>{LL.groups.planCard.location({ location: activityPlan.publicLocationName })}</Text>
          <Text style={styles.detailBody}>{activityPlan.matchSuggestion}</Text>
          <Text style={styles.planSafety}>{activityPlan.safetyGuidance}</Text>
          <View style={styles.confirmationActions}>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setConfirmationStatus("confirmed");
              }}
              style={styles.confirmationAction}
            >
              <Text style={styles.safetyActionText}>{LL.groups.planCard.confirm()}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setConfirmationStatus("needs_changes");
              }}
              style={styles.confirmationAction}
            >
              <Text style={styles.safetyActionText}>{LL.groups.planCard.requestChanges()}</Text>
            </Pressable>
          </View>
          <Text style={styles.safetyFeedback}>{getConfirmationStatusCopy()}</Text>
        </View>

        <View style={styles.safetyPanel}>
          <View style={styles.detailStack}>
            <Text style={styles.detailTitle}>{LL.groups.safety.title()}</Text>
            <Text style={styles.detailBody}>
              {exactLocationVisible ? LL.groups.safety.locationVisible() : LL.groups.safety.locationHidden()}
            </Text>
          </View>
          <View style={styles.safetyActions}>
            <Pressable accessibilityRole="button" onPress={handlePrepareReport} style={styles.safetyAction}>
              <Text style={styles.safetyActionText}>{LL.groups.safety.report()}</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={handlePrepareBlock} style={styles.safetyAction}>
              <Text style={styles.safetyActionText}>{LL.groups.safety.block()}</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={handlePrepareLeave} style={styles.safetyAction}>
              <Text style={styles.safetyActionText}>{LL.groups.safety.leave()}</Text>
            </Pressable>
          </View>
          {safetyFeedback ? <Text style={styles.safetyFeedback}>{safetyFeedback}</Text> : null}
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

        <Pressable
          accessibilityRole="button"
          onPress={() => {
            router.replace(routes.home);
          }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>{LL.groups.backHome()}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: BuzzTheme) => {
  const { colors, fontStyles, fontSizes, lineHeights, radii, spacing, borderWidths, shadows } = theme;

  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background
    },
    content: {
      flexGrow: 1,
      gap: spacing[5],
      padding: spacing[6]
    },
    header: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between"
    },
    eyebrow: {
      color: colors.accent,
      fontSize: fontSizes.xs,
      fontWeight: "900",
      letterSpacing: 1,
      textTransform: "uppercase"
    },
    status: {
      backgroundColor: colors.accentSoft,
      borderRadius: radii.full,
      color: colors.accent,
      fontSize: fontSizes.xs,
      fontWeight: "900",
      overflow: "hidden",
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[2]
    },
    hero: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: radii["2xl"],
      borderWidth: borderWidths.hairline,
      gap: spacing[3],
      padding: spacing[6],
      ...shadows.card
    },
    title: {
      color: colors.text,
      ...fontStyles.display,
      fontSize: fontSizes.hero,
      lineHeight: lineHeights.hero
    },
    body: {
      color: colors.textMuted,
      fontSize: fontSizes.md,
      lineHeight: lineHeights.body
    },
    panel: {
      backgroundColor: colors.surfaceMuted,
      borderRadius: radii.xl,
      gap: spacing[5],
      padding: spacing[5]
    },
    chatPanel: {
      backgroundColor: colors.surfaceMuted,
      borderRadius: radii.xl,
      gap: spacing[5],
      padding: spacing[5]
    },
    planCard: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: radii.xl,
      borderWidth: borderWidths.hairline,
      gap: spacing[3],
      padding: spacing[5]
    },
    planCardTitle: {
      color: colors.text,
      fontSize: fontSizes.xl,
      fontWeight: "900",
      lineHeight: lineHeights.title
    },
    planMetaRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing[2]
    },
    planMeta: {
      backgroundColor: colors.surfaceMuted,
      borderRadius: radii.sm,
      color: colors.brand,
      fontSize: fontSizes.sm,
      fontWeight: "800",
      overflow: "hidden",
      paddingHorizontal: spacing[2],
      paddingVertical: spacing[1]
    },
    planSafety: {
      color: colors.textMuted,
      fontSize: fontSizes.sm,
      fontWeight: "800",
      lineHeight: lineHeights.tight
    },
    confirmationActions: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing[3]
    },
    confirmationAction: {
      alignItems: "center",
      backgroundColor: colors.surfaceMuted,
      borderRadius: radii.sm,
      minWidth: 128,
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[2]
    },
    safetyPanel: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: radii.xl,
      borderWidth: borderWidths.hairline,
      gap: spacing[4],
      padding: spacing[5]
    },
    safetyActions: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing[3]
    },
    safetyAction: {
      alignItems: "center",
      borderColor: colors.border,
      borderRadius: radii.sm,
      borderWidth: borderWidths.hairline,
      minWidth: 88,
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[2]
    },
    safetyActionText: {
      color: colors.text,
      fontSize: fontSizes.sm,
      fontWeight: "900"
    },
    safetyFeedback: {
      color: colors.textMuted,
      fontSize: fontSizes.sm,
      fontWeight: "800",
      lineHeight: lineHeights.tight
    },
    panelLabel: {
      color: colors.brand,
      fontSize: fontSizes["2xl"],
      fontWeight: "900",
      lineHeight: lineHeights.title
    },
    detailStack: {
      gap: spacing[2]
    },
    detailTitle: {
      color: colors.brand,
      fontSize: fontSizes.sm,
      fontWeight: "900",
      letterSpacing: 0.6,
      textTransform: "uppercase"
    },
    detailBody: {
      color: colors.brand,
      fontSize: fontSizes.base,
      lineHeight: lineHeights.body
    },
    button: {
      alignItems: "center",
      backgroundColor: colors.surfaceInverse,
      borderRadius: radii.full,
      paddingHorizontal: spacing[5],
      paddingVertical: spacing[4]
    },
    buttonText: {
      color: colors.textInverse,
      fontSize: fontSizes.base,
      fontWeight: "900"
    }
  });
};
