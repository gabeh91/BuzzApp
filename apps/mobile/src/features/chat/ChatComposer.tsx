import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { useBuzzTheme } from "@/theme/ThemeProvider";
import type { BuzzTheme } from "@/theme/tokens";

import { createChatDraft } from "./chatModel";

export type ChatComposerProps = {
  blockedLabel: string;
  disabled?: boolean;
  onSend: (body: string) => Promise<void> | void;
  placeholder: string;
  sendLabel: string;
  sendingLabel: string;
};

export const ChatComposer = ({ blockedLabel, disabled = false, onSend, placeholder, sendLabel, sendingLabel }: ChatComposerProps) => {
  const { theme } = useBuzzTheme();
  const styles = createStyles(theme);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const parsedDraft = createChatDraft(draft);
  const isBlocked = parsedDraft.reason === "blocked";
  const sendDisabled = disabled || sending || !parsedDraft.canSend;

  const handleSend = async () => {
    if (sendDisabled) return;

    setSending(true);
    try {
      await onSend(parsedDraft.body);
      setDraft("");
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        <TextInput
          multiline
          onChangeText={setDraft}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          style={styles.input}
          value={draft}
        />
        <Pressable accessibilityRole="button" disabled={sendDisabled} onPress={handleSend} style={[styles.button, sendDisabled ? styles.buttonDisabled : null]}>
          <Text style={styles.buttonText}>{sending ? sendingLabel : sendLabel}</Text>
        </Pressable>
      </View>
      {isBlocked ? <Text style={styles.warning}>{blockedLabel}</Text> : null}
    </View>
  );
};

const createStyles = (theme: BuzzTheme) => {
  const { colors, fontSizes, lineHeights, radii, spacing, borderWidths } = theme;

  return StyleSheet.create({
    wrapper: {
      gap: spacing[2]
    },
    row: {
      alignItems: "flex-end",
      flexDirection: "row",
      gap: spacing[3]
    },
    input: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: radii.lg,
      borderWidth: borderWidths.hairline,
      color: colors.text,
      flex: 1,
      fontSize: fontSizes.base,
      lineHeight: lineHeights.body,
      minHeight: 48,
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[3]
    },
    button: {
      alignItems: "center",
      backgroundColor: colors.surfaceInverse,
      borderRadius: radii.full,
      minWidth: 74,
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[3]
    },
    buttonDisabled: {
      opacity: 0.45
    },
    buttonText: {
      color: colors.textInverse,
      fontSize: fontSizes.sm,
      fontWeight: "900"
    },
    warning: {
      color: colors.accent,
      fontSize: fontSizes.sm,
      fontWeight: "800",
      lineHeight: lineHeights.tight
    }
  });
};
