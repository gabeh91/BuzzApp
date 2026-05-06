export type BuzzAuthMode = "demo" | "supabase";

export type BuzzUser = {
  id: string;
  displayName: string;
  cityId: string;
  cityName: string;
  isDemo: boolean;
};

export type BuzzAuthState = {
  mode: BuzzAuthMode;
  user: BuzzUser;
};
