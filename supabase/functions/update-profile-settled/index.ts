import { resolveCurrentProfile } from "../_shared/auth.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { jsonError } from "../_shared/errors.ts";
import { createServiceRoleClient } from "../_shared/supabase.ts";

type SettledInput = {
  settled: boolean;
};

type ProfileAvailabilityRow = {
  id: string;
  settled: boolean;
  visible: boolean;
};

const jsonResponse = (
  body: Record<string, unknown>,
  status = 200,
): Response => {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
};

const readSettledInput = async (request: Request): Promise<SettledInput> => {
  const body = await request.json().catch(() => ({}));

  if (typeof body.settled !== "boolean") {
    throw new Error("settled is required");
  }

  return { settled: body.settled };
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS")
    return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST")
    return jsonError("Method not allowed", 405, corsHeaders);

  const serviceClient = createServiceRoleClient();

  try {
    const { settled } = await readSettledInput(request);
    const { profileId } = await resolveCurrentProfile(request, serviceClient);
    const visible = !settled;

    const { data: profile, error: profileError } = await serviceClient
      .from("profiles")
      .update({
        last_active_at: new Date().toISOString(),
        settled,
        updated_at: new Date().toISOString(),
        visible,
      })
      .eq("id", profileId)
      .select("id, settled, visible")
      .single<ProfileAvailabilityRow>();

    if (profileError) throw profileError;

    return jsonResponse({
      ok: true,
      profileId: profile.id,
      settled: profile.settled,
      visible: profile.visible,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to update matching availability";
    const status = message === "Authentication required" ? 401 : 400;
    return jsonError(message, status, corsHeaders);
  }
});
