import type { ProfileTraits } from "@/features/quiz/quizModel";

export type SuburbTagProfile = {
  id: string;
  name: string;
  tagWeights: Record<string, number>;
};

export type SuburbMatch = {
  id: string;
  name: string;
  score: number;
  reasons: string[];
};

const tagReasons: Record<string, string> = {
  beach: "Matches your beach and bayside preference.",
  beginner_friendly: "Good for beginner-friendly activities.",
  budget: "Fits more budget-conscious exploring.",
  central_access: "Keeps central access practical.",
  coffee: "Good for coffee-led local plans.",
  creative: "Matches your creative interests.",
  cross_city_access: "Works when you are open to travelling for the right fit.",
  fitness: "Good for fitness and active routines.",
  food: "Strong fit for food-led exploring.",
  high_energy: "Fits your higher-energy pace.",
  learn: "Good for learning something new.",
  learning: "Good for learning something new.",
  local_access: "Keeps plans close to your local area.",
  low_energy: "Fits a calmer social pace.",
  music: "Matches your interest in music and live culture.",
  nightlife: "Fits livelier evening options.",
  one_on_one: "Works for simple one-on-one plans.",
  outdoors: "Good for outdoor plans.",
  parks: "Good access to parks and green space.",
  planned: "Works well for clearly planned activities.",
  practice: "Good for building a regular routine.",
  public_transport: "Works well for public transport access.",
  quiet: "Fits a quieter, lower-pressure area.",
  routine: "Good for building a regular routine.",
  small_group: "Good for small-group plans.",
  social: "Strong fit for casual social plans.",
  spontaneous: "Supports more spontaneous plans.",
  walkability: "Good for walkable local exploring.",
  weekday: "Works well for weekday availability.",
  weekend: "Works well for weekend availability."
};

const tagsForTraits = (traits: ProfileTraits): string[] => {
  const tags = [
    ...traits.cityTags,
    ...traits.lifestyleTags,
    traits.energy === "low" ? "low_energy" : null,
    traits.energy === "high" ? "high_energy" : null,
    traits.planning,
    traits.socialStyle,
    traits.availability === "mixed" ? "weekday" : traits.availability,
    traits.availability === "mixed" ? "weekend" : null,
    traits.activityIntent
  ];

  return [...new Set(tags.filter((tag): tag is string => Boolean(tag)))];
};

export const scoreSuburbsForTraits = ({
  limit = 3,
  suburbs,
  traits
}: {
  limit?: number;
  suburbs: SuburbTagProfile[];
  traits: ProfileTraits;
}): SuburbMatch[] => {
  const desiredTags = tagsForTraits(traits);

  return suburbs
    .map((suburb) => {
      const matchedTags = desiredTags.filter((tag) => suburb.tagWeights[tag] !== undefined);
      const score = matchedTags.reduce((total, tag) => total + (suburb.tagWeights[tag] ?? 0), 0);
      const reasons = matchedTags.map((tag) => tagReasons[tag] ?? `Matches ${tag.replaceAll("_", " ")}.`);

      return {
        id: suburb.id,
        name: suburb.name,
        reasons,
        score: Number(score.toFixed(3))
      };
    })
    .filter((match) => match.score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return left.name.localeCompare(right.name);
    })
    .slice(0, limit);
};

export const defaultMelbourneSuburbProfiles: SuburbTagProfile[] = [
  {
    id: "fitzroy",
    name: "Fitzroy",
    tagWeights: {
      creative: 0.9,
      food: 0.82,
      music: 0.92,
      nightlife: 0.78,
      public_transport: 0.72,
      walkability: 0.82
    }
  },
  {
    id: "brunswick",
    name: "Brunswick",
    tagWeights: {
      budget: 0.68,
      creative: 0.82,
      food: 0.78,
      music: 0.88,
      public_transport: 0.74,
      walkability: 0.76
    }
  },
  {
    id: "south-yarra",
    name: "South Yarra",
    tagWeights: {
      coffee: 0.78,
      fitness: 0.9,
      nightlife: 0.64,
      parks: 0.82,
      public_transport: 0.86,
      walkability: 0.74
    }
  },
  {
    id: "st-kilda",
    name: "St Kilda",
    tagWeights: {
      beach: 0.95,
      music: 0.68,
      nightlife: 0.82,
      outdoors: 0.86,
      parks: 0.62,
      public_transport: 0.66
    }
  },
  {
    id: "collingwood",
    name: "Collingwood",
    tagWeights: {
      coffee: 0.78,
      creative: 0.86,
      fitness: 0.72,
      public_transport: 0.76,
      walkability: 0.8
    }
  },
  {
    id: "carlton",
    name: "Carlton",
    tagWeights: {
      budget: 0.74,
      food: 0.82,
      learning: 0.86,
      parks: 0.72,
      public_transport: 0.8,
      walkability: 0.82
    }
  },
  {
    id: "richmond",
    name: "Richmond",
    tagWeights: {
      fitness: 0.88,
      food: 0.78,
      parks: 0.66,
      public_transport: 0.82
    }
  },
  {
    id: "north-melbourne",
    name: "North Melbourne",
    tagWeights: {
      budget: 0.66,
      public_transport: 0.76,
      quiet: 0.78,
      walkability: 0.72
    }
  },
  {
    id: "prahran",
    name: "Prahran",
    tagWeights: {
      fitness: 0.74,
      food: 0.76,
      nightlife: 0.82,
      public_transport: 0.78
    }
  },
  {
    id: "footscray",
    name: "Footscray",
    tagWeights: {
      budget: 0.9,
      creative: 0.72,
      food: 0.92,
      music: 0.58,
      public_transport: 0.8
    }
  },
  {
    id: "northcote",
    name: "Northcote",
    tagWeights: {
      creative: 0.78,
      music: 0.84,
      parks: 0.72,
      quiet: 0.56,
      walkability: 0.76
    }
  },
  {
    id: "docklands",
    name: "Docklands",
    tagWeights: {
      central_access: 0.86,
      public_transport: 0.8,
      quiet: 0.58,
      walkability: 0.68
    }
  },
  {
    id: "southbank",
    name: "Southbank",
    tagWeights: {
      central_access: 0.88,
      creative: 0.72,
      parks: 0.62,
      public_transport: 0.84,
      walkability: 0.82
    }
  },
  {
    id: "elwood",
    name: "Elwood",
    tagWeights: {
      beach: 0.9,
      coffee: 0.64,
      outdoors: 0.78,
      parks: 0.7,
      quiet: 0.82
    }
  },
  {
    id: "melbourne-cbd",
    name: "Melbourne CBD",
    tagWeights: {
      central_access: 0.95,
      coffee: 0.8,
      food: 0.86,
      music: 0.72,
      nightlife: 0.84,
      public_transport: 0.94
    }
  }
];

export const getTopSuburbNamesForTraits = ({
  fallbackNames,
  limit = 3,
  suburbs = defaultMelbourneSuburbProfiles,
  traits
}: {
  fallbackNames: string[];
  limit?: number;
  suburbs?: SuburbTagProfile[];
  traits: ProfileTraits;
}): string[] => {
  const scoredNames = scoreSuburbsForTraits({ limit, suburbs, traits }).map((match) => match.name);
  const fallbackFill = fallbackNames.filter((name) => !scoredNames.includes(name));

  return [...scoredNames, ...fallbackFill].slice(0, limit);
};
