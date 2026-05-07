import { StyleSheet, Text, View } from "react-native";

import { useBuzzTheme } from "@/theme/ThemeProvider";
import type { BuzzTheme } from "@/theme/tokens";

export type ChatMessage = {
  id: string;
  body: string;
  createdAt: string;
  isOwnMessage: boolean;
  moderationStatus: string;
};

export type MessageListProps = {
  emptyLabel: string;
  messages: ChatMessage[];
};

export const MessageList = ({ emptyLabel, messages }: MessageListProps) => {
  const { theme } = useBuzzTheme();
  const styles = createStyles(theme);

  if (messages.length === 0) {
    return <Text style={styles.empty}>{emptyLabel}</Text>;
  }

  return (
    <View style={styles.list}>
      {messages.map((message) => (
        <View key={message.id} style={[styles.bubble, message.isOwnMessage ? styles.ownBubble : styles.otherBubble]}>
          <Text style={[styles.body, message.isOwnMessage ? styles.ownBody : styles.otherBody]}>{message.body}</Text>
        </View>
      ))}
    </View>
  );
};

const createStyles = (theme: BuzzTheme) => {
  const { colors, fontSizes, lineHeights, radii, spacing } = theme;

  return StyleSheet.create({
    list: {
      gap: spacing[3]
    },
    empty: {
      color: colors.brand,
      fontSize: fontSizes.base,
      lineHeight: lineHeights.body
    },
    bubble: {
      borderRadius: radii.lg,
      maxWidth: "86%",
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[3]
    },
    ownBubble: {
      alignSelf: "flex-end",
      backgroundColor: colors.surfaceInverse
    },
    otherBubble: {
      alignSelf: "flex-start",
      backgroundColor: colors.surface
    },
    body: {
      fontSize: fontSizes.base,
      lineHeight: lineHeights.body
    },
    ownBody: {
      color: colors.textInverse
    },
    otherBody: {
      color: colors.text
    }
  });
};
