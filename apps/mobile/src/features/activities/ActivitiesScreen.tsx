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
import {
  useOutgoingActivationSummary,
  type OutgoingActivationSummary,
} from "@/features/interests/useOutgoingActivationSummary";
import { useI18n } from "@/i18n/I18nProvider";
import { tabBarTotalHeight } from "@/navigation/tabBarLayout";
import { useBuzzTheme } from "@/theme/ThemeProvider";
import {
  SCREEN_CONTENT_GUTTER_SPACING,
  type BuzzTheme,
} from "@/theme/tokens";
import {
  AppBrandedCityHeader,
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
  const { isAuthenticated, user } = useBuzzAuth();
  const { isActivationGestureLocked } = useActivationGestureLock();
  const interestFlow = useInterestFlow();
  const {
    handleSelectInterest,
    interests,
    selectedInterest,
  } = useActivateInterestActions();
  const { registerFocusHandler } = useActivitiesPickerFocus();
  const outgoingSummary = useOutgoingActivationSummary({
    enabled: isAuthenticated,
    userId: user.id,
  });
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
  const visibleOutgoingActivations = useMemo(
    () => outgoingSummary.activations.slice(0, 3),
    [outgoingSummary.activations],
  );

  const pulseRingStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      pickerPulse.value,
      [0, 1],
      [colors.clear, colors.warning],
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

        {isAuthenticated && visibleOutgoingActivations.length > 0 ? (
          <Panel variant="plain" style={styles.outgoingPanel}>
            <UiText variant="panelTitle">{LL.activities.outgoing.title()}</UiText>
            {visibleOutgoingActivations.map((activation) => (
              <OutgoingActivationCard
                activation={activation}
                key={activation.activationId}
              />
            ))}
          </Panel>
        ) : null}
      </View>
    ),
    [
      LL,
      activationComplete,
      handleSelectInterest,
      interests,
      isAuthenticated,
      interestFlow.state.activation.message,
      pulseRingStyle,
      selectedInterest?.id,
      styles.headerStack,
      styles.outgoingPanel,
      styles.pickerEmphasis,
      styles.pickerPanel,
      styles.statusPanel,
      visibleOutgoingActivations,
    ],
  );

  return (
    <Screen
      contentStyle={styles.screenContent}
      edges={["top"]}
      scroll={false}
      stickyHeader={
        <AppBrandedCityHeader cityName={cityContext.city.name} />
      }
    >
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

const OutgoingActivationCard = ({
  activation,
}: {
  activation: OutgoingActivationSummary;
}) => {
  const { LL } = useI18n();
  const { theme } = useBuzzTheme();
  const styles = useMemo(() => createOutgoingCardStyles(theme), [theme]);
  const summary = activation.responseSummary;

  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <UiText variant="feedback" style={styles.title}>
          {activation.interestName}
        </UiText>
        {activation.activityGroupId ? (
          <UiText variant="status" style={styles.readyBadge}>
            {LL.activities.outgoing.groupReady()}
          </UiText>
        ) : null}
      </View>
      <UiText variant="panelBody" style={styles.summary}>
        {LL.activities.outgoing.summary({
          maybe: summary.maybe,
          pending: summary.pending,
          yes: summary.yes,
        })}
      </UiText>
    </View>
  );
};

const createStyles = (theme: BuzzTheme, bottomInset: number) => {
  const { borderWidths, colors, radii, spacing } = theme;

  const fabClearance = 72;

  return StyleSheet.create({
    screenContent: {
      flex: 1,
      flexGrow: 1,
      gap: 0,
      paddingHorizontal: 0,
      paddingTop: 0,
    },
    list: {
      flex: 1,
    },
    listContent: {
      paddingBottom: Math.max(
        spacing[8] + fabClearance + bottomInset,
        tabBarTotalHeight(theme, bottomInset) + spacing[4],
      ),
      paddingHorizontal: spacing[SCREEN_CONTENT_GUTTER_SPACING],
      paddingTop: spacing[5],
    },
    headerStack: {
      gap: spacing[5],
      paddingBottom: spacing[4],
    },
    pickerEmphasis: {
      borderColor: colors.clear,
      borderRadius: radii.xl + 3,
      borderWidth: borderWidths.hairline,
      paddingHorizontal: 0,
      paddingVertical: spacing[1],
    },
    pickerPanel: {
      gap: spacing[4],
    },
    statusPanel: {
      gap: spacing[3],
    },
    outgoingPanel: {
      gap: spacing[3],
    },
  });
};

const createOutgoingCardStyles = (theme: BuzzTheme) => {
  const { colors, radii, spacing } = theme;

  return StyleSheet.create({
    card: {
      backgroundColor: colors.background,
      borderRadius: radii.lg,
      gap: spacing[2],
      padding: spacing[4],
    },
    titleRow: {
      alignItems: "center",
      flexDirection: "row",
      gap: spacing[2],
      justifyContent: "space-between",
    },
    title: {
      color: colors.text,
      flex: 1,
      fontSize: theme.fontSizes.md,
    },
    readyBadge: {
      backgroundColor: colors.warningSoft,
      borderRadius: radii.full,
      color: colors.text,
      overflow: "hidden",
      paddingHorizontal: spacing[2],
      paddingVertical: spacing[1],
    },
    summary: {
      color: colors.textMuted,
    },
  });
};
