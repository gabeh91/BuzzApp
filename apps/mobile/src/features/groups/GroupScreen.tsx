import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import { useGroupMessagesQuery, useSendGroupMessageMutation } from "@graphql/generated";
import { useBuzzAuth } from "@/auth/AuthProvider";
import { ChatComposer } from "@/features/chat/ChatComposer";
import { createChatDraft } from "@/features/chat/chatModel";
import { MessageList, type ChatMessage } from "@/features/chat/MessageList";
import { useInterestFlow } from "@/features/interests/InterestFlowProvider";
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
