import assert from "node:assert/strict";
import test from "node:test";

import { generateSupabaseFiles } from "./supabaseGenerator.ts";

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
