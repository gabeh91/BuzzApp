import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const onboardingScreenSource = readFileSync("src/features/onboarding/OnboardingScreen.tsx", "utf8");
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
  assert.match(onboardingScreenSource, /useStepTransition/);
  assert.match(onboardingScreenSource, /useSharedValue/);
  assert.match(onboardingScreenSource, /useAnimatedStyle/);
  assert.match(onboardingScreenSource, /withTiming/);
  assert.match(onboardingScreenSource, /withRepeat/);
  assert.match(onboardingScreenSource, /transitionKey/);
  assert.doesNotMatch(onboardingScreenSource, /Animated\.timing/);
});
