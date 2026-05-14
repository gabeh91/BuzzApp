import { FlashList } from "@shopify/flash-list";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type ElementRef,
} from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { useBuzzAuth } from "@/auth/AuthProvider";
import { createCityContextFallback } from "@/features/city/cityContext";
import { useActivationGestureLock } from "@/features/interests/ActivationGestureLockProvider";
import { InterestToggleGrid } from "@/features/interests/InterestToggleGrid";
import { useActivateInterestActions } from "@/features/interests/useActivateInterestActions";
import { useInterestFlow } from "@/features/interests/InterestFlowProvider";
import { useI18n } from "@/i18n/I18nProvider";
import { useBuzzTheme } from "@/theme/ThemeProvider";
import type { BuzzTheme } from "@/theme/tokens";
import {
  Header,
  HeroPanel,
  List,
  Panel,
  Screen,
  Text as UiText,
} from "@/ui";

import { useActivitiesPickerFocus } from "./ActivitiesPickerFocusContext";

const PICKER_SCROLL_TOP_INSET_SPACING: keyof BuzzTheme["spacing"] = 3;
const PULSE_DURATION_MS = 240;
const PULSE_GAP_MS = 520;
const PULSE_REPEAT_MS = 240;
const PULSE_TAIL_MS = 400;

type ActivitiesFeedPlaceholder = { readonly _placeholder: true };

export const ActivitiesScreen = () => {
  const { LL } = useI18n();
  const { theme } = useBuzzTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const styles = useMemo(
    () => createStyles(theme, insets.bottom),
    [theme, insets.bottom],
  );
  const { user } = useBuzzAuth();
  const { isActivationGestureLocked } = useActivationGestureLock();
  const interestFlow = useInterestFlow();
  const {
    handleSelectInterest,
    interests,
    selectedInterest,
  } = useActivateInterestActions();
  const { registerFocusHandler } = useActivitiesPickerFocus();
  const activationStatus = interestFlow.state.activation.status;
  const activationComplete = activationStatus === "complete";
  const cityContext = createCityContextFallback({
    cityId: user.cityId,
    cityName: user.cityName,
  });

  const listRef = useRef<ElementRef<
    typeof FlashList<ActivitiesFeedPlaceholder>
  > | null>(null);
  const headerStackRef = useRef<View>(null);
  const pickerWrapRef = useRef<View>(null);
  const pickerPulse = useSharedValue(0);

  const pulseRingStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      pickerPulse.value,
      [0, 1],
      ["rgba(0, 0, 0, 0)", colors.warning],
    ),
  }));

  const runPickerPulse = useCallback(() => {
    pickerPulse.value = 0;
    pickerPulse.value = withSequence(
      withTiming(1, { duration: PULSE_DURATION_MS }),
      withTiming(0, { duration: PULSE_GAP_MS }),
      withTiming(1, { duration: PULSE_REPEAT_MS }),
      withTiming(0, { duration: PULSE_TAIL_MS }),
    );
  }, [pickerPulse]);

  const scrollListToOffset = useCallback((offset: number) => {
    const scrollable = listRef.current as {
      scrollToOffset: (params: { animated?: boolean; offset: number }) => void;
    } | null;

    scrollable?.scrollToOffset({ animated: true, offset });
  }, []);

  const scrollPickerIntoViewAndPulse = useCallback(() => {
    const header = headerStackRef.current;
    const picker = pickerWrapRef.current;

    const afterScroll = () => {
      setTimeout(runPickerPulse, 280);
    };

    if (!listRef.current) {
      afterScroll();
      return;
    }

    if (!header || !picker) {
      scrollListToOffset(0);
      afterScroll();
      return;
    }

    picker.measureLayout(
      header,
      (_left, top) => {
        const inset = theme.spacing[PICKER_SCROLL_TOP_INSET_SPACING];
        scrollListToOffset(Math.max(0, top - inset));
        afterScroll();
      },
      () => {
        scrollListToOffset(0);
        afterScroll();
      },
    );
  }, [runPickerPulse, scrollListToOffset, theme.spacing]);

  useEffect(() => {
    registerFocusHandler(scrollPickerIntoViewAndPulse);

    return () => {
      registerFocusHandler(null);
    };
  }, [registerFocusHandler, scrollPickerIntoViewAndPulse]);

  const header = useMemo(
    () => (
      <View ref={headerStackRef} style={styles.headerStack}>
        <Header
          left={<UiText variant="logo">{LL.brand.name()}</UiText>}
          right={<UiText variant="city">{cityContext.city.name}</UiText>}
        />

        <HeroPanel
          body={LL.activities.activate.heroBody()}
          eyebrow={LL.activities.activate.heroEyebrow()}
          title={LL.activities.activate.heroTitle()}
        />

        <View ref={pickerWrapRef} collapsable={false}>
          <Animated.View style={[styles.pickerEmphasis, pulseRingStyle]}>
            <Panel variant="surface" style={styles.pickerPanel}>
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
          </Animated.View>
        </View>

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
      interests,
      interestFlow.state.activation.message,
      pulseRingStyle,
      selectedInterest?.id,
      styles.headerStack,
      styles.pickerEmphasis,
      styles.pickerPanel,
      styles.statusPanel,
    ],
  );

  return (
    <Screen contentStyle={styles.screenContent} edges={["top"]} scroll={false}>
      <List<ActivitiesFeedPlaceholder>
        ref={listRef}
        contentContainerStyle={styles.listContent}
        data={[]}
        itemGap={0}
        keyExtractor={() => "empty"}
        ListEmptyComponent={() => null}
        ListHeaderComponent={header}
        renderItem={() => null}
        scrollEnabled={!isActivationGestureLocked}
        style={styles.list}
      />
    </Screen>
  );
};

const createStyles = (theme: BuzzTheme, bottomInset: number) => {
  const { borderWidths, radii, spacing } = theme;

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
    pickerEmphasis: {
      borderColor: "rgba(0, 0, 0, 0)",
      borderRadius: radii.xl + 3,
      borderWidth: borderWidths.hairline,
      padding: spacing[1],
    },
    pickerPanel: {
      gap: spacing[4],
    },
    statusPanel: {
      gap: spacing[3],
    },
  });
};
