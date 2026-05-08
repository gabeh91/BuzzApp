import { createClient } from "npm:@supabase/supabase-js@2";

import { corsHeaders } from "../_shared/cors.ts";
import { jsonError } from "../_shared/errors.ts";

const createAnonClient = (request: Request) => {
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

  return createClient(url, anonKey, {
    global: {
      headers: {
        authorization: request.headers.get("authorization") ?? ""
      }
    }
  });
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonError("Method not allowed", 405);
  }

  const body = await request.json().catch(() => ({}));
  const requestedCityId = typeof body?.cityId === "string" ? body.cityId : null;
  const requestedCityName = typeof body?.cityName === "string" ? body.cityName : "Melbourne";
  const supabase = createAnonClient(request);

  let cityQuery = supabase
    .from("cities")
    .select("id, name, country_code, timezone, currency, launch_status")
    .limit(1)
    .maybeSingle();

  if (requestedCityId) {
    cityQuery = supabase
      .from("cities")
      .select("id, name, country_code, timezone, currency, launch_status")
      .eq("id", requestedCityId)
      .limit(1)
      .maybeSingle();
  } else {
    cityQuery = supabase
      .from("cities")
      .select("id, name, country_code, timezone, currency, launch_status")
      .eq("name", requestedCityName)
      .limit(1)
      .maybeSingle();
  }

  const { data: city, error: cityError } = await cityQuery;

  if (cityError) {
    return jsonError(cityError.message, 500);
  }

  if (!city) {
    return jsonError("City not found", 404);
  }

  const [{ data: citySettings, error: settingsError }, { data: cityFeatureFlags, error: flagsError }, { data: cityInterests, error: interestsError }, { data: suburbs, error: suburbsError }] =
    await Promise.all([
      supabase.from("city_settings").select("matching_radius_km, default_group_size_min, default_group_size_max, activation_expiry_hours, copy_json").eq("city_id", city.id).maybeSingle(),
      supabase.from("city_feature_flags").select("feature_key, enabled").eq("city_id", city.id),
      supabase.from("city_interests").select("interests(slug)").eq("city_id", city.id).eq("is_default", true).order("sort_order", { ascending: true }),
      supabase.from("suburbs").select("name").eq("city_id", city.id).order("name", { ascending: true })
    ]);

  const dataError = settingsError ?? flagsError ?? interestsError ?? suburbsError;

  if (dataError) {
    return jsonError(dataError.message, 500);
  }

  const enabledFeatures = Object.fromEntries((cityFeatureFlags ?? []).map((flag) => [flag.feature_key, flag.enabled === true]));
  const defaultInterests = (cityInterests ?? [])
    .map((cityInterest) => {
      const interest = cityInterest.interests;
      return Array.isArray(interest) ? interest[0]?.slug : interest?.slug;
    })
    .filter((slug): slug is string => typeof slug === "string");
  const activeSuburbs = (suburbs ?? []).map((suburb) => suburb.name).filter((name): name is string => typeof name === "string");

  return new Response(
    JSON.stringify({
      ok: true,
      city: {
        id: city.id,
        name: city.name,
        countryCode: city.country_code,
        timezone: city.timezone,
        currency: city.currency ?? "AUD",
        launchStatus: city.launch_status
      },
      matching: {
        radiusKm: citySettings?.matching_radius_km ?? 10,
        defaultGroupSizeMin: citySettings?.default_group_size_min ?? 3,
        defaultGroupSizeMax: citySettings?.default_group_size_max ?? 5,
        activationExpiryHours: citySettings?.activation_expiry_hours ?? 168
      },
      enabledFeatures,
      defaultInterests,
      activeSuburbs,
      copy: citySettings?.copy_json ?? {}
    }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    }
  );
});
