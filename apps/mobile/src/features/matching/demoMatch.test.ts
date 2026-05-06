import assert from "node:assert/strict";
import test from "node:test";

import { createDemoMatchPreview } from "./demoMatch";

test("createDemoMatchPreview gives a deterministic local match without pretending to be AI", () => {
  const match = createDemoMatchPreview({
    interestName: "Climbing",
    traits: {
      energy: "high",
      planning: "planned",
      socialStyle: "small_group",
      availability: "weekend",
      activityIntent: "learn",
      quizCompleted: true,
      answersCount: 20,
      totalQuestions: 20,
      summary: "You seem ready for small groups."
    }
  });

  assert.equal(match.displayName, "Sam");
  assert.equal(match.interestName, "Climbing");
  assert.equal(match.isDemo, true);
  assert.match(match.reason, /small group/i);
  assert.match(match.reason, /Climbing/);
});
