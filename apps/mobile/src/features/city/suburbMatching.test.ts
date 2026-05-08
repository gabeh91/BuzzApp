import assert from "node:assert/strict";
import test from "node:test";

import { getTopSuburbNamesForTraits, scoreSuburbsForTraits, type SuburbTagProfile } from "./suburbMatching";
import type { ProfileTraits } from "@/features/quiz/quizModel";

const traits: ProfileTraits = {
  energy: "medium",
  planning: "planned",
  socialStyle: "small_group",
  availability: "weekend",
  activityIntent: "learn",
  cityTags: [],
  lifestyleTags: [],
  quizCompleted: true,
  answersCount: 20,
  totalQuestions: 20,
  summary: "Small group weekend learner"
};

const suburbs: SuburbTagProfile[] = [
  {
    id: "fitzroy",
    name: "Fitzroy",
    tagWeights: {
      small_group: 0.9,
      weekend: 0.8,
      learn: 0.7,
      creative: 0.6
    }
  },
  {
    id: "brunswick",
    name: "Brunswick",
    tagWeights: {
      small_group: 0.85,
      weekend: 0.72,
      learn: 0.64,
      social: 0.5
    }
  },
  {
    id: "south-yarra",
    name: "South Yarra",
    tagWeights: {
      high_energy: 0.75,
      planned: 0.55,
      one_on_one: 0.4
    }
  },
  {
    id: "st-kilda",
    name: "St Kilda",
    tagWeights: {
      spontaneous: 0.8,
      weekend: 0.6,
      high_energy: 0.5
    }
  }
];

test("scoreSuburbsForTraits returns the top three suburbs with plain-language reasons", () => {
  const matches = scoreSuburbsForTraits({ suburbs, traits });
  const [first, second, third] = matches;

  assert.deepEqual(matches.map((match) => match.name), ["Fitzroy", "Brunswick", "St Kilda"]);
  assert.equal(matches.length, 3);
  assert.ok(first);
  assert.ok(second);
  assert.ok(third);
  assert.ok(first.score > second.score);
  assert.ok(second.score > third.score);
  assert.match(first.reasons.join(" "), /small-group/i);
  assert.match(first.reasons.join(" "), /weekend/i);
  assert.match(first.reasons.join(" "), /learning/i);
});

test("scoreSuburbsForTraits uses city and lifestyle tags for suburb fit", () => {
  const cityFitTraits: ProfileTraits = {
    ...traits,
    cityTags: ["beach", "quiet", "budget"],
    lifestyleTags: ["outdoors", "music"]
  };
  const cityFitSuburbs: SuburbTagProfile[] = [
    {
      id: "fitzroy",
      name: "Fitzroy",
      tagWeights: {
        music: 0.8,
        creative: 0.7,
        nightlife: 0.6
      }
    },
    {
      id: "elwood",
      name: "Elwood",
      tagWeights: {
        beach: 0.75,
        quiet: 0.7,
        outdoors: 0.6
      }
    },
    {
      id: "footscray",
      name: "Footscray",
      tagWeights: {
        budget: 0.85,
        food: 0.7,
        creative: 0.55
      }
    }
  ];

  const matches = scoreSuburbsForTraits({ suburbs: cityFitSuburbs, traits: cityFitTraits });

  assert.equal(matches[0]?.name, "Elwood");
  assert.match(matches[0]?.reasons.join(" ") ?? "", /beach/i);
  assert.match(matches[0]?.reasons.join(" ") ?? "", /quiet/i);
  assert.match(matches[0]?.reasons.join(" ") ?? "", /outdoor/i);
});

test("getTopSuburbNamesForTraits falls back to configured suburb names when no scored match exists", () => {
  assert.deepEqual(
    getTopSuburbNamesForTraits({
      fallbackNames: ["Fitzroy", "Brunswick", "South Yarra"],
      suburbs: [],
      traits
    }),
    ["Fitzroy", "Brunswick", "South Yarra"]
  );
});
