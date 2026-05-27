import assert from "node:assert/strict";
import test from "node:test";

test("i18n module evaluates when Intl.PluralRules is unavailable", async () => {
  const originalPluralRules = Intl.PluralRules;

  try {
    Object.defineProperty(Intl, "PluralRules", {
      configurable: true,
      value: undefined
    });

    const uncachedModulePath = "../index.ts?without-plural-rules";
    const i18n = await import(uncachedModulePath);
    const LL = i18n.createI18n("en");

    assert.equal(LL.brand.name(), "Buzz");
    assert.equal(LL.home.titleActivated({ interest: "Surfing" }), "You activated Surfing.");
  } finally {
    Object.defineProperty(Intl, "PluralRules", {
      configurable: true,
      value: originalPluralRules
    });
  }
});
