import {
  ensureProfileForUser,
  resolveCurrentProfile,
} from "../_shared/auth.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { jsonError } from "../_shared/errors.ts";
import { createServiceRoleClient } from "../_shared/supabase.ts";

type InviteRow = {
  id: string;
  activity_group_id: string;
  activity_plan_id: string | null;
  max_uses: number;
  use_count: number;
};

type ActivityPlanRow = {
  capacity_max: number;
};

type ActivityGroupMemberRow = {
  id: string;
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

const readToken = async (request: Request): Promise<string> => {
  const body = await request.json().catch(() => ({}));
  const token = typeof body.token === "string" ? body.token.trim() : "";

  if (!token) {
    throw new Error("token is required");
  }

  return token;
};

const defaultCapacityMax = 5;

Deno.serve(async (request) => {
  if (request.method === "OPTIONS")
    return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST")
    return jsonError("Method not allowed", 405, corsHeaders);

  const serviceClient = createServiceRoleClient();

  try {
    const token = await readToken(request);
    const { profileId } = await resolveCurrentProfile(request, serviceClient);
    await ensureProfileForUser(serviceClient, profileId);
    const { data: invite, error: inviteError } = await serviceClient
      .from("group_invites")
      .select("id, activity_group_id, activity_plan_id, max_uses, use_count")
      .eq("token_hash", token)
      .eq("status", "active")
      .gt("expires_at", new Date().toISOString())
      .maybeSingle<InviteRow>();

    if (inviteError) throw inviteError;
    if (!invite)
      return jsonError("Invite not found or expired", 404, corsHeaders);

    const recordInviteEvent = async (
      eventType: "accepted" | "rejected_full",
      metadata: Record<string, unknown> = {},
    ) => {
      const { error: eventError } = await serviceClient
        .from("group_invite_events")
        .insert({
          activity_group_id: invite.activity_group_id,
          actor_id: profileId,
          event_type: eventType,
          invite_id: invite.id,
          metadata_json: metadata,
        });

      if (eventError) throw eventError;
    };

    const { data: existingMember, error: existingMemberError } =
      await serviceClient
        .from("activity_group_members")
        .select("id")
        .eq("activity_group_id", invite.activity_group_id)
        .eq("user_id", profileId)
        .maybeSingle<ActivityGroupMemberRow>();

    if (existingMemberError) throw existingMemberError;

    if (existingMember) {
      await recordInviteEvent("accepted", { alreadyMember: true });

      return jsonResponse({
        ok: true,
        activityGroupId: invite.activity_group_id,
        inviteId: invite.id,
        status: "accepted",
      });
    }

    const planResult = invite.activity_plan_id
      ? await serviceClient
          .from("activity_plans")
          .select("capacity_max")
          .eq("id", invite.activity_plan_id)
          .maybeSingle<ActivityPlanRow>()
      : await serviceClient
          .from("activity_plans")
          .select("capacity_max")
          .eq("activity_group_id", invite.activity_group_id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle<ActivityPlanRow>();

    if (planResult.error) throw planResult.error;

    const capacityMax = planResult.data?.capacity_max ?? defaultCapacityMax;
    const { count: memberCount, error: memberCountError } = await serviceClient
      .from("activity_group_members")
      .select("id", { count: "exact", head: true })
      .eq("activity_group_id", invite.activity_group_id);

    if (memberCountError) throw memberCountError;

    if ((memberCount ?? 0) >= capacityMax) {
      await recordInviteEvent("rejected_full", {
        capacityMax,
        memberCount: memberCount ?? 0,
      });

      return jsonError("Group is full", 409, corsHeaders);
    }

    const { error: memberError } = await serviceClient
      .from("activity_group_members")
      .insert({
        activity_group_id: invite.activity_group_id,
        user_id: profileId,
      });

    if (memberError && memberError.code !== "23505") throw memberError;

    if (!memberError) {
      const nextUseCount = invite.use_count + 1;
      const { error: updateError } = await serviceClient
        .from("group_invites")
        .update({
          accepted_at: new Date().toISOString(),
          accepted_by: profileId,
          status: nextUseCount >= invite.max_uses ? "accepted" : "active",
          use_count: nextUseCount,
        })
        .eq("id", invite.id);

      if (updateError) throw updateError;
    }

    await recordInviteEvent("accepted");

    return jsonResponse({
      ok: true,
      activityGroupId: invite.activity_group_id,
      inviteId: invite.id,
      status: "accepted",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to accept invite";
    const status = message === "Authentication required" ? 401 : 400;
    return jsonError(message, status, corsHeaders);
  }
});
