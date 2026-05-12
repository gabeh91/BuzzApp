export {
  defaultLocalAndroidSupabaseUrl,
  defaultLocalSupabaseUrl,
  isLoopbackSupabaseUrl,
  resolveSupabaseUrl,
  type ResolveSupabaseUrlInput,
  type RuntimePlatformOS,
} from "./supabaseUrlCore";
import {
  resolveSupabaseUrl,
  type ResolveSupabaseUrlInput,
} from "./supabaseUrlCore";

export const getSupabaseUrl = (
  input: ResolveSupabaseUrlInput = {},
): string => {
  return resolveSupabaseUrl(input);
};
