export type ReliabilitySummaryRow = {
  attended_count?: number | null;
  attended_plan_streak?: number | null;
  check_in_streak?: number | null;
  feedback_count?: number | null;
  no_show_count?: number | null;
  positive_feedback_count?: number | null;
  reliable_plan_streak?: number | null;
};

export type ReliabilitySummary = {
  attendedCount: number;
  attendanceRate: number | null;
  attendedPlanStreak: number;
  checkInStreak: number;
  feedbackCount: number;
  hasActivityHistory: boolean;
  noShowCount: number;
  positiveFeedbackCount: number;
  reliablePlanStreak: number;
};

const countValue = (value: number | null | undefined): number => {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.floor(value))
    : 0;
};

export const normalizeReliabilitySummary = (
  row: ReliabilitySummaryRow | null | undefined,
): ReliabilitySummary => {
  const attendedCount = countValue(row?.attended_count);
  const noShowCount = countValue(row?.no_show_count);
  const attendedOrMissedCount = attendedCount + noShowCount;

  return {
    attendedCount,
    attendanceRate: attendedOrMissedCount > 0
      ? attendedCount / attendedOrMissedCount
      : null,
    attendedPlanStreak: countValue(row?.attended_plan_streak),
    checkInStreak: countValue(row?.check_in_streak),
    feedbackCount: countValue(row?.feedback_count),
    hasActivityHistory: attendedOrMissedCount > 0 ||
      countValue(row?.feedback_count) > 0,
    noShowCount,
    positiveFeedbackCount: countValue(row?.positive_feedback_count),
    reliablePlanStreak: countValue(row?.reliable_plan_streak),
  };
};
