import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import { baseLocale, createI18n, type AppLocale, type I18n } from "@/i18n";

type I18nContextValue = {
  locale: AppLocale;
  LL: I18n;
  setLocale: (locale: AppLocale) => void;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocale] = useState<AppLocale>(baseLocale);
  const LL = useMemo(() => createI18n(locale), [locale]);

  return <I18nContext.Provider value={{ locale, LL, setLocale }}>{children}</I18nContext.Provider>;
};

export const useI18n = (): I18nContextValue => {
  const value = useContext(I18nContext);

  if (!value) {
    throw new Error("useI18n must be used within I18nProvider");
  }

  return value;
};
