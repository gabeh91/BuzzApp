export type Interest = {
  id: string;
  name: string;
  slug: string;
  category: string;
};

export type Business = {
  description: string | null;
  id: string;
  name: string;
};

export type Event = {
  id: string;
  title: string;
};

export type CitySetting = {
  activationExpiryHours: number;
  cityId: string;
  defaultGroupSizeMax: number;
  defaultGroupSizeMin: number;
  isWaitlistEnabled: boolean;
  matchingRadiusKm: number | string;
  requiresInvite: boolean;
};

export type Report = {
  activityGroupId: string | null;
  category: string;
  createdAt: string;
  details: string | null;
  id: string;
  metadataJson: Record<string, unknown>;
  reason: string;
  source: string;
  status: string;
  targetUserId: string | null;
};

export type ActivityGroup = {
  createdAt: string;
  id: string;
  status: string;
  title: string;
};

export type Reliability = {
  attendedCount: number;
  cancelledLateCount: number;
  feedbackCount: number;
  noShowCount: number;
  reliabilityScore: number | string;
  updatedAt: string;
  userId: string;
};

export type StarterPlan = {
  createdAt: string;
  id: string;
  maxGroupSize: number;
  minGroupSize: number;
  status: string;
  title: string;
};

export type AdminDashboardData = {
  activityGroups: ActivityGroup[];
  businesses: Business[];
  citySettings: CitySetting[];
  events: Event[];
  interests: Interest[];
  reliability: Reliability[];
  reports: Report[];
  starterPlans: StarterPlan[];
};
