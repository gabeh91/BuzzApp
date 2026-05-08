import type { BuzzAuthUser } from "./auth.types";

export type DemoAuthEnv = Partial<Record<string, string | undefined>>;

const demoDefaults = {
  userId: "00000000-0000-0000-0000-000000000101",
  cityId: "00000000-0000-0000-0000-000000000001",
  displayName: "New Buzz Member",
  cityName: "Melbourne"
};

const resolveAuthSource = (env: DemoAuthEnv): BuzzAuthUser["authSource"] => {
  return env.EXPO_PUBLIC_APP_ENV === "local" &&
    env.EXPO_PUBLIC_AUTH_MODE === "supabase" &&
    env.EXPO_PUBLIC_LOCAL_SUPABASE_ACCESS_TOKEN
    ? "supabase"
    : "demo";
};

export const createDemoBuzzUser = (env: DemoAuthEnv): BuzzAuthUser => {
  return {
    id: env.EXPO_PUBLIC_DEMO_USER_ID ?? demoDefaults.userId,
    displayName: env.EXPO_PUBLIC_DEMO_DISPLAY_NAME ?? demoDefaults.displayName,
    cityId: env.EXPO_PUBLIC_DEMO_CITY_ID ?? demoDefaults.cityId,
    cityName: env.EXPO_PUBLIC_DEMO_CITY_NAME ?? demoDefaults.cityName,
    authSource: resolveAuthSource(env)
  };
};
