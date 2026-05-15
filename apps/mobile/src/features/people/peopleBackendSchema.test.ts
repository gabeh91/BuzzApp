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
const connectionRequestInboxMigrationPath =
  "../../supabase/migrations/000029_connection_requests_inbox.sql";
const connectionRequestInboxMigrationSource = existsSync(
  connectionRequestInboxMigrationPath,
)
  ? readFileSync(connectionRequestInboxMigrationPath, "utf8")
  : "";
const connectionRequestResponseMigrationPath =
  "../../supabase/migrations/000030_connection_request_response.sql";
const connectionRequestResponseMigrationSource = existsSync(
  connectionRequestResponseMigrationPath,
)
  ? readFileSync(connectionRequestResponseMigrationPath, "utf8")
  : "";
const requestExpiryMigrationPath =
  "../../supabase/migrations/000031_request_expiry.sql";
const requestExpiryMigrationSource = existsSync(requestExpiryMigrationPath)
  ? readFileSync(requestExpiryMigrationPath, "utf8")
  : "";
const directChatMigrationPath =
  "../../supabase/migrations/000032_direct_chats.sql";
const directChatMigrationSource = existsSync(directChatMigrationPath)
  ? readFileSync(directChatMigrationPath, "utf8")
  : "";
const directChatSafetyMigrationPath =
  "../../supabase/migrations/000033_direct_chat_safety.sql";
const directReportReviewMigrationPath =
  "../../supabase/migrations/000035_direct_report_review_flow.sql";
const directChatSafetyMigrationSource = existsSync(
  directChatSafetyMigrationPath,
)
  ? readFileSync(directChatSafetyMigrationPath, "utf8")
  : "";
const directReportReviewMigrationSource = existsSync(
  directReportReviewMigrationPath,
)
  ? readFileSync(directReportReviewMigrationPath, "utf8")
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

test("say-hi requests are readable by the recipient inbox", () => {
  assert.equal(
    existsSync(connectionRequestInboxMigrationPath),
    true,
    "connection request inbox migration exists",
  );
  assert.match(
    connectionRequestInboxMigrationSource,
    /alter publication supabase_realtime add table public\.connection_requests/,
  );
  assert.match(
    connectionRequestInboxMigrationSource,
    /create or replace function public\."getConnectionRequests"/,
  );
  assert.match(connectionRequestInboxMigrationSource, /recipient_id = auth\.uid\(\)/);
  assert.match(connectionRequestInboxMigrationSource, /'otherName'/);
  assert.match(connectionRequestInboxMigrationSource, /'message'/);
  assert.match(
    connectionRequestInboxMigrationSource,
    /grant execute on function public\."getConnectionRequests"\(\) to authenticated/,
  );
});

test("say-hi requests can be durably accepted or declined by the recipient", () => {
  assert.equal(
    existsSync(connectionRequestResponseMigrationPath),
    true,
    "connection request response migration exists",
  );
  assert.match(
    connectionRequestResponseMigrationSource,
    /create or replace function public\."respondConnectionRequest"/,
  );
  assert.match(
    connectionRequestResponseMigrationSource,
    /normalized_response not in \('accepted', 'declined'\)/,
  );
  assert.match(connectionRequestResponseMigrationSource, /recipient_id = current_user_id/);
  assert.match(connectionRequestResponseMigrationSource, /status = 'pending'/);
  assert.match(connectionRequestResponseMigrationSource, /responded_at = now\(\)/);
  assert.match(
    connectionRequestResponseMigrationSource,
    /grant execute on function public\."respondConnectionRequest"\(uuid, text\) to authenticated/,
  );
});

test("say-hi requests expire from the pending inbox", () => {
  assert.equal(
    existsSync(requestExpiryMigrationPath),
    true,
    "request expiry migration exists",
  );
  assert.match(requestExpiryMigrationSource, /add column if not exists expires_at/);
  assert.match(requestExpiryMigrationSource, /interval '14 days'/);
  assert.match(requestExpiryMigrationSource, /expires_at > now\(\)/);
  assert.match(requestExpiryMigrationSource, /connection_requests_recipient_pending_expiry_idx/);
  assert.match(
    requestExpiryMigrationSource,
    /create or replace function public\."getConnectionRequests"/,
  );
  assert.match(
    requestExpiryMigrationSource,
    /create or replace function public\."respondConnectionRequest"/,
  );
});

