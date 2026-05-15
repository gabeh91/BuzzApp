import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import type {
  ActivityGroup,
  AdminDashboardData,
  Business,
  CitySetting,
  Event,
  Interest,
  Reliability,
  Report,
  StarterPlan,
} from "../../adminDashboardTypes";

export const dynamic = "force-dynamic";

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

type AdminClient = ReturnType<typeof createAdminClient>;

const readCollection = async <Row>(
  client: AdminClient,
  table: string,
  columns: string,
  limit = 10,
): Promise<Row[]> => {
  const { data, error } = await client.from(table).select(columns).limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Row[];
};

type InterestRow = {
  category: string;
  id: string;
  name: string;
  slug: string;
};

type BusinessRow = {
  description: string | null;
  id: string;
  name: string;
};

type EventRow = {
  id: string;
  title: string;
};

type CitySettingRow = {
  activation_expiry_hours: number;
  city_id: string;
  default_group_size_max: number;
  default_group_size_min: number;
  is_waitlist_enabled: boolean;
  matching_radius_km: number | string;
  requires_invite: boolean;
};

type ReportRow = {
  activity_group_id: string | null;
  category: string;
  created_at: string;
  details: string | null;
  id: string;
  metadata_json: Record<string, unknown> | null;
  reason: string;
  source: string | null;
  status: string;
  target_user_id: string | null;
};

type ActivityGroupRow = {
  created_at: string;
  id: string;
  status: string;
  title: string;
};

type ReliabilityRow = {
  attended_count: number;
  cancelled_late_count: number;
  feedback_count: number;
  no_show_count: number;
  reliability_score: number | string;
  updated_at: string;
  user_id: string;
};

type StarterPlanRow = {
  created_at: string;
  id: string;
  max_group_size: number;
  min_group_size: number;
  status: string;
  title: string;
};

const mapInterest = (row: InterestRow): Interest => ({
  category: row.category,
  id: row.id,
  name: row.name,
  slug: row.slug,
});

const mapBusiness = (row: BusinessRow): Business => ({
  description: row.description,
  id: row.id,
  name: row.name,
});

const mapEvent = (row: EventRow): Event => ({
  id: row.id,
  title: row.title,
});

const mapCitySetting = (row: CitySettingRow): CitySetting => ({
  activationExpiryHours: row.activation_expiry_hours,
  cityId: row.city_id,
  defaultGroupSizeMax: row.default_group_size_max,
  defaultGroupSizeMin: row.default_group_size_min,
  isWaitlistEnabled: row.is_waitlist_enabled,
  matchingRadiusKm: row.matching_radius_km,
  requiresInvite: row.requires_invite,
});

const mapReport = (row: ReportRow): Report => ({
  activityGroupId: row.activity_group_id,
  category: row.category,
  createdAt: row.created_at,
  details: row.details,
  id: row.id,
  metadataJson: row.metadata_json ?? {},
  reason: row.reason,
  source: row.source ?? "user_report",
  status: row.status,
  targetUserId: row.target_user_id,
});

const mapActivityGroup = (row: ActivityGroupRow): ActivityGroup => ({
  createdAt: row.created_at,
  id: row.id,
  status: row.status,
  title: row.title,
});

const mapReliability = (row: ReliabilityRow): Reliability => ({
  attendedCount: row.attended_count,
  cancelledLateCount: row.cancelled_late_count,
  feedbackCount: row.feedback_count,
  noShowCount: row.no_show_count,
  reliabilityScore: row.reliability_score,
  updatedAt: row.updated_at,
  userId: row.user_id,
});

const mapStarterPlan = (row: StarterPlanRow): StarterPlan => ({
  createdAt: row.created_at,
  id: row.id,
  maxGroupSize: row.max_group_size,
  minGroupSize: row.min_group_size,
  status: row.status,
  title: row.title,
});

export async function GET() {
  try {
    const client = createAdminClient();
    const [
      interests,
      businesses,
      events,
      citySettings,
      reports,
      activityGroups,
      reliability,
      starterPlans,
    ] = await Promise.all([
      readCollection<InterestRow>(client, "interests", "id, name, slug, category", 50),
      readCollection<BusinessRow>(client, "businesses", "id, name, description"),
      readCollection<EventRow>(client, "events", "id, title"),
      readCollection<CitySettingRow>(
        client,
        "city_settings",
        "city_id, matching_radius_km, default_group_size_min, default_group_size_max, activation_expiry_hours, requires_invite, is_waitlist_enabled",
      ),
      readCollection<ReportRow>(
        client,
        "reports",
        "id, category, status, reason, details, source, metadata_json, activity_group_id, target_user_id, created_at",
      ),
      readCollection<ActivityGroupRow>(
        client,
        "activity_groups",
        "id, title, status, created_at",
      ),
      readCollection<ReliabilityRow>(
        client,
        "user_reliability",
        "user_id, attended_count, no_show_count, cancelled_late_count, feedback_count, reliability_score, updated_at",
      ),
      readCollection<StarterPlanRow>(
        client,
        "starter_plans",
        "id, title, status, min_group_size, max_group_size, created_at",
      ),
    ]);

    const data: AdminDashboardData = {
      activityGroups: activityGroups.map(mapActivityGroup),
      businesses: businesses.map(mapBusiness),
      citySettings: citySettings.map(mapCitySetting),
      events: events.map(mapEvent),
      interests: interests.map(mapInterest),
      reliability: reliability.map(mapReliability),
      reports: reports.map(mapReport),
      starterPlans: starterPlans.map(mapStarterPlan),
    };

    return NextResponse.json(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load admin dashboard";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
