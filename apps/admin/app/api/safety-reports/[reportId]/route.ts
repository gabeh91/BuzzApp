import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

type ReportReviewAction = "approve_block" | "dismiss";

type ReportReviewRequestBody = {
  action?: unknown;
};

type SafetyReportRow = {
  id: string;
  metadata_json: Record<string, unknown> | null;
  reporter_id: string;
  target_user_id: string | null;
};

type RouteContext = {
  params: {
    reportId: string;
  };
};

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

const createAdminClient = () => {
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  });
};

const readReviewAction = async (
  request: NextRequest,
): Promise<ReportReviewAction> => {
  const body = (await request
    .json()
    .catch(() => ({}))) as ReportReviewRequestBody;

  if (body.action === "approve_block" || body.action === "dismiss") {
    return body.action;
  }

  throw new Error("Unsupported report review action");
};

const resolveSafetyReport = async (
  client: ReturnType<typeof createAdminClient>,
  reportId: string,
): Promise<SafetyReportRow> => {
  const { data, error } = await client
    .from("reports")
    .select("id, reporter_id, target_user_id, metadata_json")
    .eq("id", reportId)
    .single<SafetyReportRow>();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const updateReportReviewStatus = async (
  client: ReturnType<typeof createAdminClient>,
  report: SafetyReportRow,
  action: ReportReviewAction,
) => {
  const reviewedAt = new Date().toISOString();
  const existingMetadata =
    report.metadata_json && typeof report.metadata_json === "object"
      ? report.metadata_json
      : {};

  const { error } = await client
    .from("reports")
    .update({
      metadata_json: {
        ...existingMetadata,
        approvedAction: action,
        reviewedAt,
      },
      resolved_at: reviewedAt,
      reviewed_at: reviewedAt,
      status: action === "approve_block" ? "resolved" : "dismissed",
    })
    .eq("id", report.id);

  if (error) {
    throw new Error(error.message);
  }
};

const approveBlockForReport = async (
  client: ReturnType<typeof createAdminClient>,
  report: SafetyReportRow,
) => {
  if (!report.target_user_id) {
    throw new Error("Report has no target user to block");
  }

  const { error } = await client.from("blocks").upsert(
    {
      blocked_id: report.target_user_id,
      blocker_id: report.reporter_id,
    },
    {
      onConflict: "blocker_id,blocked_id",
    },
  );

  if (error) {
    throw new Error(error.message);
  }
};

export async function POST(
  request: NextRequest,
  { params }: RouteContext,
): Promise<NextResponse> {
  try {
    const action = await readReviewAction(request);
    const client = createAdminClient();
    const report = await resolveSafetyReport(client, params.reportId);

    if (action === "approve_block") {
      await approveBlockForReport(client, report);
    }

    await updateReportReviewStatus(client, report, action);

    return NextResponse.json({
      ok: true,
      action,
      reportId: report.id,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to review safety report",
      },
      { status: 400 },
    );
  }
}
