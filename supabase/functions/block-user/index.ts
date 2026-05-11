import { resolveCurrentProfile } from "../_shared/auth.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { jsonError } from "../_shared/errors.ts";
import { createServiceRoleClient } from "../_shared/supabase.ts";

type BlockInput = {
  blockedId: string;
  activityGroupId?: string;
};

type BlockRow = {
  id: string;
  blocked_id: string;
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

const trimOptional = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const readBlockInput = async (request: Request): Promise<BlockInput> => {
  const body = await request.json().catch(() => ({}));
  const blockedId = trimOptional(body.blockedId);
  const activityGroupId = trimOptional(body.activityGroupId);

  if (!blockedId) {
    throw new Error("blockedId is required");
  }

  const input: BlockInput = { blockedId };
  if (activityGroupId) input.activityGroupId = activityGroupId;

  return input;
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS")
    return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST")
    return jsonError("Method not allowed", 405, corsHeaders);

  const serviceClient = createServiceRoleClient();

  try {
    const { blockedId } = await readBlockInput(request);
    const { profileId } = await resolveCurrentProfile(request, serviceClient);

    if (blockedId === profileId) {
      throw new Error("blockedId cannot match current profile");
    }

    const { data: block, error } = await serviceClient
      .from("blocks")
      .insert({
        blocked_id: blockedId,
        blocker_id: profileId,
      })
      .select("id, blocked_id")
      .single<BlockRow>();

    if (error) throw error;

    return jsonResponse({
      ok: true,
      blockId: block.id,
      blockedId: block.blocked_id,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to block member";
    const status = message === "Authentication required" ? 401 : 400;
    return jsonError(message, status, corsHeaders);
  }
});
