import { StyleSheet, View } from "react-native";

import { useBuzzTheme } from "@/theme/ThemeProvider";
import type { BuzzTheme } from "@/theme/tokens";
import { Text as UiText } from "@/ui";

export type ChatMessage = {
  id: string;
  body: string;
  createdAt: string;
  isOwnMessage: boolean;
  moderationStatus: string;
  senderId?: string | undefined;
  senderName?: string | null | undefined;
  senderPhotoUrl?: string | null | undefined;
};

export type MessageBubbleProps = {
  message: ChatMessage;
};

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const { theme } = useBuzzTheme();
  const styles = createStyles(theme);

  return (
    <View
      style={[
        styles.bubble,
        message.isOwnMessage ? styles.ownBubble : styles.otherBubble,
      ]}
    >
      <UiText
        style={[
          styles.body,
          message.isOwnMessage ? styles.ownBody : styles.otherBody,
        ]}
      >
        {message.body}
      </UiText>
    </View>
  );
};

const createStyles = (theme: BuzzTheme) => {
  const { colors, fontSizes, lineHeights, radii, spacing } = theme;

  return StyleSheet.create({
    bubble: {
      borderRadius: radii.lg,
      maxWidth: "86%",
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[3],
    },
    ownBubble: {
      alignSelf: "flex-end",
      backgroundColor: colors.surfaceInverse,
    },
    otherBubble: {
      alignSelf: "flex-start",
      backgroundColor: colors.surface,
    },
    body: {
      fontSize: fontSizes.base,
      lineHeight: lineHeights.body,
    },
    ownBody: {
      color: colors.textInverse,
    },
    otherBody: {
      color: colors.text,
    },
  });
};
