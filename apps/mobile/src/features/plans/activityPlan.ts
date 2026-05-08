import type { CityContext } from "@/features/city/cityContext";

export type ActivityPlanStatus = "proposed" | "confirmed" | "active" | "completed" | "cancelled";
export type ActivityPlanConfirmationStatus = "pending" | "confirmed" | "needs_changes" | "cancelled";
export type ActivityPlanLocationVisibility = "area_only" | "confirmed_group" | "exact";
export type ActivityPlanVenueType = "public" | "hosted" | "private";

export type ActivityPlan = {
  title: string;
  activityName: string;
  cityName: string;
  status: ActivityPlanStatus;
  confirmationStatus: ActivityPlanConfirmationStatus;
  publicLocationName: string;
  locationVisibility: ActivityPlanLocationVisibility;
  venueType: ActivityPlanVenueType;
  capacityMin: number;
  capacityMax: number;
  minGroupSize: number;
  durationMinutes: number;
  suggestedTiming: string;
  safetyGuidance: string;
  matchSuggestion: string;
};

type CreateDefaultActivityPlanInput = {
  cityContext: CityContext;
  interestName: string;
  matchSuggestion: string;
};

const inferSuggestedTiming = (matchSuggestion: string): string => {
  const normalizedSuggestion = matchSuggestion.toLowerCase();

  if (normalizedSuggestion.includes("weekend")) {
    return "Next weekend";
  }

  if (normalizedSuggestion.includes("few days")) {
    return "Next few days";
  }

  return "This week";
};

export const createDefaultActivityPlan = ({
  cityContext,
  interestName,
  matchSuggestion
}: CreateDefaultActivityPlanInput): ActivityPlan => {
  const cityName = cityContext.city.name;

  return {
    title: `${interestName} plan in ${cityName}`,
    activityName: interestName,
    cityName,
    status: "proposed",
    confirmationStatus: "pending",
    publicLocationName: `Public ${interestName} spot in ${cityName}`,
    locationVisibility: "area_only",
    venueType: "public",
    capacityMin: cityContext.matching.defaultGroupSizeMin,
    capacityMax: cityContext.matching.defaultGroupSizeMax,
    minGroupSize: cityContext.matching.defaultGroupSizeMin,
    durationMinutes: 90,
    suggestedTiming: inferSuggestedTiming(matchSuggestion),
    safetyGuidance: "Meet in a public venue first. Exact location stays hidden until the group confirms.",
    matchSuggestion
  };
};
