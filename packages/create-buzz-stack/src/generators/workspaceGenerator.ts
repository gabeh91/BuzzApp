import type { BuzzStackConfig } from "../schema/configSchema.js";
import type { GeneratedFile } from "./types.js";

export function generateWorkspaceFiles(config: BuzzStackConfig): GeneratedFile[] {
  return [
    {
      path: "apps/mobile/package.json",
      contents: `{
  "name": "mobile",
  "version": "0.1.0",
  "private": true,
  "main": "expo-router/entry",
  "scripts": {
    "start": "expo start",
    "lint": "echo \\"mobile lint placeholder\\"",
    "typecheck": "tsc --noEmit",
    "test": "tsx --test \\"src/**/__tests__/*.test.ts\\""
  },
  "dependencies": {
    "@apollo/client": "^3.14.1",
    "@babel/runtime": "7.29.2",
    "@expo/metro-runtime": "~6.1.2",
    "@supabase/supabase-js": "latest",
    "expo": "~54.0.34",
    "expo-constants": "~18.0.13",
    "expo-linking": "~8.0.12",
    "expo-router": "~6.0.23",
    "expo-status-bar": "~3.0.9",
    "graphql": "latest",
    "react": "19.1.0",
    "react-native": "0.81.5",
    "react-native-reanimated": "~4.1.7",
    "react-native-safe-area-context": "5.6.2",
    "react-native-screens": "~4.16.0",
    "react-native-worklets": "0.5.1",
    "typesafe-i18n": "^5.27.1"
  },
  "devDependencies": {
    "@types/node": "latest",
    "@types/react": "^19.1.17",
    "tsx": "latest",
    "typescript": "^5.9.3"
  }
}
`
    },
    {
      path: "apps/mobile/babel.config.js",
      contents: `module.exports = function (api) {
  api.cache(true);

  return {
    presets: ["babel-preset-expo"]
  };
};
`
    },
    {
      path: "apps/mobile/tsconfig.json",
      contents: `{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "baseUrl": ".",
    "jsx": "react-jsx",
    "paths": {
      "@/*": ["src/*"],
      "@graphql/*": ["graphql/*"]
    },
    "types": ["node"]
  },
  "include": ["**/*.ts", "**/*.tsx"]
}
`
    },
    {
      path: "apps/mobile/app.json",
      contents: `{
  "expo": {
    "name": "${config.mobile.appName}",
    "slug": "buzz",
    "version": "1.0.0",
    "orientation": "portrait",
    "ios": {
      "bundleIdentifier": "${config.mobile.ios.devBundleId}"
    },
    "android": {
      "package": "${config.mobile.android.devPackage}"
    },
    "plugins": [
      "expo-router"
    ]
  }
}
`
    },
    {
      path: "apps/mobile/eas.json",
      contents: `{
  "cli": {
    "version": ">= 12.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_APP_ENV": "development"
      }
    },
    "staging": {
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_APP_ENV": "staging"
      }
    },
    "production": {
      "autoIncrement": true,
      "env": {
        "EXPO_PUBLIC_APP_ENV": "production"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
`
    },
    {
      path: "apps/mobile/metro.config.js",
      contents: `const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = Array.from(new Set([...(config.watchFolders ?? []), workspaceRoot]));

config.resolver.nodeModulesPaths = [
  ...(config.resolver.nodeModulesPaths ?? []),
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules")
];

module.exports = config;
`
    },
    {
      path: "apps/mobile/app/_layout.tsx",
      contents: `import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { AppProviders } from "@/providers/AppProviders";
import { colors } from "@/theme/tokens";

const RootLayout = () => {
  return (
    <AppProviders>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          gestureEnabled: true,
          contentStyle: {
            backgroundColor: colors.cream
          }
        }}
      />
    </AppProviders>
  );
};

export default RootLayout;
`
    },
    {
      path: "apps/mobile/app/index.tsx",
      contents: `import { OnboardingScreen } from "@/features/onboarding/OnboardingScreen";

const OnboardingRoute = () => {
  return <OnboardingScreen />;
};

export default OnboardingRoute;
`
    },
    {
      path: "apps/mobile/app/home.tsx",
      contents: `import { BuzzHomeScreen } from "@/features/home/BuzzHomeScreen";

const HomeRoute = () => {
  return <BuzzHomeScreen />;
};

export default HomeRoute;
`
    },
    {
      path: "apps/mobile/src/providers/AppProviders.tsx",
      contents: `import { ApolloProvider } from "@apollo/client";
import { useMemo, type ReactNode } from "react";

import { BuzzAuthProvider } from "@/auth/AuthProvider";
import { InterestFlowProvider } from "@/features/interests/InterestFlowProvider";
import { OnboardingProvider } from "@/features/onboarding/OnboardingProvider";
import { QuizProvider } from "@/features/quiz/QuizProvider";
import { I18nProvider } from "@/i18n/I18nProvider";
import { createBuzzApolloClient } from "@/lib/apollo";
import { ThemeProvider } from "@/theme/ThemeProvider";

export const AppProviders = ({ children }: { children: ReactNode }) => {
  const client = useMemo(() => createBuzzApolloClient(), []);

  return (
    <ApolloProvider client={client}>
      <ThemeProvider>
        <I18nProvider>
          <BuzzAuthProvider>
            <OnboardingProvider>
              <QuizProvider>
                <InterestFlowProvider>{children}</InterestFlowProvider>
              </QuizProvider>
            </OnboardingProvider>
          </BuzzAuthProvider>
        </I18nProvider>
      </ThemeProvider>
    </ApolloProvider>
  );
};
`
    },
    {
      path: "apps/mobile/src/i18n/en.ts",
      contents: `import type { BaseTranslation } from "typesafe-i18n";

const en = {
  brand: {
    name: "Buzz"
  },
  common: {
    continue: "Continue"
  },
  onboarding: {
    status: {
      loadingInterests: "Finding interests for your city",
      starterInterests: "Showing starter interests for now",
      readyInterests: "Choose what feels doable this week"
    },
    actions: {
      activating: "Activating..."
    },
    steps: {
      welcome: {
        eyebrow: "Welcome to Buzz",
        title: "A softer way to find your people in a new city.",
        body: "Buzz helps you find like-minded people to join you in the things you love to do."
      },
      intent: {
        eyebrow: "Your intent",
        title: "Tell Buzz why you are here.",
        body: "New to town, returning after time away, or just widening your circle. The activity comes first."
      },
      howItWorks: {
        eyebrow: "How it works",
        title: "Pick interests, activate one, then meet around a plan.",
        body: "Buzz avoids cold friend-swiping. You match around shared momentum."
      },
      profile: {
        eyebrow: "Profile basics",
        title: "Create a lightweight local profile.",
        body: "Add just enough context for Buzz to shape your first suggestions."
      },
      quizIntro: {
        eyebrow: "Discovery quiz",
        title: "A few quick questions so matches feel less random.",
        body: "The quiz captures practical signals like energy, availability, planning style, and group comfort."
      },
      quiz: {
        eyebrow: "Quiz",
        title: "Answer as you are.",
        body: "Your answers help Buzz shape practical suggestions."
      },
      interests: {
        eyebrow: "Interests",
        title: "Choose what you would genuinely do this week.",
        body: "Start with something you would actually say yes to."
      },
      activation: {
        eyebrow: "Activation",
        title: "Activate one interest when you are open to doing it.",
        body: "Activation is a clear signal that you are ready for a plan."
      },
      matchPreview: {
        eyebrow: "First match",
        title: "Buzz forms a practical next step.",
        body: "Your first preview keeps the next step practical."
      }
    }
  },
  home: {
    firstPlan: "First plan",
    titleActivated: "You activated {interest:string}.",
    titleReady: "Your Buzz profile is ready.",
    activatedBody: "Buzz has enough context to start shaping low-pressure plans around this interest.",
    readyBody: "Complete onboarding to unlock your first suggested plan.",
    suggestedNextStep: "Suggested next step",
    emptyPlan: "No suggested plan yet.",
    reviewOnboarding: "Review onboarding",
    fallbackInterest: "your next interest"
  },
  interests: {
    activation: {
      initial: "Pick one interest to activate when you are open to doing it.",
      selected: "{interest:string} is ready when you are.",
      activating: "Activating your interest...",
      complete: "{interest:string} is active. Buzz will use it to shape your next suggestion.",
      chooseBeforeActivating: "Choose an interest before activating."
    }
  }
} as const satisfies BaseTranslation;

export default en;
`
    },
    {
      path: "apps/mobile/src/i18n/index.ts",
      contents: `import { i18nObject } from "typesafe-i18n";

import en from "@/i18n/en";

export const baseLocale = "en";
export const locales = ["en"] as const;

export type AppLocale = (typeof locales)[number];
type PluralRulesLike = {
  select: (value: number) => Intl.LDMLPluralRule;
};
type IntlWithOptionalPluralRules = typeof Intl & {
  PluralRules?: new (locale?: string | string[]) => PluralRulesLike;
};

export const translations = {
  en
} as const;

const ensurePluralRules = () => {
  const globalObject = globalThis as typeof globalThis & {
    Intl?: IntlWithOptionalPluralRules;
  };

  if (!globalObject.Intl) {
    Object.defineProperty(globalObject, "Intl", {
      configurable: true,
      value: {}
    });
  }

  if (typeof globalObject.Intl.PluralRules === "function") {
    return;
  }

  class BuzzPluralRulesFallback implements PluralRulesLike {
    select(value: number): Intl.LDMLPluralRule {
      return value === 1 ? "one" : "other";
    }
  }

  Object.defineProperty(globalObject.Intl, "PluralRules", {
    configurable: true,
    value: BuzzPluralRulesFallback
  });
};

export const createI18n = (locale: AppLocale = baseLocale) => {
  ensurePluralRules();

  return i18nObject(locale, translations[locale]);
};

export const LL = createI18n(baseLocale);

export type I18n = typeof LL;
`
    },
    {
      path: "apps/mobile/src/i18n/I18nProvider.tsx",
      contents: `import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import { baseLocale, createI18n, type AppLocale, type I18n } from "@/i18n";

type I18nContextValue = {
  locale: AppLocale;
  LL: I18n;
  setLocale: (locale: AppLocale) => void;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocale] = useState<AppLocale>(baseLocale);
  const LL = useMemo(() => createI18n(locale), [locale]);

  return <I18nContext.Provider value={{ locale, LL, setLocale }}>{children}</I18nContext.Provider>;
};

export const useI18n = (): I18nContextValue => {
  const value = useContext(I18nContext);

  if (!value) {
    throw new Error("useI18n must be used within I18nProvider");
  }

  return value;
};
`
    },
    {
      path: "apps/mobile/src/i18n/i18nArchitecture.test.ts",
      contents: `import assert from "node:assert/strict";
import test from "node:test";

import { LL, locales } from "@/i18n";

test("typesafe-i18n exposes the base mobile locale", () => {
  assert.deepEqual(locales, ["en"]);
  assert.equal(LL.brand.name(), "Buzz");
  assert.equal(LL.home.titleActivated({ interest: "Surfing" }), "You activated Surfing.");
});
`
    },
    {
      path: "apps/mobile/src/i18n/i18nNativeRuntime.test.ts",
      contents: `import assert from "node:assert/strict";
import test from "node:test";

test("i18n module evaluates when Intl.PluralRules is unavailable", async () => {
  const originalPluralRules = Intl.PluralRules;

  try {
    Object.defineProperty(Intl, "PluralRules", {
      configurable: true,
      value: undefined
    });

    const uncachedModulePath = "./index.ts?without-plural-rules";
    const i18n = await import(uncachedModulePath);
    const LL = i18n.createI18n("en");

    assert.equal(LL.brand.name(), "Buzz");
    assert.equal(LL.home.titleActivated({ interest: "Surfing" }), "You activated Surfing.");
  } finally {
    Object.defineProperty(Intl, "PluralRules", {
      configurable: true,
      value: originalPluralRules
    });
  }
});
`
    },
    {
      path: "apps/mobile/src/lib/apollo.ts",
      contents: `import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

const appEnv = process.env.EXPO_PUBLIC_APP_ENV ?? "local";
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";
const localSupabaseAccessToken = process.env.EXPO_PUBLIC_LOCAL_SUPABASE_ACCESS_TOKEN ?? "";

export const graphqlUrl = supabaseUrl.replace(/\\/$/, "") + "/graphql/v1";

export type BuzzApolloHeaderInput = {
  appEnv?: string;
  supabaseAnonKey?: string;
  localSupabaseAccessToken?: string;
};

export const createBuzzApolloHeaders = ({
  appEnv = "local",
  supabaseAnonKey = "",
  localSupabaseAccessToken = ""
}: BuzzApolloHeaderInput): Record<string, string> => {
  const bearerToken = appEnv === "local" ? localSupabaseAccessToken || supabaseAnonKey : supabaseAnonKey;

  return {
    apikey: supabaseAnonKey,
    authorization: bearerToken ? \`Bearer \${bearerToken}\` : ""
  };
};

export const createBuzzApolloClient = () => {
  return new ApolloClient({
    link: new HttpLink({
      uri: graphqlUrl,
      headers: createBuzzApolloHeaders({ appEnv, supabaseAnonKey, localSupabaseAccessToken })
    }),
    cache: new InMemoryCache()
  });
};
`
    },
    {
      path: "apps/mobile/src/navigation/routes.ts",
      contents: `export const routes = {
  onboarding: "/",
  home: "/home"
} as const;

export type BuzzRoute = (typeof routes)[keyof typeof routes];

export const isOnboardingRoute = (route: BuzzRoute): boolean => {
  return route === routes.onboarding;
};
`
    },
    {
      path: "apps/mobile/src/navigation/routes.test.ts",
      contents: `import assert from "node:assert/strict";
import test from "node:test";

import { isOnboardingRoute, routes } from "./routes";

test("routes define Expo Router paths", () => {
  assert.equal(routes.home, "/home");
  assert.equal(isOnboardingRoute(routes.onboarding), true);
});
`
    },
    {
      path: "apps/mobile/src/features/onboarding/OnboardingScreen.tsx",
      contents: `import { useEffect } from "react";
import { useRouter } from "expo-router";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming
} from "react-native-reanimated";

import { useActivateInterestMutation, useBuzzHomeQuery } from "@graphql/generated";
import { useBuzzAuth } from "@/auth/AuthProvider";
import { useInterestFlow } from "@/features/interests/InterestFlowProvider";
import { useOnboarding } from "@/features/onboarding/OnboardingProvider";
import { useQuiz } from "@/features/quiz/QuizProvider";
import { useI18n } from "@/i18n/I18nProvider";
import { routes } from "@/navigation/routes";
import { useBuzzTheme } from "@/theme/ThemeProvider";
import type { BuzzTheme } from "@/theme/tokens";

const useStepTransition = (transitionKey: string) => {
  const entrance = useSharedValue(0);
  const drift = useSharedValue(0);

  useEffect(() => {
    entrance.value = 0;
    entrance.value = withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) });
  }, [entrance, transitionKey]);

  useEffect(() => {
    drift.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 3600, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 3600, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
  }, [drift]);

  const stepStyle = useAnimatedStyle(() => ({
    opacity: entrance.value,
    transform: [{ translateY: 18 * (1 - entrance.value) }, { scale: 0.985 + entrance.value * 0.015 }]
  }));

  const accentStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: 14 * drift.value }, { translateY: -10 * drift.value }]
  }));

  return { stepStyle, accentStyle };
};

export const OnboardingScreen = () => {
  const router = useRouter();
  const { theme } = useBuzzTheme();
  const styles = createStyles(theme);
  const onboarding = useOnboarding();
  const { user } = useBuzzAuth();
  const { LL } = useI18n();
  const quiz = useQuiz();
  const interestFlow = useInterestFlow();
  const { data, loading, error } = useBuzzHomeQuery();
  const [activateInterest, { loading: activating }] = useActivateInterestMutation();
  const interests = data?.interestsCollection?.edges.map((edge) => edge.node) ?? [];
  const transition = useStepTransition(onboarding.state.step.id);
  const stepCopy = LL.onboarding.steps[onboarding.state.step.id as keyof typeof LL.onboarding.steps];

  const continueFlow = () => {
    if (onboarding.isLastStep) {
      router.replace(routes.home);
      return;
    }

    if (onboarding.state.step.id === "quiz" && !quiz.isLastQuestion) {
      quiz.nextQuestion();
      return;
    }

    onboarding.next();
  };

  const activateSelectedInterest = async () => {
    if (!interestFlow.state.selectedInterest) {
      interestFlow.failActivation(LL.interests.activation.chooseBeforeActivating());
      return;
    }

    interestFlow.markActivating();

    try {
      await activateInterest({ variables: { interestId: interestFlow.state.selectedInterest.id } });
    } catch {
      // Demo mode remains plug-and-play when auth-backed GraphQL writes are not available yet.
    }

    interestFlow.completeLocalActivation(quiz.traits);
    onboarding.next();
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Animated.Text style={[styles.logo, transition.accentStyle]}>{LL.brand.name()}</Animated.Text>
        <Text style={styles.copy}>{user.cityName}</Text>
        <Animated.View style={[styles.card, transition.stepStyle]}>
          <Text style={styles.eyebrow}>{stepCopy.eyebrow()}</Text>
          <Text style={styles.title}>{stepCopy.title()}</Text>

          {onboarding.state.step.id === "quiz" ? (
            <View style={styles.stack}>
              <Text style={styles.prompt}>{quiz.activeQuestion.prompt}</Text>
              {quiz.activeQuestion.options.map((option) => (
                <Pressable
                  key={option.id}
                  onPress={() => quiz.answerQuestion(quiz.activeQuestion.id, option.id)}
                  style={[styles.option, quiz.answers[quiz.activeQuestion.id] === option.id ? styles.optionSelected : null]}
                >
                  <Text style={styles.optionLabel}>{option.label}</Text>
                  <Text style={styles.copy}>{option.supportingText}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}

          {onboarding.state.step.id === "interests" ? (
            <View style={styles.pillGrid}>
              <Text style={styles.copy}>
                {loading
                  ? LL.onboarding.status.loadingInterests()
                  : error
                    ? LL.onboarding.status.starterInterests()
                    : LL.onboarding.status.readyInterests()}
              </Text>
            {interests.map((interest) => (
              <Pressable
                key={interest.id}
                onPress={() => interestFlow.select(interest)}
                style={[styles.pill, interestFlow.state.selectedInterest?.id === interest.id ? styles.pillSelected : null]}
              >
                <Text style={[styles.pillText, interestFlow.state.selectedInterest?.id === interest.id ? styles.pillTextSelected : null]}>
                  {interest.name}
                </Text>
              </Pressable>
            ))}
            </View>
          ) : null}

          {onboarding.state.step.id === "activation" ? (
            <View style={styles.stack}>
              <Text style={styles.copy}>{quiz.traits.summary}</Text>
              <Text style={styles.strong}>{interestFlow.state.activation.message}</Text>
            </View>
          ) : null}

          {onboarding.state.step.id === "matchPreview" && interestFlow.state.matchPreview ? (
            <View style={styles.matchCard}>
              <Text style={styles.prompt}>{interestFlow.state.matchPreview.headline}</Text>
              <Text style={styles.copy}>{interestFlow.state.matchPreview.reason}</Text>
            </View>
          ) : null}

          {!["quiz", "interests", "activation", "matchPreview"].includes(onboarding.state.step.id) ? (
            <Text style={styles.copy}>{stepCopy.body()}</Text>
          ) : null}
        </Animated.View>

        <Pressable
          disabled={onboarding.state.step.id === "quiz" && !quiz.hasAnsweredActiveQuestion}
          onPress={() => {
            if (onboarding.state.step.id === "activation") {
              void activateSelectedInterest();
              return;
            }

            continueFlow();
          }}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>
            {onboarding.state.step.id === "activation" && activating ? LL.onboarding.actions.activating() : LL.common.continue()}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: BuzzTheme) => {
  const { colors } = theme;

  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    content: { flexGrow: 1, padding: theme.spacing[6], gap: theme.spacing[5] },
    logo: { color: colors.text, fontFamily: theme.fontFamilies.display, fontSize: theme.fontSizes.hero, fontWeight: "900" },
    card: { backgroundColor: colors.surface, borderRadius: theme.radii["2xl"], padding: theme.spacing[6], gap: theme.spacing[4], ...theme.shadows.card },
    eyebrow: { color: colors.accent, fontSize: theme.fontSizes.xs, fontWeight: "900", letterSpacing: 1.2, textTransform: "uppercase" },
    title: { color: colors.text, fontFamily: theme.fontFamilies.display, fontSize: theme.fontSizes["5xl"], fontWeight: "900" },
    prompt: { color: colors.text, fontSize: theme.fontSizes["2xl"], fontWeight: "900" },
    copy: { color: colors.textMuted, fontSize: theme.fontSizes.lg, lineHeight: theme.lineHeights.relaxed },
    strong: { color: colors.text, fontWeight: "900" },
    stack: { gap: theme.spacing[3] },
    option: { borderRadius: theme.radii.md, padding: theme.spacing[4], backgroundColor: colors.background },
    optionSelected: { backgroundColor: colors.accentSoft },
    optionLabel: { color: colors.text, fontWeight: "900" },
    pillGrid: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing[2] },
    pill: { borderRadius: theme.radii.full, paddingVertical: theme.spacing[3], paddingHorizontal: theme.spacing[4], backgroundColor: colors.background },
    pillSelected: { backgroundColor: colors.surfaceInverse },
    pillText: { color: colors.text, fontWeight: "800" },
    pillTextSelected: { color: colors.textInverse },
    matchCard: { backgroundColor: colors.surfaceMuted, borderRadius: theme.radii.lg, padding: theme.spacing[5], gap: theme.spacing[2] },
    primaryButton: { backgroundColor: colors.surfaceInverse, borderRadius: theme.radii.lg, padding: theme.spacing[4], alignItems: "center" },
    primaryButtonText: { color: colors.textInverse, fontWeight: "900" }
  });
};
`
    },
    {
      path: "apps/mobile/graphql/operations.graphql",
      contents: `query BuzzHome {
  interestsCollection(first: 50) {
    edges {
      node {
        id
        name
        slug
        category
      }
    }
  }
}

mutation ActivateInterest($interestId: UUID!) {
  activateInterest(interestId: $interestId)
}
`
    },
    {
      path: "apps/mobile/graphql/generated.tsx",
      contents: `import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";

const defaultOptions = {} as const;

export type BuzzHomeQuery = {
  interestsCollection: {
    edges: Array<{
      node: {
        id: string;
        name: string;
        slug: string;
        category: string;
      };
    }>;
  } | null;
};

export type BuzzHomeQueryVariables = Record<string, never>;

export type ActivateInterestMutation = {
  activateInterest: Record<string, unknown> | null;
};

export type ActivateInterestMutationVariables = {
  interestId: string;
};

export const BuzzHomeDocument = gql\`
  query BuzzHome {
    interestsCollection(first: 50) {
      edges {
        node {
          id
          name
          slug
          category
        }
      }
    }
  }
\`;

export const ActivateInterestDocument = gql\`
  mutation ActivateInterest($interestId: UUID!) {
    activateInterest(interestId: $interestId)
  }
\`;

export function useBuzzHomeQuery(baseOptions?: Apollo.QueryHookOptions<BuzzHomeQuery, BuzzHomeQueryVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<BuzzHomeQuery, BuzzHomeQueryVariables>(BuzzHomeDocument, options);
}

export function useActivateInterestMutation(
  baseOptions?: Apollo.MutationHookOptions<ActivateInterestMutation, ActivateInterestMutationVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<ActivateInterestMutation, ActivateInterestMutationVariables>(
    ActivateInterestDocument,
    options
  );
}
`
    },
    {
      path: "apps/mobile/src/auth/auth.types.ts",
      contents: `export type BuzzAuthMode = "demo" | "supabase";

export type BuzzUser = {
  id: string;
  displayName: string;
  cityId: string;
  cityName: string;
  isDemo: boolean;
};

export type BuzzAuthState = {
  mode: BuzzAuthMode;
  user: BuzzUser;
};
`
    },
    {
      path: "apps/mobile/src/auth/demoAuth.ts",
      contents: `import type { BuzzUser } from "./auth.types";

type DemoAuthEnv = Partial<Record<string, string | undefined>>;

const demoDefaults = {
  userId: "00000000-0000-0000-0000-000000000101",
  cityId: "00000000-0000-0000-0000-000000000001",
  displayName: "New Buzz Member",
  cityName: "Melbourne"
};

export const createDemoBuzzUser = (env: DemoAuthEnv): BuzzUser => {
  return {
    id: env.EXPO_PUBLIC_DEMO_USER_ID ?? demoDefaults.userId,
    displayName: env.EXPO_PUBLIC_DEMO_DISPLAY_NAME ?? demoDefaults.displayName,
    cityId: env.EXPO_PUBLIC_DEMO_CITY_ID ?? demoDefaults.cityId,
    cityName: env.EXPO_PUBLIC_DEMO_CITY_NAME ?? demoDefaults.cityName,
    isDemo: true
  };
};
`
    },
    {
      path: "apps/mobile/src/auth/AuthProvider.tsx",
      contents: `import { createContext, useContext, useState, type ReactNode } from "react";

import type { BuzzAuthState } from "./auth.types";
import { createDemoBuzzUser } from "./demoAuth";

const BuzzAuthContext = createContext<BuzzAuthState | null>(null);

export const createBuzzAuthState = (): BuzzAuthState => {
  return {
    mode: "demo",
    user: createDemoBuzzUser(process.env)
  };
};

export const BuzzAuthProvider = ({ children }: { children: ReactNode }) => {
  const [state] = useState(createBuzzAuthState);

  return <BuzzAuthContext.Provider value={state}>{children}</BuzzAuthContext.Provider>;
};

export const useBuzzAuth = (): BuzzAuthState => {
  const state = useContext(BuzzAuthContext);

  if (!state) {
    throw new Error("useBuzzAuth must be used within BuzzAuthProvider");
  }

  return state;
};
`
    },
    {
      path: "apps/mobile/src/auth/demoAuth.test.ts",
      contents: `import assert from "node:assert/strict";
import test from "node:test";

import { createDemoBuzzUser } from "./demoAuth";

test("createDemoBuzzUser keeps demo identity behind a replaceable auth boundary", () => {
  const user = createDemoBuzzUser({
    EXPO_PUBLIC_DEMO_USER_ID: "00000000-0000-0000-0000-000000000202",
    EXPO_PUBLIC_DEMO_DISPLAY_NAME: "Mia"
  });

  assert.equal(user.id, "00000000-0000-0000-0000-000000000202");
  assert.equal(user.displayName, "Mia");
  assert.equal(user.isDemo, true);
});
`
    },
    {
      path: "apps/mobile/src/theme/tokens.ts",
      contents: `import { Platform } from "react-native";

export type BuzzThemeMode = "light" | "dark";

const fontFamilies = {
  display: Platform.select({ ios: "Avenir Next", android: "sans-serif-condensed", default: "serif" }),
  body: Platform.select({ ios: "Avenir Next", android: "sans-serif", default: "sans-serif" }),
  mono: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" })
};

export const spacing = {
  0: 0,
  0.25: 1,
  0.5: 2,
  0.75: 3,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48
} as const;
export const radii = {
  "2xs": 2,
  xs: 4,
  icon: 6,
  sm: 10,
  md: 14,
  lg: 20,
  xl: 24,
  "2xl": 28,
  full: 999
} as const;
export const fontSizes = { xs: 12, sm: 13, base: 15, md: 16, lg: 17, xl: 18, "2xl": 22, "5xl": 30, hero: 34 } as const;
export const lineHeights = { tight: 20, body: 24, relaxed: 26, title: 32, hero: 39 } as const;
export const borderWidths = { hairline: 1, focus: 2 } as const;

const lightPalette = {
  mode: "light",
  ink: "#15251f",
  muted: "#66736b",
  cream: "#f7f0df",
  paper: "#fffaf0",
  moss: "#31483f",
  sage: "#8fa88f",
  clay: "#c96f45",
  claySoft: "rgba(201, 111, 69, 0.14)",
  gold: "#d7a84b",
  goldSoft: "rgba(215, 168, 75, 0.28)",
  sky: "#d8e9ea",
  line: "rgba(21, 37, 31, 0.14)",
  disabled: "rgba(21, 37, 31, 0.26)",
  overlay: "rgba(21, 37, 31, 0.12)"
} as const;

const darkPalette = {
  mode: "dark",
  ink: "#f8ecd8",
  muted: "#b8aa94",
  cream: "#101814",
  paper: "#17221d",
  moss: "#d9e7d7",
  sage: "#9fba9f",
  clay: "#e09063",
  claySoft: "rgba(224, 144, 99, 0.2)",
  gold: "#e7be6a",
  goldSoft: "rgba(231, 190, 106, 0.18)",
  sky: "#263d40",
  line: "rgba(248, 236, 216, 0.16)",
  disabled: "rgba(248, 236, 216, 0.24)",
  overlay: "rgba(248, 236, 216, 0.12)"
} as const;

const lightShadows = {
  card: {
    shadowColor: "#15251f",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4
  }
} as const;

const darkShadows = {
  card: {
    shadowColor: "#000000",
    shadowOpacity: 0.28,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 16 },
    elevation: 6
  }
} as const;

const createSemanticColors = (palette: typeof lightPalette | typeof darkPalette) => {
  return {
    ...palette,
    background: palette.cream,
    surface: palette.paper,
    surfaceMuted: palette.sky,
    surfaceInverse: palette.ink,
    text: palette.ink,
    textMuted: palette.muted,
    textInverse: palette.paper,
    brand: palette.moss,
    brandSoft: palette.sage,
    accent: palette.clay,
    accentSoft: palette.claySoft,
    warning: palette.gold,
    warningSoft: palette.goldSoft,
    border: palette.line,
    focus: palette.clay
  };
};

const createTheme = <Mode extends BuzzThemeMode>(
  mode: Mode,
  palette: typeof lightPalette | typeof darkPalette,
  shadows: typeof lightShadows | typeof darkShadows
) => {
  return {
    mode,
    palette,
    colors: createSemanticColors(palette),
    fontFamilies,
    fontSizes,
    lineHeights,
    spacing,
    radii,
    borderWidths,
    shadows
  };
};

export const themes = {
  light: createTheme("light", lightPalette, lightShadows),
  dark: createTheme("dark", darkPalette, darkShadows)
} as const;

export type BuzzTheme = (typeof themes)[BuzzThemeMode];
export const colors = themes.light.colors;
export const theme = themes.light;
export const shadows = themes.light.shadows;
`
    },
    {
      path: "apps/mobile/src/theme/ThemeProvider.tsx",
      contents: `import { createContext, useContext, type ReactNode } from "react";
import { useColorScheme } from "react-native";

import { themes, type BuzzTheme, type BuzzThemeMode } from "@/theme/tokens";

type ThemeContextValue = {
  mode: BuzzThemeMode;
  theme: BuzzTheme;
  colors: BuzzTheme["colors"];
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const colorScheme = useColorScheme();
  const mode: BuzzThemeMode = colorScheme === "dark" ? "dark" : "light";
  const theme = themes[mode];

  return <ThemeContext.Provider value={{ mode, theme, colors: theme.colors }}>{children}</ThemeContext.Provider>;
};

export const useBuzzTheme = (): ThemeContextValue => {
  const value = useContext(ThemeContext);

  if (!value) {
    throw new Error("useBuzzTheme must be used within ThemeProvider");
  }

  return value;
};
`
    },
    {
      path: "apps/mobile/src/theme/tokens.test.ts",
      contents: `import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
const tokensSource = readFileSync("src/theme/tokens.ts", "utf8");

test("themes expose semantic light and dark design tokens", () => {
  assert.match(tokensSource, /mode: "light"/);
  assert.match(tokensSource, /mode: "dark"/);
  assert.match(tokensSource, /background:/);
  assert.match(tokensSource, /surface:/);
  assert.match(tokensSource, /text:/);
  assert.match(tokensSource, /accent:/);
});

test("theme includes typography, spacing, borders, radii, and shadows", () => {
  assert.match(tokensSource, /fontFamilies/);
  assert.match(tokensSource, /fontSizes/);
  assert.match(tokensSource, /spacing/);
  assert.match(tokensSource, /radii/);
  assert.match(tokensSource, /borderWidths/);
  assert.match(tokensSource, /shadows/);
  assert.match(tokensSource, /elevation: 5/);
  assert.match(tokensSource, /elevation: 6/);
});
`
    },
    {
      path: "apps/mobile/src/features/onboarding/onboardingFlow.ts",
      contents: `export type OnboardingStepId =
  | "welcome"
  | "intent"
  | "howItWorks"
  | "profile"
  | "quizIntro"
  | "quiz"
  | "interests"
  | "activation"
  | "matchPreview";

export type OnboardingStep = {
  id: OnboardingStepId;
  eyebrow: string;
  title: string;
  body: string;
};

export type OnboardingState = {
  index: number;
  step: OnboardingStep;
  progress: {
    current: number;
    total: number;
  };
};

export const onboardingSteps: OnboardingStep[] = [
  ["welcome", "Welcome to Buzz", "A softer way to find your people in a new city.", "Start with what you actually want to do."],
  ["intent", "Your intent", "Tell Buzz why you are here.", "The activity comes first; friendship may follow."],
  ["howItWorks", "How it works", "Pick interests, activate one, then meet around a plan.", "No cold friend-swiping."],
  ["profile", "Profile basics", "Create a lightweight local profile.", "Add just enough context for Buzz to shape your first suggestions."],
  ["quizIntro", "Discovery quiz", "A few quick questions so matches feel less random.", "The quiz captures practical matching signals."],
  ["quiz", "Quiz", "Answer as you are.", "Your answers help Buzz shape practical suggestions."],
  ["interests", "Interests", "Choose what you would genuinely do this week.", "Start with something you would actually say yes to."],
  ["activation", "Activation", "Activate one interest when you are open to doing it.", "Activation is the core ready signal."],
  ["matchPreview", "First match", "Buzz forms a practical next step.", "Your first preview keeps the next step practical."]
].map(([id, eyebrow, title, body]) => ({ id: id as OnboardingStepId, eyebrow, title, body }));

const createState = (index: number): OnboardingState => {
  const clampedIndex = Math.min(Math.max(index, 0), onboardingSteps.length - 1);
  const step = onboardingSteps[clampedIndex];

  if (!step) {
    throw new Error("Onboarding steps must include at least one step");
  }

  return {
    index: clampedIndex,
    step,
    progress: {
      current: clampedIndex + 1,
      total: onboardingSteps.length
    }
  };
};

export const createInitialOnboardingState = (): OnboardingState => createState(0);
export const goNext = (state: OnboardingState): OnboardingState => createState(state.index + 1);
export const goBack = (state: OnboardingState): OnboardingState => createState(state.index - 1);
`
    },
    {
      path: "apps/mobile/src/features/onboarding/OnboardingProvider.tsx",
      contents: `import { createContext, useContext, useState, type ReactNode } from "react";

import { createInitialOnboardingState, goBack, goNext, type OnboardingState } from "./onboardingFlow";

type OnboardingContextValue = {
  state: OnboardingState;
  next: () => void;
  back: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState(createInitialOnboardingState);

  return (
    <OnboardingContext.Provider
      value={{
        state,
        next: () => setState((current) => goNext(current)),
        back: () => setState((current) => goBack(current)),
        isFirstStep: state.index === 0,
        isLastStep: state.progress.current === state.progress.total
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = (): OnboardingContextValue => {
  const value = useContext(OnboardingContext);

  if (!value) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }

  return value;
};
`
    },
    {
      path: "apps/mobile/src/features/onboarding/onboardingFlow.test.ts",
      contents: `import assert from "node:assert/strict";
import test from "node:test";

import { createInitialOnboardingState, goNext, onboardingSteps } from "./onboardingFlow";

test("onboarding includes intro steps before the quiz starts", () => {
  assert.ok(onboardingSteps.findIndex((step) => step.id === "quizIntro") < onboardingSteps.findIndex((step) => step.id === "quiz"));
  assert.equal(createInitialOnboardingState().step.id, "welcome");
  assert.equal(goNext(createInitialOnboardingState()).step.id, "intent");
});
`
    },
    {
      path: "apps/mobile/src/features/home/BuzzHomeScreen.tsx",
      contents: `import { useRouter } from "expo-router";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import { useBuzzAuth } from "@/auth/AuthProvider";
import { useInterestFlow } from "@/features/interests/InterestFlowProvider";
import { useI18n } from "@/i18n/I18nProvider";
import { routes } from "@/navigation/routes";
import { useBuzzTheme } from "@/theme/ThemeProvider";
import type { BuzzTheme } from "@/theme/tokens";

export const BuzzHomeScreen = () => {
  const router = useRouter();
  const { theme } = useBuzzTheme();
  const styles = createStyles(theme);
  const { LL } = useI18n();
  const { user } = useBuzzAuth();
  const { state } = useInterestFlow();
  const selectedInterestName = state.selectedInterest?.name ?? LL.home.fallbackInterest();

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.logo}>{LL.brand.name()}</Text>
        <View style={styles.card}>
          <Text style={styles.eyebrow}>{state.matchPreview ? LL.home.firstPlan() : user.cityName}</Text>
          <Text style={styles.title}>
            {state.matchPreview ? LL.home.titleActivated({ interest: selectedInterestName }) : LL.home.titleReady()}
          </Text>
          <Text style={styles.copy}>{state.matchPreview ? LL.home.activatedBody() : LL.home.readyBody()}</Text>
          <Text style={styles.copy}>{state.matchPreview?.reason ?? LL.home.emptyPlan()}</Text>
        </View>
        <Pressable onPress={() => router.replace(routes.onboarding)} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>{LL.home.reviewOnboarding()}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: BuzzTheme) => {
  const { colors } = theme;

  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    content: { flexGrow: 1, padding: theme.spacing[6], gap: theme.spacing[5] },
    logo: { color: colors.text, fontFamily: theme.fontFamilies.display, fontSize: theme.fontSizes.hero, fontWeight: "900" },
    card: { backgroundColor: colors.surface, borderRadius: theme.radii["2xl"], padding: theme.spacing[6], gap: theme.spacing[3], ...theme.shadows.card },
    eyebrow: { color: colors.accent, fontSize: theme.fontSizes.xs, fontWeight: "900", letterSpacing: 1.2, textTransform: "uppercase" },
    title: { color: colors.text, fontFamily: theme.fontFamilies.display, fontSize: theme.fontSizes["5xl"], fontWeight: "900" },
    copy: { color: colors.textMuted, fontSize: theme.fontSizes.lg, lineHeight: theme.lineHeights.relaxed },
    secondaryButton: { borderColor: colors.border, borderWidth: theme.borderWidths.hairline, borderRadius: theme.radii.lg, padding: theme.spacing[4], alignItems: "center" },
    secondaryButtonText: { color: colors.text, fontWeight: "900" }
  });
};
`
    },
    {
      path: "apps/mobile/src/features/quiz/quizModel.ts",
      contents: `export type ProfileTraits = {
  energy: "low" | "medium" | "high";
  planning: "spontaneous" | "balanced" | "planned";
  socialStyle: "one_on_one" | "small_group" | "large_group";
  availability: "weekday" | "weekend" | "mixed";
  activityIntent: "learn" | "practice" | "social";
  quizCompleted: boolean;
  answersCount: number;
  totalQuestions: number;
  summary: string;
};

export type QuizOption = {
  id: string;
  label: string;
  supportingText: string;
  traits: Partial<Pick<ProfileTraits, "energy" | "planning" | "socialStyle" | "availability" | "activityIntent">>;
};

export type QuizQuestion = {
  id: string;
  group: "lifestyle" | "social" | "availability" | "activities";
  prompt: string;
  options: QuizOption[];
};

export type QuizAnswers = Record<string, string>;

const groups: QuizQuestion["group"][] = ["lifestyle", "social", "availability", "activities"];

export const quizQuestions: QuizQuestion[] = Array.from({ length: 20 }, (_, index) => {
  const group = groups[index % groups.length] ?? "lifestyle";

  return {
    id: "quiz-" + String(index + 1).padStart(2, "0"),
    group,
    prompt: "What feels most true for plan " + String(index + 1) + "?",
    options: [
      { id: "calm", label: "Calm and easy", supportingText: "Lower-pressure plans fit.", traits: { energy: "low", socialStyle: "one_on_one" } },
      { id: "small", label: "Warm small group", supportingText: "A clear small-group activity fits.", traits: { energy: "medium", socialStyle: "small_group", planning: "balanced" } },
      { id: "active", label: "Active and planned", supportingText: "You like momentum and a clear plan.", traits: { energy: "high", planning: "planned", availability: "weekend", activityIntent: "practice" } }
    ]
  };
});

export const deriveProfileTraits = (answers: QuizAnswers): ProfileTraits => {
  const answersCount = Object.keys(answers).length;

  return {
    energy: answersCount > 10 ? "high" : "medium",
    planning: "balanced",
    socialStyle: "small_group",
    availability: "mixed",
    activityIntent: "social",
    quizCompleted: answersCount === quizQuestions.length,
    answersCount,
    totalQuestions: quizQuestions.length,
    summary: "You seem best matched to small groups, balanced-energy plans, and social activities."
  };
};
`
    },
    {
      path: "apps/mobile/src/features/quiz/QuizProvider.tsx",
      contents: `import { createContext, useContext, useState, type ReactNode } from "react";

import { deriveProfileTraits, quizQuestions, type ProfileTraits, type QuizAnswers, type QuizQuestion } from "./quizModel";

type QuizContextValue = {
  answers: QuizAnswers;
  activeQuestion: QuizQuestion;
  activeQuestionIndex: number;
  traits: ProfileTraits;
  answerQuestion: (questionId: string, optionId: string) => void;
  nextQuestion: () => void;
  hasAnsweredActiveQuestion: boolean;
  isLastQuestion: boolean;
};

const QuizContext = createContext<QuizContextValue | null>(null);

export const QuizProvider = ({ children }: { children: ReactNode }) => {
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const activeQuestion = quizQuestions[activeQuestionIndex] ?? quizQuestions[0];

  if (!activeQuestion) {
    throw new Error("Quiz questions must include at least one question");
  }

  return (
    <QuizContext.Provider
      value={{
        answers,
        activeQuestion,
        activeQuestionIndex,
        traits: deriveProfileTraits(answers),
        answerQuestion: (questionId, optionId) => setAnswers((current) => ({ ...current, [questionId]: optionId })),
        nextQuestion: () => setActiveQuestionIndex((current) => Math.min(current + 1, quizQuestions.length - 1)),
        hasAnsweredActiveQuestion: Boolean(answers[activeQuestion.id]),
        isLastQuestion: activeQuestionIndex === quizQuestions.length - 1
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = (): QuizContextValue => {
  const value = useContext(QuizContext);

  if (!value) {
    throw new Error("useQuiz must be used within QuizProvider");
  }

  return value;
};
`
    },
    {
      path: "apps/mobile/src/features/quiz/quizModel.test.ts",
      contents: `import assert from "node:assert/strict";
import test from "node:test";

import { deriveProfileTraits, quizQuestions } from "./quizModel";

test("quiz ships as a 20 question onboarding model", () => {
  assert.equal(quizQuestions.length, 20);
  assert.equal(deriveProfileTraits({}).quizCompleted, false);
});
`
    },
    {
      path: "apps/mobile/src/features/matching/demoMatch.ts",
      contents: `import type { ProfileTraits } from "../quiz/quizModel";

export type DemoMatchPreview = {
  displayName: string;
  interestName: string;
  headline: string;
  reason: string;
  suggestedPlan: string;
  isDemo: boolean;
};

export const createDemoMatchPreview = ({ interestName, traits }: { interestName: string; traits: ProfileTraits }): DemoMatchPreview => {
  return {
    displayName: "Sam",
    interestName,
    headline: "Sam is also open to " + interestName,
    reason: "You both look suited to a small group " + interestName + " plan.",
    suggestedPlan: traits.planning === "planned" ? "Suggest a clear weekend plan." : "Suggest a low-pressure plan this week.",
    isDemo: true
  };
};
`
    },
    {
      path: "apps/mobile/src/features/matching/demoMatch.test.ts",
      contents: `import assert from "node:assert/strict";
import test from "node:test";

import { createDemoMatchPreview } from "./demoMatch";

test("createDemoMatchPreview gives a deterministic local match", () => {
  const match = createDemoMatchPreview({
    interestName: "Climbing",
    traits: {
      energy: "medium",
      planning: "balanced",
      socialStyle: "small_group",
      availability: "mixed",
      activityIntent: "social",
      quizCompleted: true,
      answersCount: 20,
      totalQuestions: 20,
      summary: "Small groups fit."
    }
  });

  assert.equal(match.displayName, "Sam");
  assert.equal(match.interestName, "Climbing");
});
`
    },
    {
      path: "apps/mobile/src/features/interests/interestFlow.ts",
      contents: `import { LL, type I18n } from "@/i18n";

import { createDemoMatchPreview, type DemoMatchPreview } from "@/features/matching/demoMatch";
import type { ProfileTraits } from "@/features/quiz/quizModel";

export type BuzzInterest = {
  id: string;
  name: string;
  slug: string;
  category: string;
};

export type InterestFlowState = {
  selectedInterest: BuzzInterest | null;
  activation: {
    status: "idle" | "activating" | "complete" | "error";
    message: string;
  };
  matchPreview: DemoMatchPreview | null;
};

export type InterestFlowCopy = {
  initialMessage: string;
  selectedMessage: (interest: string) => string;
  activatingMessage: string;
  completeMessage: (interest: string) => string;
  chooseBeforeActivatingMessage: string;
};

export const createInterestFlowCopy = (translations: I18n = LL): InterestFlowCopy => ({
  initialMessage: translations.interests.activation.initial(),
  selectedMessage: (interest) => translations.interests.activation.selected({ interest }),
  activatingMessage: translations.interests.activation.activating(),
  completeMessage: (interest) => translations.interests.activation.complete({ interest }),
  chooseBeforeActivatingMessage: translations.interests.activation.chooseBeforeActivating()
});

const defaultInterestFlowCopy = createInterestFlowCopy();

export const createInitialInterestFlowState = (copy: InterestFlowCopy = defaultInterestFlowCopy): InterestFlowState => ({
  selectedInterest: null,
  activation: { status: "idle", message: copy.initialMessage },
  matchPreview: null
});

export const selectInterest = (
  state: InterestFlowState,
  interest: BuzzInterest,
  copy: InterestFlowCopy = defaultInterestFlowCopy
): InterestFlowState => ({
  ...state,
  selectedInterest: interest,
  activation: { status: "idle", message: copy.selectedMessage(interest.name) },
  matchPreview: null
});

export const markInterestActivating = (
  state: InterestFlowState,
  copy: InterestFlowCopy = defaultInterestFlowCopy
): InterestFlowState => ({
  ...state,
  activation: { status: "activating", message: copy.activatingMessage }
});

export const activateInterestLocally = (
  state: InterestFlowState,
  traits: ProfileTraits,
  copy: InterestFlowCopy = defaultInterestFlowCopy
): InterestFlowState => {
  if (!state.selectedInterest) {
    return { ...state, activation: { status: "error", message: copy.chooseBeforeActivatingMessage } };
  }

  return {
    ...state,
    activation: { status: "complete", message: copy.completeMessage(state.selectedInterest.name) },
    matchPreview: createDemoMatchPreview({ interestName: state.selectedInterest.name, traits })
  };
};

export const markInterestActivationError = (state: InterestFlowState, message: string): InterestFlowState => ({
  ...state,
  activation: { status: "error", message }
});
`
    },
    {
      path: "apps/mobile/src/features/interests/InterestFlowProvider.tsx",
      contents: `import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import { useI18n } from "@/i18n/I18nProvider";
import type { ProfileTraits } from "@/features/quiz/quizModel";
import {
  activateInterestLocally,
  createInterestFlowCopy,
  createInitialInterestFlowState,
  markInterestActivating,
  markInterestActivationError,
  selectInterest,
  type BuzzInterest,
  type InterestFlowState
} from "./interestFlow";

type InterestFlowContextValue = {
  state: InterestFlowState;
  select: (interest: BuzzInterest) => void;
  markActivating: () => void;
  completeLocalActivation: (traits: ProfileTraits) => void;
  failActivation: (message: string) => void;
};

const InterestFlowContext = createContext<InterestFlowContextValue | null>(null);

export const InterestFlowProvider = ({ children }: { children: ReactNode }) => {
  const { LL } = useI18n();
  const copy = useMemo(() => createInterestFlowCopy(LL), [LL]);
  const [state, setState] = useState(() => createInitialInterestFlowState(copy));

  return (
    <InterestFlowContext.Provider
      value={{
        state,
        select: (interest) => setState((current) => selectInterest(current, interest, copy)),
        markActivating: () => setState((current) => markInterestActivating(current, copy)),
        completeLocalActivation: (traits) => setState((current) => activateInterestLocally(current, traits, copy)),
        failActivation: (message) => setState((current) => markInterestActivationError(current, message))
      }}
    >
      {children}
    </InterestFlowContext.Provider>
  );
};

export const useInterestFlow = (): InterestFlowContextValue => {
  const value = useContext(InterestFlowContext);

  if (!value) {
    throw new Error("useInterestFlow must be used within InterestFlowProvider");
  }

  return value;
};
`
    },
    {
      path: "apps/mobile/src/features/interests/interestFlow.test.ts",
      contents: `import assert from "node:assert/strict";
import test from "node:test";

import { activateInterestLocally, createInitialInterestFlowState, selectInterest } from "./interestFlow";

test("interest flow creates local activation preview", () => {
  const selected = selectInterest(createInitialInterestFlowState(), {
    id: "00000000-0000-0000-0000-000000000001",
    name: "Surfing",
    slug: "surfing",
    category: "sport"
  });
  const activated = activateInterestLocally(selected, {
    energy: "medium",
    planning: "balanced",
    socialStyle: "small_group",
    availability: "mixed",
    activityIntent: "social",
    quizCompleted: true,
    answersCount: 20,
    totalQuestions: 20,
    summary: "Small groups fit."
  });

  assert.equal(activated.activation.status, "complete");
  assert.equal(activated.matchPreview?.interestName, "Surfing");
});
`
    },
    {
      path: "apps/mobile/env.d.ts",
      contents: `declare const process: {
  env: {
    EXPO_PUBLIC_APP_ENV?: string;
    EXPO_PUBLIC_SUPABASE_URL?: string;
    EXPO_PUBLIC_SUPABASE_ANON_KEY?: string;
    EXPO_PUBLIC_LOCAL_SUPABASE_ACCESS_TOKEN?: string;
    EXPO_PUBLIC_AUTH_MODE?: "demo" | "supabase";
    EXPO_PUBLIC_DEMO_USER_ID?: string;
    EXPO_PUBLIC_DEMO_DISPLAY_NAME?: string;
    EXPO_PUBLIC_DEMO_CITY_ID?: string;
    EXPO_PUBLIC_DEMO_CITY_NAME?: string;
    EXPO_PUBLIC_SENTRY_DSN?: string;
    EXPO_PUBLIC_POSTHOG_PUBLIC_KEY?: string;
    EXPO_PUBLIC_POSTHOG_HOST?: string;
  };
};
`
    },
    {
      path: "apps/admin/package.json",
      contents: `{
  "name": "admin",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "echo \\"admin lint placeholder\\"",
    "typecheck": "tsc --noEmit",
    "test": "echo \\"admin tests placeholder\\""
  },
  "dependencies": {
    "@apollo/client": "^3.14.1",
    "@supabase/supabase-js": "latest",
    "graphql": "latest",
    "next": "14.2.20",
    "react": "18.3.1",
    "react-dom": "18.3.1"
  },
  "devDependencies": {
    "@types/react": "latest",
    "@types/react-dom": "latest",
    "typescript": "latest"
  }
}
`
    },
    {
      path: "apps/admin/tsconfig.json",
      contents: `{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "jsx": "preserve",
    "plugins": [
      {
        "name": "next"
      }
    ],
    "allowJs": true,
    "noEmit": true,
    "incremental": true,
    "isolatedModules": true
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": [
    "node_modules"
  ]
}
`
    },
    {
      path: "apps/admin/next-env.d.ts",
      contents: `/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/building-your-application/configuring/typescript for more information.
`
    },
    {
      path: "apps/admin/next.config.mjs",
      contents: `/** @type {import("next").NextConfig} */
const nextConfig = {};

export default nextConfig;
`
    },
    {
      path: "apps/admin/app/layout.tsx",
      contents: `import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "Georgia, serif", background: "#f7f3e8", color: "#16324f" }}>{children}</body>
    </html>
  );
}
`
    },
    {
      path: "apps/admin/app/page.tsx",
      contents: `"use client";

import { ApolloClient, ApolloProvider, HttpLink, InMemoryCache } from "@apollo/client";
import { useMemo } from "react";

import type { AdminDashboardQuery } from "../graphql/generated";
import { useAdminDashboardQuery } from "../graphql/generated";

type Interest = NonNullable<NonNullable<AdminDashboardQuery["interestsCollection"]>["edges"][number]["node"]>;
type Business = NonNullable<NonNullable<AdminDashboardQuery["businessesCollection"]>["edges"][number]["node"]>;
type Event = NonNullable<NonNullable<AdminDashboardQuery["eventsCollection"]>["edges"][number]["node"]>;

const fallbackInterests: Interest[] = [
  { id: "interest-surfing", name: "Surfing", slug: "surfing", category: "sport" },
  { id: "interest-tennis", name: "Tennis", slug: "tennis", category: "sport" },
  { id: "interest-singing", name: "Singing", slug: "singing", category: "music" },
  { id: "interest-running", name: "Running", slug: "running", category: "fitness" }
];

const fallbackBusinesses: Business[] = [
  { id: "business-ocean-club", name: "Ocean Club", description: "Local partner placeholder" },
  { id: "business-northside-tennis", name: "Northside Tennis", description: "Local partner placeholder" },
  { id: "business-laneway-coffee", name: "Laneway Coffee", description: "Local partner placeholder" }
];

const fallbackEvents: Event[] = [
  { id: "event-welcome-picnic", title: "Welcome Picnic" },
  { id: "event-climbing-night", title: "Climbing Night" },
  { id: "event-board-game-social", title: "Board Game Social" }
];

const appEnv = process.env.NEXT_PUBLIC_APP_ENV ?? "local";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const graphqlUrl = supabaseUrl.replace(/\\/$/, "") + "/graphql/v1";

function createBuzzApolloClient() {
  return new ApolloClient({
    link: new HttpLink({
      uri: graphqlUrl,
      headers: {
        apikey: supabaseAnonKey,
        authorization: supabaseAnonKey ? \`Bearer \${supabaseAnonKey}\` : ""
      }
    }),
    cache: new InMemoryCache()
  });
}

function AdminDashboard() {
  const { data, loading, error } = useAdminDashboardQuery();
  const interests = data?.interestsCollection?.edges.map((edge) => edge.node) ?? fallbackInterests;
  const businesses = data?.businessesCollection?.edges.map((edge) => edge.node) ?? fallbackBusinesses;
  const events = data?.eventsCollection?.edges.map((edge) => edge.node) ?? fallbackEvents;
  const connectionStatus = loading
    ? "Loading city data"
    : error
      ? "Showing starter city data while local services start"
      : "Connected to city data";

  return (
    <main style={{ padding: 32 }}>
      <h1>Buzz Admin</h1>
      <p>Environment: {appEnv}</p>
      <p>Supabase URL: {supabaseUrl}</p>
      <p>Connection status: {connectionStatus}</p>
      <section>
        <h2>Seeded interests</h2>
        <ul>
          {interests.map((interest) => (
            <li key={interest.id}>
              {interest.name} <span style={{ color: "#667" }}>({interest.category})</span>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Sample businesses</h2>
        <ul>
          {businesses.map((business) => (
            <li key={business.id}>
              {business.name}
              {business.description ? <span style={{ color: "#667" }}> - {business.description}</span> : null}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Sample events</h2>
        <ul>
          {events.map((event) => (
            <li key={event.id}>{event.title}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}

export default function HomePage() {
  const client = useMemo(() => createBuzzApolloClient(), []);

  return (
    <ApolloProvider client={client}>
      <AdminDashboard />
    </ApolloProvider>
  );
}
`
    },
    {
      path: "apps/admin/graphql/operations.graphql",
      contents: `query AdminDashboard {
  interestsCollection(first: 50) {
    edges {
      node {
        id
        name
        slug
        category
      }
    }
  }
  businessesCollection(first: 10) {
    edges {
      node {
        id
        name
        description
      }
    }
  }
  eventsCollection(first: 10) {
    edges {
      node {
        id
        title
      }
    }
  }
}
`
    },
    {
      path: "apps/admin/graphql/generated.tsx",
      contents: `import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";

const defaultOptions = {} as const;

export type AdminDashboardQuery = {
  interestsCollection: {
    edges: Array<{
      node: {
        id: string;
        name: string;
        slug: string;
        category: string;
      };
    }>;
  } | null;
  businessesCollection: {
    edges: Array<{
      node: {
        id: string;
        name: string;
        description: string | null;
      };
    }>;
  } | null;
  eventsCollection: {
    edges: Array<{
      node: {
        id: string;
        title: string;
      };
    }>;
  } | null;
};

export type AdminDashboardQueryVariables = Record<string, never>;

export const AdminDashboardDocument = gql\`
  query AdminDashboard {
    interestsCollection(first: 50) {
      edges {
        node {
          id
          name
          slug
          category
        }
      }
    }
    businessesCollection(first: 10) {
      edges {
        node {
          id
          name
          description
        }
      }
    }
    eventsCollection(first: 10) {
      edges {
        node {
          id
          title
        }
      }
    }
  }
\`;

export function useAdminDashboardQuery(
  baseOptions?: Apollo.QueryHookOptions<AdminDashboardQuery, AdminDashboardQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<AdminDashboardQuery, AdminDashboardQueryVariables>(
    AdminDashboardDocument,
    options
  );
}
`
    },
    {
      path: "apps/api/package.json",
      contents: `{
  "name": "api",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "node src/index.js",
    "start": "node src/index.js",
    "lint": "echo \\"api lint placeholder\\"",
    "typecheck": "echo \\"api typecheck placeholder\\"",
    "test": "echo \\"api tests placeholder\\""
  }
}
`
    },
    {
      path: "apps/api/src/index.js",
      contents: `console.log("Buzz API placeholder service");\n`
    },
    {
      path: "apps/worker/package.json",
      contents: `{
  "name": "worker",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "node src/index.js",
    "start": "node src/index.js",
    "lint": "echo \\"worker lint placeholder\\"",
    "typecheck": "echo \\"worker typecheck placeholder\\"",
    "test": "echo \\"worker tests placeholder\\""
  }
}
`
    },
    {
      path: "apps/worker/src/index.js",
      contents: `console.log("Buzz worker placeholder service");\n`
    },
    {
      path: "packages/create-buzz-stack/README.md",
      contents: "# create-buzz-stack\n\nInternal Buzz CLI for repo scaffolding, bootstrap, configuration, validation, and platform generation.\n"
    }
  ];
}
