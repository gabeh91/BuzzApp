import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const hookPath = "src/features/chat/useGroupMessages.ts";

test("useGroupMessages subscribes to group_messages inserts and cleans up the channel", () => {
  assert.equal(existsSync(hookPath), true, "useGroupMessages hook should exist");

  const source = readFileSync(hookPath, "utf8");

  assert.match(source, /createClient/);
  assert.match(source, /channel\(`group-messages-\$\{groupId\}`\)/);
  assert.match(source, /postgres_changes/);
  assert.match(source, /event:\s*"INSERT"/);
  assert.match(source, /schema:\s*"public"/);
  assert.match(source, /table:\s*"group_messages"/);
  assert.match(source, /filter:\s*`activity_group_id=eq\.\$\{groupId\}`/);
  assert.match(source, /setMessages/);
  assert.match(source, /removeChannel/);
});

test("group screen uses realtime messages instead of refetch as the only update path", () => {
  const source = readFileSync("src/features/groups/GroupScreen.tsx", "utf8");

  assert.match(source, /useGroupMessages/);
  assert.doesNotMatch(source, /await refetch\(\)/);
});
