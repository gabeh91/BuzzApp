import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

const appEnv = process.env.EXPO_PUBLIC_APP_ENV ?? "local";
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";
const localSupabaseAccessToken = process.env.EXPO_PUBLIC_LOCAL_SUPABASE_ACCESS_TOKEN ?? "";

export const graphqlUrl = supabaseUrl.replace(/\/$/, "") + "/graphql/v1";

export type BuzzApolloHeaderInput = {
  appEnv?: string;
  supabaseAnonKey?: string;
  localSupabaseAccessToken?: string;
};

export const createBuzzApolloHeaders = ({
  appEnv = "local",
  supabaseAnonKey = "",
  localSupabaseAccessToken = ""
}: BuzzApolloHeaderInput): Record<string, string> => {
  const bearerToken = appEnv === "local" ? localSupabaseAccessToken || supabaseAnonKey : supabaseAnonKey;

  return {
    apikey: supabaseAnonKey,
    authorization: bearerToken ? `Bearer ${bearerToken}` : ""
  };
};

export const createBuzzApolloClient = () => {
  return new ApolloClient({
    link: new HttpLink({
      uri: graphqlUrl,
      headers: createBuzzApolloHeaders({ appEnv, supabaseAnonKey, localSupabaseAccessToken })
    }),
    cache: new InMemoryCache()
  });
};
