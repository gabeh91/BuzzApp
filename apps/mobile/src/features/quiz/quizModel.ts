export type QuizTraitName = "energy" | "planning" | "socialStyle" | "availability" | "activityIntent";

export type ProfileTraits = {
  energy: "low" | "medium" | "high";
  planning: "spontaneous" | "balanced" | "planned";
  socialStyle: "one_on_one" | "small_group" | "large_group";
  availability: "weekday" | "weekend" | "mixed";
  activityIntent: "learn" | "practice" | "social";
  quizCompleted: boolean;
  answersCount: number;
  totalQuestions: number;
  summary: string;
};

export type QuizOption = {
  id: string;
  label: string;
  supportingText: string;
  traits: Partial<Record<QuizTraitName, ProfileTraits[QuizTraitName]>>;
};

export type QuizQuestion = {
  id: string;
  group: "lifestyle" | "social" | "availability" | "activities";
  prompt: string;
  options: QuizOption[];
};

export type QuizAnswers = Record<string, string>;

const option = (
  id: string,
  label: string,
  supportingText: string,
  traits: QuizOption["traits"]
): QuizOption => ({
  id,
  label,
  supportingText,
  traits
});

export const quizQuestions: QuizQuestion[] = [
  {
    id: "energy-after-work",
    group: "lifestyle",
    prompt: "After work, what usually feels most realistic?",
    options: [
      option("quiet-reset", "A quiet reset", "Low-pressure plans land best.", { energy: "low" }),
      option("easy-outing", "An easy outing", "You like something social but contained.", { energy: "medium" }),
      option("proper-plan", "A proper plan", "If it is worthwhile, you are in.", { energy: "high" })
    ]
  },
  {
    id: "weekend-rhythm",
    group: "lifestyle",
    prompt: "Your ideal weekend rhythm is closest to...",
    options: [
      option("slow-start", "Slow start, one good thing", "A single intentional plan works.", { energy: "low", planning: "planned" }),
      option("loose-list", "A loose list", "You like options without pressure.", { energy: "medium", planning: "balanced" }),
      option("full-calendar", "A full calendar", "You are happy stacking plans.", { energy: "high", planning: "planned" })
    ]
  },
  {
    id: "planning-style",
    group: "lifestyle",
    prompt: "How far ahead do you prefer to lock plans in?",
    options: [
      option("same-day", "Same day is fine", "Spontaneous plans feel natural.", { planning: "spontaneous" }),
      option("few-days", "A few days ahead", "A little structure helps.", { planning: "balanced" }),
      option("week-plus", "A week or more", "You like clear plans.", { planning: "planned" })
    ]
  },
  {
    id: "new-city-need",
    group: "lifestyle",
    prompt: "What would help you feel more settled?",
    options: [
      option("regular-places", "Regular places", "You want familiar local anchors.", { activityIntent: "social" }),
      option("new-skills", "New skills", "Learning gives you momentum.", { activityIntent: "learn" }),
      option("active-routine", "An active routine", "You want repeatable activities.", { activityIntent: "practice" })
    ]
  },
  {
    id: "first-meet-format",
    group: "social",
    prompt: "For a first meet-up, you would rather...",
    options: [
      option("one-person", "Meet one person", "Focused and easy to read.", { socialStyle: "one_on_one" }),
      option("small-crew", "Join a small crew", "Enough energy without overwhelm.", { socialStyle: "small_group" }),
      option("bigger-group", "Go where there is a crowd", "More people feels easier.", { socialStyle: "large_group" })
    ]
  },
  {
    id: "conversation-style",
    group: "social",
    prompt: "Good conversation usually happens when...",
    options: [
      option("deep-chat", "There is time to go deeper", "One-on-one plans fit.", { socialStyle: "one_on_one" }),
      option("shared-task", "You are doing something together", "Activity-led groups fit.", { socialStyle: "small_group" }),
      option("light-energy", "The room has momentum", "Bigger group energy helps.", { socialStyle: "large_group" })
    ]
  },
  {
    id: "group-comfort",
    group: "social",
    prompt: "Walking into a new group, you prefer...",
    options: [
      option("known-person", "Knowing one person first", "A smaller bridge matters.", { socialStyle: "one_on_one" }),
      option("clear-plan", "A clear plan or activity", "Structure makes groups easier.", { socialStyle: "small_group" }),
      option("open-room", "An open room with options", "You can find your own rhythm.", { socialStyle: "large_group" })
    ]
  },
  {
    id: "social-frequency",
    group: "social",
    prompt: "Right now, you want social plans...",
    options: [
      option("occasionally", "Occasionally", "Quality over frequency.", { energy: "low" }),
      option("weekly", "Weekly", "A steady cadence sounds good.", { energy: "medium" }),
      option("often", "Often", "You want momentum quickly.", { energy: "high" })
    ]
  },
  {
    id: "weekday-availability",
    group: "availability",
    prompt: "Weekdays are usually...",
    options: [
      option("not-ideal", "Not ideal", "Weekends will be stronger.", { availability: "weekend" }),
      option("some-evenings", "Some evenings work", "Mixed availability fits.", { availability: "mixed" }),
      option("very-flexible", "Pretty flexible", "Weekday plans are realistic.", { availability: "weekday" })
    ]
  },
  {
    id: "weekend-availability",
    group: "availability",
    prompt: "Weekends are usually...",
    options: [
      option("protected", "Protected downtime", "Lower-pressure plans matter.", { energy: "low", availability: "weekday" }),
      option("partly-open", "Partly open", "One good plan works.", { availability: "mixed" }),
      option("best-time", "The best time to meet", "Weekend activities fit.", { availability: "weekend" })
    ]
  },
  {
    id: "schedule-reliability",
    group: "availability",
    prompt: "When you say yes to a plan...",
    options: [
      option("need-flex", "I need flexibility", "Loose plans are safer.", { planning: "spontaneous" }),
      option("usually-good", "I am usually good", "Balanced planning fits.", { planning: "balanced" }),
      option("locked-in", "It is locked in", "Planned groups fit.", { planning: "planned" })
    ]
  },
  {
    id: "travel-radius",
    group: "availability",
    prompt: "How far would you travel for the right activity?",
    options: [
      option("nearby", "Nearby only", "Local matches matter most.", { energy: "low" }),
      option("across-town", "Across town sometimes", "You will travel for fit.", { energy: "medium" }),
      option("wherever-good", "Wherever it is good", "Strong intent opens options.", { energy: "high" })
    ]
  },
  {
    id: "activity-learning",
    group: "activities",
    prompt: "Trying something new feels...",
    options: [
      option("gentle", "Good if it is gentle", "Beginner-friendly matters.", { activityIntent: "learn", energy: "low" }),
      option("exciting", "Exciting with the right people", "Learning socially fits.", { activityIntent: "learn", socialStyle: "small_group" }),
      option("very-me", "Very me", "You like active discovery.", { activityIntent: "learn", energy: "high" })
    ]
  },
  {
    id: "activity-repeat",
    group: "activities",
    prompt: "If an activity clicks, you would...",
    options: [
      option("keep-casual", "Keep it casual", "No pressure to make it a routine.", { planning: "spontaneous" }),
      option("do-again", "Do it again soon", "Repeat plans could work.", { activityIntent: "practice" }),
      option("build-routine", "Build a routine", "Consistency motivates you.", { activityIntent: "practice", planning: "planned" })
    ]
  },
  {
    id: "activity-vibe",
    group: "activities",
    prompt: "The best activity vibe is...",
    options: [
      option("calm", "Calm and easy", "Low-pressure is key.", { energy: "low" }),
      option("warm", "Warm and social", "Connection matters.", { activityIntent: "social", socialStyle: "small_group" }),
      option("energetic", "Energetic and memorable", "Momentum matters.", { energy: "high" })
    ]
  },
  {
    id: "skill-level",
    group: "activities",
    prompt: "Joining around a skill, you prefer...",
    options: [
      option("beginner", "Beginner-friendly", "Learning with others helps.", { activityIntent: "learn" }),
      option("mixed", "Mixed levels", "Social fit matters more.", { socialStyle: "small_group" }),
      option("focused", "A focused session", "Practice matters.", { activityIntent: "practice" })
    ]
  },
  {
    id: "food-coffee",
    group: "activities",
    prompt: "Food or coffee plans feel like...",
    options: [
      option("safe-first", "A safe first step", "Easy one-on-one plans fit.", { socialStyle: "one_on_one" }),
      option("group-anchor", "A good group anchor", "Small group intros fit.", { socialStyle: "small_group" }),
      option("backup", "A backup option", "More active plans may fit better.", { energy: "high" })
    ]
  },
  {
    id: "outdoor-indoor",
    group: "activities",
    prompt: "You are more drawn to...",
    options: [
      option("indoor", "Indoor and cosy", "Low-friction plans fit.", { energy: "low" }),
      option("either", "Either, with good people", "Social fit leads.", { socialStyle: "small_group" }),
      option("outdoor", "Outdoor and active", "Higher-energy plans fit.", { energy: "high" })
    ]
  },
  {
    id: "follow-through",
    group: "activities",
    prompt: "After a good first activity, you would like...",
    options: [
      option("leave-open", "Leave it open", "No forced continuity.", { planning: "spontaneous" }),
      option("suggest-next", "Suggest a next one", "A natural follow-up helps.", { planning: "balanced" }),
      option("make-regular", "Make it regular", "A routine could stick.", { planning: "planned" })
    ]
  },
  {
    id: "buzz-outcome",
    group: "activities",
    prompt: "If Buzz works for you, it will help you...",
    options: [
      option("feel-at-home", "Feel more at home", "Belonging is the goal.", { activityIntent: "social" }),
      option("try-things", "Try things I have been putting off", "Discovery is the goal.", { activityIntent: "learn" }),
      option("build-rhythm", "Build a rhythm in the city", "Routine is the goal.", { activityIntent: "practice" })
    ]
  }
];

