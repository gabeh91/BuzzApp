import { corsHeaders } from "../_shared/cors.ts";
import { jsonError } from "../_shared/errors.ts";

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonError("Method not allowed", 405);
  }

  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return jsonError("Invalid JSON body");
  }

  return new Response(
    JSON.stringify({
      ok: true,
      interestId: body.interestId,
      matchedUsers: [],
      message: "Local activation recorded"
    }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    }
  );
});
