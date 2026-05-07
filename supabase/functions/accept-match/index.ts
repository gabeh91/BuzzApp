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

    if (!activityGroupId) {
      const { data: interest, error: interestError } = await serviceClient
        .from("interests")
        .select("name")
        .eq("id", activation.interest_id)
        .maybeSingle<{ name: string }>();

      if (interestError) throw interestError;

      const { data: group, error: groupError } = await serviceClient
        .from("activity_groups")
        .insert({
          city_id: activation.city_id,
          created_by: profileId,
          interest_id: activation.interest_id,
          status: "forming",
          title: `${interest?.name ?? "Activity"} plan`
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
      activityGroupId
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to accept match";
    const status = message === "Authentication required" ? 401 : 400;
    return jsonError(message, status, corsHeaders);
  }
});
