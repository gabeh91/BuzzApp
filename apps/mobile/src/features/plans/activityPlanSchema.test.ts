import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const migrationPath = "../../supabase/migrations/000014_activity_plans_backfill.sql";

test("activity plans migration adds structured public plan details and confirmation state", () => {
  assert.equal(existsSync(migrationPath), true, "activity plans backfill migration should exist");

  const migrationSource = readFileSync(migrationPath, "utf8");

  assert.match(migrationSource, /create table if not exists public\.activity_plans/);
  assert.match(migrationSource, /activity_group_id uuid not null references public\.activity_groups\(id\)/);
  assert.match(migrationSource, /interest_id uuid references public\.interests\(id\)/);
  assert.match(migrationSource, /city_id uuid references public\.cities\(id\)/);
  assert.match(migrationSource, /activity_name text not null/);
  assert.match(migrationSource, /starts_at timestamptz/);
  assert.match(migrationSource, /public_location_name text not null/);
  assert.match(migrationSource, /capacity_max integer not null default 5/);
  assert.match(migrationSource, /min_group_size integer not null default 3/);
  assert.match(migrationSource, /status text not null default 'proposed'/);
  assert.match(migrationSource, /confirmation_status text not null default 'pending'/);
  assert.match(migrationSource, /safety_guidance text not null/);
  assert.match(migrationSource, /create index if not exists activity_plans_group_status_idx/);
});
