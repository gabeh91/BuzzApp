import { useCallback, useEffect, useState } from "react";

import { buzzSupabase } from "@/lib/supabase";

import {
  normalizeReliabilitySummary,
  type ReliabilitySummary,
  type ReliabilitySummaryRow,
} from "./reliabilitySummary";

type ReliabilitySummaryState = {
  loading: boolean;
  summary: ReliabilitySummary;
};

const emptySummary = normalizeReliabilitySummary(null);

export const useReliabilitySummary = ({
  enabled,
  userId,
}: {
  enabled: boolean;
  userId: string;
}): ReliabilitySummaryState => {
  const [state, setState] = useState<ReliabilitySummaryState>({
    loading: false,
    summary: emptySummary,
  });

  const loadSummary = useCallback(async () => {
    if (!enabled) {
      setState({ loading: false, summary: emptySummary });
      return;
    }

    setState((current) => ({ ...current, loading: true }));

    const { data, error } = await buzzSupabase
      .from("user_reliability")
      .select(
        "attended_count, attended_plan_streak, check_in_streak, feedback_count, no_show_count, positive_feedback_count, reliable_plan_streak",
      )
      .eq("user_id", userId)
      .maybeSingle();

    setState({
      loading: false,
      summary: error
        ? emptySummary
        : normalizeReliabilitySummary(data as ReliabilitySummaryRow | null),
    });
  }, [enabled, userId]);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  return state;
};
