import { resolveCurrentProfile } from "../_shared/auth.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { jsonError } from "../_shared/errors.ts";
import { createServiceRoleClient } from "../_shared/supabase.ts";

type ReportCategory = "unsafe" | "harassment" | "spam" | "no_show" | "other";

type ReportInput = {
  reason: string;
  category: ReportCategory;
  activityGroupId?: string;
  details?: string;
  targetUserId?: string;
};

type ReportRow = {
  id: string;
  status: "open" | "reviewing" | "resolved" | "dismissed";
};

const reportCategories = new Set<ReportCategory>([
  "unsafe",
  "harassment",
  "spam",
  "no_show",
  "other",
]);

const jsonResponse = (
  body: Record<string, unknown>,
  status = 200,
): Response => {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
};

const trimOptional = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const readReportInput = async (request: Request): Promise<ReportInput> => {
  const body = await request.json().catch(() => ({}));
  const reason = trimOptional(body.reason);
  const rawCategory = trimOptional(body.category) ?? "other";

  if (!reason) {
    throw new Error("reason is required");
  }

  if (!reportCategories.has(rawCategory as ReportCategory)) {
    throw new Error("Unsupported report category");
  }

  const input: ReportInput = {
    category: rawCategory as ReportCategory,
    reason,
  };
  const activityGroupId = trimOptional(body.activityGroupId);
  const details = trimOptional(body.details);
  const targetUserId = trimOptional(body.targetUserId);

  if (activityGroupId) input.activityGroupId = activityGroupId;
  if (details) input.details = details;
  if (targetUserId) input.targetUserId = targetUserId;

  return input;
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS")
    return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST")
    return jsonError("Method not allowed", 405, corsHeaders);

  const serviceClient = createServiceRoleClient();

  try {
    const input = await readReportInput(request);
    const { profileId } = await resolveCurrentProfile(request, serviceClient);
    const reportPayload: Record<string, unknown> = {
      category: input.category,
      reason: input.reason,
      reporter_id: profileId,
      source: "user_report",
      status: "open",
    };

    if (input.activityGroupId)
      reportPayload.activity_group_id = input.activityGroupId;
    if (input.details) reportPayload.details = input.details;
    if (input.targetUserId) reportPayload.target_user_id = input.targetUserId;

    const { data: report, error } = await serviceClient
      .from("reports")
      .insert(reportPayload)
      .select("id, status")
      .single<ReportRow>();

    if (error) throw error;

    return jsonResponse({
      ok: true,
      reportId: report.id,
      status: report.status,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to submit report";
    const status = message === "Authentication required" ? 401 : 400;
    return jsonError(message, status, corsHeaders);
  }
});
