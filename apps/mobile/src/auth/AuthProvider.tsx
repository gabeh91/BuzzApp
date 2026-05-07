import { createContext, useContext, type ReactNode } from "react";

import type { BuzzAuthState } from "./auth.types";
import { createDemoBuzzUser, type DemoAuthEnv } from "./demoAuth";

const BuzzAuthContext = createContext<BuzzAuthState | null>(null);

export const createBuzzAuthState = (env: DemoAuthEnv = process.env): BuzzAuthState => {
  const user = createDemoBuzzUser(env);

  return {
    mode: user.authSource,
    user
  };
};

export const BuzzAuthProvider = ({ children }: { children: ReactNode }) => {
  return <BuzzAuthContext.Provider value={createBuzzAuthState()}>{children}</BuzzAuthContext.Provider>;
};

export const useBuzzAuth = (): BuzzAuthState => {
  const state = useContext(BuzzAuthContext);

  if (!state) {
    throw new Error("useBuzzAuth must be used within BuzzAuthProvider");
  }

  return state;
};
