import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const migrationPath = "../../supabase/migrations/000011_suburb_matching_backfill.sql";
const cityLifestyleMigrationPath = "../../supabase/migrations/000018_city_lifestyle_suburb_tags.sql";
const seedPath = "../../supabase/seed.sql";

test("suburb matching migration adds city-scoped suburbs, tags, and stored recommendations", () => {
  assert.equal(existsSync(migrationPath), true, "suburb matching backfill migration should exist");

  const migrationSource = readFileSync(migrationPath, "utf8");

  assert.match(migrationSource, /create table if not exists public\.suburbs/);
  assert.match(migrationSource, /city_id uuid not null references public\.cities\(id\)/);
  assert.match(migrationSource, /slug citext not null/);
  assert.match(migrationSource, /unique \(city_id, slug\)/);
  assert.match(migrationSource, /create table if not exists public\.suburb_tags/);
  assert.match(migrationSource, /tag_key text not null/);
  assert.match(migrationSource, /weight numeric not null/);
  assert.match(migrationSource, /create table if not exists public\.user_suburb_matches/);
  assert.match(migrationSource, /score numeric not null/);
  assert.match(migrationSource, /reasons_json jsonb not null default '\[\]'::jsonb/);
  assert.match(migrationSource, /create index if not exists suburbs_city_name_idx/);
  assert.match(migrationSource, /create index if not exists suburb_tags_key_weight_idx/);
});

test("Melbourne seed data includes enough suburb tag data for deterministic recommendations", () => {
  const seedSource = readFileSync(seedPath, "utf8");

  assert.match(seedSource, /insert into public\.suburbs/);
  assert.match(seedSource, /Fitzroy/);
  assert.match(seedSource, /Brunswick/);
  assert.match(seedSource, /South Yarra/);
  assert.match(seedSource, /St Kilda/);
  assert.match(seedSource, /Collingwood/);
  assert.match(seedSource, /insert into public\.suburb_tags/);
  assert.match(seedSource, /small_group/);
  assert.match(seedSource, /weekend/);
  assert.match(seedSource, /learn/);
});

test("city lifestyle suburb tag backfill adds real suburb-fit signals", () => {
  assert.equal(existsSync(cityLifestyleMigrationPath), true, "city lifestyle suburb tag backfill migration should exist");

  const migrationSource = readFileSync(cityLifestyleMigrationPath, "utf8");

  assert.match(migrationSource, /beach/);
  assert.match(migrationSource, /music/);
  assert.match(migrationSource, /food/);
  assert.match(migrationSource, /creative/);
  assert.match(migrationSource, /walkability/);
  assert.match(migrationSource, /budget/);
  assert.match(migrationSource, /quiet/);
  assert.match(migrationSource, /public_transport/);
});
