import assert from "node:assert/strict";
import test from "node:test";

import {
  parsePostActivityCheckInDismissals,
  prunePostActivityCheckInDismissals,
} from "../postActivityCheckInDismissals";

test("parsePostActivityCheckInDismissals ignores invalid stored values", () => {
  assert.deepEqual(parsePostActivityCheckInDismissals("{"), {});
  assert.deepEqual(
    parsePostActivityCheckInDismissals(
      JSON.stringify({
        "group-1": "2026-05-19T10:00:00.000Z",
        "group-2": 123,
      }),
    ),
    { "group-1": "2026-05-19T10:00:00.000Z" },
  );
});

test("prunePostActivityCheckInDismissals keeps only active snoozes", () => {
  assert.deepEqual(
    prunePostActivityCheckInDismissals(
      {
        active: "2026-05-19T10:00:00.000Z",
        expired: "2026-05-18T08:00:00.000Z",
        invalid: "not-a-date",
      },
      new Date("2026-05-18T09:00:00.000Z"),
    ),
    { active: "2026-05-19T10:00:00.000Z" },
  );
});
