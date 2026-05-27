import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const migrationPath =
  "../../supabase/migrations/000006_mvp_profile_quiz_matching.sql";
const profileFunctionMigrationPath =
  "../../supabase/migrations/000007_mvp_profile_persistence.sql";
const profileQuizStateMigrationPath =
  "../../supabase/migrations/000027_profile_quiz_state.sql";

const readMigration = () =>
  existsSync(migrationPath) ? readFileSync(migrationPath, "utf8") : "";
const readProfileFunctionMigration = () =>
  existsSync(profileFunctionMigrationPath)
    ? readFileSync(profileFunctionMigrationPath, "utf8")
    : "";
const readProfileQuizStateMigration = () =>
  existsSync(profileQuizStateMigrationPath)
    ? readFileSync(profileQuizStateMigrationPath, "utf8")
    : "";

test("mvp profile persistence migration stores quiz state and match visibility fields", () => {
  const migrationSource = readMigration();

  assert.match(migrationSource, /alter table public\.profiles/);
  assert.match(
    migrationSource,
    /add column if not exists settled boolean not null default false/,
  );
  assert.match(
    migrationSource,
    /add column if not exists visible boolean not null default true/,
  );
  assert.match(
    migrationSource,
    /add column if not exists quiz_answers jsonb not null default '\{\}'::jsonb/,
  );
  assert.match(
    migrationSource,
    /add column if not exists quiz_traits jsonb not null default '\{\}'::jsonb/,
  );
  assert.match(
    migrationSource,
    /add column if not exists last_active_at timestamptz not null default now\(\)/,
  );
  assert.match(
    migrationSource,
    /create index if not exists profiles_mvp_matching_idx/,
  );
});

test("mvp matching and group migration adds explicit lifecycle state", () => {
  const migrationSource = readMigration();

  assert.match(migrationSource, /alter table public\.match_candidates/);
  assert.match(
    migrationSource,
    /add column if not exists status text not null default 'pending'/,
  );
  assert.match(
    migrationSource,
    /add column if not exists responded_at timestamptz/,
  );
  assert.match(
    migrationSource,
    /add column if not exists source text not null default 'deterministic'/,
  );
  assert.match(migrationSource, /match_candidates_status_check/);
  assert.match(
    migrationSource,
    /create index if not exists match_candidates_status_idx/,
  );

  assert.match(migrationSource, /alter table public\.activity_groups/);
  assert.match(
    migrationSource,
    /add column if not exists interest_id uuid references public\.interests\(id\)/,
  );
  assert.match(
    migrationSource,
    /add column if not exists status text not null default 'forming'/,
  );
  assert.match(
    migrationSource,
    /add column if not exists created_by uuid references public\.profiles\(id\)/,
  );
  assert.match(migrationSource, /activity_groups_status_check/);
  assert.match(
    migrationSource,
    /create index if not exists activity_groups_status_idx/,
  );
});

test("mvp chat migration adds message moderation state", () => {
  const migrationSource = readMigration();

  assert.match(migrationSource, /alter table public\.group_messages/);
  assert.match(
    migrationSource,
    /add column if not exists message_type text not null default 'text'/,
  );
  assert.match(
    migrationSource,
    /add column if not exists moderation_status text not null default 'clean'/,
  );
  assert.match(migrationSource, /group_messages_message_type_check/);
  assert.match(migrationSource, /group_messages_moderation_status_check/);
  assert.match(
    migrationSource,
    /create index if not exists group_messages_activity_created_idx/,
  );
});

test("mvp profile persistence function is exposed through authenticated GraphQL only", () => {
  const migrationSource = readProfileFunctionMigration();

  assert.match(
    migrationSource,
    /create or replace function public\."upsertBuzzProfile"/,
  );
  assert.match(migrationSource, /"userId" uuid/);
  assert.match(migrationSource, /"quizAnswers" jsonb/);
  assert.match(migrationSource, /"quizTraits" jsonb/);
  assert.match(migrationSource, /current_user_id uuid := auth\.uid\(\)/);
  assert.match(migrationSource, /if current_user_id is null then/);
  assert.match(migrationSource, /if current_user_id <> "userId" then/);
  assert.match(migrationSource, /insert into public\.profiles/);
  assert.match(migrationSource, /on conflict \(id\) do update/);
  assert.match(
    migrationSource,
    /grant execute on function public\."upsertBuzzProfile"/,
  );
  assert.doesNotMatch(
    migrationSource,
    /grant execute on function public\."upsertBuzzProfile"[\s\S]*to anon/,
  );
});

test("profile quiz state function lets authenticated users check overwrite conflicts", () => {
  const migrationSource = readProfileQuizStateMigration();

  assert.match(
    migrationSource,
    /create or replace function public\."getBuzzProfileQuizState"/,
  );
  assert.match(migrationSource, /current_user_id uuid := auth\.uid\(\)/);
  assert.match(migrationSource, /from public\.profiles/);
  assert.match(migrationSource, /'quizAnswers'/);
  assert.match(migrationSource, /'quizCompleted'/);
  assert.match(migrationSource, /'quizTraits'/);
  assert.match(
    migrationSource,
    /grant execute on function public\."getBuzzProfileQuizState"\(\) to authenticated/,
  );
  assert.doesNotMatch(
    migrationSource,
    /grant execute on function public\."getBuzzProfileQuizState"\(\)[\s\S]*to anon/,
  );
});
