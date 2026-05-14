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

  assert.equal(existsSync(incomingPath), true, "incoming pings hook should exist");
  assert.equal(
    existsSync(outgoingPath),
    true,
    "outgoing activation summary hook should exist",
  );

  const incomingSource = readFileSync(incomingPath, "utf8");
  const outgoingSource = readFileSync(outgoingPath, "utf8");

  assert.match(incomingSource, /useIncomingActivationPings/);
  assert.match(incomingSource, /useIncomingActivationPingsQuery/);
  assert.match(incomingSource, /channel\(`activation-pings-\$\{userId\}`\)/);
  assert.match(incomingSource, /postgres_changes/);
  assert.match(incomingSource, /table:\s*"activation_pings"/);
  assert.match(incomingSource, /filter:\s*`recipient_id=eq\.\$\{userId\}`/);
  assert.match(incomingSource, /removeChannel/);

  assert.match(outgoingSource, /useOutgoingActivationSummary/);
  assert.match(outgoingSource, /useOutgoingActivationSummaryQuery/);
  assert.match(
    outgoingSource,
    /channel\(`activation-responses-\$\{userId\}`\)/,
  );
  assert.match(outgoingSource, /postgres_changes/);
  assert.match(outgoingSource, /table:\s*"activation_pings"/);
  assert.match(outgoingSource, /filter:\s*`sender_id=eq\.\$\{userId\}`/);
  assert.match(outgoingSource, /refetch/);
  assert.match(outgoingSource, /removeChannel/);
});

test("activities and chats screens render the realtime-backed MVP surfaces", () => {
  const activitiesSource = readFileSync(
    "src/features/activities/ActivitiesScreen.tsx",
    "utf8",
  );
  const chatsSource = readFileSync("src/features/chat/ChatsScreen.tsx", "utf8");

  assert.match(activitiesSource, /useIncomingActivationPings/);
  assert.match(activitiesSource, /useOutgoingActivationSummary/);
  assert.match(activitiesSource, /useRespondToActivationPing/);
  assert.match(activitiesSource, /respondToPing/);

  assert.match(chatsSource, /useChatSummaries/);
  assert.match(chatsSource, /routes\.group/);
});
