import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

test("mobile app exposes reusable UI primitives for repeated screen chrome", () => {
  assert.equal(existsSync("src/ui/Screen.tsx"), true);
  assert.equal(existsSync("src/ui/Text.tsx"), true);
  assert.equal(existsSync("src/ui/Panel.tsx"), true);
  assert.equal(existsSync("src/ui/Button.tsx"), true);
  assert.equal(existsSync("src/ui/Header.tsx"), true);
  assert.equal(existsSync("src/ui/index.ts"), true);

  const screenSource = readFileSync("src/ui/Screen.tsx", "utf8");
  const textSource = readFileSync("src/ui/Text.tsx", "utf8");
  const buttonSource = readFileSync("src/ui/Button.tsx", "utf8");
  const panelSource = readFileSync("src/ui/Panel.tsx", "utf8");
  const headerSource = readFileSync("src/ui/Header.tsx", "utf8");
  const indexSource = readFileSync("src/ui/index.ts", "utf8");

  assert.match(screenSource, /SafeAreaView/);
  assert.match(screenSource, /ScrollView/);
  assert.match(textSource, /variant/);
  assert.match(buttonSource, /variant/);
  assert.match(panelSource, /variant/);
  assert.match(headerSource, /left/);
  assert.match(headerSource, /right/);
  assert.doesNotMatch(indexSource, /Buzz(Screen|Text|Panel|Button|Header)/);
});

test("Home and Group screens consume shared UI primitives instead of duplicating every primitive style", () => {
  const homeSource = readFileSync("src/features/home/HomeScreen.tsx", "utf8");
  const groupSource = readFileSync(
    "src/features/groups/GroupScreen.tsx",
    "utf8",
  );

  assert.match(homeSource, /@\/ui/);
  assert.match(homeSource, /<Screen/);
  assert.match(homeSource, /<Header/);
  assert.match(homeSource, /<Panel/);
  assert.match(homeSource, /<UiText/);
  assert.match(homeSource, /<Button/);
  assert.match(groupSource, /@\/ui/);
  assert.match(groupSource, /<Header/);
  assert.match(groupSource, /<Button/);
});
