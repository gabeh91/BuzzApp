import type { CityContext } from "@/features/city/cityContext";
import type { ProfileTraits } from "@/features/quiz/quizModel";

export type LandingPlanStatus = "active" | "completed" | "paused" | "archived";

export type LandingPlanItemType =
  | "complete_profile"
  | "explore_suburb"
  | "activate_interest"
  | "join_plan"
  | "attend_activity"
  | "bring_friend"
  | "meet_again"
  | "save_place"
  | "join_group";

export type LandingPlanItemStatus = "pending" | "active" | "completed" | "skipped" | "expired";

export type LandingPlanItem = {
  itemType: LandingPlanItemType;
  title: string;
  description: string;
  weekNumber: number;
  sortOrder: number;
  status: LandingPlanItemStatus;
  targetId?: string;
};

export type LandingPlan = {
  title: string;
  cityName: string;
  status: LandingPlanStatus;
  items: LandingPlanItem[];
};

type CreateLandingPlanInput = {
  cityContext: CityContext;
  traits: ProfileTraits;
  selectedInterests?: string[];
  topSuburbs?: string[];
};

const firstPresent = (values: Array<string | undefined>, fallback: string): string => {
  return values.find((value) => value && value.trim().length > 0)?.trim() ?? fallback;
};

const createItem = (
  itemType: LandingPlanItemType,
  title: string,
  description: string,
  weekNumber: number,
  sortOrder: number,
  status: LandingPlanItemStatus = "pending"
): LandingPlanItem => ({
  itemType,
  title,
  description,
  weekNumber,
  sortOrder,
  status
});

const activateNextPendingItem = (items: LandingPlanItem[]): LandingPlanItem[] => {
  let activated = false;

  return items.map((item) => {
    if (item.status !== "pending" || activated) {
      return item;
    }

    activated = true;
    return {
      ...item,
      status: "active"
    };
  });
};

const describePlanPace = (traits: ProfileTraits): string => {
  if (traits.planning === "spontaneous") {
    return "Keep the ask light and easy to adjust.";
  }

  if (traits.availability === "weekend") {
    return "Aim for a clear weekend plan with the details settled early.";
  }

  return "Choose a simple time and place that is easy to confirm.";
};

export const createLandingPlan = ({
  cityContext,
  traits,
  selectedInterests = [],
  topSuburbs
}: CreateLandingPlanInput): LandingPlan => {
  const cityName = cityContext.city.name;
  const suburbs = topSuburbs?.length ? topSuburbs : cityContext.activeSuburbs;
  const primarySuburb = firstPresent([suburbs[0], cityContext.activeSuburbs[0]], cityName);
  const secondarySuburb = firstPresent([suburbs[1], cityContext.activeSuburbs[1], primarySuburb], primarySuburb);
  const primaryInterest = firstPresent(
    [selectedInterests[0], cityContext.defaultInterests[0]],
    "Coffee"
  );
  const groupSize = `${cityContext.matching.defaultGroupSizeMin}-${cityContext.matching.defaultGroupSizeMax}`;

  const items = activateNextPendingItem([
    createItem(
      "complete_profile",
      "Complete your local profile",
      traits.quizCompleted
        ? "Your quiz is complete, so the plan can follow your pace."
        : "Finish the quiz so the plan can follow your pace.",
      1,
      1,
      traits.quizCompleted ? "completed" : "pending"
    ),
    createItem(
      "explore_suburb",
      `Explore ${primarySuburb}`,
      `Start with one nearby area that matches your current city fit.`,
      1,
      2
    ),
    createItem(
      "activate_interest",
      `Activate ${primaryInterest}`,
      `Use ${primaryInterest} as the low-pressure reason to meet people this week.`,
      1,
      3
    ),
    createItem(
      "save_place",
      `Save a fallback place in ${secondarySuburb}`,
      "Pick a public backup spot so the first plan stays easy to join.",
      2,
      1
    ),
    createItem(
      "join_plan",
      `Join a ${groupSize} person plan`,
      describePlanPace(traits),
      2,
      2
    ),
    createItem(
      "attend_activity",
      `Attend your first ${primaryInterest} plan`,
      "Keep it public, practical, and anchored to the shared activity.",
      2,
      3
    ),
    createItem(
      "bring_friend",
      "Bring a friend to one plan",
      "Use a familiar person as a soft entry point when the plan benefits from it.",
      3,
      1
    ),
    createItem(
      "join_group",
      "Try one small activity group",
      "Choose a group format before broad social browsing.",
      3,
      2
    ),
    createItem(
      "meet_again",
      "Mark who you would meet again",
      "After the plan, capture repeat-connection signals while they are fresh.",
      3,
      3
    ),
    createItem(
      "explore_suburb",
      `Compare another ${cityName} suburb`,
      "Use what you learned from the first plan to widen your local map.",
      4,
      1
    )
  ]);

  return {
    title: `Your first 30 days in ${cityName}`,
    cityName,
    status: "active",
    items
  };
};
