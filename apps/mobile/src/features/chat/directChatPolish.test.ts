import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("direct chat keeps the composer docked and animates message rows", () => {
  const source = readFileSync("src/features/chat/DirectChatScreen.tsx", "utf8");

  assert.match(source, /KeyboardAvoidingView/);
  assert.match(source, /Platform/);
  assert.match(source, /AnimatedMessageBubble/);
  assert.match(source, /ownMessageEntering/);
  assert.match(source, /incomingMessageEntering/);
  assert.match(source, /FadeInUp/);
  assert.match(source, /Easing\.bezier/);
  assert.match(source, /duration\(220\)/);
  assert.match(source, /Layout\.springify/);
  assert.match(source, /withInitialValues/);
  assert.match(source, /translateY: 48/);
  assert.match(source, /scale: 0\.58/);
  const ownEnteringDefinition =
    source.match(/const ownMessageEntering =[\s\S]*?;\n/)?.[0] ?? "";
  assert.doesNotMatch(ownEnteringDefinition, /springify\(\)/);
  assert.match(source, /composerDock/);
  assert.match(source, /keyboardVerticalOffset/);
});

test("direct chat keeps conversation chrome fixed above the scrollable message list", () => {
  const source = readFileSync("src/features/chat/DirectChatScreen.tsx", "utf8");

  assert.doesNotMatch(source, /ListHeaderComponent=\{header\}/);
  assert.match(source, /<View style=\{styles\.fixedChrome\}>/);
  assert.match(source, /<BackHeader/);
  assert.match(source, /<Panel variant="plain" style=\{styles\.hero\}>/);
});

test("direct chat message list has breathing room below the fixed header", () => {
  const source = readFileSync("src/features/chat/DirectChatScreen.tsx", "utf8");

  assert.match(source, /paddingTop: spacing\[4\]/);
});

test("direct chat exposes a scroll-to-top affordance after a useful threshold", () => {
  const source = readFileSync("src/features/chat/DirectChatScreen.tsx", "utf8");

  assert.match(source, /chatScrollToTopThreshold/);
  assert.match(source, /showScrollTop/);
  assert.match(source, /handleMessageListScroll/);
  assert.match(source, /scrollToOffset/);
  assert.match(source, /styles\.scrollTopFab/);
  assert.match(source, /chevron-up/);
});

test("direct chat sends feel immediate and tactile", () => {
  const source = readFileSync("src/features/chat/useDirectMessages.ts", "utf8");

  assert.match(source, /expo-haptics/);
  assert.match(source, /sendDirectMessage/);
  assert.match(source, /normalizeMessageRows\(\[parsedData\]\)/);
  assert.match(source, /setMessages\(\(current\) =>/);
  assert.match(source, /ImpactFeedbackStyle\.Light/);
});

test("direct chat groups incoming message runs with a profile marker", () => {
  const source = readFileSync("src/features/chat/DirectChatScreen.tsx", "utf8");

  assert.match(source, /showAvatar/);
  assert.match(source, /nextMessage\.isOwnMessage/);
  assert.match(source, /styles\.avatarSlot/);
  assert.match(source, /<Avatar/);
  assert.match(source, /otherPhotoUrl/);
});

test("direct chat exposes participant safety actions", () => {
  const screenSource = readFileSync(
    "src/features/chat/DirectChatScreen.tsx",
    "utf8",
  );
  const hookSource = readFileSync(
    "src/features/chat/useDirectMessages.ts",
    "utf8",
  );

  assert.match(screenSource, /handleReportConversation/);
  assert.match(screenSource, /handleLeaveConversation/);
  assert.match(screenSource, /openLeaveConfirmation/);
  assert.match(screenSource, /openReportQuestionnaire/);
  assert.match(screenSource, /report-chat-questionnaire-sheet/);
  assert.match(screenSource, /reportCategoryOptions/);
  assert.match(screenSource, /TextInput/);
  assert.match(screenSource, /<Sheet/);
  assert.match(screenSource, /leave-chat-confirmation-sheet/);
  assert.match(screenSource, /leaveConfirmTitle/);
  assert.match(screenSource, /leaveConfirmAction/);
  assert.match(screenSource, /shield-checkmark-outline/);
  assert.match(screenSource, /log-out-outline/);
  assert.match(screenSource, /showToast/);
  assert.match(screenSource, /LL\.chat\.reportSubmitted\(\)/);
  assert.match(screenSource, /router\.replace\(routes\.chats\)/);
  assert.match(hookSource, /reportDirectConversation/);
  assert.match(hookSource, /details/);
  assert.match(hookSource, /category/);
  assert.match(hookSource, /reason/);
  assert.match(hookSource, /leaveDirectConversation/);
  assert.match(hookSource, /setConversation\(\(current\) =>/);
});
