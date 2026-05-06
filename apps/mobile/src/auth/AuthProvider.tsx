import { createContext, useContext, type ReactNode } from "react";

import type { BuzzAuthState } from "./auth.types";
import { createDemoBuzzUser } from "./demoAuth";

const BuzzAuthContext = createContext<BuzzAuthState | null>(null);

export const createBuzzAuthState = (): BuzzAuthState => {
  return {
    mode: "demo",
    user: createDemoBuzzUser(process.env)
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
