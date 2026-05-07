export type ActivityGroupStatus = "forming" | "active" | "archived";

export type ActivityGroupSummary = {
  id: string;
  interestName: string;
  matchName?: string;
  status: ActivityGroupStatus;
  suggestedPlan?: string;
};
