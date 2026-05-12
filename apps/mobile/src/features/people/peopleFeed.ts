export type PeopleSharedInterest = {
  id: string;
  name: string;
  slug: string;
  category: string;
};

export type PeopleMatch = {
  id: string;
  profileId: string;
  firstName: string;
  displayName: string;
  age?: number;
  profilePhotoUrl?: string;
  bio?: string;
  inCityDurationLabel?: string;
  sharedInterests: PeopleSharedInterest[];
  compatibilityLine: string;
  compatibilityHighlights: string[];
  score: number;
};

export type PeopleMatchesResult = {
  ok: true;
  cityId?: string;
  cityName?: string;
  peopleMatches: PeopleMatch[];
};

export type LoadPeopleMatchesInput = {
  cityId?: string;
  cityName?: string;
  quizTraits?: Record<string, unknown>;
  interestIds?: string[];
  interestSlugs?: string[];
  limitCount?: number;
};

export type SendConnectionRequestInput = {
  recipientId: string;
  message?: string;
};

export type SendConnectionRequestResult = {
  ok: true;
  connectionRequestId: string;
  recipientId: string;
  status: "pending";
};

export type PeopleRpcClient = {
  rpc: (
    name: string,
    params: Record<string, unknown>,
  ) => Promise<{
    data: unknown;
    error: { message?: string } | null;
  }>;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
};

const stringValue = (value: unknown): string | undefined => {
  return typeof value === "string" && value.trim() ? value : undefined;
};

const numberValue = (value: unknown): number | undefined => {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
};

const normalizeSharedInterest = (
  value: unknown,
): PeopleSharedInterest | null => {
  if (!isRecord(value)) {
    return null;
  }

  const id = stringValue(value.id);
  const name = stringValue(value.name);
  const slug = stringValue(value.slug);
  const category = stringValue(value.category);

  if (!id || !name || !slug || !category) {
    return null;
  }

  return { id, name, slug, category };
};

const normalizePeopleMatch = (value: unknown): PeopleMatch | null => {
  if (!isRecord(value)) {
    return null;
  }

  const id = stringValue(value.id);
  const profileId = stringValue(value.profileId);
  const firstName = stringValue(value.firstName);
  const displayName = stringValue(value.displayName) ?? firstName;
  const compatibilityLine = stringValue(value.compatibilityLine);
  const score = numberValue(value.score) ?? 0;

  if (!id || !profileId || !firstName || !displayName || !compatibilityLine) {
    return null;
  }

  const sharedInterests = Array.isArray(value.sharedInterests)
    ? value.sharedInterests
        .map(normalizeSharedInterest)
        .filter((interest): interest is PeopleSharedInterest =>
          Boolean(interest),
        )
    : [];
  const compatibilityHighlights = Array.isArray(value.compatibilityHighlights)
    ? value.compatibilityHighlights.filter(
        (highlight): highlight is string => typeof highlight === "string",
      )
    : [];
  const match: PeopleMatch = {
    id,
    profileId,
    firstName,
    displayName,
    sharedInterests,
    compatibilityLine,
    compatibilityHighlights,
    score,
  };
  const age = numberValue(value.age);
  const profilePhotoUrl = stringValue(value.profilePhotoUrl);
  const bio = stringValue(value.bio);
  const inCityDurationLabel = stringValue(value.inCityDurationLabel);

  if (age) {
    match.age = age;
  }

  if (profilePhotoUrl) {
    match.profilePhotoUrl = profilePhotoUrl;
  }

  if (bio) {
    match.bio = bio;
  }

  if (inCityDurationLabel) {
    match.inCityDurationLabel = inCityDurationLabel;
  }

  return match;
};

export const normalizePeopleMatchesResult = (
  value: unknown,
): PeopleMatchesResult => {
  if (!isRecord(value) || value.ok !== true) {
    throw new Error("Unable to load people matches");
  }

  const result: PeopleMatchesResult = {
    ok: true,
    peopleMatches: Array.isArray(value.peopleMatches)
      ? value.peopleMatches
          .map(normalizePeopleMatch)
          .filter((match): match is PeopleMatch => Boolean(match))
      : [],
  };
  const cityId = stringValue(value.cityId);
  const cityName = stringValue(value.cityName);

  if (cityId) {
    result.cityId = cityId;
  }

  if (cityName) {
    result.cityName = cityName;
  }

  return result;
};

export const loadPeopleMatches = async (
  input: LoadPeopleMatchesInput,
  client: PeopleRpcClient,
): Promise<PeopleMatchesResult> => {
  const { data, error } = await client.rpc("getPeopleMatchesForDiscover", {
    cityId: input.cityId,
    cityName: input.cityName,
    interestIds: input.interestIds ?? [],
    interestSlugs: input.interestSlugs ?? [],
    limitCount: input.limitCount ?? 20,
    quizTraits: input.quizTraits ?? {},
  });

  if (error) {
    throw new Error(error.message ?? "Unable to load people matches");
  }

  return normalizePeopleMatchesResult(data);
};

export const sendConnectionRequest = async (
  input: SendConnectionRequestInput,
  client: PeopleRpcClient,
): Promise<SendConnectionRequestResult> => {
  const { data, error } = await client.rpc("sendConnectionRequest", {
    message: input.message ?? null,
    recipientId: input.recipientId,
  });

  if (error) {
    throw new Error(error.message ?? "Unable to send connection request");
  }

  if (!isRecord(data) || data.ok !== true) {
    throw new Error("Unable to send connection request");
  }

  const connectionRequestId = stringValue(data.connectionRequestId);
  const recipientId = stringValue(data.recipientId);

  if (!connectionRequestId || !recipientId || data.status !== "pending") {
    throw new Error("Unable to send connection request");
  }

  return {
    ok: true,
    connectionRequestId,
    recipientId,
    status: "pending",
  };
};
