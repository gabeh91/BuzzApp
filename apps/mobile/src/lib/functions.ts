export type MatchAction = "accept" | "decline";

export type MatchActionResult = {
  ok: boolean;
  matchCandidateId: string;
  status: "accepted" | "declined";
  activityGroupId?: string;
};

export type CreateMatchActionRequestInput = {
  action: MatchAction;
  matchCandidateId: string;
  accessToken?: string;
  profileId?: string;
  appEnv?: string;
  supabaseAnonKey?: string;
  supabaseUrl?: string;
};

export type MatchActionRequest = {
  url: string;
  init: RequestInit;
};

const defaultSupabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321";
const defaultSupabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";
const defaultAppEnv = process.env.EXPO_PUBLIC_APP_ENV ?? "local";

const functionNameByAction: Record<MatchAction, string> = {
  accept: "accept-match",
  decline: "decline-match"
};

export const createBuzzFunctionUrl = (functionName: string, supabaseUrl = defaultSupabaseUrl): string => {
  return `${supabaseUrl.replace(/\/$/, "")}/functions/v1/${functionName}`;
};

export const createMatchActionRequest = ({
  action,
  matchCandidateId,
  accessToken,
  profileId,
  appEnv = defaultAppEnv,
  supabaseAnonKey = defaultSupabaseAnonKey,
  supabaseUrl = defaultSupabaseUrl
}: CreateMatchActionRequestInput): MatchActionRequest => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };

  if (supabaseAnonKey) {
    headers.apikey = supabaseAnonKey;
  }

  if (accessToken) {
    headers.authorization = `Bearer ${accessToken}`;
  }

  if (appEnv === "local" && profileId) {
    headers["x-buzz-local-bypass"] = "true";
    headers["x-buzz-profile-id"] = profileId;
  }

  return {
    url: createBuzzFunctionUrl(functionNameByAction[action], supabaseUrl),
    init: {
      body: JSON.stringify({ matchCandidateId }),
      headers,
      method: "POST"
    }
  };
};

export const runMatchAction = async (
  input: CreateMatchActionRequestInput,
  fetcher: typeof fetch = fetch
): Promise<MatchActionResult> => {
  const request = createMatchActionRequest(input);
  const response = await fetcher(request.url, request.init);
  const body = (await response.json()) as Partial<MatchActionResult> & { error?: string };

  if (!response.ok || !body.ok || !body.matchCandidateId || !body.status) {
    throw new Error(body.error ?? "Unable to update match");
  }

  const result: MatchActionResult = {
    ok: true,
    matchCandidateId: body.matchCandidateId,
    status: body.status
  };

  if (body.activityGroupId) {
    result.activityGroupId = body.activityGroupId;
  }

  return result;
};
