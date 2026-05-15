import type { BuzzAuthUser } from "@/auth/auth.types";

import type { ProfileTraits, QuizAnswers } from "./quizModel";

export type BuzzProfilePersistenceInput = {
  userId: string;
  displayName: string;
  cityId: string;
  quizAnswers: Record<string, unknown>;
  quizTraits: Record<string, unknown>;
};

export const createBuzzProfilePersistenceInput = ({
  user,
  answers,
  traits,
  overrides,
}: {
  user: BuzzAuthUser;
  answers: QuizAnswers;
  traits: ProfileTraits;
  overrides?: { displayName?: string; cityId?: string };
}): BuzzProfilePersistenceInput => {
  return {
    userId: user.id,
    displayName: overrides?.displayName ?? user.displayName,
    cityId: overrides?.cityId ?? user.cityId,
    quizAnswers: answers,
    quizTraits: traits,
  };
};

export const shouldPersistProfileToSupabase = (user: BuzzAuthUser): boolean => {
  return user.authSource === "supabase";
};
