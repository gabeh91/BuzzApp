import { useCallback } from "react";

import { useBuzzAuth } from "@/auth/AuthProvider";
import type { BuzzAuthUser } from "@/auth/auth.types";

import {
  createBuzzProfilePersistenceInput,
  shouldPersistProfileToSupabase,
} from "./profilePersistence";
import { persistBuzzProfileToSupabase } from "./profilePersistenceClient";
import { useQuiz } from "./QuizProvider";

export const usePersistQuizProfile = () => {
  const { user } = useBuzzAuth();
  const quiz = useQuiz();

  return useCallback(
    async (profileUser: BuzzAuthUser = user) => {
      const input = createBuzzProfilePersistenceInput({
        user: profileUser,
        answers: quiz.answers,
        traits: quiz.traits,
      });

      quiz.markProfileSaving(input);

      if (!shouldPersistProfileToSupabase(profileUser)) {
        quiz.markProfilePersisted(input);
        return;
      }

      try {
        await persistBuzzProfileToSupabase(input);
        quiz.markProfilePersisted(input);
      } catch (caught) {
        quiz.markProfilePersistenceFailed(
          input,
          caught instanceof Error ? caught.message : undefined,
        );
        throw caught;
      }
    },
    [quiz, user],
  );
};
