import type { GeneratedFile } from "./types.js";

const sharedFiles: GeneratedFile[] = [
  {
    path: "supabase/functions/_shared/cors.ts",
    contents: `export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
`
  },
  {
    path: "supabase/functions/_shared/errors.ts",
    contents: `export function jsonError(message: string, status = 400): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
`
  },
  {
    path: "supabase/functions/_shared/auth.ts",
    contents: `export function allowLocalDevBypass(appEnv: string | undefined, bypass: string | undefined): boolean {
  return appEnv === "local" && bypass === "true";
}
`
  },
  {
    path: "supabase/functions/_shared/supabase.ts",
    contents: `import { createClient } from "npm:@supabase/supabase-js@2";

export function createServiceRoleClient() {
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  return createClient(url, serviceRoleKey);
}
`
  }
];

const functionNames = [
  "activate-interest",
  "accept-match",
  "decline-match",
  "create-activity-group",
  "recommend-businesses",
  "record-business-lead",
  "generate-match-reason",
  "moderate-profile",
  "stripe-webhook"
];

function functionTemplate(name: string): string {
  const activateResponse =
    name === "activate-interest"
      ? `    return new Response(JSON.stringify({
      ok: true,
      interestId: body.interestId,
      matchedUsers: [],
      message: "Local activation recorded"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });`
      : `    return new Response(JSON.stringify({ ok: true, function: "${name}" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });`;

  return `import { corsHeaders } from "../_shared/cors.ts";
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

${activateResponse}
});
`;
}

export function generateFunctionFiles(): GeneratedFile[] {
  return [
    ...sharedFiles,
    ...functionNames.map((name) => ({
      path: `supabase/functions/${name}/index.ts`,
      contents: functionTemplate(name)
    }))
  ];
}
