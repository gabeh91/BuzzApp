import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useRef, useState, type ElementRef } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { Easing, FadeInUp, Layout } from "react-native-reanimated";

import { useBuzzAuth } from "@/auth/AuthProvider";
import { ChatComposer } from "@/features/chat/ChatComposer";
import { MessageBubble, type ChatMessage } from "@/features/chat/MessageBubble";
import type { ReportCategory } from "@/features/safety/safetyActions";
import { useI18n } from "@/i18n/I18nProvider";
import { routes } from "@/navigation/routes";
import { useBuzzTheme } from "@/theme/ThemeProvider";
import { SCREEN_CONTENT_GUTTER_SPACING, type BuzzTheme } from "@/theme/tokens";
import {
  Avatar,
  BackHeader,
  Button,
  List,
  Panel,
  Screen,
  Sheet,
  Text as UiText,
  useToast,
} from "@/ui";

import { useDirectMessages } from "./useDirectMessages";

const chatScrollToTopThreshold = 520;

const incomingMessageEntering = FadeInUp.springify().damping(18);

const ownMessageEntering = FadeInUp.duration(220)
  .easing(Easing.bezier(0.2, 0.85, 0.25, 1))
  .withInitialValues({
    opacity: 0,
    transform: [{ translateY: 48 }, { translateX: 34 }, { scale: 0.58 }],
  });

export type DirectChatScreenProps = {
  conversationId: string;
};

type DirectChatRow =
  | { type: "empty" }
  | { message: ChatMessage; showAvatar: boolean; type: "message" };

