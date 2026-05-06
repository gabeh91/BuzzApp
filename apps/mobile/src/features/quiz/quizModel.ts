import { LL, type I18n } from "@/i18n";

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

export const createQuizQuestions = (translations: I18n = LL): QuizQuestion[] => {
  const q = translations.quiz.questions;

  return [
    {
      id: "energy-after-work",
      group: "lifestyle",
      prompt: q.energyAfterWork.prompt(),
      options: [
        option("quiet-reset", q.energyAfterWork.options.quietReset.label(), q.energyAfterWork.options.quietReset.supportingText(), { energy: "low" }),
        option("easy-outing", q.energyAfterWork.options.easyOuting.label(), q.energyAfterWork.options.easyOuting.supportingText(), { energy: "medium" }),
        option("proper-plan", q.energyAfterWork.options.properPlan.label(), q.energyAfterWork.options.properPlan.supportingText(), { energy: "high" })
      ]
    },
    {
      id: "weekend-rhythm",
      group: "lifestyle",
      prompt: q.weekendRhythm.prompt(),
      options: [
        option("slow-start", q.weekendRhythm.options.slowStart.label(), q.weekendRhythm.options.slowStart.supportingText(), { energy: "low", planning: "planned" }),
        option("loose-list", q.weekendRhythm.options.looseList.label(), q.weekendRhythm.options.looseList.supportingText(), { energy: "medium", planning: "balanced" }),
        option("full-calendar", q.weekendRhythm.options.fullCalendar.label(), q.weekendRhythm.options.fullCalendar.supportingText(), { energy: "high", planning: "planned" })
      ]
    },
    {
      id: "planning-style",
      group: "lifestyle",
      prompt: q.planningStyle.prompt(),
      options: [
        option("same-day", q.planningStyle.options.sameDay.label(), q.planningStyle.options.sameDay.supportingText(), { planning: "spontaneous" }),
        option("few-days", q.planningStyle.options.fewDays.label(), q.planningStyle.options.fewDays.supportingText(), { planning: "balanced" }),
        option("week-plus", q.planningStyle.options.weekPlus.label(), q.planningStyle.options.weekPlus.supportingText(), { planning: "planned" })
      ]
    },
    {
      id: "new-city-need",
      group: "lifestyle",
      prompt: q.newCityNeed.prompt(),
      options: [
        option("regular-places", q.newCityNeed.options.regularPlaces.label(), q.newCityNeed.options.regularPlaces.supportingText(), { activityIntent: "social" }),
        option("new-skills", q.newCityNeed.options.newSkills.label(), q.newCityNeed.options.newSkills.supportingText(), { activityIntent: "learn" }),
        option("active-routine", q.newCityNeed.options.activeRoutine.label(), q.newCityNeed.options.activeRoutine.supportingText(), { activityIntent: "practice" })
      ]
    },
    {
      id: "first-meet-format",
      group: "social",
      prompt: q.firstMeetFormat.prompt(),
      options: [
        option("one-person", q.firstMeetFormat.options.onePerson.label(), q.firstMeetFormat.options.onePerson.supportingText(), { socialStyle: "one_on_one" }),
        option("small-crew", q.firstMeetFormat.options.smallCrew.label(), q.firstMeetFormat.options.smallCrew.supportingText(), { socialStyle: "small_group" }),
        option("bigger-group", q.firstMeetFormat.options.biggerGroup.label(), q.firstMeetFormat.options.biggerGroup.supportingText(), { socialStyle: "large_group" })
      ]
    },
    {
      id: "conversation-style",
      group: "social",
      prompt: q.conversationStyle.prompt(),
      options: [
        option("deep-chat", q.conversationStyle.options.deepChat.label(), q.conversationStyle.options.deepChat.supportingText(), { socialStyle: "one_on_one" }),
        option("shared-task", q.conversationStyle.options.sharedTask.label(), q.conversationStyle.options.sharedTask.supportingText(), { socialStyle: "small_group" }),
        option("light-energy", q.conversationStyle.options.lightEnergy.label(), q.conversationStyle.options.lightEnergy.supportingText(), { socialStyle: "large_group" })
      ]
    },
    {
      id: "group-comfort",
      group: "social",
      prompt: q.groupComfort.prompt(),
      options: [
        option("known-person", q.groupComfort.options.knownPerson.label(), q.groupComfort.options.knownPerson.supportingText(), { socialStyle: "one_on_one" }),
        option("clear-plan", q.groupComfort.options.clearPlan.label(), q.groupComfort.options.clearPlan.supportingText(), { socialStyle: "small_group" }),
        option("open-room", q.groupComfort.options.openRoom.label(), q.groupComfort.options.openRoom.supportingText(), { socialStyle: "large_group" })
      ]
    },
    {
      id: "social-frequency",
      group: "social",
      prompt: q.socialFrequency.prompt(),
      options: [
        option("occasionally", q.socialFrequency.options.occasionally.label(), q.socialFrequency.options.occasionally.supportingText(), { energy: "low" }),
        option("weekly", q.socialFrequency.options.weekly.label(), q.socialFrequency.options.weekly.supportingText(), { energy: "medium" }),
        option("often", q.socialFrequency.options.often.label(), q.socialFrequency.options.often.supportingText(), { energy: "high" })
      ]
    },
    {
      id: "weekday-availability",
      group: "availability",
      prompt: q.weekdayAvailability.prompt(),
      options: [
        option("not-ideal", q.weekdayAvailability.options.notIdeal.label(), q.weekdayAvailability.options.notIdeal.supportingText(), { availability: "weekend" }),
        option("some-evenings", q.weekdayAvailability.options.someEvenings.label(), q.weekdayAvailability.options.someEvenings.supportingText(), { availability: "mixed" }),
        option("very-flexible", q.weekdayAvailability.options.veryFlexible.label(), q.weekdayAvailability.options.veryFlexible.supportingText(), { availability: "weekday" })
      ]
    },
    {
      id: "weekend-availability",
      group: "availability",
      prompt: q.weekendAvailability.prompt(),
      options: [
        option("protected", q.weekendAvailability.options.protected.label(), q.weekendAvailability.options.protected.supportingText(), { energy: "low", availability: "weekday" }),
        option("partly-open", q.weekendAvailability.options.partlyOpen.label(), q.weekendAvailability.options.partlyOpen.supportingText(), { availability: "mixed" }),
        option("best-time", q.weekendAvailability.options.bestTime.label(), q.weekendAvailability.options.bestTime.supportingText(), { availability: "weekend" })
      ]
    },
    {
      id: "schedule-reliability",
      group: "availability",
      prompt: q.scheduleReliability.prompt(),
      options: [
        option("need-flex", q.scheduleReliability.options.needFlex.label(), q.scheduleReliability.options.needFlex.supportingText(), { planning: "spontaneous" }),
        option("usually-good", q.scheduleReliability.options.usuallyGood.label(), q.scheduleReliability.options.usuallyGood.supportingText(), { planning: "balanced" }),
        option("locked-in", q.scheduleReliability.options.lockedIn.label(), q.scheduleReliability.options.lockedIn.supportingText(), { planning: "planned" })
      ]
    },
    {
      id: "travel-radius",
      group: "availability",
      prompt: q.travelRadius.prompt(),
      options: [
        option("nearby", q.travelRadius.options.nearby.label(), q.travelRadius.options.nearby.supportingText(), { energy: "low" }),
        option("across-town", q.travelRadius.options.acrossTown.label(), q.travelRadius.options.acrossTown.supportingText(), { energy: "medium" }),
        option("wherever-good", q.travelRadius.options.whereverGood.label(), q.travelRadius.options.whereverGood.supportingText(), { energy: "high" })
      ]
    },
    {
      id: "activity-learning",
      group: "activities",
      prompt: q.activityLearning.prompt(),
      options: [
        option("gentle", q.activityLearning.options.gentle.label(), q.activityLearning.options.gentle.supportingText(), { activityIntent: "learn", energy: "low" }),
        option("exciting", q.activityLearning.options.exciting.label(), q.activityLearning.options.exciting.supportingText(), { activityIntent: "learn", socialStyle: "small_group" }),
        option("very-me", q.activityLearning.options.veryMe.label(), q.activityLearning.options.veryMe.supportingText(), { activityIntent: "learn", energy: "high" })
      ]
    },
    {
      id: "activity-repeat",
      group: "activities",
      prompt: q.activityRepeat.prompt(),
      options: [
        option("keep-casual", q.activityRepeat.options.keepCasual.label(), q.activityRepeat.options.keepCasual.supportingText(), { planning: "spontaneous" }),
        option("do-again", q.activityRepeat.options.doAgain.label(), q.activityRepeat.options.doAgain.supportingText(), { activityIntent: "practice" }),
        option("build-routine", q.activityRepeat.options.buildRoutine.label(), q.activityRepeat.options.buildRoutine.supportingText(), { activityIntent: "practice", planning: "planned" })
      ]
    },
    {
      id: "activity-vibe",
      group: "activities",
      prompt: q.activityVibe.prompt(),
      options: [
        option("calm", q.activityVibe.options.calm.label(), q.activityVibe.options.calm.supportingText(), { energy: "low" }),
        option("warm", q.activityVibe.options.warm.label(), q.activityVibe.options.warm.supportingText(), { activityIntent: "social", socialStyle: "small_group" }),
        option("energetic", q.activityVibe.options.energetic.label(), q.activityVibe.options.energetic.supportingText(), { energy: "high" })
      ]
    },
    {
      id: "skill-level",
      group: "activities",
      prompt: q.skillLevel.prompt(),
      options: [
        option("beginner", q.skillLevel.options.beginner.label(), q.skillLevel.options.beginner.supportingText(), { activityIntent: "learn" }),
        option("mixed", q.skillLevel.options.mixed.label(), q.skillLevel.options.mixed.supportingText(), { socialStyle: "small_group" }),
        option("focused", q.skillLevel.options.focused.label(), q.skillLevel.options.focused.supportingText(), { activityIntent: "practice" })
      ]
    },
    {
      id: "food-coffee",
      group: "activities",
      prompt: q.foodCoffee.prompt(),
      options: [
        option("safe-first", q.foodCoffee.options.safeFirst.label(), q.foodCoffee.options.safeFirst.supportingText(), { socialStyle: "one_on_one" }),
        option("group-anchor", q.foodCoffee.options.groupAnchor.label(), q.foodCoffee.options.groupAnchor.supportingText(), { socialStyle: "small_group" }),
        option("backup", q.foodCoffee.options.backup.label(), q.foodCoffee.options.backup.supportingText(), { energy: "high" })
      ]
    },
    {
      id: "outdoor-indoor",
      group: "activities",
      prompt: q.outdoorIndoor.prompt(),
      options: [
        option("indoor", q.outdoorIndoor.options.indoor.label(), q.outdoorIndoor.options.indoor.supportingText(), { energy: "low" }),
        option("either", q.outdoorIndoor.options.either.label(), q.outdoorIndoor.options.either.supportingText(), { socialStyle: "small_group" }),
        option("outdoor", q.outdoorIndoor.options.outdoor.label(), q.outdoorIndoor.options.outdoor.supportingText(), { energy: "high" })
      ]
    },
    {
      id: "follow-through",
      group: "activities",
      prompt: q.followThrough.prompt(),
      options: [
        option("leave-open", q.followThrough.options.leaveOpen.label(), q.followThrough.options.leaveOpen.supportingText(), { planning: "spontaneous" }),
        option("suggest-next", q.followThrough.options.suggestNext.label(), q.followThrough.options.suggestNext.supportingText(), { planning: "balanced" }),
        option("make-regular", q.followThrough.options.makeRegular.label(), q.followThrough.options.makeRegular.supportingText(), { planning: "planned" })
      ]
    },
    {
      id: "buzz-outcome",
      group: "activities",
      prompt: q.buzzOutcome.prompt(),
      options: [
        option("feel-at-home", q.buzzOutcome.options.feelAtHome.label(), q.buzzOutcome.options.feelAtHome.supportingText(), { activityIntent: "social" }),
        option("try-things", q.buzzOutcome.options.tryThings.label(), q.buzzOutcome.options.tryThings.supportingText(), { activityIntent: "learn" }),
        option("build-rhythm", q.buzzOutcome.options.buildRhythm.label(), q.buzzOutcome.options.buildRhythm.supportingText(), { activityIntent: "practice" })
      ]
    }
  ];
};

