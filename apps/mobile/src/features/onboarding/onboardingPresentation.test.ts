import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const onboardingScreenSource = readFileSync(
  "src/features/onboarding/OnboardingScreen.tsx",
  "utf8",
);
const packageJson = JSON.parse(readFileSync("package.json", "utf8")) as {
  dependencies?: Record<string, string>;
};
const babelConfigSource = readFileSync("babel.config.js", "utf8");

test("mobile config enables Reanimated for native transitions", () => {
  assert.ok(packageJson.dependencies?.["react-native-reanimated"]);
  assert.ok(packageJson.dependencies?.["react-native-worklets"]);
  assert.match(babelConfigSource, /babel-preset-expo/);
  assert.doesNotMatch(babelConfigSource, /react-native-reanimated\/plugin/);
});

test("onboarding presentation drives visible animated transitions", () => {
  assert.match(onboardingScreenSource, /react-native-reanimated/);
  assert.match(onboardingScreenSource, /useContentSlideTransition/);
  assert.match(onboardingScreenSource, /useAnimatedProgress/);
  assert.match(onboardingScreenSource, /useSharedValue/);
  assert.match(onboardingScreenSource, /useAnimatedStyle/);
  assert.match(onboardingScreenSource, /withTiming/);
  assert.match(onboardingScreenSource, /withRepeat/);
  assert.match(onboardingScreenSource, /transitionIndex/);
  assert.match(onboardingScreenSource, /previousIndex/);
  assert.match(onboardingScreenSource, /translateX/);
  assert.match(onboardingScreenSource, /progressFillStyle/);
  assert.doesNotMatch(onboardingScreenSource, /opacity: entrance\.value/);
  assert.doesNotMatch(onboardingScreenSource, /scale: 0\.985/);
  assert.doesNotMatch(onboardingScreenSource, /Animated\.timing/);
});

test("onboarding keeps header and progress fixed above scrollable card content", () => {
  assert.match(onboardingScreenSource, /const FixedOnboardingHeader =/);
  assert.match(onboardingScreenSource, /scroll=\{false\}/);
  assert.match(
    onboardingScreenSource,
    /contentStyle=\{styles\.screenContent\}/,
  );
  assert.match(
    onboardingScreenSource,
    /<(?:SafeAreaView|Screen)[\s\S]*?<FixedOnboardingHeader[\s\S]*?<Animated\.ScrollView[\s\S]*?<Animated\.View style=\{\[styles\.mainCard, transition\.cardStyle\]\}/,
  );
  assert.match(onboardingScreenSource, /quizProgress/);
  assert.doesNotMatch(
    onboardingScreenSource,
    /const QuizContent[\s\S]*?<ProgressBar/,
  );
});

test("ambient background is scoped below the fixed onboarding header", () => {
  assert.match(
    onboardingScreenSource,
    /<FixedOnboardingHeader[\s\S]*?<View style=\{styles\.stage\}>[\s\S]*?<AmbientBackground[\s\S]*?<Animated\.ScrollView[\s\S]*?<View style=\{styles\.layout\}>/,
  );
  assert.doesNotMatch(
    onboardingScreenSource,
    /<SafeAreaView[\s\S]*?<AmbientBackground[\s\S]*?<FixedOnboardingHeader/,
  );
  assert.match(onboardingScreenSource, /stage: \{[\s\S]*position: "relative"/);
});

test("ambient background lets decorative blobs overflow the content frame", () => {
  assert.match(
    onboardingScreenSource,
    /ambientRoot: \{[\s\S]*position: "absolute"/,
  );
  assert.doesNotMatch(
    onboardingScreenSource,
    /ambientRoot: \{[\s\S]*overflow: "hidden"[\s\S]*\},\n  ambientSky/,
  );
  assert.match(
    onboardingScreenSource,
    /ambientSky: \{[\s\S]*top: -80[\s\S]*right: -70/,
  );
  assert.match(onboardingScreenSource, /ambientGold: \{[\s\S]*left: -95/);
});

test("ambient background uses different parallax scroll speeds than the card", () => {
  assert.match(onboardingScreenSource, /useAnimatedScrollHandler/);
  assert.match(onboardingScreenSource, /const scrollY = useSharedValue\(0\)/);
  assert.match(
    onboardingScreenSource,
    /scrollY\.value = event\.contentOffset\.y/,
  );
  assert.match(
    onboardingScreenSource,
    /<Animated\.ScrollView[\s\S]*onScroll=\{scrollHandler\}[\s\S]*scrollEventThrottle=\{16\}/,
  );
  assert.match(
    onboardingScreenSource,
    /<AmbientBackground scrollY=\{scrollY\}/,
  );
  assert.match(
    onboardingScreenSource,
    /skyParallaxY = scrollY\.value \* 0\.34/,
  );
  assert.match(
    onboardingScreenSource,
    /goldParallaxY = scrollY\.value \* 0\.18/,
  );
  assert.match(
    onboardingScreenSource,
    /translateY: 16 \* ambient\.value - skyParallaxY/,
  );
  assert.match(
    onboardingScreenSource,
    /translateY: -14 \* ambient\.value - goldParallaxY/,
  );
});

test("onboarding header crossfades progress bars when entering and leaving quiz", () => {
  assert.match(
    onboardingScreenSource,
    /const useHeaderProgressTransition = \(isQuizStep: boolean\)/,
  );
  assert.match(
    onboardingScreenSource,
    /quizMode = useSharedValue\(isQuizStep \? 1 : 0\)/,
  );
  assert.match(onboardingScreenSource, /flowProgressStyle/);
  assert.match(onboardingScreenSource, /quizProgressStyle/);
  assert.match(onboardingScreenSource, /opacity: 1 - quizMode\.value/);
  assert.match(onboardingScreenSource, /opacity: quizMode\.value/);
  assert.match(onboardingScreenSource, /translateY: -12 \* quizMode\.value/);
  assert.match(
    onboardingScreenSource,
    /translateY: 12 \* \(1 - quizMode\.value\)/,
  );
  assert.match(onboardingScreenSource, /lastQuizProgress/);
  assert.match(onboardingScreenSource, /visibleQuizProgress/);
  assert.match(onboardingScreenSource, /styles\.headerProgressSlot/);
  assert.match(onboardingScreenSource, /styles\.flowProgressLayer/);
  assert.match(onboardingScreenSource, /styles\.quizProgressLayer/);
});

test("onboarding progress label noun is configurable per progress context", () => {
  assert.match(onboardingScreenSource, /type ProgressBarProps =/);
  assert.match(onboardingScreenSource, /label: string/);
  assert.match(
    onboardingScreenSource,
    /<Text style=\{styles\.progressLabel\}>\{label\}<\/Text>/,
  );
  assert.match(onboardingScreenSource, /LL\.common\.progress\.step/);
  assert.match(onboardingScreenSource, /LL\.common\.progress\.question/);
  assert.doesNotMatch(onboardingScreenSource, /LL\.onboarding\.progress/);
});
