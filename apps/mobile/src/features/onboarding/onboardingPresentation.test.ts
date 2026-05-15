import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const onboardingScreenSource = readFileSync(
  "src/features/onboarding/OnboardingScreen.tsx",
  "utf8",
);
const onboardingChromeSource = readFileSync(
  "src/features/onboarding/OnboardingChrome.tsx",
  "utf8",
);
const onboardingStepContentSource = readFileSync(
  "src/features/onboarding/OnboardingStepContent.tsx",
  "utf8",
);
const onboardingStylesSource = readFileSync(
  "src/features/onboarding/OnboardingScreen.styles.ts",
  "utf8",
);
const quizProgressBarSource = readFileSync("src/ui/QuizProgressBar.tsx", "utf8");
const onboardingSource = [
  onboardingScreenSource,
  onboardingChromeSource,
  onboardingStylesSource,
  onboardingStepContentSource,
  quizProgressBarSource,
].join("\n");
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
  assert.match(onboardingSource, /react-native-reanimated/);
  assert.match(onboardingSource, /useContentSlideTransition/);
  assert.match(quizProgressBarSource, /progressFillStyle/);
  assert.match(onboardingSource, /useSharedValue/);
  assert.match(onboardingSource, /useAnimatedStyle/);
  assert.match(onboardingSource, /withTiming/);
  assert.match(onboardingSource, /withRepeat/);
  assert.match(onboardingScreenSource, /transitionIndex/);
  assert.match(onboardingChromeSource, /previousIndex/);
  assert.match(onboardingChromeSource, /translateX/);
  assert.match(quizProgressBarSource, /progressFillStyle/);
  assert.doesNotMatch(onboardingSource, /opacity: entrance\.value/);
  assert.doesNotMatch(onboardingSource, /scale: 0\.985/);
  assert.doesNotMatch(onboardingSource, /Animated\.timing/);
});

test("onboarding screen uses shared safe edges and gutter token for scroll inset", () => {
  assert.match(onboardingScreenSource, /edges=\{\["top"\]\}/);
  assert.match(onboardingStylesSource, /SCREEN_CONTENT_GUTTER_SPACING/);
  assert.match(
    onboardingStylesSource,
    /paddingBottom:\s*bottomInset\s*\+\s*spacing\[10\]/,
  );
});

test("onboarding branded header reuses shared AppBrandedCityHeader", () => {
  assert.match(onboardingChromeSource, /AppBrandedCityHeader/);
  assert.match(onboardingChromeSource, /cityName=\{cityName\}/);
});

test("onboarding keeps header and progress fixed above scrollable card content", () => {
  assert.match(onboardingChromeSource, /const FixedOnboardingHeader =/);
  assert.match(onboardingScreenSource, /scroll=\{false\}/);
  assert.match(
    onboardingScreenSource,
    /contentStyle=\{styles\.screenContent\}/,
  );
  assert.match(onboardingScreenSource, /stickyHeader=\{\s*\n\s*<FixedOnboardingHeader/);
  assert.match(
    onboardingScreenSource,
    /<View style=\{styles\.stage\}>[\s\S]*?<Animated\.ScrollView[\s\S]*?<Animated\.View style=\{\[styles\.mainCard, transition\.cardStyle\]\}/,
  );
  assert.match(onboardingScreenSource, /quizProgress/);
  assert.doesNotMatch(
    onboardingStepContentSource,
    /const QuizContent[\s\S]*?<ProgressBar/,
  );
});

test("ambient background is scoped below the fixed onboarding header", () => {
  assert.match(
    onboardingScreenSource,
    /stickyHeader=\{\s*\n\s*<FixedOnboardingHeader[\s\S]*?<View style=\{styles\.stage\}>[\s\S]*?<AmbientBackground[\s\S]*?<Animated\.ScrollView[\s\S]*?<View style=\{styles\.layout\}>/,
  );
  assert.doesNotMatch(
    onboardingScreenSource,
    /<SafeAreaView[\s\S]*?<AmbientBackground[\s\S]*?<FixedOnboardingHeader/,
  );
  assert.match(onboardingStylesSource, /stage: \{[\s\S]*position: "relative"/);
});

test("ambient background lets decorative blobs overflow the content frame", () => {
  assert.match(
    onboardingStylesSource,
    /ambientRoot: \{[\s\S]*position: "absolute"/,
  );
  assert.doesNotMatch(
    onboardingStylesSource,
    /ambientRoot: \{[\s\S]*overflow: "hidden"[\s\S]*\},\n  ambientSky/,
  );
  assert.match(
    onboardingStylesSource,
    /ambientSky: \{[\s\S]*top: -80[\s\S]*right: -70/,
  );
  assert.match(onboardingStylesSource, /ambientGold: \{[\s\S]*left: -95/);
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
    onboardingChromeSource,
    /skyParallaxY = scrollY\.value \* 0\.34/,
  );
  assert.match(
    onboardingChromeSource,
    /goldParallaxY = scrollY\.value \* 0\.18/,
  );
  assert.match(
    onboardingChromeSource,
    /translateY: 16 \* ambient\.value - skyParallaxY/,
  );
  assert.match(
    onboardingChromeSource,
    /translateY: -14 \* ambient\.value - goldParallaxY/,
  );
});

test("onboarding header crossfades progress bars when entering and leaving quiz", () => {
  assert.match(
    onboardingChromeSource,
    /const useHeaderProgressTransition = \(isQuizStep: boolean\)/,
  );
  assert.match(
    onboardingChromeSource,
    /quizMode = useSharedValue\(isQuizStep \? 1 : 0\)/,
  );
  assert.match(onboardingChromeSource, /flowProgressStyle/);
  assert.match(onboardingChromeSource, /quizProgressStyle/);
  assert.match(onboardingChromeSource, /opacity: 1 - quizMode\.value/);
  assert.match(onboardingChromeSource, /opacity: quizMode\.value/);
  assert.match(onboardingChromeSource, /translateY: -12 \* quizMode\.value/);
  assert.match(
    onboardingChromeSource,
    /translateY: 12 \* \(1 - quizMode\.value\)/,
  );
  assert.match(onboardingChromeSource, /lastQuizProgress/);
  assert.match(onboardingChromeSource, /visibleQuizProgress/);
  assert.match(onboardingChromeSource, /styles\.headerProgressSlot/);
  assert.match(onboardingChromeSource, /styles\.flowProgressLayer/);
  assert.match(onboardingChromeSource, /styles\.quizProgressLayer/);
  assert.match(onboardingChromeSource, /QuizProgressBar/);
});

test("onboarding progress label noun is configurable per progress context", () => {
  assert.match(quizProgressBarSource, /QuizProgressBarProps/);
  assert.match(quizProgressBarSource, /label: string/);
  assert.match(quizProgressBarSource, /styles\.progressLabel/);
  assert.match(onboardingChromeSource, /LL\.common\.progress\.step/);
  assert.match(onboardingChromeSource, /LL\.common\.progress\.question/);
  assert.doesNotMatch(onboardingSource, /LL\.onboarding\.progress/);
});
