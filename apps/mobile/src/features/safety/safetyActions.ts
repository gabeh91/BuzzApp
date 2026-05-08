export type ReportCategory = "unsafe" | "harassment" | "spam" | "no_show" | "other";

export type ReportDraftInput = {
  reporterId: string;
  reason: string;
  targetUserId?: string;
  activityGroupId?: string;
  category?: ReportCategory;
  details?: string;
};

export type ReportDraft = {
  reporterId: string;
  reason: string;
  status: "draft";
  canSubmit: boolean;
  targetUserId?: string;
  activityGroupId?: string;
  category: ReportCategory;
  details?: string;
};

export type BlockPayloadInput = {
  blockerId: string;
  blockedId: string;
  activityGroupId?: string;
};

export type BlockPayload = {
  blockerId: string;
  blockedId: string;
  source: "group" | "profile";
  activityGroupId?: string;
};

const trimOptional = (value?: string): string | undefined => {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : undefined;
};

export const createReportDraft = ({
  activityGroupId,
  category = "other",
  details,
  reason,
  reporterId,
  targetUserId
}: ReportDraftInput): ReportDraft => {
  const normalizedReason = reason.trim();
  const normalizedDetails = trimOptional(details);
  const draft: ReportDraft = {
    reporterId,
    reason: normalizedReason,
    status: "draft",
    canSubmit: reporterId.trim().length > 0 && normalizedReason.length > 0,
    category
  };

  if (activityGroupId) {
    draft.activityGroupId = activityGroupId;
  }

  if (targetUserId) {
    draft.targetUserId = targetUserId;
  }

  if (normalizedDetails) {
    draft.details = normalizedDetails;
  }

  return draft;
};

export const createBlockPayload = ({
  activityGroupId,
  blockedId,
  blockerId
}: BlockPayloadInput): BlockPayload => {
  const payload: BlockPayload = {
    blockedId,
    blockerId,
    source: activityGroupId ? "group" : "profile"
  };

  if (activityGroupId) {
    payload.activityGroupId = activityGroupId;
  }

  return payload;
};

export const canShowExactLocation = (shareExactLocation: boolean, planConfirmed = false): boolean => {
  return shareExactLocation && planConfirmed;
};
