import { i18nObject } from "typesafe-i18n";

import en from "@/i18n/en";

export const baseLocale = "en";
export const locales = ["en"] as const;

export type AppLocale = (typeof locales)[number];

export const translations = {
  en
} as const;

export const createI18n = (locale: AppLocale = baseLocale) => {
  return i18nObject(locale, translations[locale]);
};

export const LL = createI18n(baseLocale);

export type I18n = typeof LL;
