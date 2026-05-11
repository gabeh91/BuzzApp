export type CityLaunchStatus =
  | "planned"
  | "waitlist"
  | "private_beta"
  | "active"
  | "paused"
  | "retired";

export type CityContext = {
  city: {
    id: string;
    name: string;
    countryCode: string;
    timezone: string;
    currency: string;
    launchStatus: CityLaunchStatus;
  };
  matching: {
    radiusKm: number;
    defaultGroupSizeMin: number;
    defaultGroupSizeMax: number;
    activationExpiryHours: number;
  };
  enabledFeatures: Record<string, boolean>;
  defaultInterests: string[];
  activeSuburbs: string[];
  copy: Record<string, string>;
};

type RawCityContext = Partial<{
  city: Partial<CityContext["city"]>;
  matching: Partial<CityContext["matching"]>;
  enabledFeatures: Record<string, boolean | null | undefined>;
  defaultInterests: string[];
  activeSuburbs: string[];
  copy: Record<string, string>;
}>;

const defaultFeatureFlags: Record<string, boolean> = {
  ai_match_cards_enabled: false,
  basic_safety_enabled: false,
  bring_friend_enabled: false,
  business_recommendations_enabled: false,
  city_config_enabled: false,
  city_starting_point_enabled: false,
  city_starter_packs_enabled: false,
  full_neighbourhood_recommender_enabled: false,
  group_first_matching_enabled: false,
  landing_plan_enabled: false,
  lead_attribution_enabled: false,
  local_knowledge_qa_enabled: false,
  media_chat_enabled: false,
  multi_city_ui_enabled: false,
  one_to_one_meetups_enabled: false,
  paid_hosts_enabled: false,
  promoted_events_enabled: false,
  starter_plans_enabled: false,
  subscriptions_enabled: false,
  superhost_progression_enabled: false,
  text_only_chat_enabled: false,
  travel_mode_enabled: false,
  verified_locals_enabled: false,
};

const legacyFeatureFlagAliases: Record<string, string> = {
  ai_match_cards: "ai_match_cards_enabled",
  bring_friend: "bring_friend_enabled",
  business_recommendations: "business_recommendations_enabled",
  landing_plan: "landing_plan_enabled",
  lead_attribution: "lead_attribution_enabled",
  local_knowledge_qa: "local_knowledge_qa_enabled",
  neighbourhood_matching: "full_neighbourhood_recommender_enabled",
  paid_hosts: "paid_hosts_enabled",
  promoted_events: "promoted_events_enabled",
  safety_checks: "basic_safety_enabled",
  starter_plans: "starter_plans_enabled",
  subscriptions: "subscriptions_enabled",
  verified_locals: "verified_locals_enabled",
};

const normalizeFeatureFlags = (
  flags: Record<string, boolean | null | undefined> = {},
): Record<string, boolean> => {
  const normalized: Record<string, boolean> = { ...defaultFeatureFlags };

  Object.entries(flags).forEach(([key, enabled]) => {
    const normalizedKey = legacyFeatureFlagAliases[key] ?? key;
    normalized[normalizedKey] = Boolean(enabled);
  });

  return normalized;
};

export const normalizeCityContext = (raw: RawCityContext): CityContext => {
  const enabledFeatures = normalizeFeatureFlags(raw.enabledFeatures);

  return {
    city: {
      id: raw.city?.id ?? "00000000-0000-0000-0000-000000000001",
      name: raw.city?.name ?? "Melbourne",
      countryCode: raw.city?.countryCode ?? "AU",
      timezone: raw.city?.timezone ?? "Australia/Melbourne",
      currency: raw.city?.currency ?? "AUD",
      launchStatus: raw.city?.launchStatus ?? "active",
    },
    matching: {
      radiusKm: raw.matching?.radiusKm ?? 10,
      defaultGroupSizeMin: raw.matching?.defaultGroupSizeMin ?? 3,
      defaultGroupSizeMax: raw.matching?.defaultGroupSizeMax ?? 5,
      activationExpiryHours: raw.matching?.activationExpiryHours ?? 168,
    },
    enabledFeatures,
    defaultInterests: raw.defaultInterests ?? [
      "tennis",
      "climbing",
      "coffee",
      "running",
    ],
    activeSuburbs: raw.activeSuburbs ?? [
      "Fitzroy",
      "Brunswick",
      "South Yarra",
      "St Kilda",
      "Collingwood",
    ],
    copy: raw.copy ?? {},
  };
};

export const createCityContextFallback = ({
  cityId,
  cityName,
}: {
  cityId?: string;
  cityName?: string;
} = {}): CityContext => {
  const city: RawCityContext["city"] = {};

  if (cityId) {
    city.id = cityId;
  }

  if (cityName) {
    city.name = cityName;
  }

  return normalizeCityContext({
    city,
    enabledFeatures: {
      basic_safety_enabled: true,
      bring_friend_enabled: true,
      city_config_enabled: true,
      full_neighbourhood_recommender_enabled: false,
      group_first_matching_enabled: true,
      landing_plan_enabled: false,
      media_chat_enabled: false,
      city_starting_point_enabled: true,
      starter_plans_enabled: false,
      text_only_chat_enabled: true,
    },
    copy: {
      starterPackTitle: `Your first 30 days in ${cityName ?? "Melbourne"}`,
      welcome: `Find your people in ${cityName ?? "Melbourne"}`,
    },
  });
};

export const isCityFeatureEnabled = (
  context: CityContext,
  featureKey: string,
): boolean => {
  return context.enabledFeatures[featureKey] === true;
};
