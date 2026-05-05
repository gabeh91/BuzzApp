import { z } from "zod";

export const localRootEnvSchema = z.object({
  APP_ENV: z.literal("local"),
  SUPABASE_URL: z.string().min(1),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional()
});

export const mobileEnvSchema = z.object({
  EXPO_PUBLIC_APP_ENV: z.string().min(1),
  EXPO_PUBLIC_SUPABASE_URL: z.string().min(1),
  EXPO_PUBLIC_SUPABASE_ANON_KEY: z.string().optional()
});
