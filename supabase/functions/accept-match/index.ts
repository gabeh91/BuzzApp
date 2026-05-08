import { resolveCurrentProfile } from "../_shared/auth.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { jsonError } from "../_shared/errors.ts";
import { createServiceRoleClient } from "../_shared/supabase.ts";

type MatchCandidateRow = {
  id: string;
  activation_id: string;
  matched_user_id: string;
  activity_group_id: string | null;
};

type InterestActivationRow = {
  id: string;
  user_id: string;
  interest_id: string;
  city_id: string | null;
};

type CitySettingsRow = {
  default_group_size_min: number | null;
  default_group_size_max: number | null;
};

type ActivityPlanRow = {
  id: string;
  title: string;
  activity_name: string;
  public_location_name: string;
  location_visibility: string;
  capacity_min: number;
  capacity_max: number;
  min_group_size: number;
  status: string;
  confirmation_status: string;
  safety_guidance: string;
};

const jsonResponse = (body: Record<string, unknown>, status = 200): Response => {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
};

const readMatchCandidateId = async (request: Request): Promise<string> => {
  const body = await request.json().catch(() => ({}));
  const matchCandidateId = typeof body.matchCandidateId === "string" ? body.matchCandidateId.trim() : "";

  if (!matchCandidateId) {
    throw new Error("matchCandidateId is required");
  }

  return matchCandidateId;
};

const toActivityPlanResponse = (plan: ActivityPlanRow | null) => {
  if (!plan) return null;

  return {
    id: plan.id,
    title: plan.title,
    activityName: plan.activity_name,
    publicLocationName: plan.public_location_name,
    locationVisibility: plan.location_visibility,
    capacityMin: plan.capacity_min,
    capacityMax: plan.capacity_max,
    minGroupSize: plan.min_group_size,
    status: plan.status,
    confirmationStatus: plan.confirmation_status,
    safetyGuidance: plan.safety_guidance
  };
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return jsonError("Method not allowed", 405, corsHeaders);

  const serviceClient = createServiceRoleClient();

  try {
    const matchCandidateId = await readMatchCandidateId(request);
    const { profileId } = await resolveCurrentProfile(request, serviceClient);

    const { data: candidate, error: candidateError } = await serviceClient
      .from("match_candidates")
      .select("id, activation_id, matched_user_id, activity_group_id")
      .eq("id", matchCandidateId)
      .maybeSingle<MatchCandidateRow>();

    if (candidateError) throw candidateError;
    if (!candidate) return jsonError("Match candidate not found", 404, corsHeaders);

    const { data: activation, error: activationError } = await serviceClient
      .from("interest_activations")
      .select("id, user_id, interest_id, city_id")
      .eq("id", candidate.activation_id)
      .maybeSingle<InterestActivationRow>();

    if (activationError) throw activationError;
    if (!activation) return jsonError("Activation not found", 404, corsHeaders);
    if (activation.user_id !== profileId) return jsonError("Cannot accept another profile's match", 403, corsHeaders);

    let activityGroupId = candidate.activity_group_id;
    let activityPlan: ActivityPlanRow | null = null;

    if (!activityGroupId) {
      const { data: interest, error: interestError } = await serviceClient
        .from("interests")
        .select("name")
        .eq("id", activation.interest_id)
        .maybeSingle<{ name: string }>();

      if (interestError) throw interestError;

      const { data: settings, error: settingsError } = activation.city_id
        ? await serviceClient
            .from("city_settings")
            .select("default_group_size_min, default_group_size_max")
            .eq("city_id", activation.city_id)
            .maybeSingle<CitySettingsRow>()
        : { data: null, error: null };

      if (settingsError) throw settingsError;

      const activityName = interest?.name ?? "Activity";
      const capacityMin = settings?.default_group_size_min ?? 3;
      const capacityMax = settings?.default_group_size_max ?? 5;

      const { data: group, error: groupError } = await serviceClient
        .from("activity_groups")
        .insert({
          city_id: activation.city_id,
          created_by: profileId,
          interest_id: activation.interest_id,
          status: "forming",
          title: `${activityName} plan`
        })
        .select("id")
        .single<{ id: string }>();

      if (groupError) throw groupError;

      activityGroupId = group.id;

      const { error: memberError } = await serviceClient.from("activity_group_members").insert([
        { activity_group_id: activityGroupId, user_id: profileId },
        { activity_group_id: activityGroupId, user_id: candidate.matched_user_id }
      ]);

      if (memberError) throw memberError;

      const startsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const endsAt = new Date(startsAt.getTime() + 90 * 60 * 1000);
      const { data: plan, error: planError } = await serviceClient
        .from("activity_plans")
        .insert({
          activity_group_id: activityGroupId,
          activity_name: activityName,
          capacity_min: capacityMin,
          capacity_max: capacityMax,
          city_id: activation.city_id,
          confirmation_status: "pending",
          created_by: profileId,
          ends_at: endsAt.toISOString(),
          interest_id: activation.interest_id,
          location_visibility: "area_only",
          min_group_size: capacityMin,
          public_location_name: `Public ${activityName} spot`,
          safety_guidance: "Meet in a public venue first. Exact location stays hidden until the group confirms.",
          starts_at: startsAt.toISOString(),
          status: "proposed",
          title: `${activityName} plan`
        })
        .select("id, title, activity_name, public_location_name, location_visibility, capacity_min, capacity_max, min_group_size, status, confirmation_status, safety_guidance")
        .single<ActivityPlanRow>();

      if (planError) throw planError;
      activityPlan = plan;
    } else {
      const { data: plan, error: planError } = await serviceClient
        .from("activity_plans")
        .select("id, title, activity_name, public_location_name, location_visibility, capacity_min, capacity_max, min_group_size, status, confirmation_status, safety_guidance")
        .eq("activity_group_id", activityGroupId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle<ActivityPlanRow>();

      if (planError) throw planError;
      activityPlan = plan;
    }

    const { error: updateError } = await serviceClient
      .from("match_candidates")
      .update({
        activity_group_id: activityGroupId,
        responded_at: new Date().toISOString(),
        status: "accepted"
      })
      .eq("id", candidate.id);

    if (updateError) throw updateError;

    return jsonResponse({
      ok: true,
      matchCandidateId: candidate.id,
      status: "accepted",
      activityGroupId,
      activityPlan: toActivityPlanResponse(activityPlan)
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to accept match";
    const status = message === "Authentication required" ? 401 : 400;
    return jsonError(message, status, corsHeaders);
  }
});
