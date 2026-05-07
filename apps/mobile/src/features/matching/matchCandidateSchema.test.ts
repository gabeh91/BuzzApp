import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const seedSqlSource = readFileSync("../../supabase/seed.sql", "utf8");
const migrationPath = "../../supabase/migrations/000009_mvp_deterministic_candidates.sql";
const migrationSource = existsSync(migrationPath) ? readFileSync(migrationPath, "utf8") : "";

test("mvp deterministic candidate migration scores compatible quiz traits", () => {
  assert.match(migrationSource, /create or replace function public\."activateInterest"/);
  assert.match(migrationSource, /current_profile\.quiz_traits->>'socialStyle'/);
  assert.match(migrationSource, /matched_profile\.quiz_traits->>'socialStyle'/);
  assert.match(migrationSource, /least\(\s*0\.94/);
  assert.match(migrationSource, /as match_score/);
  assert.match(migrationSource, /order by matched_profile\.match_score desc/);
  assert.match(migrationSource, /matched_profile\.visible is true/);
  assert.match(migrationSource, /matched_profile\.settled is false/);
});

test("local seeds include removable mvp demo profiles with active shared interests", () => {
  for (const source of [seedSqlSource, migrationSource]) {
    assert.match(source, /00000000-0000-0000-0000-000000000201/);
    assert.match(source, /Sam Rivera/);
    assert.match(source, /00000000-0000-0000-0000-000000000202/);
    assert.match(source, /Mia Chen/);
    assert.match(source, /quiz_traits/);
    assert.match(source, /'surfing'/);
    assert.match(source, /insert into public\.interest_activations/);
    assert.match(source, /visible = true/);
    assert.match(source, /settled = false/);
  }
});
