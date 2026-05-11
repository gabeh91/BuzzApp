import {
  normalizeCityContext,
  type CityContext,
} from "@/features/city/cityContext";

export type MatchAction = "accept" | "decline";

export type MatchActionResult = {
  ok: boolean;
  matchCandidateId: string;
  status: "accepted" | "declined";
  activityGroupId?: string;
};

export type AttendanceActionResult = {
  ok: boolean;
  activityGroupId: string;
  attendanceStatus: "attended";
  rsvpStatus: "confirmed";
  attendanceConfirmedAt?: string;
};

export type FeedbackActionResult = {
  ok: boolean;
  activityGroupId: string;
  feedbackStatus: "completed";
  positiveFeedbackRecorded: boolean;
  feedbackCompletedAt?: string;
};

export type SettledActionResult = {
  ok: boolean;
  profileId: string;
  settled: boolean;
  visible?: boolean;
};

export type CreateInviteActionResult = {
  ok: boolean;
  inviteId: string;
  token: string;
  tokenPreview: string;
  expiresAt: string;
};

export type ResolveInviteActionResult = {
  ok: boolean;
  inviteId: string;
  activityGroupId: string;
  inviterId: string;
  status: string;
  expiresAt: string;
  activityPlanId?: string;
};

export type AcceptInviteActionResult = {
  ok: boolean;
  inviteId: string;
  activityGroupId: string;
  status: "accepted";
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

export type CreateAttendanceActionRequestInput = {
  activityGroupId: string;
  accessToken?: string;
  profileId?: string;
  appEnv?: string;
  supabaseAnonKey?: string;
  supabaseUrl?: string;
};

export type CreateFeedbackActionRequestInput =
  CreateAttendanceActionRequestInput & {
    feltSafe?: boolean;
  };

export type CreateSettledActionRequestInput = {
  settled: boolean;
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

export type CreateCityContextRequestInput = {
  accessToken?: string;
  cityId?: string;
  cityName?: string;
  supabaseAnonKey?: string;
  supabaseUrl?: string;
};

export type CreateInviteActionRequestInput = {
  activityGroupId: string;
  activityPlanId?: string;
  accessToken?: string;
  profileId?: string;
  appEnv?: string;
  supabaseAnonKey?: string;
  supabaseUrl?: string;
};

export type ResolveInviteActionRequestInput = {
  token: string;
  accessToken?: string;
  supabaseAnonKey?: string;
  supabaseUrl?: string;
};

export type AcceptInviteActionRequestInput = ResolveInviteActionRequestInput & {
  profileId?: string;
  appEnv?: string;
};

const defaultSupabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321";
const defaultSupabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";
const defaultAppEnv = process.env.EXPO_PUBLIC_APP_ENV ?? "local";

const functionNameByAction: Record<MatchAction, string> = {
  accept: "accept-match",
  decline: "decline-match",
};

export const createBuzzFunctionUrl = (
  functionName: string,
  supabaseUrl = defaultSupabaseUrl,
): string => {
  return `${supabaseUrl.replace(/\/$/, "")}/functions/v1/${functionName}`;
};

const createFunctionHeaders = ({
  accessToken,
  appEnv,
  profileId,
  supabaseAnonKey,
}: {
  accessToken?: string | undefined;
  appEnv?: string | undefined;
  profileId?: string | undefined;
  supabaseAnonKey?: string | undefined;
}): Record<string, string> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
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

  return headers;
};

export const createCityContextRequest = ({
  accessToken,
  cityId,
  cityName,
  supabaseAnonKey = defaultSupabaseAnonKey,
  supabaseUrl = defaultSupabaseUrl,
}: CreateCityContextRequestInput): MatchActionRequest => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (supabaseAnonKey) {
    headers.apikey = supabaseAnonKey;
  }

  if (accessToken) {
    headers.authorization = `Bearer ${accessToken}`;
  }

  return {
    url: createBuzzFunctionUrl("get-city-context", supabaseUrl),
    init: {
      body: JSON.stringify({
        ...(cityId ? { cityId } : {}),
        ...(cityName ? { cityName } : {}),
      }),
      headers,
      method: "POST",
    },
  };
};

export const createMatchActionRequest = ({
  action,
  matchCandidateId,
  accessToken,
  profileId,
  appEnv = defaultAppEnv,
  supabaseAnonKey = defaultSupabaseAnonKey,
  supabaseUrl = defaultSupabaseUrl,
}: CreateMatchActionRequestInput): MatchActionRequest => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
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
      method: "POST",
    },
  };
};

export const createAttendanceActionRequest = ({
  activityGroupId,
  accessToken,
  profileId,
  appEnv = defaultAppEnv,
  supabaseAnonKey = defaultSupabaseAnonKey,
  supabaseUrl = defaultSupabaseUrl,
}: CreateAttendanceActionRequestInput): MatchActionRequest => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
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
    url: createBuzzFunctionUrl("record-attendance", supabaseUrl),
    init: {
      body: JSON.stringify({ activityGroupId }),
      headers,
      method: "POST",
    },
  };
};

