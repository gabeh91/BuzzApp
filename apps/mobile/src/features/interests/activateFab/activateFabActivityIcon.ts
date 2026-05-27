import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";

import type { BuzzInterest } from "../interestFlow";

export type ActivityIconInterest = Pick<BuzzInterest, "slug" | "name">;

export type ActivityInterestIconName = ComponentProps<typeof Ionicons>["name"];

/** Compact ping dock — same glyph as outgoing activation UI (`radio-outline`). */
export const ACTIVATE_FAB_ICON: ActivityInterestIconName = "radio-outline";

/** Known starter slugs — keeps icons stable when copy changes. */
const ICON_BY_SLUG: Partial<Record<string, ActivityInterestIconName>> = {
  surfing: "water",
  tennis: "tennisball",
  singing: "mic",
  running: "fitness",
  climbing: "fitness",
  "rock-climbing": "fitness",
  "language-exchange": "globe",
  "board-games": "game-controller",
  coffee: "cafe",
  "cooking-classes": "restaurant",
  "gym-fitness": "barbell",
  golf: "golf",
  knitting: "cut",
  chess: "grid",
  walking: "walk",
  hackathons: "code-slash",
  "book-clubs": "book",
  "wine-clubs": "wine",
  "pottery-classes": "color-palette",
  soccer: "football",
  archery: "navigate-circle",
  basketball: "basketball",
  netball: "basketball",
  volleyball: "tennisball",
  "ultimate-frisbee": "disc",
  "touch-rugby": "american-football",
  pickleball: "tennisball",
  yoga: "leaf",
  "photography-walks": "camera",
  "trivia-nights": "bulb",
  gardening: "flower",
};

export const activityIconForInterest = (
  interest: ActivityIconInterest,
): ActivityInterestIconName => {
  const slugIcon = ICON_BY_SLUG[interest.slug];
  if (slugIcon) {
    return slugIcon;
  }

  const key = `${interest.slug} ${interest.name}`.toLowerCase();

  if (key.includes("coffee") || key.includes("cafe")) return "cafe";
  if (key.includes("golf")) return "golf";
  if (key.includes("run") || key.includes("jog")) return "fitness";
  if (key.includes("walk") || key.includes("hik")) return "walk";
  if (key.includes("tennis") || key.includes("pickle")) return "tennisball";
  if (key.includes("surf")) return "water";
  if (key.includes("swim")) return "water";
  if (key.includes("cook") || key.includes("food") || key.includes("dine"))
    return "restaurant";
  if (key.includes("wine") || key.includes("beer") || key.includes("bar"))
    return "wine";
  if (key.includes("book") || key.includes("read")) return "book";
  if (key.includes("photo") || key.includes("camera")) return "camera";
  if (key.includes("yoga") || key.includes("pilates") || key.includes("meditat"))
    return "leaf";
  if (key.includes("garden") || key.includes("plant")) return "flower";
  if (key.includes("music") || key.includes("guitar") || key.includes("sing"))
    return "musical-notes";
  if (key.includes("film") || key.includes("movie") || key.includes("cinema"))
    return "videocam";
  if (key.includes("art") || key.includes("paint") || key.includes("draw"))
    return "color-palette";
  if (key.includes("pottery") || key.includes("clay")) return "color-palette";
  if (key.includes("knit") || key.includes("sew") || key.includes("craft"))
    return "cut";
  if (key.includes("climb") || key.includes("boulder")) return "fitness";
  if (key.includes("gym") || key.includes("lift") || key.includes("crossfit"))
    return "barbell";
  if (key.includes("soccer") || key.includes("football")) return "football";
  if (key.includes("basketball")) return "basketball";
  if (key.includes("volleyball") || key.includes("netball")) return "tennisball";
  if (key.includes("rugby")) return "american-football";
  if (key.includes("frisbee") || key.includes("disc")) return "disc";
  if (key.includes("archery") || key.includes("target")) return "navigate-circle";
  if (key.includes("chess") || key.includes("board")) return "grid";
  if (key.includes("trivia") || key.includes("quiz")) return "bulb";
  if (key.includes("hack") || key.includes("code") || key.includes("dev"))
    return "code-slash";
  if (key.includes("language") || key.includes("exchange")) return "globe";
  if (key.includes("dance")) return "musical-notes";
  if (key.includes("bike") || key.includes("cycl")) return "bicycle";
  if (key.includes("ski") || key.includes("snow")) return "snow";

  return "sparkles";
};
