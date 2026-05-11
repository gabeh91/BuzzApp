declare const process: {
  env: {
    EXPO_PUBLIC_APP_ENV?: string;
    EXPO_PUBLIC_SUPABASE_URL?: string;
    EXPO_PUBLIC_SUPABASE_ANON_KEY?: string;
    EXPO_PUBLIC_LOCAL_SUPABASE_ACCESS_TOKEN?: string;
    EXPO_PUBLIC_AUTH_MODE?: "demo" | "supabase";
    EXPO_PUBLIC_DEMO_USER_ID?: string;
    EXPO_PUBLIC_DEMO_DISPLAY_NAME?: string;
    EXPO_PUBLIC_DEMO_CITY_ID?: string;
    EXPO_PUBLIC_DEMO_CITY_NAME?: string;
    EXPO_PUBLIC_INVITE_ORIGIN?: string;
    EXPO_PUBLIC_SENTRY_DSN?: string;
    EXPO_PUBLIC_POSTHOG_PUBLIC_KEY?: string;
    EXPO_PUBLIC_POSTHOG_HOST?: string;
  };
};
