import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("discover empty panels keep the screen gutter when feed items are full bleed", () => {
  const source = readFileSync("src/features/home/HomeScreen.tsx", "utf8");

  assert.match(source, /paddingHorizontal:\s*0/);
  assert.match(
    source,
    /panel:\s*\{[\s\S]*marginHorizontal:\s*spacing\[SCREEN_CONTENT_GUTTER_SPACING\]/,
  );
});

test("discover enables settled item snapping across people live and nearby tabs", () => {
  const source = readFileSync("src/features/home/HomeScreen.tsx", "utf8");

  assert.match(
    source,
    /const discoverData = useMemo<DiscoverFeedItem\[\]>\([\s\S]*kind: "person"[\s\S]*kind: "live"[\s\S]*kind: "nearby"/,
  );
  assert.match(source, /snapToClosestItemOnScrollSettled=\{true\}/);
});

test("discover snapped feed items are capped to the usable viewport", () => {
  const source = readFileSync("src/features/home/HomeScreen.tsx", "utf8");

  assert.match(source, /useWindowDimensions/);
  assert.match(source, /discoverFeedItemMaxHeight/);
  assert.match(source, /tabBarTotalHeight\(theme,\s*insets\.bottom\)/);
  assert.match(source, /styles\.discoverFeedItem/);
  assert.match(source, /maxHeight:\s*discoverFeedItemMaxHeight/);
  assert.match(
    source,
    /<PeopleMatchCard[\s\S]*style=\{styles\.discoverFeedItem\}/,
  );
  assert.match(
    source,
    /<ActivityMatchCard[\s\S]*style=\{styles\.discoverFeedItem\}/,
  );
});

test("discover social feed cards can shrink media before hiding actions", () => {
  const peopleSource = readFileSync(
    "src/features/people/PeopleMatchCard.tsx",
    "utf8",
  );
  const activitySource = readFileSync(
    "src/features/activities/ActivityMatchCard.tsx",
    "utf8",
  );

  assert.match(peopleSource, /style\?:\s*StyleProp<ViewStyle>/);
  assert.match(activitySource, /style\?:\s*StyleProp<ViewStyle>/);
  assert.match(peopleSource, /media:\s*\{[\s\S]*flexShrink:\s*1/);
  assert.match(activitySource, /media:\s*\{[\s\S]*flexShrink:\s*1/);
  assert.match(peopleSource, /media:\s*\{[\s\S]*width:\s*"100%"/);
  assert.match(activitySource, /media:\s*\{[\s\S]*width:\s*"100%"/);
  assert.doesNotMatch(peopleSource, /media:\s*\{[\s\S]*aspectRatio/);
  assert.doesNotMatch(activitySource, /media:\s*\{[\s\S]*aspectRatio/);
});
