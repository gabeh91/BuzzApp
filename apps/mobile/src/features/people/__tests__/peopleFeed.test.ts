import assert from "node:assert/strict";
import test from "node:test";

import {
  loadPeopleMatches,
  normalizePeopleMatchesResult,
  sendConnectionRequest,
} from "../peopleFeed";

const backendPayload = {
  ok: true,
  cityId: "00000000-0000-0000-0000-000000000001",
  cityName: "Melbourne",
  peopleMatches: [
    {
      id: "00000000-0000-0000-0000-000000000201",
      profileId: "00000000-0000-0000-0000-000000000201",
      firstName: "Sam",
      displayName: "Sam Rivera",
      age: 31,
      profilePhotoUrl: null,
      inCityDurationLabel: "In Melbourne for 6-12 months",
      sharedInterests: [
        {
          id: "00000000-0000-0000-0000-000000000301",
          name: "Surfing",
          slug: "surfing",
          category: "outdoors",
        },
      ],
      compatibilityLine: "You both want to try Surfing",
      compatibilityHighlights: ["Overlapping availability"],
      score: 0.86,
    },
  ],
};

test("normalizePeopleMatchesResult keeps public-safe people card fields", () => {
  assert.deepEqual(normalizePeopleMatchesResult(backendPayload), {
    ok: true,
    cityId: "00000000-0000-0000-0000-000000000001",
    cityName: "Melbourne",
    peopleMatches: [
      {
        id: "00000000-0000-0000-0000-000000000201",
        profileId: "00000000-0000-0000-0000-000000000201",
        firstName: "Sam",
        displayName: "Sam Rivera",
        age: 31,
        inCityDurationLabel: "In Melbourne for 6-12 months",
        sharedInterests: [
          {
            id: "00000000-0000-0000-0000-000000000301",
            name: "Surfing",
            slug: "surfing",
            category: "outdoors",
          },
        ],
        compatibilityLine: "You both want to try Surfing",
        compatibilityHighlights: ["Overlapping availability"],
        score: 0.86,
      },
    ],
  });
});

test("loadPeopleMatches calls the anonymous-safe people RPC", async () => {
  const calls: Array<{ name: string; params: Record<string, unknown> }> = [];
  const client = {
    rpc: async (name: string, params: Record<string, unknown>) => {
      calls.push({ name, params });

      return { data: backendPayload, error: null };
    },
  };

  const result = await loadPeopleMatches(
    {
      cityId: "00000000-0000-0000-0000-000000000001",
      cityName: "Melbourne",
      interestIds: ["00000000-0000-0000-0000-000000000301"],
      interestSlugs: ["surfing"],
      limitCount: 8,
      quizTraits: {
        availability: "weekend",
        energy: "medium",
        planning: "planned",
        socialStyle: "small_group",
      },
    },
    client,
  );

  assert.equal(result.peopleMatches[0]?.firstName, "Sam");
  assert.deepEqual(calls, [
    {
      name: "getPeopleMatchesForDiscover",
      params: {
        cityId: "00000000-0000-0000-0000-000000000001",
        cityName: "Melbourne",
        interestIds: ["00000000-0000-0000-0000-000000000301"],
        interestSlugs: ["surfing"],
        limitCount: 8,
        quizTraits: {
          availability: "weekend",
          energy: "medium",
          planning: "planned",
          socialStyle: "small_group",
        },
      },
    },
  ]);
});

test("sendConnectionRequest calls the authenticated Say hi RPC", async () => {
  const calls: Array<{ name: string; params: Record<string, unknown> }> = [];
  const client = {
    rpc: async (name: string, params: Record<string, unknown>) => {
      calls.push({ name, params });

      return {
        data: {
          ok: true,
          connectionRequestId: "request-1",
          recipientId: "00000000-0000-0000-0000-000000000201",
          status: "pending",
        },
        error: null,
      };
    },
  };

  const result = await sendConnectionRequest(
    {
      message: "Would you be keen to do Surfing sometime?",
      recipientId: "00000000-0000-0000-0000-000000000201",
    },
    client,
  );

  assert.deepEqual(result, {
    ok: true,
    connectionRequestId: "request-1",
    recipientId: "00000000-0000-0000-0000-000000000201",
    status: "pending",
  });
  assert.deepEqual(calls, [
    {
      name: "sendConnectionRequest",
      params: {
        message: "Would you be keen to do Surfing sometime?",
        recipientId: "00000000-0000-0000-0000-000000000201",
      },
    },
  ]);
});
