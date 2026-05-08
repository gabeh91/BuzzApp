export type InviteContextType = "group";

export type InviteDraftInput = {
  activityGroupId: string;
  inviterId: string;
  activityPlanId?: string;
  expiresInHours?: number;
  maxUses?: number;
};

export type InviteDraft = {
  activityGroupId: string;
  contextType: InviteContextType;
  expiresInHours: number;
  inviterId: string;
  maxUses: number;
  activityPlanId?: string;
};

export type GroupInviteLinkInput = {
  origin: string;
  token: string;
};

export const createInviteDraft = ({
  activityGroupId,
  activityPlanId,
  expiresInHours = 72,
  inviterId,
  maxUses = 1
}: InviteDraftInput): InviteDraft => {
  const draft: InviteDraft = {
    activityGroupId,
    contextType: "group",
    expiresInHours,
    inviterId,
    maxUses
  };

  if (activityPlanId) {
    draft.activityPlanId = activityPlanId;
  }

  return draft;
};

export const normalizeInviteToken = (token: string): string => {
  return token.trim();
};

export const createGroupInviteLink = ({ origin, token }: GroupInviteLinkInput): string => {
  return `${origin.replace(/\/$/, "")}/join/group/${encodeURIComponent(normalizeInviteToken(token))}`;
};
