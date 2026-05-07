export type BuzzAuthMode = "demo" | "supabase";

export type BuzzAuthUser = {
  id: string;
  displayName: string;
  cityId: string;
  cityName: string;
  authSource: BuzzAuthMode;
};

export type BuzzAuthState = {
  mode: BuzzAuthMode;
  user: BuzzAuthUser;
};
