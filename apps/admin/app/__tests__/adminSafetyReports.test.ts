import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const pageSource = readFileSync("app/page.tsx", "utf8");
const operationsSource = readFileSync("graphql/operations.graphql", "utf8");
const migrationSource = [
  "../../supabase/migrations/000035_direct_report_review_flow.sql",
  "../../supabase/migrations/000036_admin_report_block_review.sql",
]
  .map((path) => readFileSync(path, "utf8"))
  .join("\n");
const reviewRoutePath = "app/api/safety-reports/[reportId]/route.ts";
const reviewRouteSource = existsSync(reviewRoutePath)
  ? readFileSync(reviewRoutePath, "utf8")
  : "";
const dashboardRoutePath = "app/api/admin-dashboard/route.ts";
const dashboardRouteSource = existsSync(dashboardRoutePath)
  ? readFileSync(dashboardRoutePath, "utf8")
  : "";

test("admin dashboard exposes report review context and approval actions", () => {
  assert.match(operationsSource, /details/);
  assert.match(operationsSource, /source/);
  assert.match(operationsSource, /metadataJson/);
  assert.match(pageSource, /reviewSafetyReport/);
  assert.match(pageSource, /approve_block/);
  assert.match(pageSource, /Dismiss report/);
  assert.match(pageSource, /Block approved/);
});

test("admin dashboard reads data through a server-side service-role route", () => {
  assert.equal(existsSync(dashboardRoutePath), true);
  assert.match(dashboardRouteSource, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(dashboardRouteSource, /"reports"/);
  assert.match(dashboardRouteSource, /"user_reliability"/);
  assert.match(dashboardRouteSource, /"city_settings"/);
  assert.match(dashboardRouteSource, /"activity_groups"/);
  assert.match(pageSource, /fetch\("\/api\/admin-dashboard"/);
  assert.doesNotMatch(pageSource, /ApolloProvider/);
  assert.doesNotMatch(pageSource, /useAdminDashboardQuery/);
  assert.doesNotMatch(pageSource, /NEXT_PUBLIC_SUPABASE_ANON_KEY/);
});

test("admin safety report review uses server-side service role access", () => {
  assert.equal(existsSync(reviewRoutePath), true);
  assert.match(reviewRouteSource, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(reviewRouteSource, /approve_block/);
  assert.match(reviewRouteSource, /dismiss/);
  assert.match(reviewRouteSource, /\.from\("blocks"\)/);
  assert.match(reviewRouteSource, /\.from\("reports"\)/);
  assert.doesNotMatch(pageSource, /SUPABASE_SERVICE_ROLE_KEY/);
});

test("admin-approved report blocks have a durable uniqueness boundary", () => {
  assert.match(migrationSource, /blocks_pair_unique_idx/);
  assert.match(migrationSource, /blocker_id, blocked_id/);
});
