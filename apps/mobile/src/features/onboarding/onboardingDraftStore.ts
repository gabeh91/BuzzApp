import {
  createAnonymousOnboardingDraft,
  type AnonymousOnboardingDraft,
} from "./onboardingDraft";

export const anonymousOnboardingDraftStorageKey =
  "buzz.anonymousOnboardingDraft.v1";

type AnonymousOnboardingDraftStorageAdapter = {
  getItem: (key: string) => Promise<string | null>;
  removeItem: (key: string) => Promise<void>;
  setItem: (key: string, value: string) => Promise<void>;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const parseQuizAnswers = (
  value: unknown,
): AnonymousOnboardingDraft["answers"] => {
  if (!isRecord(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, string] => {
      return typeof entry[1] === "string";
    }),
  );
};

const parseAnonymousOnboardingDraft = (
  rawValue: string | null,
): AnonymousOnboardingDraft => {
  if (!rawValue) {
    return createAnonymousOnboardingDraft();
  }

  try {
    const parsed = JSON.parse(rawValue) as unknown;

    if (!isRecord(parsed) || !isRecord(parsed.answers)) {
      return createAnonymousOnboardingDraft();
    }

    const status =
      parsed.status === "partial" || parsed.status === "complete"
        ? parsed.status
        : "empty";

    const draft: AnonymousOnboardingDraft = {
      activeQuestionIndex:
        typeof parsed.activeQuestionIndex === "number"
          ? parsed.activeQuestionIndex
          : 0,
      answers: parseQuizAnswers(parsed.answers),
      selectedInterest: isRecord(parsed.selectedInterest)
        ? (parsed.selectedInterest as AnonymousOnboardingDraft["selectedInterest"])
        : null,
      status,
      shortProfileSubIndex:
        typeof parsed.shortProfileSubIndex === "number"
          ? parsed.shortProfileSubIndex
          : 0,
      shortProfileComplete: parsed.shortProfileComplete === true,
    };

    if (typeof parsed.profileDisplayName === "string") {
      draft.profileDisplayName = parsed.profileDisplayName;
    }

    if (typeof parsed.profileCityId === "string") {
      draft.profileCityId = parsed.profileCityId;
    }

    if (typeof parsed.profileCityName === "string") {
      draft.profileCityName = parsed.profileCityName;
    }

    if (typeof parsed.completedAt === "string") {
      draft.completedAt = parsed.completedAt;
    }

    if (typeof parsed.claimedUserId === "string") {
      draft.claimedUserId = parsed.claimedUserId;
    }

    return draft;
  } catch {
    return createAnonymousOnboardingDraft();
  }
};

export const createAnonymousOnboardingDraftStore = (
  storage: AnonymousOnboardingDraftStorageAdapter,
) => {
  return {
    clear: async () => {
      await storage.removeItem(anonymousOnboardingDraftStorageKey);
    },
    load: async () => {
      const rawDraft = await storage.getItem(
        anonymousOnboardingDraftStorageKey,
      );

      return parseAnonymousOnboardingDraft(rawDraft);
    },
    save: async (draft: AnonymousOnboardingDraft) => {
      await storage.setItem(
        anonymousOnboardingDraftStorageKey,
        JSON.stringify(draft),
      );
    },
    update: async (
      updater: (draft: AnonymousOnboardingDraft) => AnonymousOnboardingDraft,
    ) => {
      const current = await parseAnonymousOnboardingDraft(
        await storage.getItem(anonymousOnboardingDraftStorageKey),
      );
      const nextDraft = updater(current);

      await storage.setItem(
        anonymousOnboardingDraftStorageKey,
        JSON.stringify(nextDraft),
      );

      return nextDraft;
    },
  };
};
