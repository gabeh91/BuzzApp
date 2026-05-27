import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

import { useI18n } from "@/i18n/I18nProvider";
import { useBuzzTheme } from "@/theme/ThemeProvider";
import type { BuzzTheme } from "@/theme/tokens";
import { Button, Sheet, Text as UiText } from "@/ui";

import type { OutgoingActivationSummary } from "@/features/interests/useOutgoingActivationSummary";

type OutgoingActivationCancelSheetProps = {
  activation: OutgoingActivationSummary | null;
  cancelling: boolean;
  remountKey?: number;
  onCancel: () => void;
  onConfirm: (activation: OutgoingActivationSummary) => void;
};

export const OutgoingActivationCancelSheet = ({
  activation,
  cancelling,
  remountKey = 0,
  onCancel,
  onConfirm,
}: OutgoingActivationCancelSheetProps) => {
  const { LL } = useI18n();
  const { theme } = useBuzzTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Sheet
      contentStyle={styles.content}
      onDismiss={onCancel}
      remountKey={remountKey}
      snapPoints={["38%"]}
      visible={activation !== null}
    >
      {activation ? (
        <View style={styles.stack}>
          <Ionicons
            color={theme.colors.text}
            name="radio-outline"
            size={34}
          />
          <View style={styles.copyStack}>
            <UiText variant="eyebrow" style={styles.eyebrow}>
              {LL.activities.outgoing.manageEyebrow()}
            </UiText>
            <UiText variant="panelTitle">
              {LL.activities.outgoing.manageTitle()}
            </UiText>
            <UiText variant="panelBody" style={styles.body}>
              {LL.activities.outgoing.manageBody({
                interest: activation.interestName,
              })}
            </UiText>
          </View>
          <View style={styles.actions}>
            <Button
              disabled={cancelling}
              label={
                cancelling
                  ? LL.activities.outgoing.cancelling()
                  : LL.activities.outgoing.cancel()
              }
              onPress={() => {
                onConfirm(activation);
              }}
              variant="primary"
            />
            <Button
              disabled={cancelling}
              label={LL.activities.outgoing.keepActive()}
              onPress={onCancel}
              variant="secondary"
            />
          </View>
        </View>
      ) : null}
    </Sheet>
  );
};

const createStyles = (theme: BuzzTheme) => {
  const { colors, spacing } = theme;

  return StyleSheet.create({
    actions: {
      gap: spacing[2],
    },
    body: {
      color: colors.textMuted,
    },
    content: {
      paddingTop: spacing[2],
    },
    copyStack: {
      gap: spacing[2],
    },
    eyebrow: {
      color: colors.accent,
    },
    stack: {
      gap: spacing[5],
    },
  });
};
