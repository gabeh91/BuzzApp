import { createContext, useContext, type ReactNode } from "react";
import { useColorScheme } from "react-native";

import { themes, type BuzzTheme, type BuzzThemeMode } from "@/theme/tokens";

type ThemeContextValue = {
  mode: BuzzThemeMode;
  theme: BuzzTheme;
  colors: BuzzTheme["colors"];
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const colorScheme = useColorScheme();
  const mode: BuzzThemeMode = colorScheme === "dark" ? "dark" : "light";

  const theme = themes[mode];

  return <ThemeContext.Provider value={{ mode, theme, colors: theme.colors }}>{children}</ThemeContext.Provider>;
};

export const useBuzzTheme = (): ThemeContextValue => {
  const value = useContext(ThemeContext);

  if (!value) {
    throw new Error("useBuzzTheme must be used within ThemeProvider");
  }

  return value;
};