export const quizQuestions: QuizQuestion[] = createQuizQuestions();

const defaultTraits: Pick<ProfileTraits, QuizTraitName> = {
  energy: "medium",
  planning: "balanced",
  socialStyle: "small_group",
  availability: "mixed",
  activityIntent: "social"
};

const createTraitLabels = (translations: I18n = LL): Record<QuizTraitName, Record<string, string>> => {
  return {
    energy: {
      low: translations.quiz.traitLabels.energy.low(),
      medium: translations.quiz.traitLabels.energy.medium(),
      high: translations.quiz.traitLabels.energy.high()
    },
    planning: {
      spontaneous: translations.quiz.traitLabels.planning.spontaneous(),
      balanced: translations.quiz.traitLabels.planning.balanced(),
      planned: translations.quiz.traitLabels.planning.planned()
    },
    socialStyle: {
      one_on_one: translations.quiz.traitLabels.socialStyle.oneOnOne(),
      small_group: translations.quiz.traitLabels.socialStyle.smallGroup(),
      large_group: translations.quiz.traitLabels.socialStyle.largeGroup()
    },
    availability: {
      weekday: translations.quiz.traitLabels.availability.weekday(),
      weekend: translations.quiz.traitLabels.availability.weekend(),
      mixed: translations.quiz.traitLabels.availability.mixed()
    },
    activityIntent: {
      learn: translations.quiz.traitLabels.activityIntent.learn(),
      practice: translations.quiz.traitLabels.activityIntent.practice(),
      social: translations.quiz.traitLabels.activityIntent.social()
    }
  };
};

const chooseMostCommon = <T extends string>(values: T[], fallback: T): T => {
  const counts = new Map<T, number>();

  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? fallback;
};

export const deriveProfileTraits = (
  answers: QuizAnswers,
  questions: QuizQuestion[] = quizQuestions,
  translations: I18n = LL
): ProfileTraits => {
  const selectedOptions = questions
    .map((question) => question.options.find((answer) => answer.id === answers[question.id]))
    .filter((answer): answer is QuizOption => Boolean(answer));
  const labels = createTraitLabels(translations);

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
    quizCompleted: selectedOptions.length === questions.length,
    answersCount: selectedOptions.length,
    totalQuestions: questions.length,
    summary: translations.quiz.summary({
      socialStyle: labels.socialStyle[traits.socialStyle] ?? labels.socialStyle.small_group,
      energy: labels.energy[traits.energy] ?? labels.energy.medium,
      activityIntent: labels.activityIntent[traits.activityIntent] ?? labels.activityIntent.social
    })
  };
};
