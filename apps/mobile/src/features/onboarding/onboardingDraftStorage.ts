import { fileStorage } from "@/lib/fileStorage";
import { createAnonymousOnboardingDraftStore } from "./onboardingDraftStore";

export const anonymousOnboardingDraftStore =
  createAnonymousOnboardingDraftStore(fileStorage);
