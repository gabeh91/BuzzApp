import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useCallback, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useBuzzAuth } from "@/auth/AuthProvider";
import { createCityContextFallback } from "@/features/city/cityContext";
import { ActivateInterestFab } from "@/features/interests/ActivateInterestFab";
import { InterestToggleGrid } from "@/features/interests/InterestToggleGrid";
import { useActivateInterestActions } from "@/features/interests/useActivateInterestActions";
import { useInterestFlow } from "@/features/interests/InterestFlowProvider";
import { useI18n } from "@/i18n/I18nProvider";
import { useBuzzTheme } from "@/theme/ThemeProvider";
import type { BuzzTheme } from "@/theme/tokens";
import {
  Button,
  Header,
  HeroPanel,
  List,
  Panel,
  Screen,
  Sheet,
  Text as UiText,
} from "@/ui";

export const ActivitiesScreen = () => {
  const { LL } = useI18n();
  const { theme } = useBuzzTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(
    () => createStyles(theme, insets.bottom),
    [theme, insets.bottom],
  );
  const { requireAuth, user } = useBuzzAuth();
  const interestFlow = useInterestFlow();
  const {
    activationBusy,
    confirmActivate,
    handleSelectInterest,
    interests,
    selectedInterest,
  } = useActivateInterestActions();
  const activationStatus = interestFlow.state.activation.status;
  const activationComplete = activationStatus === "complete";
  const cityContext = createCityContextFallback({
    cityId: user.cityId,
    cityName: user.cityName,
  });
  const [sheet, setSheet] = useState<"confirm" | null>(null);
  const [sheetRemountKey, setSheetRemountKey] = useState(0);

  const openConfirm = useCallback(async () => {
    if (!selectedInterest || activationBusy) {
      return;
    }

    await requireAuth("activate_interest", async () => {
      setSheetRemountKey((key) => key + 1);
      setSheet("confirm");
    });
  }, [activationBusy, requireAuth, selectedInterest]);

  const closeSheet = useCallback(() => setSheet(null), []);

  const runConfirmActivate = useCallback(async () => {
    await confirmActivate(closeSheet);
  }, [closeSheet, confirmActivate]);

  const stickyLabel = activationBusy
    ? LL.activities.activate.activating()
    : activationComplete
      ? LL.activities.activate.activateAgain()
      : LL.activities.activate.activate();

  const fabDisabled = !selectedInterest || activationBusy;

  const header = useMemo(
    () => (
      <View style={styles.headerStack}>
        <Header
          left={<UiText variant="logo">{LL.brand.name()}</UiText>}
          right={<UiText variant="city">{cityContext.city.name}</UiText>}
        />

        <HeroPanel
          body={LL.activities.activate.heroBody()}
          eyebrow={LL.activities.activate.heroEyebrow()}
          title={LL.activities.activate.heroTitle()}
        />

        <Panel variant="plain" style={styles.pickerPanel}>
          <UiText variant="panelTitle">
            {LL.activities.activate.pickTitle()}
          </UiText>
          <UiText variant="panelBody">
            {LL.activities.activate.pickBody()}
          </UiText>

          <InterestToggleGrid
            interests={interests}
            onSelectInterest={handleSelectInterest}
            selectedInterestId={selectedInterest?.id ?? ""}
          />
        </Panel>

        <Panel
          variant={activationComplete ? "plain" : "muted"}
          style={styles.statusPanel}
        >
          <UiText variant="panelTitle">
            {LL.activities.currentSignal.title()}
          </UiText>
          <UiText variant="panelBody">
            {interestFlow.state.activation.message}
          </UiText>
        </Panel>
      </View>
    ),
    [
      LL,
      activationComplete,
      cityContext.city.name,
      handleSelectInterest,
      interestFlow.state.activation.message,
      interests,
      selectedInterest?.id,
      styles.headerStack,
      styles.pickerPanel,
      styles.statusPanel,
    ],
  );

  return (
    <BottomSheetModalProvider>
      <Screen contentStyle={styles.screenContent} edges={["top"]} scroll={false}>
        <List
          contentContainerStyle={styles.listContent}
          data={[]}
          itemGap={0}
          keyExtractor={() => "empty"}
          ListEmptyComponent={() => null}
          ListHeaderComponent={header}
          renderItem={() => null}
          style={styles.list}
        />

        <ActivateInterestFab
          accessibilityHint={LL.common.activateInterestFab.hint()}
          accessibilityLabel={`${LL.common.activateInterestFab.label()}. ${stickyLabel}`}
          bottomInset={insets.bottom}
          disabled={fabDisabled}
          label={LL.common.activateInterestFab.label()}
          onPress={() => {
            void openConfirm();
          }}
        />

        <Sheet
          contentStyle={styles.sheetContent}
          onDismiss={closeSheet}
          remountKey={sheetRemountKey}
          visible={sheet === "confirm"}
        >
          <>
            <UiText variant="panelTitle">
              {LL.activities.activate.confirmTitle({
                interest: selectedInterest?.name ?? "",
              })}
            </UiText>
            <UiText variant="panelBody">
              {LL.activities.activate.confirmBody({
                interest: selectedInterest?.name ?? "",
              })}
            </UiText>
            <View style={styles.sheetActions}>
              <Button
                label={LL.activities.activate.sheetNotNow()}
                onPress={closeSheet}
                style={styles.sheetActionButton}
                variant="bordered"
              />
              <Button
                label={LL.activities.activate.confirm()}
                onPress={() => {
                  void runConfirmActivate();
                }}
                style={styles.sheetPrimaryButton}
                textStyle={styles.sheetPrimaryButtonText}
                variant="primary"
              />
            </View>
          </>
        </Sheet>
      </Screen>
    </BottomSheetModalProvider>
  );
};

const createStyles = (theme: BuzzTheme, bottomInset: number) => {
  const { colors, fontSizes, shadows, spacing } = theme;

  const fabClearance = 72;

  return StyleSheet.create({
    screenContent: {
      flex: 1,
      flexGrow: 1,
      gap: 0,
      padding: 0,
    },
    list: {
      flex: 1,
    },
    listContent: {
      padding: spacing[6],
      paddingBottom: spacing[6] + fabClearance + bottomInset,
    },
    headerStack: {
      gap: spacing[5],
      paddingBottom: spacing[4],
    },
    pickerPanel: {
      gap: spacing[4],
    },
    statusPanel: {
      gap: spacing[3],
    },
    sheetContent: {
      gap: spacing[4],
      paddingBottom: spacing[6] + bottomInset,
      paddingTop: spacing[2],
    },
    sheetActions: {
      gap: spacing[3],
      marginTop: spacing[1],
    },
    sheetActionButton: {
      width: "100%",
    },
    sheetPrimaryButton: {
      backgroundColor: colors.warning,
      borderColor: colors.warning,
      minHeight: 52,
      width: "100%",
    },
    sheetPrimaryButtonText: {
      color: colors.text,
      fontSize: fontSizes.md,
      fontWeight: "900",
    },
  });
};
