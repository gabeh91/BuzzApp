"use client";

import { useCallback, useEffect, useState, type ReactElement } from "react";

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
} from "./adminDashboardTypes";

const fallbackInterests: Interest[] = [
  {
    id: "interest-surfing",
    name: "Surfing",
    slug: "surfing",
    category: "sport",
  },
  { id: "interest-tennis", name: "Tennis", slug: "tennis", category: "sport" },
  {
    id: "interest-singing",
    name: "Singing",
    slug: "singing",
    category: "music",
  },
  {
    id: "interest-running",
    name: "Running",
    slug: "running",
    category: "fitness",
  },
];

const fallbackBusinesses: Business[] = [
  {
    id: "business-ocean-club",
    name: "Ocean Club",
    description: "Local partner placeholder",
  },
  {
    id: "business-northside-tennis",
    name: "Northside Tennis",
    description: "Local partner placeholder",
  },
  {
    id: "business-laneway-coffee",
    name: "Laneway Coffee",
    description: "Local partner placeholder",
  },
];

const fallbackEvents: Event[] = [
  { id: "event-welcome-picnic", title: "Welcome Picnic" },
  { id: "event-climbing-night", title: "Climbing Night" },
  { id: "event-board-game-social", title: "Board Game Social" },
];
const fallbackCitySettings: CitySetting[] = [];
const fallbackReports: Report[] = [];
const fallbackActivityGroups: ActivityGroup[] = [];
const fallbackReliability: Reliability[] = [];
const fallbackStarterPlans: StarterPlan[] = [];

const appEnv = process.env.NEXT_PUBLIC_APP_ENV ?? "local";
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321";

const fallbackDashboardData: AdminDashboardData = {
  activityGroups: [],
  businesses: fallbackBusinesses,
  citySettings: [],
  events: fallbackEvents,
  interests: fallbackInterests,
  reliability: [],
  reports: [],
  starterPlans: [],
};

