import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const migrationPath = "../../supabase/migrations/000015_matching_safety_backfill.sql";

test("activation matching backfill adds availability, rate limit, risk, and safety-aware matching", () => {
  assert.equal(existsSync(migrationPath), true, "matching safety backfill migration should exist");

  const migrationSource = readFileSync(migrationPath, "utf8");

  assert.match(migrationSource, /alter table public\.interest_activations/);
  assert.match(migrationSource, /add column if not exists availability_window text not null default 'this_week'/);
  assert.match(migrationSource, /add column if not exists preferred_time text not null default 'flexible'/);
  assert.match(migrationSource, /add column if not exists urgency text not null default 'soon'/);
  assert.match(migrationSource, /add column if not exists expires_at timestamptz/);
  assert.match(migrationSource, /add column if not exists rate_limit_key text/);
  assert.match(migrationSource, /create or replace function public\."activateInterest"/);
  assert.match(migrationSource, /from public\.city_settings/);
  assert.match(migrationSource, /activation_expiry_hours/);
  assert.match(migrationSource, /default_group_size_min/);
  assert.match(migrationSource, /public\.activity_risk_levels/);
  assert.match(migrationSource, /availability_overlap/);
  assert.match(migrationSource, /matched_activation\.expires_at > now\(\)/);
  assert.match(migrationSource, /from public\.blocks/);
  assert.match(migrationSource, /from public\.reports/);
  assert.match(migrationSource, /from public\.moderation_actions/);
  assert.match(migrationSource, /grant execute on function public\."activateInterest"\(uuid\) to authenticated/);
});
