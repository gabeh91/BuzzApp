import type { BuzzInterest } from "../interestFlow";

import type { GroupedInterests } from "./ActivateInterestFabWheel";

export const groupInterestsByCategory = (
  interests: BuzzInterest[],
): GroupedInterests => {
  const byCategory = new Map<string, BuzzInterest[]>();

  for (const interest of interests) {
    const bucket = byCategory.get(interest.category) ?? [];
    bucket.push(interest);
    byCategory.set(interest.category, bucket);
  }

  return Array.from(byCategory.entries())
    .map(([category, items]) => ({
      category,
      items: [...items].sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => a.category.localeCompare(b.category));
};
