import { corsHeaders } from "../_shared/cors.ts";
import { jsonError } from "../_shared/errors.ts";

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return jsonError("Method not allowed", 405);
  return new Response(JSON.stringify({ ok: true, function: "decline-match" }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
});
