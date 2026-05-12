import { createClient } from "@supabase/supabase-js";

import { secureStorage } from "./secureStorage";
import { getSupabaseUrl } from "./supabaseUrl";

const supabaseUrl = getSupabaseUrl();
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const buzzSupabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    detectSessionInUrl: false,
    flowType: "pkce",
    persistSession: true,
    storage: secureStorage,
  },
});
