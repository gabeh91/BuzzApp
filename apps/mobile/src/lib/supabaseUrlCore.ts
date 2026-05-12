export type RuntimePlatformOS = string;

export type ResolveSupabaseUrlInput = {
  androidSupabaseUrl?: string | undefined;
  appEnv?: string | undefined;
  platformOS?: RuntimePlatformOS | undefined;
  supabaseUrl?: string | undefined;
};

export const defaultLocalSupabaseUrl = "http://127.0.0.1:54321";
export const defaultLocalAndroidSupabaseUrl = "http://10.0.2.2:54321";

const loopbackHostPattern = /^https?:\/\/(127\.0\.0\.1|localhost)(?=[:/]|$)/i;

export const isLoopbackSupabaseUrl = (supabaseUrl: string): boolean => {
  return loopbackHostPattern.test(supabaseUrl);
};

export const resolveSupabaseUrl = ({
  androidSupabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_ANDROID_URL,
  appEnv = process.env.EXPO_PUBLIC_APP_ENV,
  platformOS,
  supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL,
}: ResolveSupabaseUrlInput = {}): string => {
  const resolvedSupabaseUrl = supabaseUrl?.trim() || defaultLocalSupabaseUrl;
  const isLocalTarget =
    appEnv === "local" || isLoopbackSupabaseUrl(resolvedSupabaseUrl);

  if (platformOS === "android" && isLocalTarget) {
    const androidLoopbackUrl = resolvedSupabaseUrl.replace(
      loopbackHostPattern,
      (match) =>
        match.replace(/127\.0\.0\.1|localhost/i, "10.0.2.2"),
    );

    return (
      androidSupabaseUrl?.trim() ||
      androidLoopbackUrl ||
      defaultLocalAndroidSupabaseUrl
    );
  }

  return resolvedSupabaseUrl;
};
