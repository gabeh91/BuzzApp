import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const migrationPath = "../../supabase/migrations/000010_city_config_backfill.sql";
const seedPath = "../../supabase/seed.sql";

test("city config migration adds rollout settings and city-scoped feature flags", () => {
  assert.equal(existsSync(migrationPath), true, "city config backfill migration should exist");

  const migrationSource = readFileSync(migrationPath, "utf8");

  assert.match(migrationSource, /alter table public\.cities/);
  assert.match(migrationSource, /add column if not exists launch_status/);
  assert.match(migrationSource, /add column if not exists default_latitude/);
  assert.match(migrationSource, /add column if not exists default_longitude/);
  assert.match(migrationSource, /create table if not exists public\.city_settings/);
  assert.match(migrationSource, /matching_radius_km/);
  assert.match(migrationSource, /default_group_size_min/);
  assert.match(migrationSource, /default_group_size_max/);
  assert.match(migrationSource, /activation_expiry_hours/);
  assert.match(migrationSource, /create table if not exists public\.city_feature_flags/);
  assert.match(migrationSource, /feature_key/);
  assert.match(migrationSource, /payload_json/);
  assert.match(migrationSource, /create table if not exists public\.city_interests/);
  assert.match(migrationSource, /unique \(city_id, interest_id\)/);
});

test("Melbourne seed data defines MVP city settings, flags, and interest availability", () => {
  const seedSource = readFileSync(seedPath, "utf8");

  assert.match(seedSource, /launch_status/);
  assert.match(seedSource, /'active'/);
  assert.match(seedSource, /insert into public\.city_settings/);
  assert.match(seedSource, /matching_radius_km/);
  assert.match(seedSource, /default_group_size_min/);
  assert.match(seedSource, /default_group_size_max/);
  assert.match(seedSource, /activation_expiry_hours/);
  assert.match(seedSource, /insert into public\.city_feature_flags/);
  assert.match(seedSource, /neighbourhood_matching/);
  assert.match(seedSource, /landing_plan/);
  assert.match(seedSource, /bring_friend/);
  assert.match(seedSource, /safety_checks/);
  assert.match(seedSource, /starter_plans/);
  assert.match(seedSource, /insert into public\.city_interests/);
});
