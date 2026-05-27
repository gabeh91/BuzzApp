import { resolveCurrentProfile } from "../_shared/auth.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { jsonError } from "../_shared/errors.ts";
import { createServiceRoleClient } from "../_shared/supabase.ts";

type ActivityGroupMemberRow = {
  activity_group_id: string;
  attendance_status: string;
  user_id: string;
  feedback_completed_at: string | null;
};

type ReliabilityRow = {
  feedback_count: number;
  check_in_streak: number;
  no_show_count: number;
  positive_feedback_count: number;
  reliable_plan_streak: number;
};

type FeedbackInput = {
  activityGroupId: string;
  feltSafe: boolean;
  reportRequested: boolean;
  userAttended: boolean;
  wouldMeetAgain: boolean;
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
  const activityGroupId = typeof body.activityGroupId === "string"
    ? body.activityGroupId.trim()
    : "";
  const userAttended = typeof body.userAttended === "boolean"
    ? body.userAttended
    : typeof body.didHappen === "boolean"
    ? body.didHappen
    : true;
  const feltSafe = typeof body.feltSafe === "boolean" ? body.feltSafe : true;
  const wouldMeetAgain = typeof body.wouldMeetAgain === "boolean"
    ? body.wouldMeetAgain
    : feltSafe;
  const reportRequested = typeof body.reportRequested === "boolean"
    ? body.reportRequested
    : !feltSafe;

  if (!activityGroupId) {
    throw new Error("activityGroupId is required");
  }

  return {
    activityGroupId,
    feltSafe,
    reportRequested,
    userAttended,
    wouldMeetAgain,
  };
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return jsonError("Method not allowed", 405, corsHeaders);
  }

  const serviceClient = createServiceRoleClient();

  try {
    const {
      activityGroupId,
      feltSafe,
      reportRequested,
      userAttended,
      wouldMeetAgain,
    } = await readFeedbackInput(request);
    const { profileId } = await resolveCurrentProfile(request, serviceClient);

    const { data: existingMember, error: existingMemberError } =
      await serviceClient
        .from("activity_group_members")
        .select(
          "activity_group_id, user_id, attendance_status, feedback_completed_at",
        )
        .eq("activity_group_id", activityGroupId)
        .eq("user_id", profileId)
        .maybeSingle<ActivityGroupMemberRow>();

    if (existingMemberError) throw existingMemberError;
    if (!existingMember) {
      return jsonError("Group membership not found", 404, corsHeaders);
    }

    const alreadyCompleted = Boolean(existingMember.feedback_completed_at);
    const feedbackCompletedAt = existingMember.feedback_completed_at ??
      new Date().toISOString();

    const { data: member, error: memberError } = await serviceClient
      .from("activity_group_members")
      .update({
        attendance_status: userAttended ? "attended" : "missed",
        feedback_completed_at: feedbackCompletedAt,
      })
      .eq("activity_group_id", activityGroupId)
      .eq("user_id", profileId)
      .select(
        "activity_group_id, user_id, attendance_status, feedback_completed_at",
      )
      .single<ActivityGroupMemberRow>();

    if (memberError) throw memberError;

    const { error: checkinError } = await serviceClient
      .from("activity_group_checkins")
      .upsert(
        {
          activity_group_id: activityGroupId,
          did_happen: userAttended,
          felt_safe: feltSafe,
          report_requested: reportRequested,
          updated_at: new Date().toISOString(),
          user_id: profileId,
          would_meet_again: wouldMeetAgain,
        },
        { onConflict: "activity_group_id,user_id" },
      );

    if (checkinError) throw checkinError;

    if (!alreadyCompleted) {
      const { data: reliability, error: reliabilityError } = await serviceClient
        .from("user_reliability")
        .select(
          "feedback_count, check_in_streak, no_show_count, positive_feedback_count, reliable_plan_streak",
        )
        .eq("user_id", profileId)
        .maybeSingle<ReliabilityRow>();

      if (reliabilityError) throw reliabilityError;

      const nextFeedbackCount = (reliability?.feedback_count ?? 0) + 1;
      const positiveFeedbackRecorded = userAttended && feltSafe &&
        wouldMeetAgain;
      const nextPositiveFeedbackCount =
        (reliability?.positive_feedback_count ?? 0) +
        (positiveFeedbackRecorded ? 1 : 0);
      const nextNoShowCount = (reliability?.no_show_count ?? 0) +
        (userAttended ? 0 : 1);
      const nextCheckInStreak = (reliability?.check_in_streak ?? 0) + 1;
      const nextReliablePlanStreak = positiveFeedbackRecorded
        ? (reliability?.reliable_plan_streak ?? 0) + 1
        : 0;
      const reliabilityPayload = {
        check_in_streak: nextCheckInStreak,
        feedback_count: nextFeedbackCount,
        last_feedback_at: feedbackCompletedAt,
        last_reliability_event_at: feedbackCompletedAt,
        no_show_count: nextNoShowCount,
        positive_feedback_count: nextPositiveFeedbackCount,
        reliable_plan_streak: nextReliablePlanStreak,
        updated_at: new Date().toISOString(),
        user_id: profileId,
      };

      const { error: reliabilityEventError } = await serviceClient
        .from("user_reliability_events")
        .upsert(
          [
            {
              activity_group_id: activityGroupId,
              event_type: "checked_in",
              idempotency_key: `checked-in:${activityGroupId}:${profileId}`,
              metadata_json: {
                feltSafe,
                userAttended,
                wouldMeetAgain,
              },
              user_id: profileId,
            },
            {
              activity_group_id: activityGroupId,
              event_type: userAttended ? "positive_feedback" : "missed_plan",
              idempotency_key: `${
                userAttended ? "positive-feedback" : "missed-plan"
              }:${activityGroupId}:${profileId}`,
              metadata_json: {
                feltSafe,
                userAttended,
                wouldMeetAgain,
              },
              user_id: profileId,
            },
          ],
          { onConflict: "idempotency_key" },
        );

      if (reliabilityEventError) throw reliabilityEventError;

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
      positiveFeedbackRecorded: userAttended && feltSafe && wouldMeetAgain,
      userAttended,
      wouldMeetAgain,
    });
  } catch (error) {
    const message = error instanceof Error
      ? error.message
      : "Unable to record post-plan feedback";
    const status = message === "Authentication required" ? 401 : 400;
    return jsonError(message, status, corsHeaders);
  }
});
