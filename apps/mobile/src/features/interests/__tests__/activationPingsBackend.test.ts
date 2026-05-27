import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const migrationPath =
  "../../supabase/migrations/000028_activation_pings_realtime.sql";
const acceptFlowFixMigrationPath =
  "../../supabase/migrations/000034_activation_ping_accept_flow_fix.sql";
const displayFallbackMigrationPath =
  "../../supabase/migrations/000043_activation_ping_display_fallbacks.sql";
const cancelActivationMigrationPath =
  "../../supabase/migrations/000044_cancel_interest_activation.sql";
const activationRateLimitMigrationPath =
  "../../supabase/migrations/000046_activation_rate_limits.sql";

test("activation pings migration adds realtime-safe ping tables and response functions", () => {
  assert.equal(
    existsSync(migrationPath),
    true,
    "activation pings migration should exist",
  );

  const source = readFileSync(migrationPath, "utf8");

  assert.match(source, /create table if not exists public\.activation_pings/);
  assert.match(source, /create table if not exists public\.activation_ping_events/);
  assert.match(source, /create table if not exists public\.notification_outbox/);
  assert.match(source, /create table if not exists public\.profile_devices/);
  assert.match(source, /alter table public\.activity_group_members[\s\S]*source_ping_id/);
  assert.match(source, /alter table public\.group_messages[\s\S]*metadata/);
  assert.match(source, /alter publication supabase_realtime add table public\.activation_pings/);
  assert.match(source, /create or replace function public\."activateInterest"/);
  assert.match(source, /insert into public\.activation_pings/);
  assert.match(source, /insert into public\.notification_outbox/);
  assert.match(source, /'pingCount'/);
  assert.match(source, /'responseSummary'/);
  assert.match(source, /create or replace function public\."respondToActivationPing"/);
  assert.match(source, /response text/);
  assert.match(source, /activity_group_members[\s\S]*source_ping_id/);
  assert.match(source, /group_messages[\s\S]*message_type[\s\S]*'system'/);
  assert.match(source, /create or replace function public\."getIncomingActivationPings"/);
  assert.match(source, /create or replace function public\."getOutgoingActivationSummary"/);
  assert.match(source, /create or replace function public\."getChatSummaries"/);
  assert.match(source, /grant execute on function public\."respondToActivationPing"\(uuid, text\) to authenticated/);
});

test("activation ping acceptance writes a valid group system message", () => {
  assert.equal(
    existsSync(acceptFlowFixMigrationPath),
    true,
    "activation ping accept flow fix migration should exist",
  );

  const source = readFileSync(acceptFlowFixMigrationPath, "utf8");

  assert.match(source, /create or replace function public\."respondToActivationPing"/);
  assert.match(source, /insert into public\.group_messages \(/);
  assert.match(source, /activity_group_id/);
  assert.doesNotMatch(
    source,
    /insert into public\.group_messages \(\s*resolved_activity_group_id/,
  );
  assert.match(source, /grant execute on function public\."respondToActivationPing"\(uuid, text\) to authenticated/);
});

test("incoming activation pings use user-facing fallback copy", () => {
  assert.equal(
    existsSync(displayFallbackMigrationPath),
    true,
    "activation ping display fallback migration should exist",
  );

  const source = readFileSync(displayFallbackMigrationPath, "utf8");

  assert.match(source, /create or replace function public\."getIncomingActivationPings"/);
  assert.match(source, /existingDirectConversationId/);
  assert.match(source, /direct_conversations/);
  assert.match(source, /Someone nearby/);
  assert.match(source, /this activity/);
  assert.doesNotMatch(source, /Buzz Member/);
});

test("outgoing activation pings can be cancelled by the sender", () => {
  assert.equal(
    existsSync(cancelActivationMigrationPath),
    true,
    "activation ping cancellation migration should exist",
  );

  const source = readFileSync(cancelActivationMigrationPath, "utf8");

  assert.match(source, /create or replace function public\."cancelInterestActivation"/);
  assert.match(source, /status = 'cancelled'/);
  assert.match(source, /activation_ping_events[\s\S]*'cancelled'/);
  assert.match(source, /'interestSlug'/);
  assert.match(source, /grant execute on function public\."cancelInterestActivation"\(uuid\) to authenticated/);
});

test("interest activation is rate limited per activity and per day", () => {
  assert.equal(
    existsSync(activationRateLimitMigrationPath),
    true,
    "activation rate-limit migration should exist",
  );

  const source = readFileSync(activationRateLimitMigrationPath, "utf8");

  assert.match(source, /create table if not exists public\.interest_activation_attempts/);
  assert.match(source, /interval '10 minutes'/);
  assert.match(source, /daily_limit integer := 20/);
  assert.match(source, /rate_limited_activity/);
  assert.match(source, /rate_limited_daily/);
  assert.match(source, /retryAfterSeconds/);
  assert.match(source, /insert into public\.interest_activation_attempts/);
  assert.match(source, /grant execute on function public\."activateInterest"\(uuid\) to authenticated/);
});
