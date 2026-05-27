import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

import { createChatDraft } from "../chatModel";

test("createChatDraft trims message bodies and rejects empty sends", () => {
  assert.deepEqual(createChatDraft("  See you at 6  "), {
    body: "See you at 6",
    canSend: true,
    moderationStatus: "clean",
  });
  assert.deepEqual(createChatDraft("   "), {
    body: "",
    canSend: false,
    moderationStatus: "clean",
    reason: "empty",
  });
});

test("createChatDraft blocks rude message bodies before they are sent", () => {
  assert.deepEqual(createChatDraft("you are an idiot"), {
    body: "you are an idiot",
    canSend: false,
    moderationStatus: "blocked",
    reason: "blocked",
  });
});

test("mobile GraphQL operations read group messages but do not directly insert them", () => {
  const source = readFileSync("graphql/operations.graphql", "utf8");

  assert.match(source, /query GroupMessages/);
  assert.match(source, /groupMessagesCollection/);
  assert.match(source, /sender\s*\{/);
  assert.match(source, /profilePhotoUrl/);
  assert.doesNotMatch(source, /mutation SendGroupMessage/);
  assert.doesNotMatch(source, /insertIntoGroupMessagesCollection/);
});

test("group screen renders the virtualized message timeline and sends group messages through the RPC boundary", () => {
  const source = existsSync("src/features/groups/GroupScreen.tsx")
    ? readFileSync("src/features/groups/GroupScreen.tsx", "utf8")
    : "";

  assert.match(source, /<List/);
  assert.match(source, /MessageBubble/);
  assert.match(source, /chatMessageAvatarSlot/);
  assert.match(source, /senderPhotoUrl/);
  assert.match(source, /ChatComposer/);
  assert.match(source, /useGroupMessagesQuery/);
  assert.doesNotMatch(source, /useSendGroupMessageMutation/);
  assert.match(source, /sendGroupMessage/);
  assert.match(source, /buzzSupabase\.rpc\("sendGroupMessage"/);
  assert.match(source, /LL\.chat/);
});