test("accepted say-hi requests create a direct chat conversation", () => {
  assert.equal(
    existsSync(directChatMigrationPath),
    true,
    "direct chat migration exists",
  );
  assert.match(
    directChatMigrationSource,
    /create table if not exists public\.direct_conversations/,
  );
  assert.match(
    directChatMigrationSource,
    /create table if not exists public\.direct_messages/,
  );
  assert.match(directChatMigrationSource, /least\(/);
  assert.match(directChatMigrationSource, /greatest\(/);
  assert.match(directChatMigrationSource, /direct_conversations_pair_unique_idx/);
  assert.match(
    directChatMigrationSource,
    /alter publication supabase_realtime add table public\.direct_messages/,
  );
  assert.match(
    directChatMigrationSource,
    /create or replace function public\."respondConnectionRequest"/,
  );
  assert.match(directChatMigrationSource, /directConversationId/);
  assert.match(directChatMigrationSource, /insert into public\.direct_messages/);
  assert.match(
    directChatMigrationSource,
    /create or replace function public\."getDirectMessages"/,
  );
  assert.match(
    directChatMigrationSource,
    /create or replace function public\."sendDirectMessage"/,
  );
  assert.match(
    directChatMigrationSource,
    /create or replace function public\."getChatSummaries"/,
  );
  assert.match(directChatMigrationSource, /'kind', 'direct'/);
  assert.match(
    directChatMigrationSource,
    /grant execute on function public\."getDirectMessages"\(uuid\) to authenticated/,
  );
  assert.match(
    directChatMigrationSource,
    /grant execute on function public\."sendDirectMessage"\(uuid, text\) to authenticated/,
  );
});

test("direct chats can be reported or closed by participants", () => {
  assert.equal(
    existsSync(directChatSafetyMigrationPath),
    true,
    "direct chat safety migration exists",
  );
  assert.match(
    directChatSafetyMigrationSource,
    /alter table public\.direct_conversations/,
  );
  assert.match(directChatSafetyMigrationSource, /add column if not exists status/);
  assert.match(directChatSafetyMigrationSource, /closed_by uuid/);
  assert.match(directChatSafetyMigrationSource, /closed_at timestamptz/);
  assert.match(
    directChatSafetyMigrationSource,
    /check \(status in \('active', 'closed'\)\)/,
  );
  assert.match(
    directChatSafetyMigrationSource,
    /create or replace function public\."leaveDirectConversation"/,
  );
  assert.match(directChatSafetyMigrationSource, /status = 'closed'/);
  assert.match(
    directChatSafetyMigrationSource,
    /create or replace function public\."reportDirectConversation"/,
  );
  assert.match(directChatSafetyMigrationSource, /insert into public\.reports/);
  assert.match(directChatSafetyMigrationSource, /target_user_id/);
  assert.match(directChatSafetyMigrationSource, /directConversationId/);
  assert.match(
    directChatSafetyMigrationSource,
    /where id = "conversationId"\s+and status = 'active'/,
  );
  assert.match(
    directChatSafetyMigrationSource,
    /where direct_conversations\.status = 'active'/,
  );
  assert.match(
    directChatSafetyMigrationSource,
    /grant execute on function public\."leaveDirectConversation"\(uuid\) to authenticated/,
  );
  assert.match(
    directChatSafetyMigrationSource,
    /grant execute on function public\."reportDirectConversation"\(uuid, text, text\) to authenticated/,
  );
});

test("direct chat reports collect review context before admin-approved enforcement", () => {
  assert.equal(
    existsSync(directReportReviewMigrationPath),
    true,
    "direct report review migration exists",
  );
  assert.match(directReportReviewMigrationSource, /needs_review/);
  assert.match(directReportReviewMigrationSource, /drop function if exists public\."reportDirectConversation"\(uuid, text, text\)/);
  assert.match(
    directReportReviewMigrationSource,
    /create or replace function public\."reportDirectConversation"\(\s+"conversationId" uuid,\s+"reason" text[^,]*,\s+"category" text[^,]*,\s+"details" text/s,
  );
  assert.match(directReportReviewMigrationSource, /saved_report\.status/);
  assert.match(directReportReviewMigrationSource, /'needs_review'/);
  assert.match(directReportReviewMigrationSource, /left\(normalized_details, 2000\)/);
  assert.match(directReportReviewMigrationSource, /'requestedAction', 'admin_review_for_block'/);
  assert.match(directReportReviewMigrationSource, /create or replace view public\.admin_safety_reports/);
  assert.match(directReportReviewMigrationSource, /metadata_json/);
  assert.match(
    directReportReviewMigrationSource,
    /grant execute on function public\."reportDirectConversation"\(uuid, text, text, text\) to authenticated/,
  );
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
