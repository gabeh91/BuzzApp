import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const seedSqlSource = readFileSync("../../supabase/seed.sql", "utf8");
const demoSeedPath = "../../supabase/seed.demo.sql";
const demoSeedSource = existsSync(demoSeedPath)
  ? readFileSync(demoSeedPath, "utf8")
  : "";
const migrationPath = "../../supabase/migrations/000009_mvp_deterministic_candidates.sql";
const migrationSource = existsSync(migrationPath) ? readFileSync(migrationPath, "utf8") : "";
const demoCleanupMigrationPath =
  "../../supabase/migrations/000023_remove_demo_fixture_data.sql";
const demoCleanupMigrationSource = existsSync(demoCleanupMigrationPath)
  ? readFileSync(demoCleanupMigrationPath, "utf8")
  : "";

test("mvp deterministic candidate migration scores compatible quiz traits", () => {
  assert.match(migrationSource, /create or replace function public\."activateInterest"/);
  assert.match(migrationSource, /current_profile\.quiz_traits->>'socialStyle'/);
  assert.match(migrationSource, /matched_profile\.quiz_traits->>'socialStyle'/);
  assert.match(migrationSource, /least\(\s*0\.94/);
  assert.match(migrationSource, /as match_score/);
  assert.match(migrationSource, /order by matched_profile\.match_score desc/);
  assert.match(migrationSource, /matched_profile\.visible is true/);
  assert.match(migrationSource, /matched_profile\.settled is false/);
  assert.doesNotMatch(migrationSource, /with demo_profiles/);
  assert.doesNotMatch(migrationSource, /Sam Rivera/);
});

test("production seed excludes removable mvp demo profiles", () => {
  assert.doesNotMatch(seedSqlSource, /00000000-0000-0000-0000-000000000201/);
  assert.doesNotMatch(seedSqlSource, /Sam Rivera/);
  assert.doesNotMatch(seedSqlSource, /00000000-0000-0000-0000-000000000202/);
  assert.doesNotMatch(seedSqlSource, /Mia Chen/);
  assert.doesNotMatch(seedSqlSource, /with demo_profiles/);
  assert.doesNotMatch(seedSqlSource, /insert into public\.profiles/);
  assert.doesNotMatch(seedSqlSource, /insert into public\.interest_activations/);
});

test("explicit demo seed includes removable mvp demo profiles with active shared interests", () => {
  assert.equal(existsSync(demoSeedPath), true, "demo seed should be explicit");
  assert.match(demoSeedSource, /00000000-0000-0000-0000-000000000201/);
  assert.match(demoSeedSource, /Sam Rivera/);
  assert.match(demoSeedSource, /00000000-0000-0000-0000-000000000202/);
  assert.match(demoSeedSource, /Mia Chen/);
  assert.match(demoSeedSource, /quiz_traits/);
  assert.match(demoSeedSource, /'surfing'/);
  assert.match(demoSeedSource, /insert into public\.interest_activations/);
  assert.match(demoSeedSource, /visible = true/);
  assert.match(demoSeedSource, /settled = false/);
});

test("remote-safe migrations remove any old demo fixture rows", () => {
  assert.equal(
    existsSync(demoCleanupMigrationPath),
    true,
    "demo cleanup migration should exist",
  );
  assert.match(demoCleanupMigrationSource, /delete from public\.profiles/);
  assert.match(demoCleanupMigrationSource, /00000000-0000-0000-0000-000000000201/);
  assert.match(demoCleanupMigrationSource, /00000000-0000-0000-0000-000000000202/);
  assert.match(demoCleanupMigrationSource, /Northside Tennis/);
  assert.match(demoCleanupMigrationSource, /Welcome Picnic/);
});
