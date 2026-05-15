import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

import { getSupabaseUrl } from "./supabaseUrl";

const appEnv = process.env.EXPO_PUBLIC_APP_ENV ?? "local";
const supabaseUrl = getSupabaseUrl();
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";
const localSupabaseAccessToken =
  process.env.EXPO_PUBLIC_LOCAL_SUPABASE_ACCESS_TOKEN ?? "";

export const graphqlUrl = supabaseUrl.replace(/\/$/, "") + "/graphql/v1";

export type BuzzApolloHeaderInput = {
  appEnv?: string;
  supabaseAnonKey?: string;
  localSupabaseAccessToken?: string;
  supabaseAccessToken?: string | undefined;
};

export const createBuzzApolloHeaders = ({
  appEnv = "local",
  supabaseAnonKey = "",
  localSupabaseAccessToken = "",
  supabaseAccessToken = "",
}: BuzzApolloHeaderInput): Record<string, string> => {
  const bearerToken =
    supabaseAccessToken ||
    (appEnv === "local"
      ? localSupabaseAccessToken || supabaseAnonKey
      : supabaseAnonKey);

  return {
    apikey: supabaseAnonKey,
    authorization: bearerToken ? `Bearer ${bearerToken}` : "",
  };
};

type BuzzApolloClientOptions = {
  getAccessToken?: () => Promise<string | undefined> | string | undefined;
};

export const createBuzzApolloClient = (
  options: BuzzApolloClientOptions = {},
) => {
  const httpLink = new HttpLink(
    options.getAccessToken
      ? { uri: graphqlUrl }
      : {
          uri: graphqlUrl,
          headers: createBuzzApolloHeaders({
            appEnv,
            supabaseAnonKey,
            localSupabaseAccessToken,
          }),
        },
  );
  const link = options.getAccessToken
    ? setContext(async (_operation, context) => {
        const supabaseAccessToken = await options.getAccessToken?.();

        return {
          headers: {
            ...context.headers,
            ...createBuzzApolloHeaders({
              appEnv,
              localSupabaseAccessToken,
              supabaseAccessToken,
              supabaseAnonKey,
            }),
          },
        };
      }).concat(httpLink)
    : httpLink;

  return new ApolloClient({
    link,
    cache: new InMemoryCache(),
  });
};
