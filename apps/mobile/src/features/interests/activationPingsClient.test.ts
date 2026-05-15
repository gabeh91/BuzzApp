import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

test("mobile GraphQL operations cover activation ping reads and response mutation", () => {
  const source = readFileSync("graphql/operations.graphql", "utf8");

  assert.match(source, /query IncomingActivationPings/);
  assert.match(source, /getIncomingActivationPings/);
  assert.match(source, /query OutgoingActivationSummary/);
  assert.match(source, /getOutgoingActivationSummary/);
  assert.match(source, /query ChatSummaries/);
  assert.match(source, /getChatSummaries/);
  assert.match(source, /mutation RespondToActivationPing/);
  assert.match(source, /respondToActivationPing/);
});

test("activation ping realtime hooks patch incoming and outgoing ping state", () => {
  const incomingPath = "src/features/interests/useIncomingActivationPings.ts";
  const outgoingPath = "src/features/interests/useOutgoingActivationSummary.ts";

  assert.equal(
    existsSync(incomingPath),
    true,
    "incoming pings hook should exist",
  );
  assert.equal(
    existsSync(outgoingPath),
    true,
    "outgoing activation summary hook should exist",
  );

  const incomingSource = readFileSync(incomingPath, "utf8");
  const outgoingSource = readFileSync(outgoingPath, "utf8");

  assert.match(incomingSource, /useIncomingActivationPings/);
  assert.match(incomingSource, /useIncomingActivationPingsQuery/);
  assert.match(incomingSource, /JSON\.parse/);
  assert.match(incomingSource, /fetchPolicy:\s*"cache-and-network"/);
  assert.match(incomingSource, /channelInstanceId/);
  assert.match(
    incomingSource,
    /channel\(`activation-pings-\$\{userId\}-\$\{channelInstanceId\}`\)/,
  );
  assert.match(incomingSource, /postgres_changes/);
  assert.match(incomingSource, /table:\s*"activation_pings"/);
  assert.match(incomingSource, /filter:\s*`recipient_id=eq\.\$\{userId\}`/);
  assert.match(incomingSource, /removeChannel/);

  assert.match(outgoingSource, /useOutgoingActivationSummary/);
  assert.match(outgoingSource, /useOutgoingActivationSummaryQuery/);
  assert.match(outgoingSource, /JSON\.parse/);
  assert.match(outgoingSource, /fetchPolicy:\s*"cache-and-network"/);
  assert.match(
    outgoingSource,
    /channel\(`activation-responses-\$\{userId\}-\$\{channelInstanceId\}`\)/,
  );
  assert.match(outgoingSource, /postgres_changes/);
  assert.match(outgoingSource, /table:\s*"activation_pings"/);
  assert.match(outgoingSource, /filter:\s*`sender_id=eq\.\$\{userId\}`/);
  assert.match(outgoingSource, /refetch/);
  assert.match(outgoingSource, /removeChannel/);
});

test("incoming activation ping realtime does not surface placeholder labels", () => {
  const incomingSource = readFileSync(
    "src/features/interests/useIncomingActivationPings.ts",
    "utf8",
  );

  assert.match(incomingSource, /const refetchIncomingPings/);
  assert.match(incomingSource, /void refetchIncomingPings\(\)/);
  assert.match(incomingSource, /Someone nearby/);
  assert.match(incomingSource, /this activity/);
  assert.doesNotMatch(incomingSource, /interestName:\s*"Activity"/);
  assert.doesNotMatch(incomingSource, /senderName:\s*"Buzz Member"/);
  assert.doesNotMatch(incomingSource, /Buzz Member/);
});

test("existing chat activation pings stay distinct from direct chats", () => {
  const incomingSource = readFileSync(
    "src/features/interests/useIncomingActivationPings.ts",
    "utf8",
  );
  const chatsSource = readFileSync("src/features/chat/ChatsScreen.tsx", "utf8");

  assert.match(incomingSource, /existingDirectConversationId/);
  assert.match(chatsSource, /item\.existingDirectConversationId/);
  assert.match(chatsSource, /routes\.directChat\(item\.existingDirectConversationId\)/);
  assert.match(chatsSource, /LL\.chats\.requests\.existingChatPingBody/);
  assert.match(chatsSource, /LL\.chats\.requests\.openExistingChat/);
  assert.match(chatsSource, /`ping:\$\{item\.ping\.id\}`/);
  assert.match(chatsSource, /`chat:\$\{item\.chat\.kind\}:\$\{item\.chat\.id\}`/);
});