export const createInviteActionRequest = ({
  accessToken,
  activityGroupId,
  activityPlanId,
  appEnv = defaultAppEnv,
  profileId,
  supabaseAnonKey = defaultSupabaseAnonKey,
  supabaseUrl = defaultSupabaseUrl,
}: CreateInviteActionRequestInput): MatchActionRequest => {
  return {
    url: createBuzzFunctionUrl("create-invite", supabaseUrl),
    init: {
      body: JSON.stringify({
        activityGroupId,
        ...(activityPlanId ? { activityPlanId } : {}),
      }),
      headers: createFunctionHeaders({
        accessToken,
        appEnv,
        profileId,
        supabaseAnonKey,
      }),
      method: "POST",
    },
  };
};

export const createResolveInviteActionRequest = ({
  accessToken,
  supabaseAnonKey = defaultSupabaseAnonKey,
  supabaseUrl = defaultSupabaseUrl,
  token,
}: ResolveInviteActionRequestInput): MatchActionRequest => {
  return {
    url: createBuzzFunctionUrl("resolve-invite", supabaseUrl),
    init: {
      body: JSON.stringify({ token }),
      headers: createFunctionHeaders({
        accessToken,
        supabaseAnonKey,
      }),
      method: "POST",
    },
  };
};

export const createAcceptInviteActionRequest = ({
  accessToken,
  appEnv = defaultAppEnv,
  profileId,
  supabaseAnonKey = defaultSupabaseAnonKey,
  supabaseUrl = defaultSupabaseUrl,
  token,
}: AcceptInviteActionRequestInput): MatchActionRequest => {
  return {
    url: createBuzzFunctionUrl("accept-invite", supabaseUrl),
    init: {
      body: JSON.stringify({ token }),
      headers: createFunctionHeaders({
        accessToken,
        appEnv,
        profileId,
        supabaseAnonKey,
      }),
      method: "POST",
    },
  };
};

export const createFeedbackActionRequest = ({
  activityGroupId,
  accessToken,
  feltSafe = true,
  profileId,
  appEnv = defaultAppEnv,
  supabaseAnonKey = defaultSupabaseAnonKey,
  supabaseUrl = defaultSupabaseUrl,
}: CreateFeedbackActionRequestInput): MatchActionRequest => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
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
    url: createBuzzFunctionUrl("record-feedback", supabaseUrl),
    init: {
      body: JSON.stringify({ activityGroupId, feltSafe }),
      headers,
      method: "POST",
    },
  };
};

export const createSettledActionRequest = ({
  accessToken,
  appEnv = defaultAppEnv,
  profileId,
  settled,
  supabaseAnonKey = defaultSupabaseAnonKey,
  supabaseUrl = defaultSupabaseUrl,
}: CreateSettledActionRequestInput): MatchActionRequest => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
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
    url: createBuzzFunctionUrl("update-profile-settled", supabaseUrl),
    init: {
      body: JSON.stringify({ settled }),
      headers,
      method: "POST",
    },
  };
};

export const runMatchAction = async (
  input: CreateMatchActionRequestInput,
  fetcher: typeof fetch = fetch,
): Promise<MatchActionResult> => {
  const request = createMatchActionRequest(input);
  const response = await fetcher(request.url, request.init);
  const body = (await response.json()) as Partial<MatchActionResult> & {
    error?: string;
  };

  if (!response.ok || !body.ok || !body.matchCandidateId || !body.status) {
    throw new Error(body.error ?? "Unable to update match");
  }

  const result: MatchActionResult = {
    ok: true,
    matchCandidateId: body.matchCandidateId,
    status: body.status,
  };

  if (body.activityGroupId) {
    result.activityGroupId = body.activityGroupId;
  }

  return result;
};

export const runAttendanceAction = async (
  input: CreateAttendanceActionRequestInput,
  fetcher: typeof fetch = fetch,
): Promise<AttendanceActionResult> => {
  const request = createAttendanceActionRequest(input);
  const response = await fetcher(request.url, request.init);
  const body = (await response.json()) as Partial<AttendanceActionResult> & {
    error?: string;
  };

  if (
    !response.ok ||
    !body.ok ||
    !body.activityGroupId ||
    body.attendanceStatus !== "attended" ||
    body.rsvpStatus !== "confirmed"
  ) {
    throw new Error(body.error ?? "Unable to confirm attendance");
  }

  const result: AttendanceActionResult = {
    ok: true,
    activityGroupId: body.activityGroupId,
    attendanceStatus: "attended",
    rsvpStatus: "confirmed",
  };

  if (body.attendanceConfirmedAt) {
    result.attendanceConfirmedAt = body.attendanceConfirmedAt;
  }

  return result;
};

