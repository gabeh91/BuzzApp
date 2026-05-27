import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("root tabs expose Discover, Activities, Chats, and Profile as bottom destinations", () => {
  const rootTabsSource = readFileSync("src/navigation/RootTabs.tsx", "utf8");
  const bottomTabIconSource = readFileSync(
    "src/navigation/BottomTabIcon.tsx",
    "utf8",
  );
  const bubbleTabBarSource = readFileSync(
    "src/navigation/AnimatedBubbleTabBar.tsx",
    "utf8",
  );
  const homeSource = readFileSync("src/features/home/HomeScreen.tsx", "utf8");
  const activitiesSource = readFileSync(
    "src/features/activities/ActivitiesScreen.tsx",
    "utf8",
  );
  const chatsSource = readFileSync("src/features/chat/ChatsScreen.tsx", "utf8");
  const profileSource = readFileSync(
    "src/features/profile/ProfileScreen.tsx",
    "utf8",
  );
  const translationsSource = readFileSync("src/i18n/en.ts", "utf8");

  assert.match(rootTabsSource, /<Tabs/);
  assert.match(rootTabsSource, /name="home"/);
  assert.match(rootTabsSource, /name="activities"/);
  assert.match(rootTabsSource, /name="chats"/);
  assert.match(rootTabsSource, /name="profile"/);
  assert.match(rootTabsSource, /AnimatedBubbleTabBar/);
  assert.match(rootTabsSource, /BottomTabIcon/);
  assert.match(bubbleTabBarSource, /useSharedValue/);
  assert.match(bubbleTabBarSource, /withSequence/);
  assert.match(bubbleTabBarSource, /withSpring/);
  assert.match(bubbleTabBarSource, /colors\.surfaceMuted/);
  assert.match(bubbleTabBarSource, /scaleX: bubbleStretch\.value/);
  assert.match(bubbleTabBarSource, /scaleY: bubbleSquash\.value/);
  assert.match(bubbleTabBarSource, /bubbleMorph/);
  assert.match(bubbleTabBarSource, /movementDirection/);
  assert.match(bubbleTabBarSource, /useConnectionRequestInbox/);
  assert.match(bubbleTabBarSource, /useActivationPingInbox/);
  assert.match(bubbleTabBarSource, /useChatSummaries/);
  assert.match(bubbleTabBarSource, /chatsUnreadCount/);
  assert.doesNotMatch(bubbleTabBarSource, /activeBubbleLeadingLobe/);
  assert.doesNotMatch(bubbleTabBarSource, /activeBubbleTrailingLobe/);
  assert.match(bottomTabIconSource, /discover/);
  assert.match(bottomTabIconSource, /activities/);
  assert.match(bottomTabIconSource, /chats/);
  assert.match(rootTabsSource, /typeof unreadCount === "number"/);
  assert.match(bottomTabIconSource, /profile/);
  assert.doesNotMatch(homeSource, /routes\.profile/);
  assert.doesNotMatch(activitiesSource, /routes\.home/);
  assert.doesNotMatch(chatsSource, /routes\.home/);
  assert.doesNotMatch(profileSource, /routes\.home/);
  assert.match(translationsSource, /navigation:/);
  assert.match(translationsSource, /discover:/);
  assert.match(translationsSource, /activities:/);
  assert.match(translationsSource, /chats:/);
  assert.match(translationsSource, /profile:/);
});
