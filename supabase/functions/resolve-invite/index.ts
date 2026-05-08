import { corsHeaders } from "../_shared/cors.ts";
import { jsonError } from "../_shared/errors.ts";
import { createServiceRoleClient } from "../_shared/supabase.ts";

type InviteRow = {
  id: string;
  activity_group_id: string;
  activity_plan_id: string | null;
  inviter_id: string;
  status: string;
  expires_at: string;
};

const jsonResponse = (body: Record<string, unknown>, status = 200): Response => {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
};

const readToken = async (request: Request): Promise<string> => {
  const body = await request.json().catch(() => ({}));
  const token = typeof body.token === "string" ? body.token.trim() : "";

  if (!token) {
    throw new Error("token is required");
  }

  return token;
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return jsonError("Method not allowed", 405, corsHeaders);

  const serviceClient = createServiceRoleClient();

  try {
    const token = await readToken(request);
    const { data: invite, error } = await serviceClient
      .from("group_invites")
      .select("id, activity_group_id, activity_plan_id, inviter_id, status, expires_at")
      .eq("token_hash", token)
      .eq("status", "active")
      .gt("expires_at", new Date().toISOString())
      .maybeSingle<InviteRow>();

    if (error) throw error;
    if (!invite) return jsonError("Invite not found or expired", 404, corsHeaders);

    return jsonResponse({
      ok: true,
      inviteId: invite.id,
      activityGroupId: invite.activity_group_id,
      activityPlanId: invite.activity_plan_id,
      inviterId: invite.inviter_id,
      status: invite.status,
      expiresAt: invite.expires_at
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to resolve invite";
    return jsonError(message, 400, corsHeaders);
  }
});