export const runFeedbackAction = async (
  input: CreateFeedbackActionRequestInput,
  fetcher: typeof fetch = fetch,
): Promise<FeedbackActionResult> => {
  const request = createFeedbackActionRequest(input);
  const response = await fetcher(request.url, request.init);
  const body = (await response.json()) as Partial<FeedbackActionResult> & {
    error?: string;
  };

  if (
    !response.ok ||
    !body.ok ||
    !body.activityGroupId ||
    body.feedbackStatus !== "completed" ||
    typeof body.positiveFeedbackRecorded !== "boolean"
  ) {
    throw new Error(body.error ?? "Unable to record post-plan feedback");
  }

  const result: FeedbackActionResult = {
    ok: true,
    activityGroupId: body.activityGroupId,
    feedbackStatus: "completed",
    positiveFeedbackRecorded: body.positiveFeedbackRecorded,
  };

  if (body.feedbackCompletedAt) {
    result.feedbackCompletedAt = body.feedbackCompletedAt;
  }

  return result;
};

export const runCreateInviteAction = async (
  input: CreateInviteActionRequestInput,
  fetcher: typeof fetch = fetch,
): Promise<CreateInviteActionResult> => {
  const request = createInviteActionRequest(input);
  const response = await fetcher(request.url, request.init);
  const body = (await response.json()) as Partial<CreateInviteActionResult> & {
    error?: string;
  };

  if (
    !response.ok ||
    !body.ok ||
    !body.inviteId ||
    !body.token ||
    !body.tokenPreview ||
    !body.expiresAt
  ) {
    throw new Error(body.error ?? "Unable to create invite");
  }

  return {
    ok: true,
    inviteId: body.inviteId,
    token: body.token,
    tokenPreview: body.tokenPreview,
    expiresAt: body.expiresAt,
  };
};

export const runResolveInviteAction = async (
  input: ResolveInviteActionRequestInput,
  fetcher: typeof fetch = fetch,
): Promise<ResolveInviteActionResult> => {
  const request = createResolveInviteActionRequest(input);
  const response = await fetcher(request.url, request.init);
  const body = (await response.json()) as Partial<ResolveInviteActionResult> & {
    error?: string;
  };

  if (
    !response.ok ||
    !body.ok ||
    !body.inviteId ||
    !body.activityGroupId ||
    !body.inviterId ||
    !body.status ||
    !body.expiresAt
  ) {
    throw new Error(body.error ?? "Unable to resolve invite");
  }

  const result: ResolveInviteActionResult = {
    ok: true,
    inviteId: body.inviteId,
    activityGroupId: body.activityGroupId,
    inviterId: body.inviterId,
    status: body.status,
    expiresAt: body.expiresAt,
  };

  if (body.activityPlanId) {
    result.activityPlanId = body.activityPlanId;
  }

  return result;
};

export const runAcceptInviteAction = async (
  input: AcceptInviteActionRequestInput,
  fetcher: typeof fetch = fetch,
): Promise<AcceptInviteActionResult> => {
  const request = createAcceptInviteActionRequest(input);
  const response = await fetcher(request.url, request.init);
  const body = (await response.json()) as Partial<AcceptInviteActionResult> & {
    error?: string;
  };

  if (
    !response.ok ||
    !body.ok ||
    !body.inviteId ||
    !body.activityGroupId ||
    body.status !== "accepted"
  ) {
    throw new Error(body.error ?? "Unable to accept invite");
  }

  return {
    ok: true,
    inviteId: body.inviteId,
    activityGroupId: body.activityGroupId,
    status: "accepted",
  };
};

export const runSettledAction = async (
  input: CreateSettledActionRequestInput,
  fetcher: typeof fetch = fetch,
): Promise<SettledActionResult> => {
  const request = createSettledActionRequest(input);
  const response = await fetcher(request.url, request.init);
  const body = (await response.json()) as Partial<SettledActionResult> & {
    error?: string;
  };

  if (
    !response.ok ||
    !body.ok ||
    !body.profileId ||
    typeof body.settled !== "boolean"
  ) {
    throw new Error(body.error ?? "Unable to update matching availability");
  }

  const result: SettledActionResult = {
    ok: true,
    profileId: body.profileId,
    settled: body.settled,
  };

  if (typeof body.visible === "boolean") {
    result.visible = body.visible;
  }

  return result;
};

export const runCityContextRequest = async (
  input: CreateCityContextRequestInput,
  fetcher: typeof fetch = fetch,
): Promise<CityContext> => {
  const request = createCityContextRequest(input);
  const response = await fetcher(request.url, request.init);
  const body = (await response.json()) as {
    error?: string;
    ok?: boolean;
  } & Parameters<typeof normalizeCityContext>[0];

  if (!response.ok || body.ok !== true) {
    throw new Error(body.error ?? "Unable to load city context");
  }

  return normalizeCityContext(body);
};