function AdminDashboard(): ReactElement {
  const [data, setData] = useState<AdminDashboardData>(fallbackDashboardData);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewingReportId, setReviewingReportId] = useState<string | null>(
    null,
  );
  const [reviewNotice, setReviewNotice] = useState<string | null>(null);
  const loadDashboard = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/admin-dashboard", {
        cache: "no-store",
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(body.error ?? "Unable to load admin dashboard");
      }

      const nextData = (await response.json()) as AdminDashboardData;
      setData(nextData);
      setError(null);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load admin dashboard",
      );
      setData(fallbackDashboardData);
    } finally {
      setLoading(false);
    }
  }, []);
  const interests = data.interests ?? fallbackInterests;
  const businesses = data.businesses ?? fallbackBusinesses;
  const events = data.events ?? fallbackEvents;
  const citySettings = data.citySettings ?? fallbackCitySettings;
  const reports = data.reports ?? fallbackReports;
  const activityGroups = data.activityGroups ?? fallbackActivityGroups;
  const reliability = data.reliability ?? fallbackReliability;
  const starterPlans = data.starterPlans ?? fallbackStarterPlans;
  const connectionStatus = loading
    ? "Loading city data"
    : error
      ? "Showing starter city data while local services start"
      : "Connected to city data";

  const reviewSafetyReport = async (
    reportId: string,
    action: "approve_block" | "dismiss",
  ) => {
    setReviewingReportId(reportId);
    setReviewNotice(null);

    try {
      const response = await fetch(`/api/safety-reports/${reportId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(body.error ?? "Unable to review report");
      }

      setReviewNotice(
        action === "approve_block" ? "Block approved." : "Report dismissed.",
      );
      await loadDashboard();
    } catch (reviewError) {
      setReviewNotice(
        reviewError instanceof Error
          ? reviewError.message
          : "Unable to review report.",
      );
    } finally {
      setReviewingReportId(null);
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  return (
    <main style={{ padding: 32 }}>
      <h1>Buzz Admin</h1>
      <p>Environment: {appEnv}</p>
      <p>Supabase URL: {supabaseUrl}</p>
      <p>Connection status: {connectionStatus}</p>
      <section>
        <h2>Seeded interests</h2>
        <ul>
          {interests.map((interest) => (
            <li key={interest.id}>
              {interest.name}{" "}
              <span style={{ color: "#667" }}>({interest.category})</span>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Sample businesses</h2>
        <ul>
          {businesses.map((business) => (
            <li key={business.id}>
              {business.name}
              {business.description ? (
                <span style={{ color: "#667" }}> - {business.description}</span>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Sample events</h2>
        <ul>
          {events.map((event) => (
            <li key={event.id}>{event.title}</li>
          ))}
        </ul>
      </section>
      <section>
        <h2>City config</h2>
        {citySettings.length > 0 ? (
          <ul>
            {citySettings.map((setting) => (
              <li key={setting.cityId}>
                {String(setting.matchingRadiusKm)} km radius, groups{" "}
                {setting.defaultGroupSizeMin}-{setting.defaultGroupSizeMax},{" "}
                {setting.activationExpiryHours}h activation expiry
              </li>
            ))}
          </ul>
        ) : (
          <p>
            City settings will appear after the local city config seed is
            available.
          </p>
        )}
      </section>
      <section>
        <h2>Reports</h2>
        {reviewNotice ? <p>{reviewNotice}</p> : null}
        {reports.length > 0 ? (
          <ul
            style={{ display: "grid", gap: 12, listStyle: "none", padding: 0 }}
          >
            {reports.map((report) => (
              <li
                key={report.id}
                style={{
                  background: "#fffaf0",
                  border: "1px solid rgba(21, 37, 31, 0.14)",
                  borderRadius: 16,
                  padding: 16,
                }}
              >
                <strong>{report.reason}</strong>
                <p style={{ color: "#667", marginBottom: 8 }}>
                  {report.category} · {report.status} · {report.createdAt}
                </p>
                {report.details ? (
                  <p>{report.details}</p>
                ) : (
                  <p>No extra details added.</p>
                )}
                <p style={{ color: "#667", fontSize: 13 }}>
                  Source: {report.source ?? "user_report"}
                </p>
                {report.status === "needs_review" ||
                report.status === "reviewing" ? (
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <button
                      disabled={reviewingReportId === report.id}
                      onClick={() => {
                        void reviewSafetyReport(report.id, "approve_block");
                      }}
                      type="button"
                    >
                      Approve block
                    </button>
                    <button
                      disabled={reviewingReportId === report.id}
                      onClick={() => {
                        void reviewSafetyReport(report.id, "dismiss");
                      }}
                      type="button"
                    >
                      Dismiss report
                    </button>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p>No safety reports are waiting for review.</p>
        )}
      </section>
      <section>
        <h2>Groups</h2>
        {activityGroups.length > 0 ? (
          <ul>
            {activityGroups.map((group) => (
              <li key={group.id}>
                {group.title}{" "}
                <span style={{ color: "#667" }}>({group.status})</span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No activity groups have been created yet.</p>
        )}
      </section>
      <section>
        <h2>Attendance</h2>
        {reliability.length > 0 ? (
          <ul>
            {reliability.map((record) => (
              <li key={record.userId}>
                {record.attendedCount} attended, {record.noShowCount} no-shows,{" "}
                {record.feedbackCount} feedback
                <span style={{ color: "#667" }}>
                  {" "}
                  ({String(record.reliabilityScore)} score)
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No attendance or reliability records have been created yet.</p>
        )}
      </section>
      <section>
        <h2>Starter plans</h2>
        {starterPlans.length > 0 ? (
          <ul>
            {starterPlans.map((plan) => (
              <li key={plan.id}>
                {plan.title}{" "}
                <span style={{ color: "#667" }}>({plan.status})</span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No starter plan placeholders have been created yet.</p>
        )}
      </section>
    </main>
  );
}

export default function HomePage(): ReactElement {
  return <AdminDashboard />;
}
