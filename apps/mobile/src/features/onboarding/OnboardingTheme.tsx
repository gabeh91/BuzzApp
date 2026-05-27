import { createContext, type ReactNode, useContext } from "react";

import type { BuzzTheme } from "@/theme/tokens";

import type { OnboardingStyles } from "./OnboardingScreen.styles";

export type OnboardingThemeContextValue = {
  colors: BuzzTheme["colors"];
  styles: OnboardingStyles;
  headerProgressHeight: number;
  headerProgressGap: number;
};

const OnboardingThemeContext =
  createContext<OnboardingThemeContextValue | null>(null);

export const OnboardingThemeProvider = ({
  children,
  value,
}: {
  children: ReactNode;
  value: OnboardingThemeContextValue;
}) => {
  return (
    <OnboardingThemeContext.Provider value={value}>
      {children}
    </OnboardingThemeContext.Provider>
  );
};

export const useOnboardingTheme = (): OnboardingThemeContextValue => {
  const value = useContext(OnboardingThemeContext);

  if (!value) {
    throw new Error(
      "useOnboardingTheme must be used within OnboardingThemeProvider",
    );
  }

  return value;
};
