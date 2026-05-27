import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

import { useI18n } from "@/i18n/I18nProvider";
import { useBuzzTheme } from "@/theme/ThemeProvider";
import type { BuzzTheme } from "@/theme/tokens";
import { Panel, Text as UiText, TextInputGroup } from "@/ui";

export type ShortProfileFieldsProps = {
  nameValue: string;
  onNameChange: (value: string) => void;
  cityName: string;
  cityHint?: string;
  cityNote?: string;
  layout?: "default" | "onboarding";
};

export const ShortProfileFields = ({
  nameValue,
  onNameChange,
  cityName,
  cityHint,
  cityNote,
  layout = "default",
}: ShortProfileFieldsProps) => {
  const { LL } = useI18n();
  const { theme } = useBuzzTheme();
  const styles = useMemo(() => createFieldStyles(theme), [theme]);
  const isOnboarding = layout === "onboarding";

  return (
    <View style={styles.contentStack}>
      <TextInputGroup
        autoCapitalize="words"
        autoCorrect={false}
        autoFocus={isOnboarding}
        description={
          isOnboarding
            ? undefined
            : LL.onboarding.shortProfile.name.helper()
        }
        label={LL.onboarding.shortProfile.name.fieldLabel()}
        labelBackdropColor={
          isOnboarding ? theme.colors.background : theme.colors.surface
        }
        onChangeText={onNameChange}
        value={nameValue}
      />

      {isOnboarding ? (
        <Panel style={styles.shortProfileCityPanel} variant="muted">
          <UiText variant="eyebrow">
            {LL.onboarding.shortProfile.location.sectionLabel()}
          </UiText>
          <UiText variant="panelTitle">{cityName}</UiText>
          {cityNote ? <UiText variant="body">{cityNote}</UiText> : null}
        </Panel>
      ) : (
        <View style={styles.shortProfileFieldGroup}>
          <UiText style={styles.shortProfileFieldLabel} variant="eyebrow">
            {cityHint}
          </UiText>
          <View style={styles.shortProfileStaticField}>
            <UiText variant="panelTitle">{cityName}</UiText>
          </View>
        </View>
      )}
    </View>
  );
};

const createFieldStyles = (theme: BuzzTheme) => {
  const { colors, radii, spacing, borderWidths } = theme;

  return StyleSheet.create({
    contentStack: {
      gap: spacing[4],
    },
    shortProfileFieldGroup: {
      gap: spacing[2],
    },
    shortProfileFieldLabel: {
      letterSpacing: 0.8,
    },
    shortProfileStaticField: {
      alignItems: "flex-start",
      backgroundColor: colors.background,
      borderColor: colors.border,
      borderRadius: radii.sm,
      borderWidth: borderWidths.hairline,
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[3],
    },
    shortProfileCityPanel: {
      padding: spacing[4],
    },
  });
};
