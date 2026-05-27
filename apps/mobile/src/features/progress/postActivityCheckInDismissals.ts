import type { StorageAdapter } from "@/lib/storage";

export const postActivityCheckInDismissalsStorageKey = (userId: string) =>
  `buzz.postActivityCheckInDismissals.v1.${userId}`;

export type PostActivityCheckInDismissals = Record<string, string>;

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

export const parsePostActivityCheckInDismissals = (
  rawValue: string | null,
): PostActivityCheckInDismissals => {
  if (!rawValue) return {};

  try {
    const parsed = JSON.parse(rawValue) as unknown;

    if (!isRecord(parsed)) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(parsed).filter((entry): entry is [string, string] => {
        return typeof entry[1] === "string";
      }),
    );
  } catch {
    return {};
  }
};

export const prunePostActivityCheckInDismissals = (
  dismissals: PostActivityCheckInDismissals,
  now: Date,
): PostActivityCheckInDismissals => {
  return Object.fromEntries(
    Object.entries(dismissals).filter(([, snoozedUntil]) => {
      const snoozedUntilDate = new Date(snoozedUntil);
      return !Number.isNaN(snoozedUntilDate.getTime()) &&
        snoozedUntilDate.getTime() > now.getTime();
    }),
  );
};

export const createPostActivityCheckInDismissalStore = (
  storage: StorageAdapter,
  userId: string,
) => {
  const storageKey = postActivityCheckInDismissalsStorageKey(userId);

  return {
    load: async (now = new Date()): Promise<PostActivityCheckInDismissals> => {
      const activeDismissals = prunePostActivityCheckInDismissals(
        parsePostActivityCheckInDismissals(await storage.getItem(storageKey)),
        now,
      );

      await storage.setItem(storageKey, JSON.stringify(activeDismissals));

      return activeDismissals;
    },
    snooze: async ({
      activityGroupId,
      snoozedUntil,
      now = new Date(),
    }: {
      activityGroupId: string;
      snoozedUntil: string;
      now?: Date;
    }): Promise<PostActivityCheckInDismissals> => {
      const currentDismissals = prunePostActivityCheckInDismissals(
        parsePostActivityCheckInDismissals(await storage.getItem(storageKey)),
        now,
      );
      const nextDismissals = {
        ...currentDismissals,
        [activityGroupId]: snoozedUntil,
      };

      await storage.setItem(storageKey, JSON.stringify(nextDismissals));

      return nextDismissals;
    },
  };
};
