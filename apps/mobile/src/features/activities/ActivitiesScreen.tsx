import { StyleSheet } from "react-native";

import { createCityContextFallback } from "@/features/city/cityContext";
import { useInterestFlow } from "@/features/interests/InterestFlowProvider";
import { useBuzzAuth } from "@/auth/AuthProvider";
import { useI18n } from "@/i18n/I18nProvider";
import { useBuzzTheme } from "@/theme/ThemeProvider";
import type { BuzzTheme } from "@/theme/tokens";
import { Header, HeroPanel, Panel, Screen, Text as UiText } from "@/ui";

export const ActivitiesScreen = () => {
  const { LL } = useI18n();
  const { theme } = useBuzzTheme();
  const styles = createStyles(theme);
  const { user } = useBuzzAuth();
  const { state } = useInterestFlow();
  const cityContext = createCityContextFallback({
    cityId: user.cityId,
    cityName: user.cityName,
  });
  const selectedInterestName = state.selectedInterest?.name;
  const activationComplete = state.activation.status === "complete";
  const currentSignalTitle = activationComplete
    ? LL.activities.currentSignal.active({
        interest: selectedInterestName ?? LL.home.fallbackInterest(),
      })
    : selectedInterestName
      ? LL.activities.currentSignal.selected({ interest: selectedInterestName })
      : LL.activities.currentSignal.empty();
  const currentSignalBody = activationComplete
    ? LL.activities.currentSignal.bodyActive()
    : selectedInterestName
      ? LL.activities.currentSignal.bodySelected()
      : LL.activities.currentSignal.bodyEmpty();
  const planTitle = state.matchPreview?.suggestedPlan;

  return (
    <Screen contentStyle={styles.content} edges={["top"]}>
      <Header
        left={<UiText variant="logo">{LL.brand.name()}</UiText>}
        right={<UiText variant="city">{cityContext.city.name}</UiText>}
      />

      <HeroPanel
        body={LL.activities.subtitle()}
        eyebrow={LL.activities.eyebrow()}
        title={LL.activities.title()}
      />

      <Panel variant="muted" style={styles.panel}>
        <UiText variant="panelTitle">
          {LL.activities.currentSignal.title()}
        </UiText>
        <UiText variant="panelBody">{currentSignalTitle}</UiText>
        <UiText variant="panelBody">{currentSignalBody}</UiText>
      </Panel>

      <Panel variant="plain" style={styles.panel}>
        <UiText variant="panelTitle">{LL.activities.plans.title()}</UiText>
        <UiText variant="panelBody">
          {planTitle
            ? LL.activities.plans.active({ plan: planTitle })
            : LL.activities.plans.empty()}
        </UiText>
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
