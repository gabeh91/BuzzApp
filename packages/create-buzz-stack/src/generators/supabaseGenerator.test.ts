import assert from "node:assert/strict";
import test from "node:test";

import { generateSupabaseFiles } from "./supabaseGenerator.ts";

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
