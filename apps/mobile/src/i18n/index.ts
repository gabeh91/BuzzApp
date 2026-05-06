import { i18nObject } from "typesafe-i18n";

import en from "@/i18n/en";

export const baseLocale = "en";
export const locales = ["en"] as const;

export type AppLocale = (typeof locales)[number];
type PluralRulesLike = {
  select: (value: number) => Intl.LDMLPluralRule;
};
type IntlWithOptionalPluralRules = typeof Intl & {
  PluralRules?: new (locale?: string | string[]) => PluralRulesLike;
};

export const translations = {
  en
} as const;

const ensurePluralRules = () => {
  const globalObject = globalThis as typeof globalThis & {
    Intl?: IntlWithOptionalPluralRules;
  };

  if (!globalObject.Intl) {
    Object.defineProperty(globalObject, "Intl", {
      configurable: true,
      value: {}
    });
  }

  if (typeof globalObject.Intl.PluralRules === "function") {
    return;
  }

  class BuzzPluralRulesFallback implements PluralRulesLike {
    select(value: number): Intl.LDMLPluralRule {
      return value === 1 ? "one" : "other";
    }
  }

  Object.defineProperty(globalObject.Intl, "PluralRules", {
    configurable: true,
    value: BuzzPluralRulesFallback
  });
};

export const createI18n = (locale: AppLocale = baseLocale) => {
  ensurePluralRules();

  return i18nObject(locale, translations[locale]);
};

export const LL = createI18n(baseLocale);

export type I18n = typeof LL;
