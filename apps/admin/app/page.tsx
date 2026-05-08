"use client";

import { ApolloClient, ApolloProvider, HttpLink, InMemoryCache } from "@apollo/client";
import { useMemo, type ReactElement } from "react";

import type { AdminDashboardQuery } from "../graphql/generated";
import { useAdminDashboardQuery } from "../graphql/generated";

type Interest = NonNullable<NonNullable<AdminDashboardQuery["interestsCollection"]>["edges"][number]["node"]>;
type Business = NonNullable<NonNullable<AdminDashboardQuery["businessesCollection"]>["edges"][number]["node"]>;
type Event = NonNullable<NonNullable<AdminDashboardQuery["eventsCollection"]>["edges"][number]["node"]>;
type CitySetting = NonNullable<NonNullable<AdminDashboardQuery["citySettingsCollection"]>["edges"][number]["node"]>;
type Report = NonNullable<NonNullable<AdminDashboardQuery["reportsCollection"]>["edges"][number]["node"]>;
type ActivityGroup = NonNullable<
  NonNullable<AdminDashboardQuery["activityGroupsCollection"]>["edges"][number]["node"]
>;
type Reliability = NonNullable<NonNullable<AdminDashboardQuery["userReliabilityCollection"]>["edges"][number]["node"]>;
type StarterPlan = NonNullable<NonNullable<AdminDashboardQuery["starterPlansCollection"]>["edges"][number]["node"]>;

const fallbackInterests: Interest[] = [
  { id: "interest-surfing", name: "Surfing", slug: "surfing", category: "sport" },
  { id: "interest-tennis", name: "Tennis", slug: "tennis", category: "sport" },
  { id: "interest-singing", name: "Singing", slug: "singing", category: "music" },
  { id: "interest-running", name: "Running", slug: "running", category: "fitness" }
];

const fallbackBusinesses: Business[] = [
  { id: "business-ocean-club", name: "Ocean Club", description: "Local partner placeholder" },
  { id: "business-northside-tennis", name: "Northside Tennis", description: "Local partner placeholder" },
  { id: "business-laneway-coffee", name: "Laneway Coffee", description: "Local partner placeholder" }
];

const fallbackEvents: Event[] = [
  { id: "event-welcome-picnic", title: "Welcome Picnic" },
  { id: "event-climbing-night", title: "Climbing Night" },
  { id: "event-board-game-social", title: "Board Game Social" }
];
const fallbackCitySettings: CitySetting[] = [];
const fallbackReports: Report[] = [];
const fallbackActivityGroups: ActivityGroup[] = [];
const fallbackReliability: Reliability[] = [];
const fallbackStarterPlans: StarterPlan[] = [];

const appEnv = process.env.NEXT_PUBLIC_APP_ENV ?? "local";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const graphqlUrl = supabaseUrl.replace(/\/$/, "") + "/graphql/v1";

function createBuzzApolloClient() {
  return new ApolloClient({
    link: new HttpLink({
      uri: graphqlUrl,
      headers: {
        apikey: supabaseAnonKey,
        authorization: supabaseAnonKey ? `Bearer ${supabaseAnonKey}` : ""
      }
    }),
    cache: new InMemoryCache()
  });
}

function AdminDashboard(): ReactElement {
  const { data, loading, error } = useAdminDashboardQuery();
  const interests = data?.interestsCollection?.edges.map((edge) => edge.node) ?? fallbackInterests;
  const businesses = data?.businessesCollection?.edges.map((edge) => edge.node) ?? fallbackBusinesses;
  const events = data?.eventsCollection?.edges.map((edge) => edge.node) ?? fallbackEvents;
  const citySettings = data?.citySettingsCollection?.edges.map((edge) => edge.node) ?? fallbackCitySettings;
  const reports = data?.reportsCollection?.edges.map((edge) => edge.node) ?? fallbackReports;
  const activityGroups = data?.activityGroupsCollection?.edges.map((edge) => edge.node) ?? fallbackActivityGroups;
  const reliability = data?.userReliabilityCollection?.edges.map((edge) => edge.node) ?? fallbackReliability;
  const starterPlans = data?.starterPlansCollection?.edges.map((edge) => edge.node) ?? fallbackStarterPlans;
  const connectionStatus = loading
    ? "Loading city data"
    : error
      ? "Showing starter city data while local services start"
      : "Connected to city data";

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
              {interest.name} <span style={{ color: "#667" }}>({interest.category})</span>
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
              {business.description ? <span style={{ color: "#667" }}> - {business.description}</span> : null}
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
                {String(setting.matchingRadiusKm)} km radius, groups {setting.defaultGroupSizeMin}-
                {setting.defaultGroupSizeMax}, {setting.activationExpiryHours}h activation expiry
              </li>
            ))}
          </ul>
        ) : (
          <p>City settings will appear after the local city config seed is available.</p>
        )}
      </section>
      <section>
        <h2>Reports</h2>
        {reports.length > 0 ? (
          <ul>
            {reports.map((report) => (
              <li key={report.id}>
                {report.reason}{" "}
                <span style={{ color: "#667" }}>
                  ({report.category}, {report.status}, {report.createdAt})
                </span>
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
                {group.title} <span style={{ color: "#667" }}>({group.status})</span>
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
                {record.attendedCount} attended, {record.noShowCount} no-shows, {record.feedbackCount} feedback
                <span style={{ color: "#667" }}> ({String(record.reliabilityScore)} score)</span>
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
                {plan.title} <span style={{ color: "#667" }}>({plan.status})</span>
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
  const client = useMemo(() => createBuzzApolloClient(), []);

  return (
    <ApolloProvider client={client}>
      <AdminDashboard />
    </ApolloProvider>
  );
}
