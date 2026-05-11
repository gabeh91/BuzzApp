import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const migrationPath =
  "../../supabase/migrations/000010_city_config_backfill.sql";
const scopeMigrationPath =
  "../../supabase/migrations/000019_mvp_feature_flag_scope.sql";
const seedPath = "../../supabase/seed.sql";

test("city config migration adds rollout settings and city-scoped feature flags", () => {
  assert.equal(
    existsSync(migrationPath),
    true,
    "city config backfill migration should exist",
  );

  const migrationSource = readFileSync(migrationPath, "utf8");

  assert.match(migrationSource, /alter table public\.cities/);
  assert.match(migrationSource, /add column if not exists launch_status/);
  assert.match(migrationSource, /add column if not exists default_latitude/);
  assert.match(migrationSource, /add column if not exists default_longitude/);
  assert.match(
    migrationSource,
    /create table if not exists public\.city_settings/,
  );
  assert.match(migrationSource, /matching_radius_km/);
  assert.match(migrationSource, /default_group_size_min/);
  assert.match(migrationSource, /default_group_size_max/);
  assert.match(migrationSource, /activation_expiry_hours/);
  assert.match(
    migrationSource,
    /create table if not exists public\.city_feature_flags/,
  );
  assert.match(migrationSource, /environment text not null default 'local'/);
  assert.match(migrationSource, /feature_key/);
  assert.match(migrationSource, /payload_json/);
  assert.match(
    migrationSource,
    /create table if not exists public\.city_interests/,
  );
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
  assert.match(seedSource, /bring_friend_enabled/);
  assert.match(seedSource, /basic_safety_enabled/);
  assert.match(seedSource, /melbourne_starting_point_enabled/);
  assert.match(seedSource, /text_only_chat_enabled/);
  assert.match(seedSource, /group_first_matching_enabled/);
  assert.match(seedSource, /city_config_enabled/);
  assert.match(seedSource, /landing_plan_enabled', false/);
  assert.match(seedSource, /full_neighbourhood_recommender_enabled', false/);
  assert.match(seedSource, /starter_plans_enabled', false/);
  assert.match(seedSource, /insert into public\.city_interests/);
});

test("MVP scope migration adds environment-aware remote feature flag defaults", () => {
  assert.equal(
    existsSync(scopeMigrationPath),
    true,
    "MVP feature flag scope migration should exist",
  );

  const migrationSource = readFileSync(scopeMigrationPath, "utf8");

  assert.match(migrationSource, /alter table public\.feature_flags/);
  assert.match(migrationSource, /add column if not exists environment/);
  assert.match(migrationSource, /add column if not exists city_id/);
  assert.match(migrationSource, /add column if not exists payload_json/);
  assert.match(migrationSource, /bring_friend_enabled', true/);
  assert.match(migrationSource, /basic_safety_enabled', true/);
  assert.match(migrationSource, /melbourne_starting_point_enabled', true/);
  assert.match(migrationSource, /landing_plan_enabled', false/);
  assert.match(migrationSource, /media_chat_enabled', false/);
});
