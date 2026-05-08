import { resolveCurrentProfile } from "../_shared/auth.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { jsonError } from "../_shared/errors.ts";
import { createServiceRoleClient } from "../_shared/supabase.ts";

const jsonResponse = (body: Record<string, unknown>, status = 200): Response => {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
};

const readInviteInput = async (request: Request) => {
  const body = await request.json().catch(() => ({}));
  const activityGroupId = typeof body.activityGroupId === "string" ? body.activityGroupId.trim() : "";
  const activityPlanId = typeof body.activityPlanId === "string" ? body.activityPlanId.trim() : undefined;

  if (!activityGroupId) {
    throw new Error("activityGroupId is required");
  }

  return {
    activityGroupId,
    activityPlanId
  };
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return jsonError("Method not allowed", 405, corsHeaders);

  const serviceClient = createServiceRoleClient();

  try {
    const { activityGroupId, activityPlanId } = await readInviteInput(request);
    const { profileId } = await resolveCurrentProfile(request, serviceClient);
    const token = crypto.randomUUID().replaceAll("-", "");
    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();

    const { data: invite, error } = await serviceClient
      .from("group_invites")
      .insert({
        activity_group_id: activityGroupId,
        activity_plan_id: activityPlanId,
        expires_at: expiresAt,
        inviter_id: profileId,
        token_hash: token,
        token_preview: token.slice(0, 8)
      })
      .select("id, token_preview, expires_at")
      .single<{ id: string; token_preview: string; expires_at: string }>();

    if (error) throw error;

    return jsonResponse({
      ok: true,
      inviteId: invite.id,
      token,
      tokenPreview: invite.token_preview,
      expiresAt: invite.expires_at
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create invite";
    const status = message === "Authentication required" ? 401 : 400;
    return jsonError(message, status, corsHeaders);
  }
});
