export type CityLaunchStatus = "planned" | "waitlist" | "private_beta" | "active" | "paused" | "retired";

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
  ai_match_cards: false,
  bring_friend: false,
  landing_plan: false,
  lead_attribution: false,
  local_knowledge_qa: false,
  neighbourhood_matching: false,
  paid_hosts: false,
  promoted_events: false,
  safety_checks: false,
  starter_plans: false,
  subscriptions: false,
  verified_locals: false
};

export const normalizeCityContext = (raw: RawCityContext): CityContext => {
  const enabledFeatures = Object.fromEntries(
    Object.entries({
      ...defaultFeatureFlags,
      ...(raw.enabledFeatures ?? {})
    }).map(([key, enabled]) => [key, Boolean(enabled)])
  );

  return {
    city: {
      id: raw.city?.id ?? "00000000-0000-0000-0000-000000000001",
      name: raw.city?.name ?? "Melbourne",
      countryCode: raw.city?.countryCode ?? "AU",
      timezone: raw.city?.timezone ?? "Australia/Melbourne",
      currency: raw.city?.currency ?? "AUD",
      launchStatus: raw.city?.launchStatus ?? "active"
    },
    matching: {
      radiusKm: raw.matching?.radiusKm ?? 10,
      defaultGroupSizeMin: raw.matching?.defaultGroupSizeMin ?? 3,
      defaultGroupSizeMax: raw.matching?.defaultGroupSizeMax ?? 5,
      activationExpiryHours: raw.matching?.activationExpiryHours ?? 168
    },
    enabledFeatures,
    defaultInterests: raw.defaultInterests ?? ["tennis", "climbing", "coffee", "running"],
    activeSuburbs: raw.activeSuburbs ?? ["Fitzroy", "Brunswick", "South Yarra", "St Kilda", "Collingwood"],
    copy: raw.copy ?? {}
  };
};

export const createCityContextFallback = ({
  cityId,
  cityName
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
      bring_friend: true,
      landing_plan: true,
      neighbourhood_matching: true,
      safety_checks: true,
      starter_plans: false
    },
    copy: {
      starterPackTitle: `Your first 30 days in ${cityName ?? "Melbourne"}`,
      welcome: `Find your people in ${cityName ?? "Melbourne"}`
    }
  });
};

export const isCityFeatureEnabled = (context: CityContext, featureKey: string): boolean => {
  return context.enabledFeatures[featureKey] === true;
};
