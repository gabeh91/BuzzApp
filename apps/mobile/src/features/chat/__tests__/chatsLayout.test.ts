import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const styleBlock = (source: string, name: string) => {
  const match = new RegExp(`${name}:\\s*\\{([^}]*)\\}`).exec(source);

  assert.ok(match, `Expected ${name} style block to exist`);
  const block = match[1];
  assert.ok(block, `Expected ${name} style block to contain declarations`);

  return block;
};

test("chats sticky tabs use a full-bleed container while content keeps the gutter", () => {
  const source = readFileSync("src/features/chat/ChatsScreen.tsx", "utf8");
  const stickyTabsSource = readFileSync("src/ui/StickySegmentedTabs.tsx", "utf8");
  const tabsContainer = styleBlock(source, "chatsTabsContainer");
  const pinnedTabsContainer = styleBlock(source, "chatsPinnedTabsContainer");

  assert.match(source, /tabsContainerStyle=\{styles\.chatsTabsContainer\}/);
  assert.match(source, /pinnedTabsContainerStyle=\{styles\.chatsPinnedTabsContainer\}/);
  assert.match(tabsContainer, /paddingHorizontal:\s*spacing\[SCREEN_CONTENT_GUTTER_SPACING\]/);
  assert.doesNotMatch(source, /marginHorizontal:\s*-spacing\[SCREEN_CONTENT_GUTTER_SPACING\]/);
  assert.match(pinnedTabsContainer, /paddingBottom:\s*0/);
  assert.match(pinnedTabsContainer, /paddingTop:\s*0/);
  assert.doesNotMatch(pinnedTabsContainer, /paddingHorizontal:/);
  assert.doesNotMatch(stickyTabsSource, /pinnedTabsOverlay:\s*\{[\s\S]*paddingTop:/);
  assert.doesNotMatch(stickyTabsSource, /pinnedTabsOverlay:\s*\{[\s\S]*paddingBottom:/);
});

test("sticky tabs reset pinned header state when the active tab changes", () => {
  const source = readFileSync("src/ui/StickySegmentedTabs.tsx", "utf8");

  assert.match(source, /useEffect/);
  assert.match(source, /setTabsPinned\(false\)/);
  assert.match(source, /scrollY\.value = 0/);
  assert.match(source, /\[scrollY, value\]/);
});

test("chats list items use full-width feed sections instead of floating cards", () => {
  const source = readFileSync("src/features/chat/ChatsScreen.tsx", "utf8");
  const chatSection = styleBlock(source, "chatSection");
  const requestSection = styleBlock(source, "requestSection");
  const lastFeedSection = styleBlock(source, "lastFeedSection");

  assert.match(source, /paddingHorizontal:\s*0/);
  assert.match(source, /headerIntro:\s*\{[\s\S]*paddingHorizontal:\s*spacing\[SCREEN_CONTENT_GUTTER_SPACING\]/);
  assert.match(source, /emptyPanel:\s*\{[\s\S]*marginHorizontal:\s*spacing\[SCREEN_CONTENT_GUTTER_SPACING\]/);
  assert.match(source, /chatSection:\s*\{/);
  assert.match(source, /requestSection:\s*\{/);
  assert.match(source, /sectionContent:\s*\{/);
  assert.match(source, /borderTopWidth:\s*borderWidths\.hairline/);
  assert.doesNotMatch(chatSection, /borderBottomWidth/);
  assert.doesNotMatch(requestSection, /borderBottomWidth/);
  assert.match(lastFeedSection, /borderBottomWidth:\s*borderWidths\.hairline/);
  assert.match(source, /const isLastItem = index === visibleItems\.length - 1/);
  assert.match(source, /styles\.lastFeedSection/);
  assert.doesNotMatch(source, /const messageListCard =/);
  assert.doesNotMatch(source, /chatCard:\s*messageListCard/);
  assert.doesNotMatch(source, /requestCard:\s*messageListCard/);
});

test("activity request rows use activity context and compact response actions", () => {
  const source = readFileSync("src/features/chat/ChatsScreen.tsx", "utf8");
  const translations = readFileSync("src/i18n/en.ts", "utf8");

  assert.match(source, /activityIconForInterest/);
  assert.match(source, /interestSlug/);
  assert.match(source, /pingInterestDemandCounts/);
  assert.match(source, /LL\.activities\.pings\.interestDemandOne/);
  assert.match(source, /LL\.activities\.pings\.interestDemandMany/);
  assert.match(source, /requestResponseRow:\s*\{/);
  assert.match(source, /requestResponsePrimaryAction:\s*\{/);
  assert.match(source, /requestResponseSecondaryAction:\s*\{/);
  assert.match(source, /requestDeclineAction:\s*\{/);
  assert.match(source, /requestDeclineText:\s*\{/);
  assert.match(source, /textDecorationLine:\s*"underline"/);
  assert.match(source, /<Pressable[\s\S]*styles\.requestDeclineAction[\s\S]*LL\.activities\.pings\.no/);
  assert.doesNotMatch(source, /name="sparkles-outline"/);
  assert.match(translations, /interestDemandOne:\s*"1 person interested in \{interest:string\}"/);
  assert.match(
    translations,
    /interestDemandMany:\s*"\{count:number\} people interested in \{interest:string\}"/,
  );
});
