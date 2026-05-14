import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
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
  useIncomingActivationPings,
  type IncomingActivationPing,
} from "@/features/interests/useIncomingActivationPings";
import {
  useOutgoingActivationSummary,
  type OutgoingActivationSummary,
} from "@/features/interests/useOutgoingActivationSummary";
import {
  useRespondToActivationPing,
  type ActivationPingResponse,
} from "@/features/interests/useRespondToActivationPing";
import { useI18n } from "@/i18n/I18nProvider";
import { routes } from "@/navigation/routes";
import { useBuzzTheme } from "@/theme/ThemeProvider";
import type { BuzzTheme } from "@/theme/tokens";
import {
  Button,
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
  const router = useRouter();
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
  const incomingPings = useIncomingActivationPings({
    enabled: isAuthenticated,
    userId: user.id,
  });
  const outgoingSummary = useOutgoingActivationSummary({
    enabled: isAuthenticated,
    userId: user.id,
  });
  const {
    loading: respondingToPing,
    respondToPing,
  } = useRespondToActivationPing();
  const { refetch: refetchIncomingPings } = incomingPings;
  const { refetch: refetchOutgoingSummary } = outgoingSummary;
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
  const visibleIncomingPings = useMemo(
    () => incomingPings.pings.slice(0, 3),
    [incomingPings.pings],
  );
  const visibleOutgoingActivations = useMemo(
    () => outgoingSummary.activations.slice(0, 3),
    [outgoingSummary.activations],
  );

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

  const handlePingResponse = useCallback(
    async (ping: IncomingActivationPing, response: ActivationPingResponse) => {
      const result = await respondToPing(ping.id, response);

      await Promise.all([refetchIncomingPings(), refetchOutgoingSummary()]);

      if (response === "yes" && result.ok && result.activityGroupId) {
        router.push(routes.group(result.activityGroupId));
      }
    },
    [refetchIncomingPings, refetchOutgoingSummary, respondToPing, router],
  );

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

        {isAuthenticated && visibleIncomingPings.length > 0 ? (
          <Panel variant="muted" style={styles.pingsPanel}>
            <UiText variant="panelTitle">{LL.activities.pings.title()}</UiText>
            {visibleIncomingPings.map((ping) => (
              <IncomingPingCard
                key={ping.id}
                disabled={respondingToPing}
                onRespond={handlePingResponse}
                ping={ping}
              />
            ))}
          </Panel>
        ) : null}

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
      cityContext.city.name,
      handleSelectInterest,
      handlePingResponse,
      interests,
      isAuthenticated,
      interestFlow.state.activation.message,
      pulseRingStyle,
      respondingToPing,
      selectedInterest?.id,
      styles.headerStack,
      styles.outgoingPanel,
      styles.pickerEmphasis,
      styles.pickerPanel,
      styles.pingsPanel,
      styles.statusPanel,
      visibleIncomingPings,
      visibleOutgoingActivations,
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

type IncomingPingCardProps = {
  disabled: boolean;
  onRespond: (
    ping: IncomingActivationPing,
    response: ActivationPingResponse,
  ) => Promise<void>;
  ping: IncomingActivationPing;
};

const IncomingPingCard = ({
  disabled,
  onRespond,
  ping,
}: IncomingPingCardProps) => {
  const { LL } = useI18n();
  const { theme } = useBuzzTheme();
  const styles = useMemo(() => createPingCardStyles(theme), [theme]);

  return (
    <View style={styles.card}>
      <View style={styles.copyStack}>
        <UiText variant="feedback" style={styles.title}>
          {LL.activities.pings.body({
            interest: ping.interestName,
            name: ping.senderName,
          })}
        </UiText>
      </View>

      <View style={styles.actionRow}>
        <Button
          disabled={disabled}
          label={
            disabled
              ? LL.activities.pings.responding()
              : LL.activities.pings.yes()
          }
          onPress={() => {
            void onRespond(ping, "yes");
          }}
          style={styles.primaryAction}
          textStyle={styles.actionText}
          variant="primary"
        />
        <Button
          disabled={disabled}
          label={LL.activities.pings.maybe()}
          onPress={() => {
            void onRespond(ping, "maybe");
          }}
          style={styles.secondaryAction}
          textStyle={styles.actionText}
          variant="tonal"
        />
        <Button
          disabled={disabled}
          label={LL.activities.pings.no()}
          onPress={() => {
            void onRespond(ping, "no");
          }}
          style={styles.secondaryAction}
          textStyle={styles.actionText}
          variant="plain"
        />
      </View>
    </View>
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
    pingsPanel: {
      gap: spacing[4],
    },
    outgoingPanel: {
      gap: spacing[3],
    },
  });
};

const createPingCardStyles = (theme: BuzzTheme) => {
  const { colors, radii, spacing } = theme;

  return StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: radii.lg,
      gap: spacing[3],
      padding: spacing[4],
    },
    copyStack: {
      gap: spacing[1],
    },
    title: {
      color: colors.text,
      fontSize: theme.fontSizes.md,
      lineHeight: theme.lineHeights.tight,
    },
    actionRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing[2],
    },
    primaryAction: {
      flexGrow: 1,
      minHeight: 42,
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[2],
    },
    secondaryAction: {
      flexGrow: 1,
      minHeight: 42,
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[2],
    },
    actionText: {
      fontSize: theme.fontSizes.xs,
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
