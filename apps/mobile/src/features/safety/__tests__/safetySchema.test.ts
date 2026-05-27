import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const migrationPath = "../../supabase/migrations/000013_safety_backfill.sql";

test("safety migration adds user settings, verification, moderation, and reliability primitives", () => {
  assert.equal(existsSync(migrationPath), true, "safety backfill migration should exist");

  const migrationSource = readFileSync(migrationPath, "utf8");

  assert.match(migrationSource, /create table if not exists public\.user_safety_settings/);
  assert.match(migrationSource, /share_exact_location boolean not null default false/);
  assert.match(migrationSource, /require_public_meeting boolean not null default true/);
  assert.match(migrationSource, /create table if not exists public\.user_verifications/);
  assert.match(migrationSource, /verification_type text not null/);
  assert.match(migrationSource, /status text not null default 'pending'/);
  assert.match(migrationSource, /alter table public\.reports/);
  assert.match(migrationSource, /add column if not exists activity_group_id uuid references public\.activity_groups\(id\)/);
  assert.match(migrationSource, /add column if not exists status text not null default 'open'/);
  assert.match(migrationSource, /create table if not exists public\.moderation_actions/);
  assert.match(migrationSource, /action_type text not null/);
  assert.match(migrationSource, /create table if not exists public\.plan_safety_checks/);
  assert.match(migrationSource, /location_visibility text not null default 'area_only'/);
  assert.match(migrationSource, /create table if not exists public\.user_reliability/);
  assert.match(migrationSource, /reliability_score numeric not null default 1/);
  assert.match(migrationSource, /create table if not exists public\.activity_risk_levels/);
  assert.match(migrationSource, /risk_level text not null default 'low'/);
  assert.match(migrationSource, /create index if not exists reports_status_created_idx/);
});
