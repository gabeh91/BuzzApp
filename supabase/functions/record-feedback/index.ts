import { resolveCurrentProfile } from "../_shared/auth.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { jsonError } from "../_shared/errors.ts";
import { createServiceRoleClient } from "../_shared/supabase.ts";

type ActivityGroupMemberRow = {
  activity_group_id: string;
  user_id: string;
  feedback_completed_at: string | null;
};

type ReliabilityRow = {
  feedback_count: number;
  positive_feedback_count: number;
};

type FeedbackInput = {
  activityGroupId: string;
  feltSafe: boolean;
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

const readFeedbackInput = async (request: Request): Promise<FeedbackInput> => {
  const body = await request.json().catch(() => ({}));
  const activityGroupId =
    typeof body.activityGroupId === "string" ? body.activityGroupId.trim() : "";
  const feltSafe = typeof body.feltSafe === "boolean" ? body.feltSafe : true;

  if (!activityGroupId) {
    throw new Error("activityGroupId is required");
  }

  return { activityGroupId, feltSafe };
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS")
    return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST")
    return jsonError("Method not allowed", 405, corsHeaders);

  const serviceClient = createServiceRoleClient();

  try {
    const { activityGroupId, feltSafe } = await readFeedbackInput(request);
    const { profileId } = await resolveCurrentProfile(request, serviceClient);

    const { data: existingMember, error: existingMemberError } =
      await serviceClient
        .from("activity_group_members")
        .select("activity_group_id, user_id, feedback_completed_at")
        .eq("activity_group_id", activityGroupId)
        .eq("user_id", profileId)
        .maybeSingle<ActivityGroupMemberRow>();

    if (existingMemberError) throw existingMemberError;
    if (!existingMember)
      return jsonError("Group membership not found", 404, corsHeaders);

    const alreadyCompleted = Boolean(existingMember.feedback_completed_at);
    const feedbackCompletedAt =
      existingMember.feedback_completed_at ?? new Date().toISOString();

    const { data: member, error: memberError } = await serviceClient
      .from("activity_group_members")
      .update({
        feedback_completed_at: feedbackCompletedAt,
      })
      .eq("activity_group_id", activityGroupId)
      .eq("user_id", profileId)
      .select("activity_group_id, user_id, feedback_completed_at")
      .single<ActivityGroupMemberRow>();

    if (memberError) throw memberError;

    if (!alreadyCompleted) {
      const { data: reliability, error: reliabilityError } = await serviceClient
        .from("user_reliability")
        .select("feedback_count, positive_feedback_count")
        .eq("user_id", profileId)
        .maybeSingle<ReliabilityRow>();

      if (reliabilityError) throw reliabilityError;

      const nextFeedbackCount = (reliability?.feedback_count ?? 0) + 1;
      const nextPositiveFeedbackCount =
        (reliability?.positive_feedback_count ?? 0) + (feltSafe ? 1 : 0);
      const reliabilityPayload = {
        feedback_count: nextFeedbackCount,
        last_feedback_at: feedbackCompletedAt,
        positive_feedback_count: nextPositiveFeedbackCount,
        updated_at: new Date().toISOString(),
        user_id: profileId,
      };

      const { error: upsertReliabilityError } = await serviceClient
        .from("user_reliability")
        .upsert(reliabilityPayload, { onConflict: "user_id" });

      if (upsertReliabilityError) throw upsertReliabilityError;
    }

    return jsonResponse({
      ok: true,
      activityGroupId: member.activity_group_id,
      feedbackCompletedAt: member.feedback_completed_at,
      feedbackStatus: "completed",
      positiveFeedbackRecorded: feltSafe,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to record post-plan feedback";
    const status = message === "Authentication required" ? 401 : 400;
    return jsonError(message, status, corsHeaders);
  }
});
