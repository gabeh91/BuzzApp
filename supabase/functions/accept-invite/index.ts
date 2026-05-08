import { resolveCurrentProfile } from "../_shared/auth.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { jsonError } from "../_shared/errors.ts";
import { createServiceRoleClient } from "../_shared/supabase.ts";

type InviteRow = {
  id: string;
  activity_group_id: string;
  max_uses: number;
  use_count: number;
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
    const { profileId } = await resolveCurrentProfile(request, serviceClient);
    const { data: invite, error: inviteError } = await serviceClient
      .from("group_invites")
      .select("id, activity_group_id, max_uses, use_count")
      .eq("token_hash", token)
      .eq("status", "active")
      .gt("expires_at", new Date().toISOString())
      .maybeSingle<InviteRow>();

    if (inviteError) throw inviteError;
    if (!invite) return jsonError("Invite not found or expired", 404, corsHeaders);

    const { error: memberError } = await serviceClient
      .from("activity_group_members")
      .insert({ activity_group_id: invite.activity_group_id, user_id: profileId });

    if (memberError && memberError.code !== "23505") throw memberError;

    const nextUseCount = invite.use_count + 1;
    const { error: updateError } = await serviceClient
      .from("group_invites")
      .update({
        accepted_at: new Date().toISOString(),
        accepted_by: profileId,
        status: nextUseCount >= invite.max_uses ? "accepted" : "active",
        use_count: nextUseCount
      })
      .eq("id", invite.id);

    if (updateError) throw updateError;

    return jsonResponse({
      ok: true,
      activityGroupId: invite.activity_group_id,
      inviteId: invite.id,
      status: "accepted"
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to accept invite";
    const status = message === "Authentication required" ? 401 : 400;
    return jsonError(message, status, corsHeaders);
  }
});
