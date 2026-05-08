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
  high_energy: "Fits your higher-energy pace.",
  learn: "Good for learning something new.",
  low_energy: "Fits a calmer social pace.",
  one_on_one: "Works for simple one-on-one plans.",
  planned: "Works well for clearly planned activities.",
  practice: "Good for building a regular routine.",
  small_group: "Good for small-group plans.",
  social: "Strong fit for casual social plans.",
  spontaneous: "Supports more spontaneous plans.",
  weekday: "Works well for weekday availability.",
  weekend: "Works well for weekend availability."
};

const tagsForTraits = (traits: ProfileTraits): string[] => {
  const tags = [
    traits.energy === "low" ? "low_energy" : null,
    traits.energy === "high" ? "high_energy" : null,
    traits.planning,
    traits.socialStyle,
    traits.availability === "mixed" ? "weekday" : traits.availability,
    traits.availability === "mixed" ? "weekend" : null,
    traits.activityIntent
  ];

  return tags.filter((tag): tag is string => Boolean(tag));
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
