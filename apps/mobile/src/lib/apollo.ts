import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const graphqlUrl = supabaseUrl.replace(/\/$/, "") + "/graphql/v1";

export const createBuzzApolloClient = () => {
  return new ApolloClient({
    link: new HttpLink({
      uri: graphqlUrl,
      headers: {
        apikey: supabaseAnonKey,
        authorization: supabaseAnonKey ? `Bearer ${supabaseAnonKey}` : ""
      }
    }),
    cache: new InMemoryCache()
  });
};
