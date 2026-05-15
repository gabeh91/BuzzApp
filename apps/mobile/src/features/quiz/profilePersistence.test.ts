import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import type { BuzzAuthUser } from "@/auth/auth.types";

import {
  createBuzzProfilePersistenceInput,
  shouldPersistProfileToSupabase,
} from "./profilePersistence";
import type { ProfileTraits, QuizAnswers } from "./quizModel";

const operationsSource = readFileSync("graphql/operations.graphql", "utf8");
const generatedGraphqlSource = readFileSync("graphql/generated.tsx", "utf8");
const quizProviderSource = readFileSync(
  "src/features/quiz/QuizProvider.tsx",
  "utf8",
);
const onboardingScreenSource = readFileSync(
  "src/features/onboarding/OnboardingScreen.tsx",
  "utf8",
);
const profileQuizScreenSource = readFileSync(
  "src/features/quiz/ProfileQuizScreen.tsx",
  "utf8",
);
const profileQuizOverwritePromptSource = readFileSync(
  "src/features/quiz/ProfileQuizOverwritePrompt.tsx",
  "utf8",
);
const persistQuizProfileHookSource = readFileSync(
  "src/features/quiz/usePersistQuizProfile.ts",
  "utf8",
);
const profilePersistenceClientSource = readFileSync(
  "src/features/quiz/profilePersistenceClient.ts",
  "utf8",
);

const demoUser: BuzzAuthUser = {
  id: "00000000-0000-0000-0000-000000000101",
  displayName: "Mia",
  cityId: "00000000-0000-0000-0000-000000000001",
  cityName: "Melbourne",
  authSource: "demo",
};

const answers: QuizAnswers = {
  "energy-after-work": "easy-outing",
  "first-meet-format": "small-crew",
};

const traits: ProfileTraits = {
  energy: "medium",
  planning: "balanced",
  socialStyle: "small_group",
  availability: "mixed",
  activityIntent: "social",
  cityTags: ["walkability"],
  lifestyleTags: ["coffee"],
  quizCompleted: false,
  answersCount: 2,
  totalQuestions: 20,
  summary: "Best with small groups",
};

test("createBuzzProfilePersistenceInput serializes the replaceable auth user, quiz answers, and traits", () => {
  assert.deepEqual(
    createBuzzProfilePersistenceInput({ user: demoUser, answers, traits }),
    {
      userId: demoUser.id,
      displayName: demoUser.displayName,
      cityId: demoUser.cityId,
      quizAnswers: answers,
      quizTraits: traits,
    },
  );
});

test("createBuzzProfilePersistenceInput accepts optional display and city overrides", () => {
  assert.deepEqual(
    createBuzzProfilePersistenceInput({
      user: demoUser,
      answers,
      traits,
      overrides: { displayName: "River", cityId: "city-override" },
    }),
    {
      userId: demoUser.id,
      displayName: "River",
      cityId: "city-override",
      quizAnswers: answers,
      quizTraits: traits,
    },
  );
});

test("shouldPersistProfileToSupabase only sends profile writes for Supabase-backed users", () => {
  assert.equal(shouldPersistProfileToSupabase(demoUser), false);
  assert.equal(
    shouldPersistProfileToSupabase({ ...demoUser, authSource: "supabase" }),
    true,
  );
});

test("mobile GraphQL operations still expose profile persistence for generated schema coverage", () => {
  assert.match(operationsSource, /mutation UpsertBuzzProfile/);
  assert.match(operationsSource, /upsertBuzzProfile/);
  assert.match(
    generatedGraphqlSource,
    /export function useUpsertBuzzProfileMutation/,
  );
});

test("profile persistence uses Supabase RPC so quiz JSON is sent as jsonb", () => {
  assert.match(
    profilePersistenceClientSource,
    /buzzSupabase\.rpc\("upsertBuzzProfile"/,
  );
  assert.match(profilePersistenceClientSource, /quizAnswers: input\.quizAnswers/);
  assert.match(profilePersistenceClientSource, /quizTraits: input\.quizTraits/);
  assert.match(persistQuizProfileHookSource, /persistBuzzProfileToSupabase/);
  assert.doesNotMatch(
    persistQuizProfileHookSource,
    /useUpsertBuzzProfileMutation/,
  );
});

test("profile quiz overwrite prompt does not expose raw persistence errors", () => {
  assert.match(
    profileQuizOverwritePromptSource,
    /LL\.profileQuizOverwritePrompt\.failed\(\)/,
  );
  assert.doesNotMatch(profileQuizOverwritePromptSource, /caught\.message/);
});

test("quiz provider exposes optimistic profile persistence state", () => {
  assert.match(quizProviderSource, /profilePersistence/);
  assert.match(quizProviderSource, /markProfileSaving/);
  assert.match(quizProviderSource, /markProfilePersisted/);
  assert.match(quizProviderSource, /markProfilePersistenceFailed/);
});

test("onboarding persists quiz profile through the shared RPC helper without blocking demo mode", () => {
  assert.match(onboardingScreenSource, /persistBuzzProfileToSupabase/);
  assert.match(onboardingScreenSource, /createBuzzProfilePersistenceInput/);
  assert.match(onboardingScreenSource, /shouldPersistProfileToSupabase/);
  assert.match(onboardingScreenSource, /quiz\.markProfileSaving/);
  assert.match(onboardingScreenSource, /quiz\.markProfilePersisted/);
  assert.match(onboardingScreenSource, /quiz\.markProfilePersistenceFailed/);
});

test("authenticated profile quiz is a cut-down route with exit and profile persistence", () => {
  assert.match(profileQuizScreenSource, /QuizQuestionPanel/);
  assert.match(profileQuizScreenSource, /closeQuiz/);
  assert.match(profileQuizScreenSource, /router\.canGoBack/);
  assert.match(profileQuizScreenSource, /router\.replace\(routes\.profile\)/);
  assert.match(profileQuizScreenSource, /usePersistQuizProfile/);
  assert.match(persistQuizProfileHookSource, /persistBuzzProfileToSupabase/);
  assert.match(quizProviderSource, /status === "anonymous"/);
});
