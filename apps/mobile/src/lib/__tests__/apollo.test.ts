import assert from "node:assert/strict";
import test from "node:test";

import { createBuzzApolloHeaders } from "../apollo";

test("createBuzzApolloHeaders uses anon key for reads when no user token is present", () => {
  assert.deepEqual(
    createBuzzApolloHeaders({
      appEnv: "local",
      supabaseAnonKey: "anon-key",
    }),
    {
      apikey: "anon-key",
      authorization: "Bearer anon-key",
    },
  );
});

test("createBuzzApolloHeaders prefers a Supabase user token for authenticated mutations", () => {
  assert.deepEqual(
    createBuzzApolloHeaders({
      appEnv: "local",
      supabaseAnonKey: "anon-key",
      localSupabaseAccessToken: "user-token",
    }),
    {
      apikey: "anon-key",
      authorization: "Bearer user-token",
    },
  );
});

test("createBuzzApolloHeaders prefers the stored Supabase session token in hosted envs", () => {
  assert.deepEqual(
    createBuzzApolloHeaders({
      appEnv: "production",
      supabaseAnonKey: "anon-key",
      supabaseAccessToken: "session-token",
    }),
    {
      apikey: "anon-key",
      authorization: "Bearer session-token",
    },
  );
});

test("createBuzzApolloHeaders ignores local user tokens outside local app env", () => {
  assert.deepEqual(
    createBuzzApolloHeaders({
      appEnv: "production",
      supabaseAnonKey: "anon-key",
      localSupabaseAccessToken: "user-token",
    }),
    {
      apikey: "anon-key",
      authorization: "Bearer anon-key",
    },
  );
});
