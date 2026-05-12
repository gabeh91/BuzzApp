import assert from "node:assert/strict";
import test from "node:test";

import { resolveSupabaseUrl } from "./supabaseUrlCore";

test("resolveSupabaseUrl keeps iOS and default local Supabase on loopback", () => {
  assert.equal(
    resolveSupabaseUrl({
      appEnv: "local",
      platformOS: "ios",
      supabaseUrl: "http://127.0.0.1:54321",
    }),
    "http://127.0.0.1:54321",
  );
});

test("resolveSupabaseUrl uses Android emulator host for local Supabase", () => {
  assert.equal(
    resolveSupabaseUrl({
      appEnv: "local",
      platformOS: "android",
      supabaseUrl: "http://127.0.0.1:54321",
    }),
    "http://10.0.2.2:54321",
  );
});

test("resolveSupabaseUrl prefers explicit Android local URL when configured", () => {
  assert.equal(
    resolveSupabaseUrl({
      androidSupabaseUrl: "http://10.0.2.2:54321",
      appEnv: "local",
      platformOS: "android",
      supabaseUrl: "http://127.0.0.1:54321",
    }),
    "http://10.0.2.2:54321",
  );
});

test("resolveSupabaseUrl does not rewrite hosted Supabase URLs for Android", () => {
  assert.equal(
    resolveSupabaseUrl({
      androidSupabaseUrl: "http://10.0.2.2:54321",
      appEnv: "production",
      platformOS: "android",
      supabaseUrl: "https://example.supabase.co",
    }),
    "https://example.supabase.co",
  );
});