const defaultTraits: Pick<ProfileTraits, QuizTraitName> = {
  energy: "medium",
  planning: "balanced",
  socialStyle: "small_group",
  availability: "mixed",
  activityIntent: "social"
};

const labels: Record<QuizTraitName, Record<string, string>> = {
  energy: {
    low: "lower-pressure",
    medium: "balanced-energy",
    high: "high-momentum"
  },
  planning: {
    spontaneous: "spontaneous",
    balanced: "lightly planned",
    planned: "planned"
  },
  socialStyle: {
    one_on_one: "one-on-one",
    small_group: "small groups",
    large_group: "bigger groups"
  },
  availability: {
    weekday: "weekday",
    weekend: "weekend",
    mixed: "mixed"
  },
  activityIntent: {
    learn: "learning-led",
    practice: "routine-building",
    social: "social"
  }
};

const chooseMostCommon = <T extends string>(values: T[], fallback: T): T => {
  const counts = new Map<T, number>();

  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? fallback;
};

export const deriveProfileTraits = (answers: QuizAnswers): ProfileTraits => {
  const selectedOptions = quizQuestions
    .map((question) => question.options.find((answer) => answer.id === answers[question.id]))
    .filter((answer): answer is QuizOption => Boolean(answer));

  const traitValues = <Name extends QuizTraitName>(name: Name): ProfileTraits[Name][] => {
    return selectedOptions
      .map((answer) => answer.traits[name])
      .filter((value): value is ProfileTraits[Name] => Boolean(value));
  };

  const traits: Pick<ProfileTraits, QuizTraitName> = {
    energy: chooseMostCommon(traitValues("energy"), defaultTraits.energy),
    planning: chooseMostCommon(traitValues("planning"), defaultTraits.planning),
    socialStyle: chooseMostCommon(traitValues("socialStyle"), defaultTraits.socialStyle),
    availability: chooseMostCommon(traitValues("availability"), defaultTraits.availability),
    activityIntent: chooseMostCommon(traitValues("activityIntent"), defaultTraits.activityIntent)
  };

  return {
    ...traits,
    quizCompleted: selectedOptions.length === quizQuestions.length,
    answersCount: selectedOptions.length,
    totalQuestions: quizQuestions.length,
    summary: `You seem best matched to ${labels.socialStyle[traits.socialStyle]}, ${labels.energy[traits.energy]} plans, and ${labels.activityIntent[traits.activityIntent]} activities.`
  };
};
