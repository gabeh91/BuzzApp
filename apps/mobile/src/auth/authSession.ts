import type { BuzzAuthUser } from "./auth.types";

const defaultCity = {
  cityId: "00000000-0000-0000-0000-000000000001",
  cityName: "Melbourne",
};

export type SupabaseUserSnapshot = {
  id: string;
  email?: string | null | undefined;
  displayName?: string | null | undefined;
  cityId?: string | null | undefined;
  cityName?: string | null | undefined;
};

export type StoredSessionLockInput = {
  hasStoredSupabaseSession: boolean;
  biometricEnabled: boolean;
};

export const createAnonymousBuzzUser = (): BuzzAuthUser => ({
  authSource: "anonymous",
  cityId: defaultCity.cityId,
  cityName: defaultCity.cityName,
  displayName: "Guest",
  id: "anonymous-buzz-browser",
});

export const createSupabaseBuzzUser = (
  snapshot: SupabaseUserSnapshot,
): BuzzAuthUser => ({
  authSource: "supabase",
  cityId: snapshot.cityId ?? defaultCity.cityId,
  cityName: snapshot.cityName ?? defaultCity.cityName,
  displayName: snapshot.displayName ?? snapshot.email ?? "Buzz Member",
  id: snapshot.id,
});

export const shouldLockStoredSession = ({
  biometricEnabled,
  hasStoredSupabaseSession,
}: StoredSessionLockInput): boolean => {
  return hasStoredSupabaseSession && biometricEnabled;
};
