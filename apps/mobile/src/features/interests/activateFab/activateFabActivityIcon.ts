import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";

import type { BuzzInterest } from "../interestFlow";

export const activityIconForInterest = (
  interest: BuzzInterest,
): ComponentProps<typeof Ionicons>["name"] => {
  const key = `${interest.slug} ${interest.name}`.toLowerCase();

  if (key.includes("coffee")) return "cafe";
  if (key.includes("golf")) return "golf";
  if (key.includes("run")) return "walk";
  if (key.includes("tennis")) return "tennisball";
  if (key.includes("surf")) return "water";
  if (key.includes("cook")) return "restaurant";
  if (key.includes("music") || key.includes("guitar")) return "musical-notes";
  if (key.includes("climb")) return "trending-up";
  if (key.includes("hack")) return "code-slash";

  return "sparkles";
};
