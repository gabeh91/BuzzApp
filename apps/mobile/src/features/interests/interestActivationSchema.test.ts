import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const migrationPath = "../../supabase/migrations/000008_mvp_activation_matching.sql";

const readMigration = () => (existsSync(migrationPath) ? readFileSync(migrationPath, "utf8") : "");

test("backend activation migration persists activations and returns deterministic candidates", () => {
  const migrationSource = readMigration();

  assert.match(migrationSource, /create unique index if not exists interest_activations_active_unique_idx/);
  assert.match(migrationSource, /create unique index if not exists match_candidates_activation_user_unique_idx/);
  assert.match(migrationSource, /create or replace function public\."activateInterest"/);
  assert.match(migrationSource, /current_user_id uuid := auth\.uid\(\)/);
  assert.match(migrationSource, /raise exception 'Profile required'/);
  assert.match(migrationSource, /select \*[\s\S]*into current_profile[\s\S]*from public\.profiles/);
  assert.match(migrationSource, /coalesce\(current_profile\.city_id, target_city_id\)/);
  assert.match(migrationSource, /current_activation_id uuid/);
  assert.doesNotMatch(migrationSource, /declare[\s\S]*\n  activation_id uuid/);
  assert.match(migrationSource, /on conflict \(user_id, interest_id\) where status = 'active'/);
  assert.match(migrationSource, /insert into public\.match_candidates/);
  assert.match(migrationSource, /blocked_id = current_user_id/);
  assert.match(migrationSource, /matched_profile\.visible is true/);
  assert.match(migrationSource, /matched_profile\.settled is false/);
  assert.match(migrationSource, /'matchCandidates'/);
  assert.match(migrationSource, /grant execute on function public\."activateInterest"\(uuid\) to authenticated/);
  assert.doesNotMatch(migrationSource, /grant execute on function public\."activateInterest"\(uuid\) to anon/);
});
