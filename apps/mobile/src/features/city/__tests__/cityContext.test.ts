import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

import {
  createCityContextFallback,
  isCityFeatureEnabled,
  normalizeCityContext,
} from "../cityContext";
import {
  createCityContextRequest,
  runCityContextRequest,
} from "@/lib/functions";

test("createCityContextFallback exposes city starting point defaults without hardcoded feature checks in screens", () => {
  const context = createCityContextFallback({
    cityId: "city-melbourne",
    cityName: "Melbourne",
  });

  assert.equal(context.city.id, "city-melbourne");
  assert.equal(context.city.name, "Melbourne");
  assert.equal(context.city.countryCode, "AU");
  assert.equal(context.city.timezone, "Australia/Melbourne");
  assert.equal(context.city.currency, "AUD");
  assert.equal(context.city.launchStatus, "active");
  assert.equal(context.matching.radiusKm, 10);
  assert.equal(context.matching.defaultGroupSizeMin, 3);
  assert.equal(context.matching.defaultGroupSizeMax, 5);
  assert.equal(
    isCityFeatureEnabled(context, "city_starting_point_enabled"),
    true,
  );
  assert.equal(
    isCityFeatureEnabled(context, "melbourne_starting_point_enabled"),
    false,
  );
  assert.equal(isCityFeatureEnabled(context, "landing_plan_enabled"), false);
  assert.equal(
    isCityFeatureEnabled(context, "full_neighbourhood_recommender_enabled"),
    false,
  );
  assert.equal(isCityFeatureEnabled(context, "bring_friend_enabled"), true);
  assert.equal(isCityFeatureEnabled(context, "basic_safety_enabled"), true);
  assert.equal(isCityFeatureEnabled(context, "starter_plans_enabled"), false);
  assert.deepEqual(context.defaultInterests.slice(0, 4), [
    "tennis",
    "climbing",
    "coffee",
    "running",
  ]);
  assert.deepEqual(context.activeSuburbs.slice(0, 3), [
    "Fitzroy",
    "Brunswick",
    "South Yarra",
  ]);
});

test("normalizeCityContext accepts backend payloads and fills optional defaults", () => {
  const context = normalizeCityContext({
    city: {
      id: "city-1",
      name: "Sydney",
      countryCode: "AU",
      timezone: "Australia/Sydney",
      launchStatus: "waitlist",
    },
    matching: {
      radiusKm: 12,
      defaultGroupSizeMin: 4,
      defaultGroupSizeMax: 6,
    },
    enabledFeatures: {
      landing_plan_enabled: true,
    },
    defaultInterests: ["coffee"],
    activeSuburbs: ["Newtown"],
  });

  assert.equal(context.city.currency, "AUD");
  assert.equal(context.matching.activationExpiryHours, 168);
  assert.equal(context.enabledFeatures.landing_plan_enabled, true);
  assert.equal(context.enabledFeatures.basic_safety_enabled, false);
  assert.deepEqual(context.copy, {});
});

test("get-city-context Edge Function reads city config tables and returns safe rollout context", () => {
  const functionPath = "../../supabase/functions/get-city-context/index.ts";

  assert.equal(
    existsSync(functionPath),
    true,
    "get-city-context Edge Function should exist",
  );

  const source = readFileSync(functionPath, "utf8");

  assert.match(source, /city_settings/);
  assert.match(source, /city_feature_flags/);
  assert.match(source, /city_interests/);
  assert.match(source, /suburbs/);
  assert.match(source, /launchStatus/);
  assert.match(source, /defaultGroupSizeMin/);
  assert.match(source, /enabledFeatures/);
  assert.match(source, /activeSuburbs/);
  assert.doesNotMatch(source, /SUPABASE_SERVICE_ROLE_KEY/);
});

test("mobile city context client calls get-city-context and normalizes the payload", async () => {
  const request = createCityContextRequest({
    cityId: "city-1",
    supabaseAnonKey: "anon-key",
    supabaseUrl: "http://localhost:54321",
  });

  assert.equal(
    request.url,
    "http://localhost:54321/functions/v1/get-city-context",
  );
  assert.equal(request.init.method, "POST");
  assert.equal(
    (request.init.headers as Record<string, string>).apikey,
    "anon-key",
  );
  assert.deepEqual(JSON.parse(String(request.init.body)), { cityId: "city-1" });

  const context = await runCityContextRequest(
    {
      cityName: "Melbourne",
      supabaseUrl: "http://localhost:54321",
    },
    async () =>
      new Response(
        JSON.stringify({
          ok: true,
          city: {
            id: "city-1",
            name: "Melbourne",
            countryCode: "AU",
            timezone: "Australia/Melbourne",
            launchStatus: "active",
          },
          matching: {
            radiusKm: 10,
            defaultGroupSizeMin: 3,
            defaultGroupSizeMax: 5,
          },
          enabledFeatures: {
            landing_plan_enabled: true,
          },
          defaultInterests: ["coffee"],
          activeSuburbs: ["Fitzroy"],
        }),
      ),
  );

  assert.equal(context.city.currency, "AUD");
  assert.equal(context.city.name, "Melbourne");
  assert.equal(context.enabledFeatures.landing_plan_enabled, true);
  assert.equal(context.matching.activationExpiryHours, 168);
});
