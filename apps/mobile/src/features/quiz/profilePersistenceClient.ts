import { buzzSupabase } from "@/lib/supabase";

import type { BuzzProfilePersistenceInput } from "./profilePersistence";

export const persistBuzzProfileToSupabase = async (
  input: BuzzProfilePersistenceInput,
): Promise<void> => {
  const { error } = await buzzSupabase.rpc("upsertBuzzProfile", {
    cityId: input.cityId,
    displayName: input.displayName,
    quizAnswers: input.quizAnswers,
    quizTraits: input.quizTraits,
    userId: input.userId,
  });

  if (error) {
    throw new Error(error.message ?? "Unable to save quiz answers");
  }
};