export const DirectChatScreen = ({ conversationId }: DirectChatScreenProps) => {
  const router = useRouter();
  const listRef = useRef<ElementRef<typeof FlashList<DirectChatRow>> | null>(
    null,
  );
  const { isAuthenticated, user } = useBuzzAuth();
  const { LL } = useI18n();
  const { showToast } = useToast();
  const { theme } = useBuzzTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(
    () => createStyles(theme, insets.bottom),
    [theme, insets.bottom],
  );
  const directMessages = useDirectMessages({
    conversationId,
    currentUserId: user.id,
    enabled: isAuthenticated && conversationId.length > 0,
  });
  const title =
    directMessages.conversation?.otherName ?? LL.chat.directTitleFallback();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [safetyFeedback, setSafetyFeedback] = useState<string | null>(null);
  const [leaveConfirmVisible, setLeaveConfirmVisible] = useState(false);
  const [leaveConfirmRemountKey, setLeaveConfirmRemountKey] = useState(0);
  const [reportCategory, setReportCategory] = useState<ReportCategory>("other");
  const [reportDetails, setReportDetails] = useState("");
  const [reportSheetVisible, setReportSheetVisible] = useState(false);
  const [reportSheetRemountKey, setReportSheetRemountKey] = useState(0);

  const reportCategoryOptions = useMemo(
    () =>
      [
        { id: "unsafe", label: LL.chat.reportCategoryUnsafe() },
        { id: "harassment", label: LL.chat.reportCategoryHarassment() },
        { id: "spam", label: LL.chat.reportCategorySpam() },
        { id: "no_show", label: LL.chat.reportCategoryNoShow() },
        { id: "other", label: LL.chat.reportCategoryOther() },
      ] satisfies Array<{ id: ReportCategory; label: string }>,
    [LL],
  );

  const rows = useMemo<DirectChatRow[]>(
    () =>
      directMessages.messages.length === 0
        ? [{ type: "empty" }]
        : directMessages.messages.map((message, index, messages) => {
            const nextMessage = messages[index + 1];

            return {
              message,
              showAvatar:
                !message.isOwnMessage &&
                (!nextMessage || nextMessage.isOwnMessage),
              type: "message" as const,
            };
          }),
    [directMessages.messages],
  );

  const handleSendMessage = useCallback(
    async (body: string) => {
      await directMessages.sendMessage(body);
    },
    [directMessages],
  );

  const handleReportConversation = useCallback(async () => {
    setSafetyFeedback(null);

    try {
      const selectedCategory = reportCategoryOptions.find(
        (option) => option.id === reportCategory,
      );
      const details = reportDetails.trim();
      const reportInput = {
        category: reportCategory,
        reason: selectedCategory?.label ?? LL.chat.reportSheetTitle(),
      };

      await directMessages.reportConversation(
        details.length > 0 ? { ...reportInput, details } : reportInput,
      );
      setReportSheetVisible(false);
      setReportDetails("");
      setReportCategory("other");
      showToast({
        message: LL.chat.reportSubmitted(),
        placement: "top",
        variant: "success",
      });
    } catch {
      setSafetyFeedback(LL.chat.reportFailed());
    }
  }, [
    LL,
    directMessages,
    reportCategory,
    reportCategoryOptions,
    reportDetails,
    showToast,
  ]);

  const openReportQuestionnaire = useCallback(() => {
    setSafetyFeedback(null);
    setReportSheetRemountKey((current) => current + 1);
    setReportSheetVisible(true);
  }, []);

  const closeReportQuestionnaire = useCallback(() => {
    setReportSheetVisible(false);
  }, []);

  const openLeaveConfirmation = useCallback(() => {
    setSafetyFeedback(null);
    setLeaveConfirmRemountKey((current) => current + 1);
    setLeaveConfirmVisible(true);
  }, []);

  const closeLeaveConfirmation = useCallback(() => {
    setLeaveConfirmVisible(false);
  }, []);

  const handleLeaveConversation = useCallback(async () => {
    setSafetyFeedback(null);

    try {
      await directMessages.leaveConversation();
      setLeaveConfirmVisible(false);
      router.replace(routes.chats);
    } catch {
      setSafetyFeedback(LL.chat.leaveFailed());
    }
  }, [LL, directMessages, router]);

  const fixedChrome = useMemo(
    () => (
      <View style={styles.fixedChrome}>
        <BackHeader
          backLabel={LL.common.back()}
          onBack={() => router.back()}
          right={<UiText variant="eyebrow">{LL.chats.eyebrow()}</UiText>}
        />

        <Panel variant="plain" style={styles.hero}>
          <View style={styles.heroRow}>
            <Avatar
              accessibilityLabel={title}
              fallbackInitial={title}
              size={52}
              uri={directMessages.conversation?.otherPhotoUrl ?? undefined}
            />
            <View style={styles.titleStack}>
              <UiText variant="eyebrow">{LL.peopleConnect.eyebrow()}</UiText>
              <UiText variant="panelTitle" style={styles.title}>
                {title}
              </UiText>
              <UiText variant="panelBody" style={styles.subtitle}>
                {LL.chat.directSubtitle()}
              </UiText>
            </View>
          </View>
        </Panel>

        <View style={styles.safetyRow}>
          <Pressable
            accessibilityLabel={LL.chat.report()}
            accessibilityRole="button"
            disabled={directMessages.reporting}
            onPress={openReportQuestionnaire}
            style={({ pressed }) => [
              styles.safetyAction,
              pressed ? styles.safetyActionPressed : null,
            ]}
          >
            <Ionicons
              color={theme.colors.brand}
              name="shield-checkmark-outline"
              size={18}
            />
            <UiText variant="button" style={styles.safetyActionText}>
              {directMessages.reporting
                ? LL.chat.reporting()
                : LL.chat.report()}
            </UiText>
          </Pressable>

          <Pressable
            accessibilityLabel={LL.chat.leave()}
            accessibilityRole="button"
            disabled={directMessages.leaving}
            onPress={openLeaveConfirmation}
            style={({ pressed }) => [
              styles.safetyAction,
              styles.leaveAction,
              pressed ? styles.safetyActionPressed : null,
            ]}
          >
            <Ionicons
              color={theme.colors.brand}
              name="log-out-outline"
              size={18}
            />
            <UiText variant="button" style={styles.safetyActionText}>
              {directMessages.leaving ? LL.chat.leaving() : LL.chat.leave()}
            </UiText>
          </Pressable>
        </View>

        {safetyFeedback ? (
          <UiText variant="feedback" style={styles.safetyFeedback}>
            {safetyFeedback}
          </UiText>
        ) : null}
      </View>
    ),
    [
      LL,
      directMessages.leaving,
      directMessages.conversation?.otherPhotoUrl,
      directMessages.reporting,
      handleLeaveConversation,
      openLeaveConfirmation,
      openReportQuestionnaire,
      router,
      styles.fixedChrome,
      styles.hero,
      styles.heroRow,
      styles.leaveAction,
      styles.safetyAction,
      styles.safetyActionPressed,
      styles.safetyActionText,
      styles.safetyFeedback,
      styles.safetyRow,
      styles.subtitle,
      styles.titleStack,
      styles.title,
      safetyFeedback,
      theme.colors.brand,
      title,
    ],
  );

  const handleMessageListScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const nextVisible =
        event.nativeEvent.contentOffset.y > chatScrollToTopThreshold;

      setShowScrollTop((current) =>
        current === nextVisible ? current : nextVisible,
      );
    },
    [],
  );

  const scrollToTop = useCallback(() => {
    const scrollable = listRef.current as {
      scrollToOffset?: (params: { animated?: boolean; offset: number }) => void;
    } | null;

    scrollable?.scrollToOffset?.({ animated: true, offset: 0 });
  }, []);

  const renderRow = ({
    index,
    item,
  }: {
    index: number;
    item: DirectChatRow;
  }) => {
    if (item.type === "message") {
      return (
        <AnimatedMessageBubble
          index={index}
          message={item.message}
          otherName={title}
          otherPhotoUrl={directMessages.conversation?.otherPhotoUrl}
          showAvatar={item.showAvatar}
          style={styles.messageRow}
        />
      );
    }

    return (
      <Panel variant="muted" style={styles.emptyPanel}>
        <UiText variant="panelTitle">
          {directMessages.loading ? LL.chats.groups.loading() : LL.chat.empty()}
        </UiText>
        {directMessages.error ? (
          <UiText variant="panelBody">{directMessages.error.message}</UiText>
        ) : null}
      </Panel>
    );
  };

  return (
    <Screen contentStyle={styles.screenContent} edges={["top"]} scroll={false}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", default: undefined })}
        keyboardVerticalOffset={Platform.select({ ios: 10, default: 0 })}
        style={styles.keyboardRoot}
      >
        {fixedChrome}

        <List<DirectChatRow>
          ref={listRef}
          contentContainerStyle={styles.listContent}
          data={rows}
          itemGap={theme.spacing[3]}
          keyExtractor={(item) =>
            item.type === "message" ? item.message.id : item.type
          }
          onScroll={handleMessageListScroll}
          renderItem={renderRow}
          scrollEventThrottle={16}
          style={styles.list}
        />

        {showScrollTop ? (
          <Animated.View
            entering={FadeInUp.duration(180)}
            layout={Layout.springify().damping(18)}
            style={styles.scrollTopFabWrap}
          >
            <Pressable
              accessibilityLabel={LL.chat.backToTop()}
              accessibilityRole="button"
              onPress={scrollToTop}
              style={({ pressed }) => [
                styles.scrollTopFab,
                pressed ? styles.scrollTopFabPressed : null,
              ]}
            >
              <Ionicons color={theme.colors.text} name="chevron-up" size={24} />
            </Pressable>
          </Animated.View>
        ) : null}

        <View style={styles.composerDock}>
          <Panel variant="plain" style={styles.composerPanel}>
            <ChatComposer
              blockedLabel={LL.chat.blocked()}
              disabled={
                directMessages.sending ||
                directMessages.conversation?.status === "closed"
              }
              onSend={handleSendMessage}
              placeholder={LL.chat.directComposerPlaceholder()}
              sendLabel={LL.chat.send()}
              sendingLabel={LL.chat.sending()}
            />
          </Panel>
        </View>
      </KeyboardAvoidingView>

      <Sheet
        contentStyle={styles.leaveSheetContent}
        onDismiss={closeLeaveConfirmation}
        remountKey={leaveConfirmRemountKey}
        snapPoints={["38%"]}
        testID="leave-chat-confirmation-sheet"
        visible={leaveConfirmVisible}
      >
        <View style={styles.leaveSheetStack}>
          <View style={styles.leaveSheetIcon}>
            <Ionicons
              color={theme.colors.text}
              name="log-out-outline"
              size={24}
            />
          </View>
          <View style={styles.leaveSheetCopy}>
            <UiText variant="eyebrow">{LL.chat.leaveConfirmEyebrow()}</UiText>
            <UiText variant="panelTitle" style={styles.leaveSheetTitle}>
              {LL.chat.leaveConfirmTitle({ name: title })}
            </UiText>
            <UiText variant="panelBody" style={styles.leaveSheetBody}>
              {LL.chat.leaveConfirmBody()}
            </UiText>
          </View>
          <View style={styles.leaveSheetActions}>
            <Button
              disabled={directMessages.leaving}
              label={
                directMessages.leaving
                  ? LL.chat.leaving()
                  : LL.chat.leaveConfirmAction()
              }
              onPress={() => {
                void handleLeaveConversation();
              }}
            />
            <Button
              disabled={directMessages.leaving}
              label={LL.chat.leaveConfirmCancel()}
              onPress={closeLeaveConfirmation}
              variant="tonal"
            />
          </View>
        </View>
      </Sheet>

      <Sheet
        contentStyle={styles.reportSheetContent}
        onDismiss={closeReportQuestionnaire}
        remountKey={reportSheetRemountKey}
        snapPoints={["58%", "86%"]}
        testID="report-chat-questionnaire-sheet"
        visible={reportSheetVisible}
      >
        <View style={styles.reportSheetStack}>
          <View style={styles.reportSheetHeader}>
            <View style={styles.reportSheetIcon}>
              <Ionicons
                color={theme.colors.text}
                name="shield-checkmark-outline"
                size={24}
              />
            </View>
            <Pressable
              accessibilityLabel={LL.common.dismiss()}
              accessibilityRole="button"
              onPress={closeReportQuestionnaire}
              style={({ pressed }) => [
                styles.reportSheetClose,
                pressed ? styles.reportSheetClosePressed : null,
              ]}
            >
              <Ionicons color={theme.colors.text} name="close" size={22} />
            </Pressable>
          </View>

          <View style={styles.reportSheetCopy}>
            <UiText variant="eyebrow">{LL.chat.reportSheetEyebrow()}</UiText>
            <UiText variant="panelTitle" style={styles.reportSheetTitle}>
              {LL.chat.reportSheetTitle()}
            </UiText>
            <UiText variant="panelBody" style={styles.reportSheetBody}>
              {LL.chat.reportSheetBody()}
            </UiText>
          </View>

          <View style={styles.reportCategoryGrid}>
            {reportCategoryOptions.map((option) => {
              const selected = option.id === reportCategory;

              return (
                <Pressable
                  accessibilityRole="button"
                  key={option.id}
                  onPress={() => setReportCategory(option.id)}
                  style={({ pressed }) => [
                    styles.reportCategoryPill,
                    selected ? styles.reportCategoryPillSelected : null,
                    pressed ? styles.reportCategoryPillPressed : null,
                  ]}
                >
                  <UiText
                    variant="button"
                    style={[
                      styles.reportCategoryText,
                      selected ? styles.reportCategoryTextSelected : null,
                    ]}
                  >
                    {option.label}
                  </UiText>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.reportDetailsStack}>
            <UiText variant="button" style={styles.reportDetailsLabel}>
              {LL.chat.reportDetailsLabel()}
            </UiText>
            <TextInput
              multiline
              onChangeText={setReportDetails}
              placeholder={LL.chat.reportDetailsPlaceholder()}
              placeholderTextColor={theme.colors.textMuted}
              style={styles.reportDetailsInput}
              textAlignVertical="top"
              value={reportDetails}
            />
          </View>

          <View style={styles.reportSheetActions}>
            <Button
              disabled={directMessages.reporting}
              label={
                directMessages.reporting
                  ? LL.chat.reporting()
                  : LL.chat.reportSubmit()
              }
              onPress={() => {
                void handleReportConversation();
              }}
            />
            <Button
              disabled={directMessages.reporting}
              label={LL.chat.reportCancel()}
              onPress={closeReportQuestionnaire}
              variant="tonal"
            />
          </View>
        </View>
      </Sheet>
    </Screen>
  );
};

const AnimatedMessageBubble = ({
  index,
  message,
  otherName,
  otherPhotoUrl,
  showAvatar,
  style,
}: {
  index: number;
  message: ChatMessage;
  otherName: string;
  otherPhotoUrl: string | null | undefined;
  showAvatar: boolean;
  style: StyleProp<ViewStyle>;
}) => {
  const { theme } = useBuzzTheme();
  const styles = useMemo(() => createMessageRowStyles(theme), [theme]);

  return (
    <Animated.View
      entering={
        message.isOwnMessage
          ? ownMessageEntering
          : incomingMessageEntering.delay(Math.min(index * 18, 140))
      }
      layout={Layout.springify().damping(18)}
      style={style}
    >
      <View
        style={[
          styles.row,
          message.isOwnMessage ? styles.ownRow : styles.otherRow,
        ]}
      >
        {!message.isOwnMessage ? (
          <View style={styles.avatarSlot}>
            {showAvatar ? (
              <Avatar
                accessibilityLabel={otherName}
                fallbackInitial={otherName}
                size={30}
                uri={otherPhotoUrl ?? undefined}
              />
            ) : null}
          </View>
        ) : null}
        <MessageBubble message={message} />
      </View>
    </Animated.View>
  );
};

const createMessageRowStyles = (theme: BuzzTheme) => {
  const { spacing } = theme;

  return StyleSheet.create({
    row: {
      alignItems: "flex-end",
      flexDirection: "row",
      gap: spacing[2],
    },
    ownRow: {
      justifyContent: "flex-end",
    },
    otherRow: {
      justifyContent: "flex-start",
    },
    avatarSlot: {
      alignItems: "center",
      width: 30,
    },
  });
};

const createStyles = (theme: BuzzTheme, bottomInset: number) => {
  const { borderWidths, colors, radii, shadows, spacing } = theme;

  return StyleSheet.create({
    screenContent: {
      flex: 1,
      flexGrow: 1,
      gap: 0,
      paddingHorizontal: 0,
      paddingTop: 0,
    },
    keyboardRoot: {
      flex: 1,
    },
    list: {
      flex: 1,
    },
    listContent: {
      paddingBottom: spacing[5],
      paddingHorizontal: spacing[SCREEN_CONTENT_GUTTER_SPACING],
      paddingTop: spacing[4],
    },
    fixedChrome: {
      backgroundColor: colors.background,
      borderBottomColor: colors.overlay,
      borderBottomWidth: borderWidths.hairline,
      gap: spacing[3],
      paddingBottom: spacing[4],
      paddingHorizontal: spacing[SCREEN_CONTENT_GUTTER_SPACING],
      paddingTop: spacing[SCREEN_CONTENT_GUTTER_SPACING],
    },
    hero: {
      borderRadius: radii["2xl"],
      padding: spacing[4],
      ...shadows.card,
    },
    heroRow: {
      alignItems: "center",
      flexDirection: "row",
      gap: spacing[3],
    },
    titleStack: {
      flex: 1,
      gap: spacing[1],
    },
    title: {
      color: colors.text,
    },
    subtitle: {
      color: colors.textMuted,
    },
    safetyRow: {
      flexDirection: "row",
      gap: spacing[2],
    },
    safetyAction: {
      alignItems: "center",
      backgroundColor: colors.warningSoft,
      borderRadius: radii.full,
      flexDirection: "row",
      flex: 1,
      gap: spacing[2],
      justifyContent: "center",
      minHeight: 44,
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[2],
    },
    leaveAction: {
      backgroundColor: colors.surfaceMuted,
    },
    safetyActionPressed: {
      opacity: 0.78,
      transform: [{ scale: 0.98 }],
    },
    safetyActionText: {
      color: colors.text,
      fontSize: 14,
    },
    safetyFeedback: {
      color: colors.textMuted,
    },
    leaveSheetContent: {
      paddingHorizontal: spacing[5],
    },
    leaveSheetStack: {
      gap: spacing[4],
      paddingTop: spacing[2],
    },
    leaveSheetIcon: {
      alignItems: "center",
      alignSelf: "flex-start",
      backgroundColor: colors.warningSoft,
      borderRadius: radii.full,
      height: 48,
      justifyContent: "center",
      width: 48,
    },
    leaveSheetCopy: {
      gap: spacing[2],
    },
    leaveSheetTitle: {
      color: colors.text,
    },
    leaveSheetBody: {
      color: colors.textMuted,
    },
    leaveSheetActions: {
      gap: spacing[2],
    },
    reportSheetContent: {
      paddingHorizontal: spacing[5],
    },
    reportSheetStack: {
      gap: spacing[4],
      paddingTop: spacing[2],
    },
    reportSheetHeader: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
    },
    reportSheetIcon: {
      alignItems: "center",
      backgroundColor: colors.warningSoft,
      borderRadius: radii.full,
      height: 48,
      justifyContent: "center",
      width: 48,
    },
    reportSheetClose: {
      alignItems: "center",
      backgroundColor: colors.surfaceMuted,
      borderRadius: radii.full,
      height: 44,
      justifyContent: "center",
      width: 44,
    },
    reportSheetClosePressed: {
      opacity: 0.78,
      transform: [{ scale: 0.97 }],
    },
    reportSheetCopy: {
      gap: spacing[2],
    },
    reportSheetTitle: {
      color: colors.text,
    },
    reportSheetBody: {
      color: colors.textMuted,
    },
    reportCategoryGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing[2],
    },
    reportCategoryPill: {
      backgroundColor: colors.background,
      borderColor: colors.border,
      borderRadius: radii.full,
      borderWidth: borderWidths.hairline,
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[3],
    },
    reportCategoryPillSelected: {
      backgroundColor: colors.warningSoft,
      borderColor: colors.warning,
    },
    reportCategoryPillPressed: {
      opacity: 0.78,
      transform: [{ scale: 0.98 }],
    },
    reportCategoryText: {
      color: colors.textMuted,
      fontSize: 14,
    },
    reportCategoryTextSelected: {
      color: colors.text,
    },
    reportDetailsStack: {
      gap: spacing[2],
    },
    reportDetailsLabel: {
      color: colors.text,
    },
    reportDetailsInput: {
      backgroundColor: colors.background,
      borderColor: colors.border,
      borderRadius: radii.lg,
      borderWidth: borderWidths.hairline,
      color: colors.text,
      fontFamily: theme.fontFamilies.body,
      fontSize: theme.fontSizes.md,
      lineHeight: theme.lineHeights.body,
      minHeight: 118,
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[3],
    },
    reportSheetActions: {
      gap: spacing[2],
    },
    messageRow: {
      paddingHorizontal: spacing[1],
    },
    emptyPanel: {
      gap: spacing[2],
    },
    composerPanel: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: radii.xl,
      borderWidth: borderWidths.hairline,
      gap: spacing[3],
      padding: spacing[3],
    },
    composerDock: {
      backgroundColor: colors.background,
      borderTopColor: colors.overlay,
      borderTopWidth: borderWidths.hairline,
      paddingBottom: Math.max(bottomInset, spacing[3]),
      paddingHorizontal: spacing[SCREEN_CONTENT_GUTTER_SPACING],
      paddingTop: spacing[3],
    },
    scrollTopFabWrap: {
      bottom: spacing[4],
      position: "absolute",
      right: spacing[SCREEN_CONTENT_GUTTER_SPACING],
    },
    scrollTopFab: {
      alignItems: "center",
      backgroundColor: colors.warning,
      borderColor: colors.border,
      borderRadius: radii.full,
      borderWidth: borderWidths.hairline,
      elevation: 0,
      height: 48,
      justifyContent: "center",
      shadowOpacity: 0,
      width: 48,
    },
    scrollTopFabPressed: {
      opacity: 0.82,
      transform: [{ scale: 0.97 }],
    },
  });
};
