import { StyleSheet } from "react-native";

import { useBuzzAuth } from "@/auth/AuthProvider";
import { createCityContextFallback } from "@/features/city/cityContext";
import { useI18n } from "@/i18n/I18nProvider";
import { useBuzzTheme } from "@/theme/ThemeProvider";
import type { BuzzTheme } from "@/theme/tokens";
import { Header, HeroPanel, Panel, Screen, Text as UiText } from "@/ui";

export const ChatsScreen = () => {
  const { LL } = useI18n();
  const { theme } = useBuzzTheme();
  const styles = createStyles(theme);
  const { user } = useBuzzAuth();
  const cityContext = createCityContextFallback({
    cityId: user.cityId,
    cityName: user.cityName,
  });

  return (
    <Screen contentStyle={styles.content} edges={["top"]}>
      <Header
        left={<UiText variant="logo">{LL.brand.name()}</UiText>}
        right={<UiText variant="city">{cityContext.city.name}</UiText>}
      />

      <HeroPanel
        body={LL.chats.subtitle()}
        eyebrow={LL.chats.eyebrow()}
        title={LL.chats.title()}
      />

      <Panel variant="muted" style={styles.panel}>
        <UiText variant="panelTitle">{LL.chats.requests.title()}</UiText>
        <UiText variant="panelBody">{LL.chats.requests.empty()}</UiText>
      </Panel>

      <Panel variant="plain" style={styles.panel}>
        <UiText variant="panelTitle">{LL.chats.groups.title()}</UiText>
        <UiText variant="panelBody">{LL.chats.groups.empty()}</UiText>
      </Panel>
    </Screen>
  );
};

const createStyles = (theme: BuzzTheme) => {
  const { spacing } = theme;

  return StyleSheet.create({
    content: {
      flexGrow: 1,
      gap: spacing[5],
      padding: spacing[6],
    },
    panel: {
      gap: spacing[3],
    },
  });
};
