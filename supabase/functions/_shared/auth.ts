import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

export type ResolvedProfile = {
  profileId: string;
  source: "local" | "supabase";
};

export function allowLocalDevBypass(
  appEnv: string | undefined,
  bypass: string | undefined,
): boolean {
  return appEnv === "local" && bypass === "true";
}

export async function ensureProfileForUser(
  serviceClient: SupabaseClient,
  profileId: string,
): Promise<void> {
  const { error } = await serviceClient
    .from("profiles")
    .upsert({ id: profileId }, { ignoreDuplicates: true, onConflict: "id" });

  if (error) throw error;
}

const readBearerToken = (request: Request): string | null => {
  const authorization = request.headers.get("authorization") ?? "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
};

export async function resolveCurrentProfile(
  request: Request,
  serviceClient: SupabaseClient,
): Promise<ResolvedProfile> {
  const token = readBearerToken(request);

  if (token) {
    const { data, error } = await serviceClient.auth.getUser(token);

    if (!error && data.user?.id) {
      return {
        profileId: data.user.id,
        source: "supabase",
      };
    }
  }

  const bypassProfileId = request.headers.get("x-buzz-profile-id") ?? undefined;
  const bypassEnabled = allowLocalDevBypass(
    Deno.env.get("APP_ENV"),
    request.headers.get("x-buzz-local-bypass") ?? undefined,
  );

  if (bypassEnabled && bypassProfileId) {
    return {
      profileId: bypassProfileId,
      source: "local",
    };
  }

  throw new Error("Authentication required");
}
