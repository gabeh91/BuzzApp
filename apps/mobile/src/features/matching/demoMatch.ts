import type { ProfileTraits } from "../quiz/quizModel";

export type DemoMatchInput = {
  interestName: string;
  traits: ProfileTraits;
};

export type DemoMatchPreview = {
  displayName: string;
  interestName: string;
  headline: string;
  reason: string;
  suggestedPlan: string;
  isDemo: boolean;
};

export const createDemoMatchPreview = ({ interestName, traits }: DemoMatchInput): DemoMatchPreview => {
  const groupPhrase = traits.socialStyle === "one_on_one" ? "one-on-one" : traits.socialStyle === "large_group" ? "open group" : "small group";
  const pacePhrase = traits.energy === "high" ? "with real momentum" : traits.energy === "low" ? "without pressure" : "at an easy pace";

  return {
    displayName: "Sam",
    interestName,
    headline: `Sam is also open to ${interestName}`,
    reason: `You both look suited to a ${groupPhrase} ${interestName} plan ${pacePhrase}.`,
    suggestedPlan:
      traits.planning === "spontaneous"
        ? `Suggest a low-pressure ${interestName} session this week.`
        : `Suggest a clear ${interestName} plan for the next ${traits.availability === "weekend" ? "weekend" : "few days"}.`,
    isDemo: true
  };
};
