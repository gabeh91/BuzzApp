import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const migrationPath = "../../supabase/migrations/000012_landing_plan_backfill.sql";

test("landing plan migration adds deterministic journey tables", () => {
  assert.equal(existsSync(migrationPath), true, "landing plan backfill migration should exist");

  const migrationSource = readFileSync(migrationPath, "utf8");

  assert.match(migrationSource, /create table if not exists public\.landing_plans/);
  assert.match(migrationSource, /user_id uuid not null references public\.profiles\(id\)/);
  assert.match(migrationSource, /city_id uuid not null references public\.cities\(id\)/);
  assert.match(migrationSource, /status text not null default 'active'/);
  assert.match(migrationSource, /generated_at timestamptz not null default now\(\)/);
  assert.match(migrationSource, /create table if not exists public\.landing_plan_items/);
  assert.match(migrationSource, /item_type text not null/);
  assert.match(migrationSource, /week_number integer not null/);
  assert.match(migrationSource, /sort_order integer not null/);
  assert.match(migrationSource, /create table if not exists public\.plan_recipes/);
  assert.match(migrationSource, /safety_defaults_json jsonb not null default '\{\}'::jsonb/);
  assert.match(migrationSource, /create table if not exists public\.user_social_preferences/);
  assert.match(migrationSource, /social_comfort_mode/);
  assert.match(migrationSource, /prefer_no_chat_needed/);
  assert.match(migrationSource, /create table if not exists public\.repeat_connection_preferences/);
  assert.match(migrationSource, /would_meet_again/);
  assert.match(migrationSource, /create index if not exists landing_plan_items_plan_sort_idx/);
});
