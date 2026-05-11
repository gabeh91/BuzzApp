import { resolveCurrentProfile } from "../_shared/auth.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { jsonError } from "../_shared/errors.ts";
import { createServiceRoleClient } from "../_shared/supabase.ts";

type LeaveGroupInput = {
  activityGroupId: string;
};

type ActivityGroupMemberRow = {
  activity_group_id: string;
  user_id: string;
};

const jsonResponse = (
  body: Record<string, unknown>,
  status = 200,
): Response => {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
};

const readLeaveGroupInput = async (
  request: Request,
): Promise<LeaveGroupInput> => {
  const body = await request.json().catch(() => ({}));
  const activityGroupId =
    typeof body.activityGroupId === "string" ? body.activityGroupId.trim() : "";

  if (!activityGroupId) {
    throw new Error("activityGroupId is required");
  }

  return { activityGroupId };
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS")
    return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST")
    return jsonError("Method not allowed", 405, corsHeaders);

  const serviceClient = createServiceRoleClient();

  try {
    const { activityGroupId } = await readLeaveGroupInput(request);
    const { profileId } = await resolveCurrentProfile(request, serviceClient);

    const { data: member, error } = await serviceClient
      .from("activity_group_members")
      .delete()
      .eq("activity_group_id", activityGroupId)
      .eq("user_id", profileId)
      .select("activity_group_id, user_id")
      .maybeSingle<ActivityGroupMemberRow>();

    if (error) throw error;
    if (!member)
      return jsonError("Group membership not found", 404, corsHeaders);

    return jsonResponse({
      ok: true,
      activityGroupId: member.activity_group_id,
      status: "left",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to leave group";
    const status = message === "Authentication required" ? 401 : 400;
    return jsonError(message, status, corsHeaders);
  }
});