test("chat summaries use an instance-unique realtime topic", () => {
  const chatHookSource = readFileSync(
    "src/features/chat/useChatSummaries.ts",
    "utf8",
  );
  const connectionRequestsHookSource = readFileSync(
    "src/features/chat/useConnectionRequests.ts",
    "utf8",
  );

  assert.match(chatHookSource, /fetchPolicy:\s*"cache-and-network"/);
  assert.match(chatHookSource, /JSON\.parse/);
  assert.match(chatHookSource, /channelInstanceId/);
  assert.match(
    chatHookSource,
    /channel\(`chat-summaries-\$\{userId\}-\$\{channelInstanceId\}`\)/,
  );
  assert.match(chatHookSource, /removeChannel/);
  assert.match(chatHookSource, /table:\s*"direct_messages"/);

  assert.match(connectionRequestsHookSource, /getConnectionRequests/);
  assert.match(connectionRequestsHookSource, /respondConnectionRequest/);
  assert.match(connectionRequestsHookSource, /normalizeConnectionRequests/);
  assert.match(connectionRequestsHookSource, /directConversationId/);
  assert.match(connectionRequestsHookSource, /channelInstanceId/);
  assert.match(
    connectionRequestsHookSource,
    /channel\(`connection-requests-\$\{userId\}-\$\{channelInstanceId\}`\)/,
  );
  assert.match(connectionRequestsHookSource, /table:\s*"connection_requests"/);
  assert.match(
    connectionRequestsHookSource,
    /filter:\s*`recipient_id=eq\.\$\{userId\}`/,
  );
  assert.match(connectionRequestsHookSource, /removeChannel/);
});

test("global ping singleton and chats screen render the realtime-backed MVP surfaces", () => {
  const appProvidersSource = readFileSync(
    "src/providers/AppProviders.tsx",
    "utf8",
  );
  const pingSingletonSource = readFileSync(
    "src/features/interests/ActivationPingInboxSingleton.tsx",
    "utf8",
  );
  const activitiesSource = readFileSync(
    "src/features/activities/ActivitiesScreen.tsx",
    "utf8",
  );
  const chatsSource = readFileSync("src/features/chat/ChatsScreen.tsx", "utf8");

  assert.match(appProvidersSource, /ActivationPingInboxSingleton/);
  assert.match(appProvidersSource, /ConnectionRequestInboxSingleton/);
  assert.match(pingSingletonSource, /useIncomingActivationPings/);
  assert.match(pingSingletonSource, /useConnectionRequestInbox/);
  assert.match(pingSingletonSource, /InboxNudgeSheet/);
  assert.match(pingSingletonSource, /LL\.chats\.nudge/);
  assert.match(pingSingletonSource, /Ionicons/);
  assert.match(pingSingletonSource, /nudgeFreshnessMs/);
  assert.match(pingSingletonSource, /isFreshForNudge/);
  assert.match(pingSingletonSource, /<Sheet/);
  assert.match(pingSingletonSource, /testID="inbox-nudge-sheet"/);
  assert.doesNotMatch(pingSingletonSource, /FullWindowOverlay/);
  assert.doesNotMatch(pingSingletonSource, /StyleSheet\.absoluteFillObject/);
  assert.match(activitiesSource, /useOutgoingActivationSummary/);
  assert.doesNotMatch(activitiesSource, /useIncomingActivationPings/);

  assert.match(chatsSource, /useChatSummaries/);
  assert.match(chatsSource, /useConnectionRequestInbox/);
  assert.match(chatsSource, /activity-accept-flow-sheet/);
  assert.match(chatsSource, /openAcceptFlow/);
  assert.match(chatsSource, /confirmAcceptFlow/);
  assert.match(chatsSource, /LL\.chats\.activityAccept/);
  assert.match(chatsSource, /pingInbox\.respondToPing\(acceptingPing, "yes"\)/);
  assert.match(chatsSource, /routes\.group/);
  assert.match(chatsSource, /routes\.directChat/);
  assert.match(chatsSource, /styles\.requestCard/);
  assert.match(chatsSource, /requestCard: \{/);
});

test("global inbox nudge dismissal is scoped to the current pending request batch", () => {
  const pingSingletonSource = readFileSync(
    "src/features/interests/ActivationPingInboxSingleton.tsx",
    "utf8",
  );

  assert.doesNotMatch(pingSingletonSource, /dismissedForUserId/);
  assert.match(pingSingletonSource, /activeNudgeKeys/);
  assert.match(pingSingletonSource, /dismissedNudgeKeys/);
  assert.match(
    pingSingletonSource,
    /activeNudgeKeys\.some\(\s*\(itemKey\) => !dismissedNudgeKeys\.has\(itemKey\)\s*\)/,
  );
  assert.match(pingSingletonSource, /setDismissedNudgeKeys\(new Set\(\)\)/);
  assert.match(
    pingSingletonSource,
    /new Set\(\[\.\.\.current, \.\.\.activeNudgeKeys\]\)/,
  );
});
