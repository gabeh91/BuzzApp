import { resolveCurrentProfile } from "../_shared/auth.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { jsonError } from "../_shared/errors.ts";
import { createServiceRoleClient } from "../_shared/supabase.ts";

type ActivityGroupMemberRow = {
  activity_group_id: string;
  user_id: string;
  rsvp_status: string;
  attendance_status: string;
  attendance_confirmed_at: string | null;
};

type ReliabilityRow = {
  attended_count: number;
};

const jsonResponse = (body: Record<string, unknown>, status = 200): Response => {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
};

const readActivityGroupId = async (request: Request): Promise<string> => {
  const body = await request.json().catch(() => ({}));
  const activityGroupId = typeof body.activityGroupId === "string" ? body.activityGroupId.trim() : "";

  if (!activityGroupId) {
    throw new Error("activityGroupId is required");
  }

  return activityGroupId;
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return jsonError("Method not allowed", 405, corsHeaders);

  const serviceClient = createServiceRoleClient();

  try {
    const activityGroupId = await readActivityGroupId(request);
    const { profileId } = await resolveCurrentProfile(request, serviceClient);

    const { data: existingMember, error: existingMemberError } = await serviceClient
      .from("activity_group_members")
      .select("activity_group_id, user_id, rsvp_status, attendance_status, attendance_confirmed_at")
      .eq("activity_group_id", activityGroupId)
      .eq("user_id", profileId)
      .maybeSingle<ActivityGroupMemberRow>();

    if (existingMemberError) throw existingMemberError;
    if (!existingMember) return jsonError("Group membership not found", 404, corsHeaders);

    const alreadyAttended = existingMember.attendance_status === "attended";
    const attendanceConfirmedAt = existingMember.attendance_confirmed_at ?? new Date().toISOString();

    const { data: member, error: memberError } = await serviceClient
      .from("activity_group_members")
      .update({
        attendance_confirmed_at: attendanceConfirmedAt,
        attendance_status: "attended",
        rsvp_status: "confirmed"
      })
      .eq("activity_group_id", activityGroupId)
      .eq("user_id", profileId)
      .select("activity_group_id, user_id, rsvp_status, attendance_status, attendance_confirmed_at")
      .single<ActivityGroupMemberRow>();

    if (memberError) throw memberError;

    if (!alreadyAttended) {
      const { data: reliability, error: reliabilityError } = await serviceClient
        .from("user_reliability")
        .select("attended_count")
        .eq("user_id", profileId)
        .maybeSingle<ReliabilityRow>();

      if (reliabilityError) throw reliabilityError;

      const nextAttendedCount = (reliability?.attended_count ?? 0) + 1;
      const reliabilityPayload = {
        attended_count: nextAttendedCount,
        last_attended_at: attendanceConfirmedAt,
        reliability_score: 1,
        updated_at: new Date().toISOString(),
        user_id: profileId
      };

      const { error: upsertReliabilityError } = await serviceClient
        .from("user_reliability")
        .upsert(reliabilityPayload, { onConflict: "user_id" });

      if (upsertReliabilityError) throw upsertReliabilityError;
    }

    return jsonResponse({
      ok: true,
      activityGroupId: member.activity_group_id,
      attendanceConfirmedAt: member.attendance_confirmed_at,
      attendanceStatus: "attended",
      rsvpStatus: "confirmed"
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to confirm attendance";
    const status = message === "Authentication required" ? 401 : 400;
    return jsonError(message, status, corsHeaders);
  }
});
