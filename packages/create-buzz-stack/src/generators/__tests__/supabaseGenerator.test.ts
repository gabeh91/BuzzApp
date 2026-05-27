import assert from "node:assert/strict";
import test from "node:test";

import { generateSupabaseFiles } from "../supabaseGenerator.ts";

const expandedInterestSlugs = [
  "golf",
  "knitting",
  "chess",
  "walking",
  "hackathons",
  "book-clubs",
  "wine-clubs",
  "pottery-classes",
  "rock-climbing",
  "soccer",
  "archery",
  "basketball",
  "netball",
  "volleyball",
  "ultimate-frisbee",
  "touch-rugby",
  "pickleball",
  "yoga",
  "photography-walks",
  "trivia-nights",
  "gardening"
];

test("supabase scaffold enables pg_graphql and exposes an activation mutation", () => {
  const files = generateSupabaseFiles();
  const extensions = files.find((file) => file.path === "supabase/migrations/000001_initial_extensions.sql");
  const graphqlMigration = files.find((file) => file.path === "supabase/migrations/000004_graphql_api.sql");

  assert.ok(extensions);
  assert.match(extensions.contents, /create extension if not exists pg_graphql/);
  assert.ok(graphqlMigration);
  assert.match(graphqlMigration.contents, /inflect_names/);
  assert.match(graphqlMigration.contents, /create or replace function public\."activateInterest"/);
  assert.match(graphqlMigration.contents, /grant execute on function public\."activateInterest"\(uuid\) to anon, authenticated/);
});

test("supabase scaffold includes the expanded starter interests as seed data and a forward migration", () => {
  const files = generateSupabaseFiles();
  const seedSql = files.find((file) => file.path === "supabase/seed.sql");
  const migration = files.find((file) => file.path === "supabase/migrations/000005_expand_starter_interests.sql");

  assert.ok(seedSql);
  assert.ok(migration);
  assert.match(migration.contents, /insert into public\.interests \(name, slug, category\)/);
  assert.match(migration.contents, /on conflict \(slug\) do nothing/);

  for (const slug of expandedInterestSlugs) {
    assert.match(seedSql.contents, new RegExp(`'${slug}'`));
    assert.match(migration.contents, new RegExp(`'${slug}'`));
  }
});

test("supabase scaffold includes mvp profile quiz and matching persistence migration", () => {
  const files = generateSupabaseFiles();
  const migration = files.find((file) => file.path === "supabase/migrations/000006_mvp_profile_quiz_matching.sql");

  assert.ok(migration);
  assert.match(migration.contents, /add column if not exists quiz_answers jsonb/);
  assert.match(migration.contents, /add column if not exists quiz_traits jsonb/);
  assert.match(migration.contents, /add column if not exists visible boolean not null default true/);
  assert.match(migration.contents, /add column if not exists status text not null default 'pending'/);
  assert.match(migration.contents, /create index if not exists profiles_quiz_traits_gin_idx/);
});

test("supabase scaffold includes authenticated profile persistence function migration", () => {
  const files = generateSupabaseFiles();
  const migration = files.find((file) => file.path === "supabase/migrations/000007_mvp_profile_persistence.sql");

  assert.ok(migration);
  assert.match(migration.contents, /create or replace function public\."upsertBuzzProfile"/);
  assert.match(migration.contents, /current_user_id uuid := auth\.uid\(\)/);
  assert.match(migration.contents, /if current_user_id <> "userId" then/);
  assert.match(migration.contents, /grant execute on function public\."upsertBuzzProfile"/);
  assert.doesNotMatch(migration.contents, /grant execute on function public\."upsertBuzzProfile"[\s\S]*to anon/);
});

test("supabase scaffold includes backend interest activation matching migration", () => {
  const files = generateSupabaseFiles();
  const migration = files.find((file) => file.path === "supabase/migrations/000008_mvp_activation_matching.sql");

  assert.ok(migration);
  assert.match(migration.contents, /create or replace function public\."activateInterest"/);
  assert.match(migration.contents, /interest_activations_active_unique_idx/);
  assert.match(migration.contents, /match_candidates_activation_user_unique_idx/);
  assert.match(migration.contents, /current_activation_id uuid/);
  assert.doesNotMatch(migration.contents, /declare[\s\S]*\n  activation_id uuid/);
  assert.match(migration.contents, /'matchCandidates'/);
  assert.match(migration.contents, /grant execute on function public\."activateInterest"\(uuid\) to authenticated/);
  assert.doesNotMatch(migration.contents, /grant execute on function public\."activateInterest"\(uuid\) to anon/);
});

test("supabase scaffold includes deterministic candidate scoring and demo match fixtures", () => {
  const files = generateSupabaseFiles();
  const seedSql = files.find((file) => file.path === "supabase/seed.sql");
  const demoSeedSql = files.find((file) => file.path === "supabase/seed.demo.sql");
  const migration = files.find((file) => file.path === "supabase/migrations/000009_mvp_deterministic_candidates.sql");
  const cleanupMigration = files.find(
    (file) => file.path === "supabase/migrations/000023_remove_demo_fixture_data.sql"
  );

  assert.ok(seedSql);
  assert.ok(demoSeedSql);
  assert.ok(migration);
  assert.ok(cleanupMigration);
  assert.match(migration.contents, /current_profile\.quiz_traits->>'socialStyle'/);
  assert.match(migration.contents, /least\(\s*0\.94/);
  assert.match(migration.contents, /order by matched_profile\.match_score desc/);
  assert.doesNotMatch(seedSql.contents, /Sam Rivera/);
  assert.doesNotMatch(migration.contents, /Sam Rivera/);
  assert.match(cleanupMigration.contents, /delete from public\.profiles/);
  assert.match(cleanupMigration.contents, /Northside Tennis/);

  for (const source of [demoSeedSql.contents]) {
    assert.match(source, /00000000-0000-0000-0000-000000000201/);
    assert.match(source, /Sam Rivera/);
    assert.match(source, /00000000-0000-0000-0000-000000000202/);
    assert.match(source, /Mia Chen/);
    assert.match(source, /insert into public\.interest_activations/);
  }
});
