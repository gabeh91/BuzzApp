import assert from "node:assert/strict";
import test from "node:test";

import {
  createAnonymousOnboardingDraft,
  markAnonymousOnboardingComplete,
  mergeQuizAnswerIntoDraft,
} from "../onboardingDraft";
import { createAnonymousOnboardingDraftStore } from "../onboardingDraftStore";

const createMemoryStorage = () => {
  const values = new Map<string, string>();

  return {
    getItem: async (key: string) => values.get(key) ?? null,
    removeItem: async (key: string) => {
      values.delete(key);
    },
    setItem: async (key: string, value: string) => {
      values.set(key, value);
    },
  };
};

test("anonymous onboarding draft store persists partial quiz answers", async () => {
  const store = createAnonymousOnboardingDraftStore(createMemoryStorage());
  const partialDraft = mergeQuizAnswerIntoDraft(
    createAnonymousOnboardingDraft(),
    "pace",
    "low",
    2,
  );

  await store.save(partialDraft);

  assert.deepEqual(await store.load(), partialDraft);
});

test("anonymous onboarding draft store keeps completion separate from auth claim", async () => {
  const store = createAnonymousOnboardingDraftStore(createMemoryStorage());
  const completedDraft = markAnonymousOnboardingComplete(
    createAnonymousOnboardingDraft(),
    new Date("2026-05-11T00:00:00.000Z"),
  );

  await store.save(completedDraft);

  assert.equal((await store.load()).status, "complete");
  assert.equal((await store.load()).claimedUserId, undefined);
});

test("anonymous onboarding draft store falls back to an empty draft on missing or invalid data", async () => {
  const storage = createMemoryStorage();
  const store = createAnonymousOnboardingDraftStore(storage);

  assert.deepEqual(await store.load(), createAnonymousOnboardingDraft());

  await storage.setItem("buzz.anonymousOnboardingDraft.v1", "{");

  assert.deepEqual(await store.load(), createAnonymousOnboardingDraft());
});
