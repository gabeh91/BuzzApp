import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const migrationPath =
  "../../supabase/migrations/000024_people_feed_backend.sql";
const migrationSource = existsSync(migrationPath)
  ? readFileSync(migrationPath, "utf8")
  : "";
const demoSeedPath = "../../supabase/seed.demo.sql";
const demoSeedSource = existsSync(demoSeedPath)
  ? readFileSync(demoSeedPath, "utf8")
  : "";
const interestSlugMigrationPath =
  "../../supabase/migrations/000025_people_feed_interest_slugs.sql";
const interestSlugMigrationSource = existsSync(interestSlugMigrationPath)
  ? readFileSync(interestSlugMigrationPath, "utf8")
  : "";

test("people feed backend exposes anonymous-safe profile cards", () => {
  assert.equal(existsSync(migrationPath), true, "people feed migration exists");
  assert.match(migrationSource, /create or replace function public\."getPeopleMatches"/);
  assert.match(migrationSource, /"quizTraits" jsonb/);
  assert.match(migrationSource, /"interestIds" uuid\[\]/);
  assert.match(migrationSource, /returns jsonb/);
  assert.match(migrationSource, /security definer/);
  assert.match(migrationSource, /'peopleMatches'/);
  assert.match(migrationSource, /'profilePhotoUrl'/);
  assert.match(migrationSource, /'sharedInterests'/);
  assert.match(migrationSource, /'compatibilityLine'/);
  assert.match(migrationSource, /'age'/);
  assert.match(
    migrationSource,
    /grant execute on function public\."getPeopleMatches"\(uuid, text, jsonb, uuid\[\], integer\) to anon, authenticated/,
  );
});

test("people feed filters unsafe, unavailable, private, and over-limit profiles", () => {
  assert.match(migrationSource, /profile\.visible is true/);
  assert.match(migrationSource, /profile\.settled is false/);
  assert.match(migrationSource, /profile\.id <> coalesce\(current_user_id/);
  assert.match(migrationSource, /current_date - interval '18 years'/);
  assert.match(migrationSource, /least\(greatest\(coalesce\("limitCount", 20\), 1\), 50\)/);
  assert.match(migrationSource, /from public\.blocks/);
  assert.match(migrationSource, /from public\.reports/);
  assert.match(migrationSource, /from public\.moderation_actions/);
  assert.doesNotMatch(migrationSource, /auth\.users/);
  assert.doesNotMatch(migrationSource, /email/);
});

test("say-hi backend is authenticated and stores connection requests safely", () => {
  assert.match(migrationSource, /create table if not exists public\.connection_requests/);
  assert.match(migrationSource, /check \(requester_id <> recipient_id\)/);
  assert.match(
    migrationSource,
    /check \(status in \('pending', 'accepted', 'declined', 'cancelled'\)\)/,
  );
  assert.match(
    migrationSource,
    /create unique index if not exists connection_requests_pending_unique_idx/,
  );
  assert.match(migrationSource, /alter table public\.connection_requests enable row level security/);
  assert.match(
    migrationSource,
    /create policy "Connection request participants can read"/,
  );
  assert.match(migrationSource, /create or replace function public\."sendConnectionRequest"/);
  assert.match(migrationSource, /raise exception 'Authentication required'/);
  assert.match(migrationSource, /raise exception 'Cannot message yourself'/);
  assert.match(migrationSource, /revoke execute on function public\."sendConnectionRequest"\(uuid, text\) from anon/);
  assert.match(migrationSource, /grant execute on function public\."sendConnectionRequest"\(uuid, text\) to authenticated/);
});

test("profile detail backend returns public-safe people profile data", () => {
  assert.match(migrationSource, /create or replace function public\."getPeopleProfile"/);
  assert.match(migrationSource, /'peopleProfile'/);
  assert.match(migrationSource, /'interests'/);
  assert.match(migrationSource, /'profilePhotoUrl'/);
  assert.match(migrationSource, /'inCityDurationLabel'/);
  assert.match(migrationSource, /profile\.visible is true/);
  assert.match(migrationSource, /profile\.settled is false/);
  assert.match(
    migrationSource,
    /grant execute on function public\."getPeopleProfile"\(uuid\) to anon, authenticated/,
  );
  assert.doesNotMatch(migrationSource, /auth\.users/);
  assert.doesNotMatch(migrationSource, /email/);
});

test("demo seed has explicit people-feed fixtures outside production seed", () => {
  assert.equal(existsSync(demoSeedPath), true, "demo seed exists");
  assert.match(demoSeedSource, /first_name/);
  assert.match(demoSeedSource, /date_of_birth/);
  assert.match(demoSeedSource, /profile_photo_url/);
  assert.match(demoSeedSource, /city_arrived_at/);
  assert.match(demoSeedSource, /insert into public\.user_interests/);
  assert.match(demoSeedSource, /insert into public\.interest_activations/);
});

test("people feed accepts interest slugs from mobile fallback interests", () => {
  assert.equal(
    existsSync(interestSlugMigrationPath),
    true,
    "interest slug compatibility migration exists",
  );
  assert.match(interestSlugMigrationSource, /public\."getPeopleMatchesForDiscover"/);
  assert.match(interestSlugMigrationSource, /"interestSlugs" text\[\]/);
  assert.match(interestSlugMigrationSource, /where interests\.slug = any\("interestSlugs"\)/);
  assert.match(
    interestSlugMigrationSource,
    /grant execute on function public\."getPeopleMatchesForDiscover"\(uuid, text, jsonb, uuid\[\], integer, text\[\]\) to anon, authenticated/,
  );
});
