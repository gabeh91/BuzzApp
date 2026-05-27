export type PostActivityCheckInCandidate = {
  activityGroupId: string;
  attendanceConfirmedAt: string | null;
  attendanceStatus: string;
  feedbackCompletedAt: string | null;
  groupCreatedAt: string | null;
  groupTitle: string;
  interestName: string;
  planStartsAt: string | null;
};

export const postActivityCheckInDelayMs = (days: number): number => {
  return Math.max(0, days) * 24 * 60 * 60 * 1000;
};

export const postActivityCheckInSnoozeMs = (hours: number): number => {
  return Math.max(0, hours) * 60 * 60 * 1000;
};

const getCandidateAnchorDate = (
  candidate: PostActivityCheckInCandidate,
): Date | null => {
  const rawDate = candidate.planStartsAt ?? candidate.groupCreatedAt;
  if (!rawDate) return null;

  const date = new Date(rawDate);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const isPostActivityCheckInDue = (
  candidate: PostActivityCheckInCandidate,
  now: Date,
  delayMs: number,
  expiryMs = Number.POSITIVE_INFINITY,
  snoozedUntilByGroupId: Record<string, string> = {},
): boolean => {
  if (candidate.feedbackCompletedAt) return false;

  const anchorDate = getCandidateAnchorDate(candidate);
  if (!anchorDate) return false;

  const snoozedUntil = snoozedUntilByGroupId[candidate.activityGroupId];
  if (snoozedUntil) {
    const snoozedUntilDate = new Date(snoozedUntil);
    if (
      !Number.isNaN(snoozedUntilDate.getTime()) &&
      snoozedUntilDate.getTime() > now.getTime()
    ) {
      return false;
    }
  }

  const ageMs = now.getTime() - anchorDate.getTime();
  return ageMs >= delayMs && ageMs <= expiryMs;
};

export const findNextPostActivityCheckIn = (
  candidates: PostActivityCheckInCandidate[],
  now: Date,
  delayMs: number,
  expiryMs = Number.POSITIVE_INFINITY,
  snoozedUntilByGroupId: Record<string, string> = {},
): PostActivityCheckInCandidate | null => {
  const dueCandidates = candidates.filter((candidate) =>
    isPostActivityCheckInDue(
      candidate,
      now,
      delayMs,
      expiryMs,
      snoozedUntilByGroupId,
    ),
  );

  dueCandidates.sort((left, right) => {
    const leftDate = getCandidateAnchorDate(left)?.getTime() ?? 0;
    const rightDate = getCandidateAnchorDate(right)?.getTime() ?? 0;
    return leftDate - rightDate;
  });

  return dueCandidates[0] ?? null;
};

export const getPostActivityCheckInDelayDays = (
  env: Record<string, string | undefined> = process.env,
): number => {
  const parsed = Number(env.EXPO_PUBLIC_POST_ACTIVITY_CHECKIN_DELAY_DAYS);
  return Number.isFinite(parsed) ? parsed : 2;
};

export const getPostActivityCheckInExpiryDays = (
  env: Record<string, string | undefined> = process.env,
): number => {
  const parsed = Number(env.EXPO_PUBLIC_POST_ACTIVITY_CHECKIN_EXPIRY_DAYS);
  return Number.isFinite(parsed) ? parsed : 14;
};

export const getPostActivityCheckInSnoozeHours = (
  env: Record<string, string | undefined> = process.env,
): number => {
  const parsed = Number(env.EXPO_PUBLIC_POST_ACTIVITY_CHECKIN_SNOOZE_HOURS);
  return Number.isFinite(parsed) ? parsed : 24;
};
