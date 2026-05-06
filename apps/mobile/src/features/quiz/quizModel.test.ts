import assert from "node:assert/strict";
import test from "node:test";

import { deriveProfileTraits, quizQuestions } from "./quizModel";

test("quiz ships as a 20 question onboarding model grouped for guided discovery", () => {
  assert.equal(quizQuestions.length, 20);
  assert.deepEqual(new Set(quizQuestions.map((question) => question.group)), new Set(["lifestyle", "social", "availability", "activities"]));
  assert.ok(quizQuestions.every((question) => question.options.length >= 3));
});

test("deriveProfileTraits turns quiz answers into deterministic matching traits", () => {
  const answers = Object.fromEntries(
    quizQuestions.map((question) => {
      const preferredOption =
        question.options.find((option) => option.traits.socialStyle === "small_group") ??
        question.options.find((option) => option.traits.energy === "high") ??
        question.options[0];

      assert.ok(preferredOption);

      return [question.id, preferredOption.id];
    })
  );

  const traits = deriveProfileTraits(answers);

  assert.equal(traits.socialStyle, "small_group");
  assert.equal(traits.energy, "high");
  assert.equal(traits.quizCompleted, true);
  assert.ok(traits.summary.includes("small groups"));
});

test("deriveProfileTraits reports incomplete quiz state without throwing", () => {
  const traits = deriveProfileTraits({});

  assert.equal(traits.quizCompleted, false);
  assert.equal(traits.answersCount, 0);
  assert.equal(traits.totalQuestions, 20);
});
