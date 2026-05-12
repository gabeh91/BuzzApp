/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import { gql } from '@apollo/client';
import type * as ApolloReactCommon from '@apollo/client';
import * as ApolloReactHooks from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  BigFloat: { input: unknown; output: unknown; }
  BigInt: { input: number; output: number; }
  Cursor: { input: unknown; output: unknown; }
  Date: { input: string; output: string; }
  Datetime: { input: string; output: string; }
  JSON: { input: Record<string, unknown>; output: Record<string, unknown>; }
  Opaque: { input: unknown; output: unknown; }
  Time: { input: unknown; output: unknown; }
  UUID: { input: string; output: string; }
};

export type ActivityGroupCheckins = Node & {
  activityGroup: ActivityGroups;
  activityGroupId: Scalars['UUID']['output'];
  createdAt: Scalars['Datetime']['output'];
  didHappen: Scalars['Boolean']['output'];
  feltSafe: Scalars['Boolean']['output'];
  id: Scalars['UUID']['output'];
  metadataJson: Scalars['JSON']['output'];
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  reportRequested: Scalars['Boolean']['output'];
  updatedAt: Scalars['Datetime']['output'];
  user?: Maybe<Profiles>;
  userId: Scalars['UUID']['output'];
  wouldMeetAgain: Scalars['Boolean']['output'];
};

export type ActivityGroupCheckinsConnection = {
  edges: Array<ActivityGroupCheckinsEdge>;
  pageInfo: PageInfo;
};

export type ActivityGroupCheckinsDeleteResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<ActivityGroupCheckins>;
};

export type ActivityGroupCheckinsEdge = {
  cursor: Scalars['String']['output'];
  node: ActivityGroupCheckins;
};

export type ActivityGroupCheckinsFilter = {
  activityGroupId?: InputMaybe<UuidFilter>;
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<ActivityGroupCheckinsFilter>>;
  createdAt?: InputMaybe<DatetimeFilter>;
  didHappen?: InputMaybe<BooleanFilter>;
  feltSafe?: InputMaybe<BooleanFilter>;
  id?: InputMaybe<UuidFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<ActivityGroupCheckinsFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<ActivityGroupCheckinsFilter>>;
  reportRequested?: InputMaybe<BooleanFilter>;
  updatedAt?: InputMaybe<DatetimeFilter>;
  userId?: InputMaybe<UuidFilter>;
  wouldMeetAgain?: InputMaybe<BooleanFilter>;
};

export type ActivityGroupCheckinsInsertInput = {
  activityGroupId?: InputMaybe<Scalars['UUID']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  didHappen?: InputMaybe<Scalars['Boolean']['input']>;
  feltSafe?: InputMaybe<Scalars['Boolean']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  metadataJson?: InputMaybe<Scalars['JSON']['input']>;
  reportRequested?: InputMaybe<Scalars['Boolean']['input']>;
  updatedAt?: InputMaybe<Scalars['Datetime']['input']>;
  userId?: InputMaybe<Scalars['UUID']['input']>;
  wouldMeetAgain?: InputMaybe<Scalars['Boolean']['input']>;
};

export type ActivityGroupCheckinsInsertResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<ActivityGroupCheckins>;
};

export type ActivityGroupCheckinsOrderBy = {
  activityGroupId?: InputMaybe<OrderByDirection>;
  createdAt?: InputMaybe<OrderByDirection>;
  didHappen?: InputMaybe<OrderByDirection>;
  feltSafe?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  reportRequested?: InputMaybe<OrderByDirection>;
  updatedAt?: InputMaybe<OrderByDirection>;
  userId?: InputMaybe<OrderByDirection>;
  wouldMeetAgain?: InputMaybe<OrderByDirection>;
};

export type ActivityGroupCheckinsUpdateInput = {
  activityGroupId?: InputMaybe<Scalars['UUID']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  didHappen?: InputMaybe<Scalars['Boolean']['input']>;
  feltSafe?: InputMaybe<Scalars['Boolean']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  metadataJson?: InputMaybe<Scalars['JSON']['input']>;
  reportRequested?: InputMaybe<Scalars['Boolean']['input']>;
  updatedAt?: InputMaybe<Scalars['Datetime']['input']>;
  userId?: InputMaybe<Scalars['UUID']['input']>;
  wouldMeetAgain?: InputMaybe<Scalars['Boolean']['input']>;
};

export type ActivityGroupCheckinsUpdateResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<ActivityGroupCheckins>;
};

export type ActivityGroupMembers = Node & {
  activityGroup: ActivityGroups;
  activityGroupId: Scalars['UUID']['output'];
  attendanceConfirmedAt?: Maybe<Scalars['Datetime']['output']>;
  attendanceStatus: Scalars['String']['output'];
  createdAt: Scalars['Datetime']['output'];
  feedbackCompletedAt?: Maybe<Scalars['Datetime']['output']>;
  id: Scalars['UUID']['output'];
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  rsvpStatus: Scalars['String']['output'];
  user?: Maybe<Profiles>;
  userId: Scalars['UUID']['output'];
};

export type ActivityGroupMembersConnection = {
  edges: Array<ActivityGroupMembersEdge>;
  pageInfo: PageInfo;
};

export type ActivityGroupMembersDeleteResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<ActivityGroupMembers>;
};

export type ActivityGroupMembersEdge = {
  cursor: Scalars['String']['output'];
  node: ActivityGroupMembers;
};

export type ActivityGroupMembersFilter = {
  activityGroupId?: InputMaybe<UuidFilter>;
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<ActivityGroupMembersFilter>>;
  attendanceConfirmedAt?: InputMaybe<DatetimeFilter>;
  attendanceStatus?: InputMaybe<StringFilter>;
  createdAt?: InputMaybe<DatetimeFilter>;
  feedbackCompletedAt?: InputMaybe<DatetimeFilter>;
  id?: InputMaybe<UuidFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<ActivityGroupMembersFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<ActivityGroupMembersFilter>>;
  rsvpStatus?: InputMaybe<StringFilter>;
  userId?: InputMaybe<UuidFilter>;
};

export type ActivityGroupMembersInsertInput = {
  activityGroupId?: InputMaybe<Scalars['UUID']['input']>;
  attendanceConfirmedAt?: InputMaybe<Scalars['Datetime']['input']>;
  attendanceStatus?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  feedbackCompletedAt?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  rsvpStatus?: InputMaybe<Scalars['String']['input']>;
  userId?: InputMaybe<Scalars['UUID']['input']>;
};

export type ActivityGroupMembersInsertResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<ActivityGroupMembers>;
};

export type ActivityGroupMembersOrderBy = {
  activityGroupId?: InputMaybe<OrderByDirection>;
  attendanceConfirmedAt?: InputMaybe<OrderByDirection>;
  attendanceStatus?: InputMaybe<OrderByDirection>;
  createdAt?: InputMaybe<OrderByDirection>;
  feedbackCompletedAt?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  rsvpStatus?: InputMaybe<OrderByDirection>;
  userId?: InputMaybe<OrderByDirection>;
};

export type ActivityGroupMembersUpdateInput = {
  activityGroupId?: InputMaybe<Scalars['UUID']['input']>;
  attendanceConfirmedAt?: InputMaybe<Scalars['Datetime']['input']>;
  attendanceStatus?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  feedbackCompletedAt?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  rsvpStatus?: InputMaybe<Scalars['String']['input']>;
  userId?: InputMaybe<Scalars['UUID']['input']>;
};

export type ActivityGroupMembersUpdateResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<ActivityGroupMembers>;
};

export type ActivityGroups = Node & {
  activityGroupCheckinsCollection?: Maybe<ActivityGroupCheckinsConnection>;
  activityGroupMembersCollection?: Maybe<ActivityGroupMembersConnection>;
  activityPlansCollection?: Maybe<ActivityPlansConnection>;
  city?: Maybe<Cities>;
  cityId?: Maybe<Scalars['UUID']['output']>;
  createdAt: Scalars['Datetime']['output'];
  createdBy?: Maybe<Scalars['UUID']['output']>;
  groupInviteEventsCollection?: Maybe<GroupInviteEventsConnection>;
  groupInvitesCollection?: Maybe<GroupInvitesConnection>;
  groupMessagesCollection?: Maybe<GroupMessagesConnection>;
  id: Scalars['UUID']['output'];
  interest?: Maybe<Interests>;
  interestId?: Maybe<Scalars['UUID']['output']>;
  matchCandidatesCollection?: Maybe<MatchCandidatesConnection>;
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  planSafetyChecksCollection?: Maybe<PlanSafetyChecksConnection>;
  profiles?: Maybe<Profiles>;
  reportsCollection?: Maybe<ReportsConnection>;
  status: Scalars['String']['output'];
  title: Scalars['String']['output'];
};


export type ActivityGroupsActivityGroupCheckinsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<ActivityGroupCheckinsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<ActivityGroupCheckinsOrderBy>>;
};


export type ActivityGroupsActivityGroupMembersCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<ActivityGroupMembersFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<ActivityGroupMembersOrderBy>>;
};


export type ActivityGroupsActivityPlansCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<ActivityPlansFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<ActivityPlansOrderBy>>;
};


export type ActivityGroupsGroupInviteEventsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<GroupInviteEventsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<GroupInviteEventsOrderBy>>;
};


export type ActivityGroupsGroupInvitesCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<GroupInvitesFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<GroupInvitesOrderBy>>;
};


export type ActivityGroupsGroupMessagesCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<GroupMessagesFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<GroupMessagesOrderBy>>;
};


export type ActivityGroupsMatchCandidatesCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<MatchCandidatesFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<MatchCandidatesOrderBy>>;
};


export type ActivityGroupsPlanSafetyChecksCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<PlanSafetyChecksFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<PlanSafetyChecksOrderBy>>;
};


export type ActivityGroupsReportsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<ReportsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<ReportsOrderBy>>;
};

export type ActivityGroupsConnection = {
  edges: Array<ActivityGroupsEdge>;
  pageInfo: PageInfo;
};

export type ActivityGroupsDeleteResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<ActivityGroups>;
};

export type ActivityGroupsEdge = {
  cursor: Scalars['String']['output'];
  node: ActivityGroups;
};

export type ActivityGroupsFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<ActivityGroupsFilter>>;
  cityId?: InputMaybe<UuidFilter>;
  createdAt?: InputMaybe<DatetimeFilter>;
  createdBy?: InputMaybe<UuidFilter>;
  id?: InputMaybe<UuidFilter>;
  interestId?: InputMaybe<UuidFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<ActivityGroupsFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<ActivityGroupsFilter>>;
  status?: InputMaybe<StringFilter>;
  title?: InputMaybe<StringFilter>;
};

export type ActivityGroupsInsertInput = {
  cityId?: InputMaybe<Scalars['UUID']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  createdBy?: InputMaybe<Scalars['UUID']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  interestId?: InputMaybe<Scalars['UUID']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type ActivityGroupsInsertResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<ActivityGroups>;
};

export type ActivityGroupsOrderBy = {
  cityId?: InputMaybe<OrderByDirection>;
  createdAt?: InputMaybe<OrderByDirection>;
  createdBy?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  interestId?: InputMaybe<OrderByDirection>;
  status?: InputMaybe<OrderByDirection>;
  title?: InputMaybe<OrderByDirection>;
};

export type ActivityGroupsUpdateInput = {
  cityId?: InputMaybe<Scalars['UUID']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  createdBy?: InputMaybe<Scalars['UUID']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  interestId?: InputMaybe<Scalars['UUID']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type ActivityGroupsUpdateResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<ActivityGroups>;
};

export type ActivityPlans = Node & {
  activityGroup: ActivityGroups;
  activityGroupId: Scalars['UUID']['output'];
  activityName: Scalars['String']['output'];
  capacityMax: Scalars['Int']['output'];
  capacityMin: Scalars['Int']['output'];
  city?: Maybe<Cities>;
  cityId?: Maybe<Scalars['UUID']['output']>;
  confirmationStatus: Scalars['String']['output'];
  createdAt: Scalars['Datetime']['output'];
  createdBy?: Maybe<Scalars['UUID']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  endsAt?: Maybe<Scalars['Datetime']['output']>;
  groupInvitesCollection?: Maybe<GroupInvitesConnection>;
  id: Scalars['UUID']['output'];
  interest?: Maybe<Interests>;
  interestId?: Maybe<Scalars['UUID']['output']>;
  locationVisibility: Scalars['String']['output'];
  minGroupSize: Scalars['Int']['output'];
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  planSafetyChecksCollection?: Maybe<PlanSafetyChecksConnection>;
  profiles?: Maybe<Profiles>;
  publicLocationName: Scalars['String']['output'];
  safetyGuidance: Scalars['String']['output'];
  startsAt?: Maybe<Scalars['Datetime']['output']>;
  status: Scalars['String']['output'];
  title: Scalars['String']['output'];
  updatedAt: Scalars['Datetime']['output'];
  venueType: Scalars['String']['output'];
};


export type ActivityPlansGroupInvitesCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<GroupInvitesFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<GroupInvitesOrderBy>>;
};


export type ActivityPlansPlanSafetyChecksCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<PlanSafetyChecksFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<PlanSafetyChecksOrderBy>>;
};

export type ActivityPlansConnection = {
  edges: Array<ActivityPlansEdge>;
  pageInfo: PageInfo;
};

export type ActivityPlansDeleteResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<ActivityPlans>;
};

export type ActivityPlansEdge = {
  cursor: Scalars['String']['output'];
  node: ActivityPlans;
};

export type ActivityPlansFilter = {
  activityGroupId?: InputMaybe<UuidFilter>;
  activityName?: InputMaybe<StringFilter>;
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<ActivityPlansFilter>>;
  capacityMax?: InputMaybe<IntFilter>;
  capacityMin?: InputMaybe<IntFilter>;
  cityId?: InputMaybe<UuidFilter>;
  confirmationStatus?: InputMaybe<StringFilter>;
  createdAt?: InputMaybe<DatetimeFilter>;
  createdBy?: InputMaybe<UuidFilter>;
  description?: InputMaybe<StringFilter>;
  endsAt?: InputMaybe<DatetimeFilter>;
  id?: InputMaybe<UuidFilter>;
  interestId?: InputMaybe<UuidFilter>;
  locationVisibility?: InputMaybe<StringFilter>;
  minGroupSize?: InputMaybe<IntFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<ActivityPlansFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<ActivityPlansFilter>>;
  publicLocationName?: InputMaybe<StringFilter>;
  safetyGuidance?: InputMaybe<StringFilter>;
  startsAt?: InputMaybe<DatetimeFilter>;
  status?: InputMaybe<StringFilter>;
  title?: InputMaybe<StringFilter>;
  updatedAt?: InputMaybe<DatetimeFilter>;
  venueType?: InputMaybe<StringFilter>;
};

export type ActivityPlansInsertInput = {
  activityGroupId?: InputMaybe<Scalars['UUID']['input']>;
  activityName?: InputMaybe<Scalars['String']['input']>;
  capacityMax?: InputMaybe<Scalars['Int']['input']>;
  capacityMin?: InputMaybe<Scalars['Int']['input']>;
  cityId?: InputMaybe<Scalars['UUID']['input']>;
  confirmationStatus?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  createdBy?: InputMaybe<Scalars['UUID']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  endsAt?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  interestId?: InputMaybe<Scalars['UUID']['input']>;
  locationVisibility?: InputMaybe<Scalars['String']['input']>;
  minGroupSize?: InputMaybe<Scalars['Int']['input']>;
  publicLocationName?: InputMaybe<Scalars['String']['input']>;
  safetyGuidance?: InputMaybe<Scalars['String']['input']>;
  startsAt?: InputMaybe<Scalars['Datetime']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['Datetime']['input']>;
  venueType?: InputMaybe<Scalars['String']['input']>;
};

export type ActivityPlansInsertResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<ActivityPlans>;
};

export type ActivityPlansOrderBy = {
  activityGroupId?: InputMaybe<OrderByDirection>;
  activityName?: InputMaybe<OrderByDirection>;
  capacityMax?: InputMaybe<OrderByDirection>;
  capacityMin?: InputMaybe<OrderByDirection>;
  cityId?: InputMaybe<OrderByDirection>;
  confirmationStatus?: InputMaybe<OrderByDirection>;
  createdAt?: InputMaybe<OrderByDirection>;
  createdBy?: InputMaybe<OrderByDirection>;
  description?: InputMaybe<OrderByDirection>;
  endsAt?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  interestId?: InputMaybe<OrderByDirection>;
  locationVisibility?: InputMaybe<OrderByDirection>;
  minGroupSize?: InputMaybe<OrderByDirection>;
  publicLocationName?: InputMaybe<OrderByDirection>;
  safetyGuidance?: InputMaybe<OrderByDirection>;
  startsAt?: InputMaybe<OrderByDirection>;
  status?: InputMaybe<OrderByDirection>;
  title?: InputMaybe<OrderByDirection>;
  updatedAt?: InputMaybe<OrderByDirection>;
  venueType?: InputMaybe<OrderByDirection>;
};

export type ActivityPlansUpdateInput = {
  activityGroupId?: InputMaybe<Scalars['UUID']['input']>;
  activityName?: InputMaybe<Scalars['String']['input']>;
  capacityMax?: InputMaybe<Scalars['Int']['input']>;
  capacityMin?: InputMaybe<Scalars['Int']['input']>;
  cityId?: InputMaybe<Scalars['UUID']['input']>;
  confirmationStatus?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  createdBy?: InputMaybe<Scalars['UUID']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  endsAt?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  interestId?: InputMaybe<Scalars['UUID']['input']>;
  locationVisibility?: InputMaybe<Scalars['String']['input']>;
  minGroupSize?: InputMaybe<Scalars['Int']['input']>;
  publicLocationName?: InputMaybe<Scalars['String']['input']>;
  safetyGuidance?: InputMaybe<Scalars['String']['input']>;
  startsAt?: InputMaybe<Scalars['Datetime']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['Datetime']['input']>;
  venueType?: InputMaybe<Scalars['String']['input']>;
};

export type ActivityPlansUpdateResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<ActivityPlans>;
};

export type ActivityRiskLevels = Node & {
  activityKey: Scalars['String']['output'];
  createdAt: Scalars['Datetime']['output'];
  guidance?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  requiresDaytime: Scalars['Boolean']['output'];
  requiresPublicVenue: Scalars['Boolean']['output'];
  riskLevel: Scalars['String']['output'];
  updatedAt: Scalars['Datetime']['output'];
};

export type ActivityRiskLevelsConnection = {
  edges: Array<ActivityRiskLevelsEdge>;
  pageInfo: PageInfo;
};

export type ActivityRiskLevelsDeleteResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<ActivityRiskLevels>;
};

export type ActivityRiskLevelsEdge = {
  cursor: Scalars['String']['output'];
  node: ActivityRiskLevels;
};

export type ActivityRiskLevelsFilter = {
  activityKey?: InputMaybe<StringFilter>;
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<ActivityRiskLevelsFilter>>;
  createdAt?: InputMaybe<DatetimeFilter>;
  guidance?: InputMaybe<StringFilter>;
  id?: InputMaybe<UuidFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<ActivityRiskLevelsFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<ActivityRiskLevelsFilter>>;
  requiresDaytime?: InputMaybe<BooleanFilter>;
  requiresPublicVenue?: InputMaybe<BooleanFilter>;
  riskLevel?: InputMaybe<StringFilter>;
  updatedAt?: InputMaybe<DatetimeFilter>;
};

export type ActivityRiskLevelsInsertInput = {
  activityKey?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  guidance?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  requiresDaytime?: InputMaybe<Scalars['Boolean']['input']>;
  requiresPublicVenue?: InputMaybe<Scalars['Boolean']['input']>;
  riskLevel?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['Datetime']['input']>;
};

export type ActivityRiskLevelsInsertResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<ActivityRiskLevels>;
};

export type ActivityRiskLevelsOrderBy = {
  activityKey?: InputMaybe<OrderByDirection>;
  createdAt?: InputMaybe<OrderByDirection>;
  guidance?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  requiresDaytime?: InputMaybe<OrderByDirection>;
  requiresPublicVenue?: InputMaybe<OrderByDirection>;
  riskLevel?: InputMaybe<OrderByDirection>;
  updatedAt?: InputMaybe<OrderByDirection>;
};

export type ActivityRiskLevelsUpdateInput = {
  activityKey?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  guidance?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  requiresDaytime?: InputMaybe<Scalars['Boolean']['input']>;
  requiresPublicVenue?: InputMaybe<Scalars['Boolean']['input']>;
  riskLevel?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['Datetime']['input']>;
};

export type ActivityRiskLevelsUpdateResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<ActivityRiskLevels>;
};

export type AiProfileSummaries = Node & {
  createdAt: Scalars['Datetime']['output'];
  id: Scalars['UUID']['output'];
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  profile?: Maybe<Profiles>;
  profileId: Scalars['UUID']['output'];
  provider: Scalars['String']['output'];
  summary: Scalars['String']['output'];
};

export type AiProfileSummariesConnection = {
  edges: Array<AiProfileSummariesEdge>;
  pageInfo: PageInfo;
};

export type AiProfileSummariesDeleteResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<AiProfileSummaries>;
};

export type AiProfileSummariesEdge = {
  cursor: Scalars['String']['output'];
  node: AiProfileSummaries;
};

export type AiProfileSummariesFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<AiProfileSummariesFilter>>;
  createdAt?: InputMaybe<DatetimeFilter>;
  id?: InputMaybe<UuidFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<AiProfileSummariesFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<AiProfileSummariesFilter>>;
  profileId?: InputMaybe<UuidFilter>;
  provider?: InputMaybe<StringFilter>;
  summary?: InputMaybe<StringFilter>;
};

export type AiProfileSummariesInsertInput = {
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  profileId?: InputMaybe<Scalars['UUID']['input']>;
  provider?: InputMaybe<Scalars['String']['input']>;
  summary?: InputMaybe<Scalars['String']['input']>;
};

export type AiProfileSummariesInsertResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<AiProfileSummaries>;
};

export type AiProfileSummariesOrderBy = {
  createdAt?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  profileId?: InputMaybe<OrderByDirection>;
  provider?: InputMaybe<OrderByDirection>;
  summary?: InputMaybe<OrderByDirection>;
};

export type AiProfileSummariesUpdateInput = {
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  profileId?: InputMaybe<Scalars['UUID']['input']>;
  provider?: InputMaybe<Scalars['String']['input']>;
  summary?: InputMaybe<Scalars['String']['input']>;
};

export type AiProfileSummariesUpdateResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<AiProfileSummaries>;
};

/** Boolean expression comparing fields on type "BigFloat" */
export type BigFloatFilter = {
  eq?: InputMaybe<Scalars['BigFloat']['input']>;
  gt?: InputMaybe<Scalars['BigFloat']['input']>;
  gte?: InputMaybe<Scalars['BigFloat']['input']>;
  in?: InputMaybe<Array<Scalars['BigFloat']['input']>>;
  is?: InputMaybe<FilterIs>;
  lt?: InputMaybe<Scalars['BigFloat']['input']>;
  lte?: InputMaybe<Scalars['BigFloat']['input']>;
  neq?: InputMaybe<Scalars['BigFloat']['input']>;
};

/** Boolean expression comparing fields on type "BigFloatList" */
export type BigFloatListFilter = {
  containedBy?: InputMaybe<Array<Scalars['BigFloat']['input']>>;
  contains?: InputMaybe<Array<Scalars['BigFloat']['input']>>;
  eq?: InputMaybe<Array<Scalars['BigFloat']['input']>>;
  is?: InputMaybe<FilterIs>;
  overlaps?: InputMaybe<Array<Scalars['BigFloat']['input']>>;
};

/** Boolean expression comparing fields on type "BigInt" */
export type BigIntFilter = {
  eq?: InputMaybe<Scalars['BigInt']['input']>;
  gt?: InputMaybe<Scalars['BigInt']['input']>;
  gte?: InputMaybe<Scalars['BigInt']['input']>;
  in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  is?: InputMaybe<FilterIs>;
  lt?: InputMaybe<Scalars['BigInt']['input']>;
  lte?: InputMaybe<Scalars['BigInt']['input']>;
  neq?: InputMaybe<Scalars['BigInt']['input']>;
};

/** Boolean expression comparing fields on type "BigIntList" */
export type BigIntListFilter = {
  containedBy?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  contains?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  eq?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  is?: InputMaybe<FilterIs>;
  overlaps?: InputMaybe<Array<Scalars['BigInt']['input']>>;
};

export type Blocks = Node & {
  blocked?: Maybe<Profiles>;
  blockedId: Scalars['UUID']['output'];
  blocker?: Maybe<Profiles>;
  blockerId: Scalars['UUID']['output'];
  createdAt: Scalars['Datetime']['output'];
  id: Scalars['UUID']['output'];
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
};

export type BlocksConnection = {
  edges: Array<BlocksEdge>;
  pageInfo: PageInfo;
};

export type BlocksDeleteResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Blocks>;
};

export type BlocksEdge = {
  cursor: Scalars['String']['output'];
  node: Blocks;
};

export type BlocksFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<BlocksFilter>>;
  blockedId?: InputMaybe<UuidFilter>;
  blockerId?: InputMaybe<UuidFilter>;
  createdAt?: InputMaybe<DatetimeFilter>;
  id?: InputMaybe<UuidFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<BlocksFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<BlocksFilter>>;
};

export type BlocksInsertInput = {
  blockedId?: InputMaybe<Scalars['UUID']['input']>;
  blockerId?: InputMaybe<Scalars['UUID']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
};

export type BlocksInsertResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Blocks>;
};

export type BlocksOrderBy = {
  blockedId?: InputMaybe<OrderByDirection>;
  blockerId?: InputMaybe<OrderByDirection>;
  createdAt?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
};

export type BlocksUpdateInput = {
  blockedId?: InputMaybe<Scalars['UUID']['input']>;
  blockerId?: InputMaybe<Scalars['UUID']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
};

export type BlocksUpdateResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Blocks>;
};

/** Boolean expression comparing fields on type "Boolean" */
export type BooleanFilter = {
  eq?: InputMaybe<Scalars['Boolean']['input']>;
  is?: InputMaybe<FilterIs>;
};

/** Boolean expression comparing fields on type "BooleanList" */
export type BooleanListFilter = {
  containedBy?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  contains?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  eq?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  is?: InputMaybe<FilterIs>;
  overlaps?: InputMaybe<Array<Scalars['Boolean']['input']>>;
};

export type BusinessCategories = Node & {
  businessesCollection?: Maybe<BusinessesConnection>;
  id: Scalars['UUID']['output'];
  name: Scalars['String']['output'];
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
};


export type BusinessCategoriesBusinessesCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<BusinessesFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<BusinessesOrderBy>>;
};

export type BusinessCategoriesConnection = {
  edges: Array<BusinessCategoriesEdge>;
  pageInfo: PageInfo;
};

export type BusinessCategoriesDeleteResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<BusinessCategories>;
};

export type BusinessCategoriesEdge = {
  cursor: Scalars['String']['output'];
  node: BusinessCategories;
};

export type BusinessCategoriesFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<BusinessCategoriesFilter>>;
  id?: InputMaybe<UuidFilter>;
  name?: InputMaybe<StringFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<BusinessCategoriesFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<BusinessCategoriesFilter>>;
};

export type BusinessCategoriesInsertInput = {
  id?: InputMaybe<Scalars['UUID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type BusinessCategoriesInsertResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<BusinessCategories>;
};

export type BusinessCategoriesOrderBy = {
  id?: InputMaybe<OrderByDirection>;
  name?: InputMaybe<OrderByDirection>;
};

export type BusinessCategoriesUpdateInput = {
  id?: InputMaybe<Scalars['UUID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type BusinessCategoriesUpdateResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<BusinessCategories>;
};

export type BusinessImpressions = Node & {
  business: Businesses;
  businessId: Scalars['UUID']['output'];
  createdAt: Scalars['Datetime']['output'];
  id: Scalars['UUID']['output'];
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  user?: Maybe<Profiles>;
  userId: Scalars['UUID']['output'];
};

export type BusinessImpressionsConnection = {
  edges: Array<BusinessImpressionsEdge>;
  pageInfo: PageInfo;
};

export type BusinessImpressionsDeleteResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<BusinessImpressions>;
};

export type BusinessImpressionsEdge = {
  cursor: Scalars['String']['output'];
  node: BusinessImpressions;
};

export type BusinessImpressionsFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<BusinessImpressionsFilter>>;
  businessId?: InputMaybe<UuidFilter>;
  createdAt?: InputMaybe<DatetimeFilter>;
  id?: InputMaybe<UuidFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<BusinessImpressionsFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<BusinessImpressionsFilter>>;
  userId?: InputMaybe<UuidFilter>;
};

export type BusinessImpressionsInsertInput = {
  businessId?: InputMaybe<Scalars['UUID']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  userId?: InputMaybe<Scalars['UUID']['input']>;
};

export type BusinessImpressionsInsertResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<BusinessImpressions>;
};

export type BusinessImpressionsOrderBy = {
  businessId?: InputMaybe<OrderByDirection>;
  createdAt?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  userId?: InputMaybe<OrderByDirection>;
};

export type BusinessImpressionsUpdateInput = {
  businessId?: InputMaybe<Scalars['UUID']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  userId?: InputMaybe<Scalars['UUID']['input']>;
};

export type BusinessImpressionsUpdateResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<BusinessImpressions>;
};

export type BusinessLeads = Node & {
  business: Businesses;
  businessId: Scalars['UUID']['output'];
  createdAt: Scalars['Datetime']['output'];
  id: Scalars['UUID']['output'];
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  source: Scalars['String']['output'];
};

export type BusinessLeadsConnection = {
  edges: Array<BusinessLeadsEdge>;
  pageInfo: PageInfo;
};

export type BusinessLeadsDeleteResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<BusinessLeads>;
};

export type BusinessLeadsEdge = {
  cursor: Scalars['String']['output'];
  node: BusinessLeads;
};

export type BusinessLeadsFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<BusinessLeadsFilter>>;
  businessId?: InputMaybe<UuidFilter>;
  createdAt?: InputMaybe<DatetimeFilter>;
  id?: InputMaybe<UuidFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<BusinessLeadsFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<BusinessLeadsFilter>>;
  source?: InputMaybe<StringFilter>;
};

export type BusinessLeadsInsertInput = {
  businessId?: InputMaybe<Scalars['UUID']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  source?: InputMaybe<Scalars['String']['input']>;
};

export type BusinessLeadsInsertResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<BusinessLeads>;
};

export type BusinessLeadsOrderBy = {
  businessId?: InputMaybe<OrderByDirection>;
  createdAt?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  source?: InputMaybe<OrderByDirection>;
};

export type BusinessLeadsUpdateInput = {
  businessId?: InputMaybe<Scalars['UUID']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  source?: InputMaybe<Scalars['String']['input']>;
};

export type BusinessLeadsUpdateResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<BusinessLeads>;
};

export type Businesses = Node & {
  businessImpressionsCollection?: Maybe<BusinessImpressionsConnection>;
  businessLeadsCollection?: Maybe<BusinessLeadsConnection>;
  category?: Maybe<BusinessCategories>;
  categoryId?: Maybe<Scalars['UUID']['output']>;
  city?: Maybe<Cities>;
  cityId?: Maybe<Scalars['UUID']['output']>;
  createdAt: Scalars['Datetime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  name: Scalars['String']['output'];
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
};


export type BusinessesBusinessImpressionsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<BusinessImpressionsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<BusinessImpressionsOrderBy>>;
};


export type BusinessesBusinessLeadsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<BusinessLeadsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<BusinessLeadsOrderBy>>;
};

export type BusinessesConnection = {
  edges: Array<BusinessesEdge>;
  pageInfo: PageInfo;
};

export type BusinessesDeleteResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Businesses>;
};

export type BusinessesEdge = {
  cursor: Scalars['String']['output'];
  node: Businesses;
};

export type BusinessesFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<BusinessesFilter>>;
  categoryId?: InputMaybe<UuidFilter>;
  cityId?: InputMaybe<UuidFilter>;
  createdAt?: InputMaybe<DatetimeFilter>;
  description?: InputMaybe<StringFilter>;
  id?: InputMaybe<UuidFilter>;
  name?: InputMaybe<StringFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<BusinessesFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<BusinessesFilter>>;
};

export type BusinessesInsertInput = {
  categoryId?: InputMaybe<Scalars['UUID']['input']>;
  cityId?: InputMaybe<Scalars['UUID']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type BusinessesInsertResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Businesses>;
};

export type BusinessesOrderBy = {
  categoryId?: InputMaybe<OrderByDirection>;
  cityId?: InputMaybe<OrderByDirection>;
  createdAt?: InputMaybe<OrderByDirection>;
  description?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  name?: InputMaybe<OrderByDirection>;
};

export type BusinessesUpdateInput = {
  categoryId?: InputMaybe<Scalars['UUID']['input']>;
  cityId?: InputMaybe<Scalars['UUID']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type BusinessesUpdateResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Businesses>;
};

export type Cities = Node & {
  activityGroupsCollection?: Maybe<ActivityGroupsConnection>;
  activityPlansCollection?: Maybe<ActivityPlansConnection>;
  businessesCollection?: Maybe<BusinessesConnection>;
  cityFeatureFlagsCollection?: Maybe<CityFeatureFlagsConnection>;
  cityInterestsCollection?: Maybe<CityInterestsConnection>;
  citySettings?: Maybe<CitySettings>;
  countryCode: Scalars['String']['output'];
  createdAt: Scalars['Datetime']['output'];
  currency: Scalars['String']['output'];
  defaultLatitude?: Maybe<Scalars['BigFloat']['output']>;
  defaultLongitude?: Maybe<Scalars['BigFloat']['output']>;
  eventsCollection?: Maybe<EventsConnection>;
  featureFlagsCollection?: Maybe<FeatureFlagsConnection>;
  id: Scalars['UUID']['output'];
  interestActivationsCollection?: Maybe<InterestActivationsConnection>;
  landingPlansCollection?: Maybe<LandingPlansConnection>;
  launchStatus: Scalars['String']['output'];
  name: Scalars['String']['output'];
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  profilesCollection?: Maybe<ProfilesConnection>;
  starterPlansCollection?: Maybe<StarterPlansConnection>;
  suburbsCollection?: Maybe<SuburbsConnection>;
  timezone: Scalars['String']['output'];
  updatedAt: Scalars['Datetime']['output'];
  userSuburbMatchesCollection?: Maybe<UserSuburbMatchesConnection>;
};


export type CitiesActivityGroupsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<ActivityGroupsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<ActivityGroupsOrderBy>>;
};


export type CitiesActivityPlansCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<ActivityPlansFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<ActivityPlansOrderBy>>;
};


export type CitiesBusinessesCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<BusinessesFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<BusinessesOrderBy>>;
};


export type CitiesCityFeatureFlagsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<CityFeatureFlagsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<CityFeatureFlagsOrderBy>>;
};


export type CitiesCityInterestsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<CityInterestsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<CityInterestsOrderBy>>;
};


export type CitiesEventsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<EventsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<EventsOrderBy>>;
};


export type CitiesFeatureFlagsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<FeatureFlagsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<FeatureFlagsOrderBy>>;
};


export type CitiesInterestActivationsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<InterestActivationsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<InterestActivationsOrderBy>>;
};


export type CitiesLandingPlansCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<LandingPlansFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<LandingPlansOrderBy>>;
};


export type CitiesProfilesCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<ProfilesFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<ProfilesOrderBy>>;
};


export type CitiesStarterPlansCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<StarterPlansFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<StarterPlansOrderBy>>;
};


export type CitiesSuburbsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<SuburbsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<SuburbsOrderBy>>;
};


export type CitiesUserSuburbMatchesCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UserSuburbMatchesFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<UserSuburbMatchesOrderBy>>;
};

export type CitiesConnection = {
  edges: Array<CitiesEdge>;
  pageInfo: PageInfo;
};

export type CitiesDeleteResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Cities>;
};

export type CitiesEdge = {
  cursor: Scalars['String']['output'];
  node: Cities;
};

export type CitiesFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<CitiesFilter>>;
  countryCode?: InputMaybe<StringFilter>;
  createdAt?: InputMaybe<DatetimeFilter>;
  currency?: InputMaybe<StringFilter>;
  defaultLatitude?: InputMaybe<BigFloatFilter>;
  defaultLongitude?: InputMaybe<BigFloatFilter>;
  id?: InputMaybe<UuidFilter>;
  launchStatus?: InputMaybe<StringFilter>;
  name?: InputMaybe<StringFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<CitiesFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<CitiesFilter>>;
  timezone?: InputMaybe<StringFilter>;
  updatedAt?: InputMaybe<DatetimeFilter>;
};

export type CitiesInsertInput = {
  countryCode?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  currency?: InputMaybe<Scalars['String']['input']>;
  defaultLatitude?: InputMaybe<Scalars['BigFloat']['input']>;
  defaultLongitude?: InputMaybe<Scalars['BigFloat']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  launchStatus?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  timezone?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['Datetime']['input']>;
};

export type CitiesInsertResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Cities>;
};

export type CitiesOrderBy = {
  countryCode?: InputMaybe<OrderByDirection>;
  createdAt?: InputMaybe<OrderByDirection>;
  currency?: InputMaybe<OrderByDirection>;
  defaultLatitude?: InputMaybe<OrderByDirection>;
  defaultLongitude?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  launchStatus?: InputMaybe<OrderByDirection>;
  name?: InputMaybe<OrderByDirection>;
  timezone?: InputMaybe<OrderByDirection>;
  updatedAt?: InputMaybe<OrderByDirection>;
};

export type CitiesUpdateInput = {
  countryCode?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  currency?: InputMaybe<Scalars['String']['input']>;
  defaultLatitude?: InputMaybe<Scalars['BigFloat']['input']>;
  defaultLongitude?: InputMaybe<Scalars['BigFloat']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  launchStatus?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  timezone?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['Datetime']['input']>;
};

export type CitiesUpdateResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Cities>;
};

export type CityFeatureFlags = Node & {
  city: Cities;
  cityId: Scalars['UUID']['output'];
  createdAt: Scalars['Datetime']['output'];
  enabled: Scalars['Boolean']['output'];
  environment: Scalars['String']['output'];
  featureKey: Scalars['String']['output'];
  id: Scalars['UUID']['output'];
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  payloadJson: Scalars['JSON']['output'];
  updatedAt: Scalars['Datetime']['output'];
};

export type CityFeatureFlagsConnection = {
  edges: Array<CityFeatureFlagsEdge>;
  pageInfo: PageInfo;
};

export type CityFeatureFlagsDeleteResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<CityFeatureFlags>;
};

export type CityFeatureFlagsEdge = {
  cursor: Scalars['String']['output'];
  node: CityFeatureFlags;
};

export type CityFeatureFlagsFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<CityFeatureFlagsFilter>>;
  cityId?: InputMaybe<UuidFilter>;
  createdAt?: InputMaybe<DatetimeFilter>;
  enabled?: InputMaybe<BooleanFilter>;
  environment?: InputMaybe<StringFilter>;
  featureKey?: InputMaybe<StringFilter>;
  id?: InputMaybe<UuidFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<CityFeatureFlagsFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<CityFeatureFlagsFilter>>;
  updatedAt?: InputMaybe<DatetimeFilter>;
};

export type CityFeatureFlagsInsertInput = {
  cityId?: InputMaybe<Scalars['UUID']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  enabled?: InputMaybe<Scalars['Boolean']['input']>;
  environment?: InputMaybe<Scalars['String']['input']>;
  featureKey?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  payloadJson?: InputMaybe<Scalars['JSON']['input']>;
  updatedAt?: InputMaybe<Scalars['Datetime']['input']>;
};

export type CityFeatureFlagsInsertResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<CityFeatureFlags>;
};

export type CityFeatureFlagsOrderBy = {
  cityId?: InputMaybe<OrderByDirection>;
  createdAt?: InputMaybe<OrderByDirection>;
  enabled?: InputMaybe<OrderByDirection>;
  environment?: InputMaybe<OrderByDirection>;
  featureKey?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  updatedAt?: InputMaybe<OrderByDirection>;
};

export type CityFeatureFlagsUpdateInput = {
  cityId?: InputMaybe<Scalars['UUID']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  enabled?: InputMaybe<Scalars['Boolean']['input']>;
  environment?: InputMaybe<Scalars['String']['input']>;
  featureKey?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  payloadJson?: InputMaybe<Scalars['JSON']['input']>;
  updatedAt?: InputMaybe<Scalars['Datetime']['input']>;
};

export type CityFeatureFlagsUpdateResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<CityFeatureFlags>;
};

export type CityInterests = Node & {
  city: Cities;
  cityId: Scalars['UUID']['output'];
  createdAt: Scalars['Datetime']['output'];
  id: Scalars['UUID']['output'];
  interest?: Maybe<Interests>;
  interestId: Scalars['UUID']['output'];
  isDefault: Scalars['Boolean']['output'];
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  sortOrder: Scalars['Int']['output'];
};

export type CityInterestsConnection = {
  edges: Array<CityInterestsEdge>;
  pageInfo: PageInfo;
};

export type CityInterestsDeleteResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<CityInterests>;
};

export type CityInterestsEdge = {
  cursor: Scalars['String']['output'];
  node: CityInterests;
};

export type CityInterestsFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<CityInterestsFilter>>;
  cityId?: InputMaybe<UuidFilter>;
  createdAt?: InputMaybe<DatetimeFilter>;
  id?: InputMaybe<UuidFilter>;
  interestId?: InputMaybe<UuidFilter>;
  isDefault?: InputMaybe<BooleanFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<CityInterestsFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<CityInterestsFilter>>;
  sortOrder?: InputMaybe<IntFilter>;
};

export type CityInterestsInsertInput = {
  cityId?: InputMaybe<Scalars['UUID']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  interestId?: InputMaybe<Scalars['UUID']['input']>;
  isDefault?: InputMaybe<Scalars['Boolean']['input']>;
  sortOrder?: InputMaybe<Scalars['Int']['input']>;
};

export type CityInterestsInsertResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<CityInterests>;
};

export type CityInterestsOrderBy = {
  cityId?: InputMaybe<OrderByDirection>;
  createdAt?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  interestId?: InputMaybe<OrderByDirection>;
  isDefault?: InputMaybe<OrderByDirection>;
  sortOrder?: InputMaybe<OrderByDirection>;
};

export type CityInterestsUpdateInput = {
  cityId?: InputMaybe<Scalars['UUID']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  interestId?: InputMaybe<Scalars['UUID']['input']>;
  isDefault?: InputMaybe<Scalars['Boolean']['input']>;
  sortOrder?: InputMaybe<Scalars['Int']['input']>;
};

export type CityInterestsUpdateResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<CityInterests>;
};

export type CitySettings = Node & {
  activationExpiryHours: Scalars['Int']['output'];
  city: Cities;
  cityId: Scalars['UUID']['output'];
  copyJson: Scalars['JSON']['output'];
  createdAt: Scalars['Datetime']['output'];
  defaultGroupSizeMax: Scalars['Int']['output'];
  defaultGroupSizeMin: Scalars['Int']['output'];
  featureFlagsJson: Scalars['JSON']['output'];
  isWaitlistEnabled: Scalars['Boolean']['output'];
  matchingRadiusKm: Scalars['BigFloat']['output'];
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  requiresInvite: Scalars['Boolean']['output'];
  updatedAt: Scalars['Datetime']['output'];
};

export type CitySettingsConnection = {
  edges: Array<CitySettingsEdge>;
  pageInfo: PageInfo;
};

export type CitySettingsDeleteResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<CitySettings>;
};

export type CitySettingsEdge = {
  cursor: Scalars['String']['output'];
  node: CitySettings;
};

export type CitySettingsFilter = {
  activationExpiryHours?: InputMaybe<IntFilter>;
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<CitySettingsFilter>>;
  cityId?: InputMaybe<UuidFilter>;
  createdAt?: InputMaybe<DatetimeFilter>;
  defaultGroupSizeMax?: InputMaybe<IntFilter>;
  defaultGroupSizeMin?: InputMaybe<IntFilter>;
  isWaitlistEnabled?: InputMaybe<BooleanFilter>;
  matchingRadiusKm?: InputMaybe<BigFloatFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<CitySettingsFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<CitySettingsFilter>>;
  requiresInvite?: InputMaybe<BooleanFilter>;
  updatedAt?: InputMaybe<DatetimeFilter>;
};

export type CitySettingsInsertInput = {
  activationExpiryHours?: InputMaybe<Scalars['Int']['input']>;
  cityId?: InputMaybe<Scalars['UUID']['input']>;
  copyJson?: InputMaybe<Scalars['JSON']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  defaultGroupSizeMax?: InputMaybe<Scalars['Int']['input']>;
  defaultGroupSizeMin?: InputMaybe<Scalars['Int']['input']>;
  featureFlagsJson?: InputMaybe<Scalars['JSON']['input']>;
  isWaitlistEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  matchingRadiusKm?: InputMaybe<Scalars['BigFloat']['input']>;
  requiresInvite?: InputMaybe<Scalars['Boolean']['input']>;
  updatedAt?: InputMaybe<Scalars['Datetime']['input']>;
};

export type CitySettingsInsertResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<CitySettings>;
};

export type CitySettingsOrderBy = {
  activationExpiryHours?: InputMaybe<OrderByDirection>;
  cityId?: InputMaybe<OrderByDirection>;
  createdAt?: InputMaybe<OrderByDirection>;
  defaultGroupSizeMax?: InputMaybe<OrderByDirection>;
  defaultGroupSizeMin?: InputMaybe<OrderByDirection>;
  isWaitlistEnabled?: InputMaybe<OrderByDirection>;
  matchingRadiusKm?: InputMaybe<OrderByDirection>;
  requiresInvite?: InputMaybe<OrderByDirection>;
  updatedAt?: InputMaybe<OrderByDirection>;
};

export type CitySettingsUpdateInput = {
  activationExpiryHours?: InputMaybe<Scalars['Int']['input']>;
  cityId?: InputMaybe<Scalars['UUID']['input']>;
  copyJson?: InputMaybe<Scalars['JSON']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  defaultGroupSizeMax?: InputMaybe<Scalars['Int']['input']>;
  defaultGroupSizeMin?: InputMaybe<Scalars['Int']['input']>;
  featureFlagsJson?: InputMaybe<Scalars['JSON']['input']>;
  isWaitlistEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  matchingRadiusKm?: InputMaybe<Scalars['BigFloat']['input']>;
  requiresInvite?: InputMaybe<Scalars['Boolean']['input']>;
  updatedAt?: InputMaybe<Scalars['Datetime']['input']>;
};

export type CitySettingsUpdateResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<CitySettings>;
};

/** Boolean expression comparing fields on type "Date" */
export type DateFilter = {
  eq?: InputMaybe<Scalars['Date']['input']>;
  gt?: InputMaybe<Scalars['Date']['input']>;
  gte?: InputMaybe<Scalars['Date']['input']>;
  in?: InputMaybe<Array<Scalars['Date']['input']>>;
  is?: InputMaybe<FilterIs>;
  lt?: InputMaybe<Scalars['Date']['input']>;
  lte?: InputMaybe<Scalars['Date']['input']>;
  neq?: InputMaybe<Scalars['Date']['input']>;
};

/** Boolean expression comparing fields on type "DateList" */
export type DateListFilter = {
  containedBy?: InputMaybe<Array<Scalars['Date']['input']>>;
  contains?: InputMaybe<Array<Scalars['Date']['input']>>;
  eq?: InputMaybe<Array<Scalars['Date']['input']>>;
  is?: InputMaybe<FilterIs>;
  overlaps?: InputMaybe<Array<Scalars['Date']['input']>>;
};

/** Boolean expression comparing fields on type "Datetime" */
export type DatetimeFilter = {
  eq?: InputMaybe<Scalars['Datetime']['input']>;
  gt?: InputMaybe<Scalars['Datetime']['input']>;
  gte?: InputMaybe<Scalars['Datetime']['input']>;
  in?: InputMaybe<Array<Scalars['Datetime']['input']>>;
  is?: InputMaybe<FilterIs>;
  lt?: InputMaybe<Scalars['Datetime']['input']>;
  lte?: InputMaybe<Scalars['Datetime']['input']>;
  neq?: InputMaybe<Scalars['Datetime']['input']>;
};

/** Boolean expression comparing fields on type "DatetimeList" */
export type DatetimeListFilter = {
  containedBy?: InputMaybe<Array<Scalars['Datetime']['input']>>;
  contains?: InputMaybe<Array<Scalars['Datetime']['input']>>;
  eq?: InputMaybe<Array<Scalars['Datetime']['input']>>;
  is?: InputMaybe<FilterIs>;
  overlaps?: InputMaybe<Array<Scalars['Datetime']['input']>>;
};

export type EventInterests = Node & {
  event: Events;
  eventId: Scalars['UUID']['output'];
  id: Scalars['UUID']['output'];
  interest?: Maybe<Interests>;
  interestId: Scalars['UUID']['output'];
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
};

export type EventInterestsConnection = {
  edges: Array<EventInterestsEdge>;
  pageInfo: PageInfo;
};

export type EventInterestsDeleteResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<EventInterests>;
};

export type EventInterestsEdge = {
  cursor: Scalars['String']['output'];
  node: EventInterests;
};

export type EventInterestsFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<EventInterestsFilter>>;
  eventId?: InputMaybe<UuidFilter>;
  id?: InputMaybe<UuidFilter>;
  interestId?: InputMaybe<UuidFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<EventInterestsFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<EventInterestsFilter>>;
};

export type EventInterestsInsertInput = {
  eventId?: InputMaybe<Scalars['UUID']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  interestId?: InputMaybe<Scalars['UUID']['input']>;
};

export type EventInterestsInsertResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<EventInterests>;
};

export type EventInterestsOrderBy = {
  eventId?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  interestId?: InputMaybe<OrderByDirection>;
};

export type EventInterestsUpdateInput = {
  eventId?: InputMaybe<Scalars['UUID']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  interestId?: InputMaybe<Scalars['UUID']['input']>;
};

export type EventInterestsUpdateResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<EventInterests>;
};

export type Events = Node & {
  city?: Maybe<Cities>;
  cityId?: Maybe<Scalars['UUID']['output']>;
  createdAt: Scalars['Datetime']['output'];
  eventInterestsCollection?: Maybe<EventInterestsConnection>;
  id: Scalars['UUID']['output'];
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  startsAt?: Maybe<Scalars['Datetime']['output']>;
  title: Scalars['String']['output'];
};


export type EventsEventInterestsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<EventInterestsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<EventInterestsOrderBy>>;
};

export type EventsConnection = {
  edges: Array<EventsEdge>;
  pageInfo: PageInfo;
};

export type EventsDeleteResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Events>;
};

export type EventsEdge = {
  cursor: Scalars['String']['output'];
  node: Events;
};

export type EventsFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<EventsFilter>>;
  cityId?: InputMaybe<UuidFilter>;
  createdAt?: InputMaybe<DatetimeFilter>;
  id?: InputMaybe<UuidFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<EventsFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<EventsFilter>>;
  startsAt?: InputMaybe<DatetimeFilter>;
  title?: InputMaybe<StringFilter>;
};

export type EventsInsertInput = {
  cityId?: InputMaybe<Scalars['UUID']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  startsAt?: InputMaybe<Scalars['Datetime']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type EventsInsertResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Events>;
};

export type EventsOrderBy = {
  cityId?: InputMaybe<OrderByDirection>;
  createdAt?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  startsAt?: InputMaybe<OrderByDirection>;
  title?: InputMaybe<OrderByDirection>;
};

export type EventsUpdateInput = {
  cityId?: InputMaybe<Scalars['UUID']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  startsAt?: InputMaybe<Scalars['Datetime']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type EventsUpdateResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Events>;
};

export type FeatureFlags = Node & {
  city?: Maybe<Cities>;
  cityId?: Maybe<Scalars['UUID']['output']>;
  createdAt: Scalars['Datetime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  enabled: Scalars['Boolean']['output'];
  environment: Scalars['String']['output'];
  id?: Maybe<Scalars['UUID']['output']>;
  key: Scalars['String']['output'];
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  payloadJson: Scalars['JSON']['output'];
  updatedAt: Scalars['Datetime']['output'];
};

export type FeatureFlagsConnection = {
  edges: Array<FeatureFlagsEdge>;
  pageInfo: PageInfo;
};

export type FeatureFlagsDeleteResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<FeatureFlags>;
};

export type FeatureFlagsEdge = {
  cursor: Scalars['String']['output'];
  node: FeatureFlags;
};

export type FeatureFlagsFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<FeatureFlagsFilter>>;
  cityId?: InputMaybe<UuidFilter>;
  createdAt?: InputMaybe<DatetimeFilter>;
  description?: InputMaybe<StringFilter>;
  enabled?: InputMaybe<BooleanFilter>;
  environment?: InputMaybe<StringFilter>;
  id?: InputMaybe<UuidFilter>;
  key?: InputMaybe<StringFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<FeatureFlagsFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<FeatureFlagsFilter>>;
  updatedAt?: InputMaybe<DatetimeFilter>;
};

export type FeatureFlagsInsertInput = {
  cityId?: InputMaybe<Scalars['UUID']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  enabled?: InputMaybe<Scalars['Boolean']['input']>;
  environment?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  key?: InputMaybe<Scalars['String']['input']>;
  payloadJson?: InputMaybe<Scalars['JSON']['input']>;
  updatedAt?: InputMaybe<Scalars['Datetime']['input']>;
};

export type FeatureFlagsInsertResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<FeatureFlags>;
};

export type FeatureFlagsOrderBy = {
  cityId?: InputMaybe<OrderByDirection>;
  createdAt?: InputMaybe<OrderByDirection>;
  description?: InputMaybe<OrderByDirection>;
  enabled?: InputMaybe<OrderByDirection>;
  environment?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  key?: InputMaybe<OrderByDirection>;
  updatedAt?: InputMaybe<OrderByDirection>;
};

export type FeatureFlagsUpdateInput = {
  cityId?: InputMaybe<Scalars['UUID']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  enabled?: InputMaybe<Scalars['Boolean']['input']>;
  environment?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  key?: InputMaybe<Scalars['String']['input']>;
  payloadJson?: InputMaybe<Scalars['JSON']['input']>;
  updatedAt?: InputMaybe<Scalars['Datetime']['input']>;
};

export type FeatureFlagsUpdateResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<FeatureFlags>;
};

export enum FilterIs {
  NotNull = 'NOT_NULL',
  Null = 'NULL'
}

/** Boolean expression comparing fields on type "Float" */
export type FloatFilter = {
  eq?: InputMaybe<Scalars['Float']['input']>;
  gt?: InputMaybe<Scalars['Float']['input']>;
  gte?: InputMaybe<Scalars['Float']['input']>;
  in?: InputMaybe<Array<Scalars['Float']['input']>>;
  is?: InputMaybe<FilterIs>;
  lt?: InputMaybe<Scalars['Float']['input']>;
  lte?: InputMaybe<Scalars['Float']['input']>;
  neq?: InputMaybe<Scalars['Float']['input']>;
};

/** Boolean expression comparing fields on type "FloatList" */
export type FloatListFilter = {
  containedBy?: InputMaybe<Array<Scalars['Float']['input']>>;
  contains?: InputMaybe<Array<Scalars['Float']['input']>>;
  eq?: InputMaybe<Array<Scalars['Float']['input']>>;
  is?: InputMaybe<FilterIs>;
  overlaps?: InputMaybe<Array<Scalars['Float']['input']>>;
};

export type GroupInviteEvents = Node & {
  activityGroup: ActivityGroups;
  activityGroupId: Scalars['UUID']['output'];
  actor?: Maybe<Profiles>;
  actorId?: Maybe<Scalars['UUID']['output']>;
  createdAt: Scalars['Datetime']['output'];
  eventType: Scalars['String']['output'];
  id: Scalars['UUID']['output'];
  invite: GroupInvites;
  inviteId: Scalars['UUID']['output'];
  metadataJson: Scalars['JSON']['output'];
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
};

export type GroupInviteEventsConnection = {
  edges: Array<GroupInviteEventsEdge>;
  pageInfo: PageInfo;
};

export type GroupInviteEventsDeleteResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<GroupInviteEvents>;
};

export type GroupInviteEventsEdge = {
  cursor: Scalars['String']['output'];
  node: GroupInviteEvents;
};

export type GroupInviteEventsFilter = {
  activityGroupId?: InputMaybe<UuidFilter>;
  actorId?: InputMaybe<UuidFilter>;
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<GroupInviteEventsFilter>>;
  createdAt?: InputMaybe<DatetimeFilter>;
  eventType?: InputMaybe<StringFilter>;
  id?: InputMaybe<UuidFilter>;
  inviteId?: InputMaybe<UuidFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<GroupInviteEventsFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<GroupInviteEventsFilter>>;
};

export type GroupInviteEventsInsertInput = {
  activityGroupId?: InputMaybe<Scalars['UUID']['input']>;
  actorId?: InputMaybe<Scalars['UUID']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  eventType?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  inviteId?: InputMaybe<Scalars['UUID']['input']>;
  metadataJson?: InputMaybe<Scalars['JSON']['input']>;
};

export type GroupInviteEventsInsertResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<GroupInviteEvents>;
};

export type GroupInviteEventsOrderBy = {
  activityGroupId?: InputMaybe<OrderByDirection>;
  actorId?: InputMaybe<OrderByDirection>;
  createdAt?: InputMaybe<OrderByDirection>;
  eventType?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  inviteId?: InputMaybe<OrderByDirection>;
};

export type GroupInviteEventsUpdateInput = {
  activityGroupId?: InputMaybe<Scalars['UUID']['input']>;
  actorId?: InputMaybe<Scalars['UUID']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  eventType?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  inviteId?: InputMaybe<Scalars['UUID']['input']>;
  metadataJson?: InputMaybe<Scalars['JSON']['input']>;
};

export type GroupInviteEventsUpdateResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<GroupInviteEvents>;
};

export type GroupInvites = Node & {
  acceptedAt?: Maybe<Scalars['Datetime']['output']>;
  acceptedBy?: Maybe<Scalars['UUID']['output']>;
  activityGroup: ActivityGroups;
  activityGroupId: Scalars['UUID']['output'];
  activityPlan?: Maybe<ActivityPlans>;
  activityPlanId?: Maybe<Scalars['UUID']['output']>;
  createdAt: Scalars['Datetime']['output'];
  expiresAt: Scalars['Datetime']['output'];
  groupInviteEventsCollection?: Maybe<GroupInviteEventsConnection>;
  id: Scalars['UUID']['output'];
  inviter?: Maybe<Profiles>;
  inviterId: Scalars['UUID']['output'];
  maxUses: Scalars['Int']['output'];
  metadataJson: Scalars['JSON']['output'];
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  profiles?: Maybe<Profiles>;
  status: Scalars['String']['output'];
  tokenHash: Scalars['String']['output'];
  tokenPreview: Scalars['String']['output'];
  useCount: Scalars['Int']['output'];
};


export type GroupInvitesGroupInviteEventsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<GroupInviteEventsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<GroupInviteEventsOrderBy>>;
};

export type GroupInvitesConnection = {
  edges: Array<GroupInvitesEdge>;
  pageInfo: PageInfo;
};

export type GroupInvitesDeleteResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<GroupInvites>;
};

export type GroupInvitesEdge = {
  cursor: Scalars['String']['output'];
  node: GroupInvites;
};

export type GroupInvitesFilter = {
  acceptedAt?: InputMaybe<DatetimeFilter>;
  acceptedBy?: InputMaybe<UuidFilter>;
  activityGroupId?: InputMaybe<UuidFilter>;
  activityPlanId?: InputMaybe<UuidFilter>;
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<GroupInvitesFilter>>;
  createdAt?: InputMaybe<DatetimeFilter>;
  expiresAt?: InputMaybe<DatetimeFilter>;
  id?: InputMaybe<UuidFilter>;
  inviterId?: InputMaybe<UuidFilter>;
  maxUses?: InputMaybe<IntFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<GroupInvitesFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<GroupInvitesFilter>>;
  status?: InputMaybe<StringFilter>;
  tokenHash?: InputMaybe<StringFilter>;
  tokenPreview?: InputMaybe<StringFilter>;
  useCount?: InputMaybe<IntFilter>;
};

export type GroupInvitesInsertInput = {
  acceptedAt?: InputMaybe<Scalars['Datetime']['input']>;
  acceptedBy?: InputMaybe<Scalars['UUID']['input']>;
  activityGroupId?: InputMaybe<Scalars['UUID']['input']>;
  activityPlanId?: InputMaybe<Scalars['UUID']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  expiresAt?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  inviterId?: InputMaybe<Scalars['UUID']['input']>;
  maxUses?: InputMaybe<Scalars['Int']['input']>;
  metadataJson?: InputMaybe<Scalars['JSON']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  tokenHash?: InputMaybe<Scalars['String']['input']>;
  tokenPreview?: InputMaybe<Scalars['String']['input']>;
  useCount?: InputMaybe<Scalars['Int']['input']>;
};

export type GroupInvitesInsertResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<GroupInvites>;
};

export type GroupInvitesOrderBy = {
  acceptedAt?: InputMaybe<OrderByDirection>;
  acceptedBy?: InputMaybe<OrderByDirection>;
  activityGroupId?: InputMaybe<OrderByDirection>;
  activityPlanId?: InputMaybe<OrderByDirection>;
  createdAt?: InputMaybe<OrderByDirection>;
  expiresAt?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  inviterId?: InputMaybe<OrderByDirection>;
  maxUses?: InputMaybe<OrderByDirection>;
  status?: InputMaybe<OrderByDirection>;
  tokenHash?: InputMaybe<OrderByDirection>;
  tokenPreview?: InputMaybe<OrderByDirection>;
  useCount?: InputMaybe<OrderByDirection>;
};

export type GroupInvitesUpdateInput = {
  acceptedAt?: InputMaybe<Scalars['Datetime']['input']>;
  acceptedBy?: InputMaybe<Scalars['UUID']['input']>;
  activityGroupId?: InputMaybe<Scalars['UUID']['input']>;
  activityPlanId?: InputMaybe<Scalars['UUID']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  expiresAt?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  inviterId?: InputMaybe<Scalars['UUID']['input']>;
  maxUses?: InputMaybe<Scalars['Int']['input']>;
  metadataJson?: InputMaybe<Scalars['JSON']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  tokenHash?: InputMaybe<Scalars['String']['input']>;
  tokenPreview?: InputMaybe<Scalars['String']['input']>;
  useCount?: InputMaybe<Scalars['Int']['input']>;
};

export type GroupInvitesUpdateResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<GroupInvites>;
};

export type GroupMessages = Node & {
  activityGroup: ActivityGroups;
  activityGroupId: Scalars['UUID']['output'];
  body: Scalars['String']['output'];
  createdAt: Scalars['Datetime']['output'];
  id: Scalars['UUID']['output'];
  messageType: Scalars['String']['output'];
  moderationStatus: Scalars['String']['output'];
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  sender?: Maybe<Profiles>;
  senderId: Scalars['UUID']['output'];
};

export type GroupMessagesConnection = {
  edges: Array<GroupMessagesEdge>;
  pageInfo: PageInfo;
};

export type GroupMessagesDeleteResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<GroupMessages>;
};

export type GroupMessagesEdge = {
  cursor: Scalars['String']['output'];
  node: GroupMessages;
};

export type GroupMessagesFilter = {
  activityGroupId?: InputMaybe<UuidFilter>;
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<GroupMessagesFilter>>;
  body?: InputMaybe<StringFilter>;
  createdAt?: InputMaybe<DatetimeFilter>;
  id?: InputMaybe<UuidFilter>;
  messageType?: InputMaybe<StringFilter>;
  moderationStatus?: InputMaybe<StringFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<GroupMessagesFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<GroupMessagesFilter>>;
  senderId?: InputMaybe<UuidFilter>;
};

export type GroupMessagesInsertInput = {
  activityGroupId?: InputMaybe<Scalars['UUID']['input']>;
  body?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  messageType?: InputMaybe<Scalars['String']['input']>;
  moderationStatus?: InputMaybe<Scalars['String']['input']>;
  senderId?: InputMaybe<Scalars['UUID']['input']>;
};

export type GroupMessagesInsertResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<GroupMessages>;
};

export type GroupMessagesOrderBy = {
  activityGroupId?: InputMaybe<OrderByDirection>;
  body?: InputMaybe<OrderByDirection>;
  createdAt?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  messageType?: InputMaybe<OrderByDirection>;
  moderationStatus?: InputMaybe<OrderByDirection>;
  senderId?: InputMaybe<OrderByDirection>;
};

export type GroupMessagesUpdateInput = {
  activityGroupId?: InputMaybe<Scalars['UUID']['input']>;
  body?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  messageType?: InputMaybe<Scalars['String']['input']>;
  moderationStatus?: InputMaybe<Scalars['String']['input']>;
  senderId?: InputMaybe<Scalars['UUID']['input']>;
};

export type GroupMessagesUpdateResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<GroupMessages>;
};

/** Boolean expression comparing fields on type "ID" */
export type IdFilter = {
  eq?: InputMaybe<Scalars['ID']['input']>;
};

/** Boolean expression comparing fields on type "Int" */
export type IntFilter = {
  eq?: InputMaybe<Scalars['Int']['input']>;
  gt?: InputMaybe<Scalars['Int']['input']>;
  gte?: InputMaybe<Scalars['Int']['input']>;
  in?: InputMaybe<Array<Scalars['Int']['input']>>;
  is?: InputMaybe<FilterIs>;
  lt?: InputMaybe<Scalars['Int']['input']>;
  lte?: InputMaybe<Scalars['Int']['input']>;
  neq?: InputMaybe<Scalars['Int']['input']>;
};

/** Boolean expression comparing fields on type "IntList" */
export type IntListFilter = {
  containedBy?: InputMaybe<Array<Scalars['Int']['input']>>;
  contains?: InputMaybe<Array<Scalars['Int']['input']>>;
  eq?: InputMaybe<Array<Scalars['Int']['input']>>;
  is?: InputMaybe<FilterIs>;
  overlaps?: InputMaybe<Array<Scalars['Int']['input']>>;
};

export type InterestActivations = Node & {
  availabilityWindow: Scalars['String']['output'];
  city?: Maybe<Cities>;
  cityId?: Maybe<Scalars['UUID']['output']>;
  createdAt: Scalars['Datetime']['output'];
  expiresAt?: Maybe<Scalars['Datetime']['output']>;
  id: Scalars['UUID']['output'];
  interest?: Maybe<Interests>;
  interestId: Scalars['UUID']['output'];
  matchCandidatesCollection?: Maybe<MatchCandidatesConnection>;
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  preferredTime: Scalars['String']['output'];
  rateLimitKey?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  urgency: Scalars['String']['output'];
  user?: Maybe<Profiles>;
  userId: Scalars['UUID']['output'];
};


export type InterestActivationsMatchCandidatesCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<MatchCandidatesFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<MatchCandidatesOrderBy>>;
};

export type InterestActivationsConnection = {
  edges: Array<InterestActivationsEdge>;
  pageInfo: PageInfo;
};

export type InterestActivationsDeleteResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<InterestActivations>;
};

export type InterestActivationsEdge = {
  cursor: Scalars['String']['output'];
  node: InterestActivations;
};

export type InterestActivationsFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<InterestActivationsFilter>>;
  availabilityWindow?: InputMaybe<StringFilter>;
  cityId?: InputMaybe<UuidFilter>;
  createdAt?: InputMaybe<DatetimeFilter>;
  expiresAt?: InputMaybe<DatetimeFilter>;
  id?: InputMaybe<UuidFilter>;
  interestId?: InputMaybe<UuidFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<InterestActivationsFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<InterestActivationsFilter>>;
  preferredTime?: InputMaybe<StringFilter>;
  rateLimitKey?: InputMaybe<StringFilter>;
  status?: InputMaybe<StringFilter>;
  urgency?: InputMaybe<StringFilter>;
  userId?: InputMaybe<UuidFilter>;
};

export type InterestActivationsInsertInput = {
  availabilityWindow?: InputMaybe<Scalars['String']['input']>;
  cityId?: InputMaybe<Scalars['UUID']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  expiresAt?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  interestId?: InputMaybe<Scalars['UUID']['input']>;
  preferredTime?: InputMaybe<Scalars['String']['input']>;
  rateLimitKey?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  urgency?: InputMaybe<Scalars['String']['input']>;
  userId?: InputMaybe<Scalars['UUID']['input']>;
};

export type InterestActivationsInsertResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<InterestActivations>;
};

export type InterestActivationsOrderBy = {
  availabilityWindow?: InputMaybe<OrderByDirection>;
  cityId?: InputMaybe<OrderByDirection>;
  createdAt?: InputMaybe<OrderByDirection>;
  expiresAt?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  interestId?: InputMaybe<OrderByDirection>;
  preferredTime?: InputMaybe<OrderByDirection>;
  rateLimitKey?: InputMaybe<OrderByDirection>;
  status?: InputMaybe<OrderByDirection>;
  urgency?: InputMaybe<OrderByDirection>;
  userId?: InputMaybe<OrderByDirection>;
};

export type InterestActivationsUpdateInput = {
  availabilityWindow?: InputMaybe<Scalars['String']['input']>;
  cityId?: InputMaybe<Scalars['UUID']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  expiresAt?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  interestId?: InputMaybe<Scalars['UUID']['input']>;
  preferredTime?: InputMaybe<Scalars['String']['input']>;
  rateLimitKey?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  urgency?: InputMaybe<Scalars['String']['input']>;
  userId?: InputMaybe<Scalars['UUID']['input']>;
};

export type InterestActivationsUpdateResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<InterestActivations>;
};

export type Interests = Node & {
  activityGroupsCollection?: Maybe<ActivityGroupsConnection>;
  activityPlansCollection?: Maybe<ActivityPlansConnection>;
  category: Scalars['String']['output'];
  cityInterestsCollection?: Maybe<CityInterestsConnection>;
  createdAt: Scalars['Datetime']['output'];
  eventInterestsCollection?: Maybe<EventInterestsConnection>;
  id: Scalars['UUID']['output'];
  interestActivationsCollection?: Maybe<InterestActivationsConnection>;
  name: Scalars['String']['output'];
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  slug: Scalars['String']['output'];
  starterPlansCollection?: Maybe<StarterPlansConnection>;
  userInterestsCollection?: Maybe<UserInterestsConnection>;
};


export type InterestsActivityGroupsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<ActivityGroupsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<ActivityGroupsOrderBy>>;
};


export type InterestsActivityPlansCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<ActivityPlansFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<ActivityPlansOrderBy>>;
};


export type InterestsCityInterestsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<CityInterestsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<CityInterestsOrderBy>>;
};


export type InterestsEventInterestsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<EventInterestsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<EventInterestsOrderBy>>;
};


export type InterestsInterestActivationsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<InterestActivationsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<InterestActivationsOrderBy>>;
};


export type InterestsStarterPlansCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<StarterPlansFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<StarterPlansOrderBy>>;
};


export type InterestsUserInterestsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UserInterestsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<UserInterestsOrderBy>>;
};

export type InterestsConnection = {
  edges: Array<InterestsEdge>;
  pageInfo: PageInfo;
};

export type InterestsDeleteResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Interests>;
};

export type InterestsEdge = {
  cursor: Scalars['String']['output'];
  node: Interests;
};

export type InterestsFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<InterestsFilter>>;
  category?: InputMaybe<StringFilter>;
  createdAt?: InputMaybe<DatetimeFilter>;
  id?: InputMaybe<UuidFilter>;
  name?: InputMaybe<StringFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<InterestsFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<InterestsFilter>>;
  slug?: InputMaybe<StringFilter>;
};

export type InterestsInsertInput = {
  category?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
};

export type InterestsInsertResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Interests>;
};

export type InterestsOrderBy = {
  category?: InputMaybe<OrderByDirection>;
  createdAt?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  name?: InputMaybe<OrderByDirection>;
  slug?: InputMaybe<OrderByDirection>;
};

export type InterestsUpdateInput = {
  category?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
};

export type InterestsUpdateResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Interests>;
};

export type LandingPlanItems = Node & {
  completedAt?: Maybe<Scalars['Datetime']['output']>;
  createdAt: Scalars['Datetime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  itemType: Scalars['String']['output'];
  landingPlan: LandingPlans;
  landingPlanId: Scalars['UUID']['output'];
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  sortOrder: Scalars['Int']['output'];
  status: Scalars['String']['output'];
  targetId?: Maybe<Scalars['UUID']['output']>;
  title: Scalars['String']['output'];
  updatedAt: Scalars['Datetime']['output'];
  weekNumber: Scalars['Int']['output'];
};

export type LandingPlanItemsConnection = {
  edges: Array<LandingPlanItemsEdge>;
  pageInfo: PageInfo;
};

export type LandingPlanItemsDeleteResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<LandingPlanItems>;
};

export type LandingPlanItemsEdge = {
  cursor: Scalars['String']['output'];
  node: LandingPlanItems;
};

export type LandingPlanItemsFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<LandingPlanItemsFilter>>;
  completedAt?: InputMaybe<DatetimeFilter>;
  createdAt?: InputMaybe<DatetimeFilter>;
  description?: InputMaybe<StringFilter>;
  id?: InputMaybe<UuidFilter>;
  itemType?: InputMaybe<StringFilter>;
  landingPlanId?: InputMaybe<UuidFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<LandingPlanItemsFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<LandingPlanItemsFilter>>;
  sortOrder?: InputMaybe<IntFilter>;
  status?: InputMaybe<StringFilter>;
  targetId?: InputMaybe<UuidFilter>;
  title?: InputMaybe<StringFilter>;
  updatedAt?: InputMaybe<DatetimeFilter>;
  weekNumber?: InputMaybe<IntFilter>;
};

export type LandingPlanItemsInsertInput = {
  completedAt?: InputMaybe<Scalars['Datetime']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  itemType?: InputMaybe<Scalars['String']['input']>;
  landingPlanId?: InputMaybe<Scalars['UUID']['input']>;
  sortOrder?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  targetId?: InputMaybe<Scalars['UUID']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['Datetime']['input']>;
  weekNumber?: InputMaybe<Scalars['Int']['input']>;
};

export type LandingPlanItemsInsertResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<LandingPlanItems>;
};

export type LandingPlanItemsOrderBy = {
  completedAt?: InputMaybe<OrderByDirection>;
  createdAt?: InputMaybe<OrderByDirection>;
  description?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  itemType?: InputMaybe<OrderByDirection>;
  landingPlanId?: InputMaybe<OrderByDirection>;
  sortOrder?: InputMaybe<OrderByDirection>;
  status?: InputMaybe<OrderByDirection>;
  targetId?: InputMaybe<OrderByDirection>;
  title?: InputMaybe<OrderByDirection>;
  updatedAt?: InputMaybe<OrderByDirection>;
  weekNumber?: InputMaybe<OrderByDirection>;
};

export type LandingPlanItemsUpdateInput = {
  completedAt?: InputMaybe<Scalars['Datetime']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  itemType?: InputMaybe<Scalars['String']['input']>;
  landingPlanId?: InputMaybe<Scalars['UUID']['input']>;
  sortOrder?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  targetId?: InputMaybe<Scalars['UUID']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['Datetime']['input']>;
  weekNumber?: InputMaybe<Scalars['Int']['input']>;
};

export type LandingPlanItemsUpdateResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<LandingPlanItems>;
};

export type LandingPlans = Node & {
  city: Cities;
  cityId: Scalars['UUID']['output'];
  createdAt: Scalars['Datetime']['output'];
  endsAt?: Maybe<Scalars['Datetime']['output']>;
  generatedAt: Scalars['Datetime']['output'];
  id: Scalars['UUID']['output'];
  landingPlanItemsCollection?: Maybe<LandingPlanItemsConnection>;
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  repeatConnectionPreferencesCollection?: Maybe<RepeatConnectionPreferencesConnection>;
  startsAt?: Maybe<Scalars['Datetime']['output']>;
  status: Scalars['String']['output'];
  updatedAt: Scalars['Datetime']['output'];
  user?: Maybe<Profiles>;
  userId: Scalars['UUID']['output'];
  version: Scalars['Int']['output'];
};


export type LandingPlansLandingPlanItemsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<LandingPlanItemsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<LandingPlanItemsOrderBy>>;
};


export type LandingPlansRepeatConnectionPreferencesCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<RepeatConnectionPreferencesFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<RepeatConnectionPreferencesOrderBy>>;
};

export type LandingPlansConnection = {
  edges: Array<LandingPlansEdge>;
  pageInfo: PageInfo;
};

export type LandingPlansDeleteResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<LandingPlans>;
};

export type LandingPlansEdge = {
  cursor: Scalars['String']['output'];
  node: LandingPlans;
};

export type LandingPlansFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<LandingPlansFilter>>;
  cityId?: InputMaybe<UuidFilter>;
  createdAt?: InputMaybe<DatetimeFilter>;
  endsAt?: InputMaybe<DatetimeFilter>;
  generatedAt?: InputMaybe<DatetimeFilter>;
  id?: InputMaybe<UuidFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<LandingPlansFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<LandingPlansFilter>>;
  startsAt?: InputMaybe<DatetimeFilter>;
  status?: InputMaybe<StringFilter>;
  updatedAt?: InputMaybe<DatetimeFilter>;
  userId?: InputMaybe<UuidFilter>;
  version?: InputMaybe<IntFilter>;
};

export type LandingPlansInsertInput = {
  cityId?: InputMaybe<Scalars['UUID']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  endsAt?: InputMaybe<Scalars['Datetime']['input']>;
  generatedAt?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  startsAt?: InputMaybe<Scalars['Datetime']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['Datetime']['input']>;
  userId?: InputMaybe<Scalars['UUID']['input']>;
  version?: InputMaybe<Scalars['Int']['input']>;
};

export type LandingPlansInsertResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<LandingPlans>;
};

export type LandingPlansOrderBy = {
  cityId?: InputMaybe<OrderByDirection>;
  createdAt?: InputMaybe<OrderByDirection>;
  endsAt?: InputMaybe<OrderByDirection>;
  generatedAt?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  startsAt?: InputMaybe<OrderByDirection>;
  status?: InputMaybe<OrderByDirection>;
  updatedAt?: InputMaybe<OrderByDirection>;
  userId?: InputMaybe<OrderByDirection>;
  version?: InputMaybe<OrderByDirection>;
};

export type LandingPlansUpdateInput = {
  cityId?: InputMaybe<Scalars['UUID']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  endsAt?: InputMaybe<Scalars['Datetime']['input']>;
  generatedAt?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  startsAt?: InputMaybe<Scalars['Datetime']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['Datetime']['input']>;
  userId?: InputMaybe<Scalars['UUID']['input']>;
  version?: InputMaybe<Scalars['Int']['input']>;
};

export type LandingPlansUpdateResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<LandingPlans>;
};

export type MatchCandidates = Node & {
  activation?: Maybe<InterestActivations>;
  activationId: Scalars['UUID']['output'];
  activityGroup?: Maybe<ActivityGroups>;
  activityGroupId?: Maybe<Scalars['UUID']['output']>;
  createdAt: Scalars['Datetime']['output'];
  id: Scalars['UUID']['output'];
  matchedUser?: Maybe<Profiles>;
  matchedUserId: Scalars['UUID']['output'];
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  reason?: Maybe<Scalars['String']['output']>;
  respondedAt?: Maybe<Scalars['Datetime']['output']>;
  score: Scalars['BigFloat']['output'];
  source: Scalars['String']['output'];
  status: Scalars['String']['output'];
};

export type MatchCandidatesConnection = {
  edges: Array<MatchCandidatesEdge>;
  pageInfo: PageInfo;
};

export type MatchCandidatesDeleteResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<MatchCandidates>;
};

export type MatchCandidatesEdge = {
  cursor: Scalars['String']['output'];
  node: MatchCandidates;
};

export type MatchCandidatesFilter = {
  activationId?: InputMaybe<UuidFilter>;
  activityGroupId?: InputMaybe<UuidFilter>;
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<MatchCandidatesFilter>>;
  createdAt?: InputMaybe<DatetimeFilter>;
  id?: InputMaybe<UuidFilter>;
  matchedUserId?: InputMaybe<UuidFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<MatchCandidatesFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<MatchCandidatesFilter>>;
  reason?: InputMaybe<StringFilter>;
  respondedAt?: InputMaybe<DatetimeFilter>;
  score?: InputMaybe<BigFloatFilter>;
  source?: InputMaybe<StringFilter>;
  status?: InputMaybe<StringFilter>;
};

export type MatchCandidatesInsertInput = {
  activationId?: InputMaybe<Scalars['UUID']['input']>;
  activityGroupId?: InputMaybe<Scalars['UUID']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  matchedUserId?: InputMaybe<Scalars['UUID']['input']>;
  reason?: InputMaybe<Scalars['String']['input']>;
  respondedAt?: InputMaybe<Scalars['Datetime']['input']>;
  score?: InputMaybe<Scalars['BigFloat']['input']>;
  source?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
};

export type MatchCandidatesInsertResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<MatchCandidates>;
};

export type MatchCandidatesOrderBy = {
  activationId?: InputMaybe<OrderByDirection>;
  activityGroupId?: InputMaybe<OrderByDirection>;
  createdAt?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  matchedUserId?: InputMaybe<OrderByDirection>;
  reason?: InputMaybe<OrderByDirection>;
  respondedAt?: InputMaybe<OrderByDirection>;
  score?: InputMaybe<OrderByDirection>;
  source?: InputMaybe<OrderByDirection>;
  status?: InputMaybe<OrderByDirection>;
};

export type MatchCandidatesUpdateInput = {
  activationId?: InputMaybe<Scalars['UUID']['input']>;
  activityGroupId?: InputMaybe<Scalars['UUID']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  matchedUserId?: InputMaybe<Scalars['UUID']['input']>;
  reason?: InputMaybe<Scalars['String']['input']>;
  respondedAt?: InputMaybe<Scalars['Datetime']['input']>;
  score?: InputMaybe<Scalars['BigFloat']['input']>;
  source?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
};

export type MatchCandidatesUpdateResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<MatchCandidates>;
};

export type ModerationActions = Node & {
  actionType: Scalars['String']['output'];
  actor?: Maybe<Profiles>;
  actorId?: Maybe<Scalars['UUID']['output']>;
  createdAt: Scalars['Datetime']['output'];
  expiresAt?: Maybe<Scalars['Datetime']['output']>;
  id: Scalars['UUID']['output'];
  metadataJson: Scalars['JSON']['output'];
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  reason?: Maybe<Scalars['String']['output']>;
  report?: Maybe<Reports>;
  reportId?: Maybe<Scalars['UUID']['output']>;
  targetUser?: Maybe<Profiles>;
  targetUserId?: Maybe<Scalars['UUID']['output']>;
};

export type ModerationActionsConnection = {
  edges: Array<ModerationActionsEdge>;
  pageInfo: PageInfo;
};

export type ModerationActionsDeleteResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<ModerationActions>;
};

export type ModerationActionsEdge = {
  cursor: Scalars['String']['output'];
  node: ModerationActions;
};

export type ModerationActionsFilter = {
  actionType?: InputMaybe<StringFilter>;
  actorId?: InputMaybe<UuidFilter>;
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<ModerationActionsFilter>>;
  createdAt?: InputMaybe<DatetimeFilter>;
  expiresAt?: InputMaybe<DatetimeFilter>;
  id?: InputMaybe<UuidFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<ModerationActionsFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<ModerationActionsFilter>>;
  reason?: InputMaybe<StringFilter>;
  reportId?: InputMaybe<UuidFilter>;
  targetUserId?: InputMaybe<UuidFilter>;
};

export type ModerationActionsInsertInput = {
  actionType?: InputMaybe<Scalars['String']['input']>;
  actorId?: InputMaybe<Scalars['UUID']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  expiresAt?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  metadataJson?: InputMaybe<Scalars['JSON']['input']>;
  reason?: InputMaybe<Scalars['String']['input']>;
  reportId?: InputMaybe<Scalars['UUID']['input']>;
  targetUserId?: InputMaybe<Scalars['UUID']['input']>;
};

export type ModerationActionsInsertResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<ModerationActions>;
};

export type ModerationActionsOrderBy = {
  actionType?: InputMaybe<OrderByDirection>;
  actorId?: InputMaybe<OrderByDirection>;
  createdAt?: InputMaybe<OrderByDirection>;
  expiresAt?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  reason?: InputMaybe<OrderByDirection>;
  reportId?: InputMaybe<OrderByDirection>;
  targetUserId?: InputMaybe<OrderByDirection>;
};

export type ModerationActionsUpdateInput = {
  actionType?: InputMaybe<Scalars['String']['input']>;
  actorId?: InputMaybe<Scalars['UUID']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  expiresAt?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  metadataJson?: InputMaybe<Scalars['JSON']['input']>;
  reason?: InputMaybe<Scalars['String']['input']>;
  reportId?: InputMaybe<Scalars['UUID']['input']>;
  targetUserId?: InputMaybe<Scalars['UUID']['input']>;
};

export type ModerationActionsUpdateResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<ModerationActions>;
};

/** The root type for creating and mutating data */
export type Mutation = {
  activateInterest?: Maybe<Scalars['JSON']['output']>;
  /** Deletes zero or more records from the `ActivityGroupCheckins` collection */
  deleteFromActivityGroupCheckinsCollection: ActivityGroupCheckinsDeleteResponse;
  /** Deletes zero or more records from the `ActivityGroupMembers` collection */
  deleteFromActivityGroupMembersCollection: ActivityGroupMembersDeleteResponse;
  /** Deletes zero or more records from the `ActivityGroups` collection */
  deleteFromActivityGroupsCollection: ActivityGroupsDeleteResponse;
  /** Deletes zero or more records from the `ActivityPlans` collection */
  deleteFromActivityPlansCollection: ActivityPlansDeleteResponse;
  /** Deletes zero or more records from the `ActivityRiskLevels` collection */
  deleteFromActivityRiskLevelsCollection: ActivityRiskLevelsDeleteResponse;
  /** Deletes zero or more records from the `AiProfileSummaries` collection */
  deleteFromAiProfileSummariesCollection: AiProfileSummariesDeleteResponse;
  /** Deletes zero or more records from the `Blocks` collection */
  deleteFromBlocksCollection: BlocksDeleteResponse;
  /** Deletes zero or more records from the `BusinessCategories` collection */
  deleteFromBusinessCategoriesCollection: BusinessCategoriesDeleteResponse;
  /** Deletes zero or more records from the `BusinessImpressions` collection */
  deleteFromBusinessImpressionsCollection: BusinessImpressionsDeleteResponse;
  /** Deletes zero or more records from the `BusinessLeads` collection */
  deleteFromBusinessLeadsCollection: BusinessLeadsDeleteResponse;
  /** Deletes zero or more records from the `Businesses` collection */
  deleteFromBusinessesCollection: BusinessesDeleteResponse;
  /** Deletes zero or more records from the `Cities` collection */
  deleteFromCitiesCollection: CitiesDeleteResponse;
  /** Deletes zero or more records from the `CityFeatureFlags` collection */
  deleteFromCityFeatureFlagsCollection: CityFeatureFlagsDeleteResponse;
  /** Deletes zero or more records from the `CityInterests` collection */
  deleteFromCityInterestsCollection: CityInterestsDeleteResponse;
  /** Deletes zero or more records from the `CitySettings` collection */
  deleteFromCitySettingsCollection: CitySettingsDeleteResponse;
  /** Deletes zero or more records from the `EventInterests` collection */
  deleteFromEventInterestsCollection: EventInterestsDeleteResponse;
  /** Deletes zero or more records from the `Events` collection */
  deleteFromEventsCollection: EventsDeleteResponse;
  /** Deletes zero or more records from the `FeatureFlags` collection */
  deleteFromFeatureFlagsCollection: FeatureFlagsDeleteResponse;
  /** Deletes zero or more records from the `GroupInviteEvents` collection */
  deleteFromGroupInviteEventsCollection: GroupInviteEventsDeleteResponse;
  /** Deletes zero or more records from the `GroupInvites` collection */
  deleteFromGroupInvitesCollection: GroupInvitesDeleteResponse;
  /** Deletes zero or more records from the `GroupMessages` collection */
  deleteFromGroupMessagesCollection: GroupMessagesDeleteResponse;
  /** Deletes zero or more records from the `InterestActivations` collection */
  deleteFromInterestActivationsCollection: InterestActivationsDeleteResponse;
  /** Deletes zero or more records from the `Interests` collection */
  deleteFromInterestsCollection: InterestsDeleteResponse;
  /** Deletes zero or more records from the `LandingPlanItems` collection */
  deleteFromLandingPlanItemsCollection: LandingPlanItemsDeleteResponse;
  /** Deletes zero or more records from the `LandingPlans` collection */
  deleteFromLandingPlansCollection: LandingPlansDeleteResponse;
  /** Deletes zero or more records from the `MatchCandidates` collection */
  deleteFromMatchCandidatesCollection: MatchCandidatesDeleteResponse;
  /** Deletes zero or more records from the `ModerationActions` collection */
  deleteFromModerationActionsCollection: ModerationActionsDeleteResponse;
  /** Deletes zero or more records from the `PlanRecipes` collection */
  deleteFromPlanRecipesCollection: PlanRecipesDeleteResponse;
  /** Deletes zero or more records from the `PlanSafetyChecks` collection */
  deleteFromPlanSafetyChecksCollection: PlanSafetyChecksDeleteResponse;
  /** Deletes zero or more records from the `Profiles` collection */
  deleteFromProfilesCollection: ProfilesDeleteResponse;
  /** Deletes zero or more records from the `RepeatConnectionPreferences` collection */
  deleteFromRepeatConnectionPreferencesCollection: RepeatConnectionPreferencesDeleteResponse;
  /** Deletes zero or more records from the `Reports` collection */
  deleteFromReportsCollection: ReportsDeleteResponse;
  /** Deletes zero or more records from the `SpatialRefSys` collection */
  deleteFromSpatialRefSysCollection: SpatialRefSysDeleteResponse;
  /** Deletes zero or more records from the `StarterPlanSteps` collection */
  deleteFromStarterPlanStepsCollection: StarterPlanStepsDeleteResponse;
  /** Deletes zero or more records from the `StarterPlans` collection */
  deleteFromStarterPlansCollection: StarterPlansDeleteResponse;
  /** Deletes zero or more records from the `SuburbTags` collection */
  deleteFromSuburbTagsCollection: SuburbTagsDeleteResponse;
  /** Deletes zero or more records from the `Suburbs` collection */
  deleteFromSuburbsCollection: SuburbsDeleteResponse;
  /** Deletes zero or more records from the `UserInterests` collection */
  deleteFromUserInterestsCollection: UserInterestsDeleteResponse;
  /** Deletes zero or more records from the `UserReliability` collection */
  deleteFromUserReliabilityCollection: UserReliabilityDeleteResponse;
  /** Deletes zero or more records from the `UserSafetySettings` collection */
  deleteFromUserSafetySettingsCollection: UserSafetySettingsDeleteResponse;
  /** Deletes zero or more records from the `UserSocialPreferences` collection */
  deleteFromUserSocialPreferencesCollection: UserSocialPreferencesDeleteResponse;
  /** Deletes zero or more records from the `UserSuburbMatches` collection */
  deleteFromUserSuburbMatchesCollection: UserSuburbMatchesDeleteResponse;
  /** Deletes zero or more records from the `UserVerifications` collection */
  deleteFromUserVerificationsCollection: UserVerificationsDeleteResponse;
  disablelongtransactions?: Maybe<Scalars['String']['output']>;
  enablelongtransactions?: Maybe<Scalars['String']['output']>;
  gettransactionid?: Maybe<Scalars['Opaque']['output']>;
  /** Adds one or more `ActivityGroupCheckins` records to the collection */
  insertIntoActivityGroupCheckinsCollection?: Maybe<ActivityGroupCheckinsInsertResponse>;
  /** Adds one or more `ActivityGroupMembers` records to the collection */
  insertIntoActivityGroupMembersCollection?: Maybe<ActivityGroupMembersInsertResponse>;
  /** Adds one or more `ActivityGroups` records to the collection */
  insertIntoActivityGroupsCollection?: Maybe<ActivityGroupsInsertResponse>;
  /** Adds one or more `ActivityPlans` records to the collection */
  insertIntoActivityPlansCollection?: Maybe<ActivityPlansInsertResponse>;
  /** Adds one or more `ActivityRiskLevels` records to the collection */
  insertIntoActivityRiskLevelsCollection?: Maybe<ActivityRiskLevelsInsertResponse>;
  /** Adds one or more `AiProfileSummaries` records to the collection */
  insertIntoAiProfileSummariesCollection?: Maybe<AiProfileSummariesInsertResponse>;
  /** Adds one or more `Blocks` records to the collection */
  insertIntoBlocksCollection?: Maybe<BlocksInsertResponse>;
  /** Adds one or more `BusinessCategories` records to the collection */
  insertIntoBusinessCategoriesCollection?: Maybe<BusinessCategoriesInsertResponse>;
  /** Adds one or more `BusinessImpressions` records to the collection */
  insertIntoBusinessImpressionsCollection?: Maybe<BusinessImpressionsInsertResponse>;
  /** Adds one or more `BusinessLeads` records to the collection */
  insertIntoBusinessLeadsCollection?: Maybe<BusinessLeadsInsertResponse>;
  /** Adds one or more `Businesses` records to the collection */
  insertIntoBusinessesCollection?: Maybe<BusinessesInsertResponse>;
  /** Adds one or more `Cities` records to the collection */
  insertIntoCitiesCollection?: Maybe<CitiesInsertResponse>;
  /** Adds one or more `CityFeatureFlags` records to the collection */
  insertIntoCityFeatureFlagsCollection?: Maybe<CityFeatureFlagsInsertResponse>;
  /** Adds one or more `CityInterests` records to the collection */
  insertIntoCityInterestsCollection?: Maybe<CityInterestsInsertResponse>;
  /** Adds one or more `CitySettings` records to the collection */
  insertIntoCitySettingsCollection?: Maybe<CitySettingsInsertResponse>;
  /** Adds one or more `EventInterests` records to the collection */
  insertIntoEventInterestsCollection?: Maybe<EventInterestsInsertResponse>;
  /** Adds one or more `Events` records to the collection */
  insertIntoEventsCollection?: Maybe<EventsInsertResponse>;
  /** Adds one or more `FeatureFlags` records to the collection */
  insertIntoFeatureFlagsCollection?: Maybe<FeatureFlagsInsertResponse>;
  /** Adds one or more `GroupInviteEvents` records to the collection */
  insertIntoGroupInviteEventsCollection?: Maybe<GroupInviteEventsInsertResponse>;
  /** Adds one or more `GroupInvites` records to the collection */
  insertIntoGroupInvitesCollection?: Maybe<GroupInvitesInsertResponse>;
  /** Adds one or more `GroupMessages` records to the collection */
  insertIntoGroupMessagesCollection?: Maybe<GroupMessagesInsertResponse>;
  /** Adds one or more `InterestActivations` records to the collection */
  insertIntoInterestActivationsCollection?: Maybe<InterestActivationsInsertResponse>;
  /** Adds one or more `Interests` records to the collection */
  insertIntoInterestsCollection?: Maybe<InterestsInsertResponse>;
  /** Adds one or more `LandingPlanItems` records to the collection */
  insertIntoLandingPlanItemsCollection?: Maybe<LandingPlanItemsInsertResponse>;
  /** Adds one or more `LandingPlans` records to the collection */
  insertIntoLandingPlansCollection?: Maybe<LandingPlansInsertResponse>;
  /** Adds one or more `MatchCandidates` records to the collection */
  insertIntoMatchCandidatesCollection?: Maybe<MatchCandidatesInsertResponse>;
  /** Adds one or more `ModerationActions` records to the collection */
  insertIntoModerationActionsCollection?: Maybe<ModerationActionsInsertResponse>;
  /** Adds one or more `PlanRecipes` records to the collection */
  insertIntoPlanRecipesCollection?: Maybe<PlanRecipesInsertResponse>;
  /** Adds one or more `PlanSafetyChecks` records to the collection */
  insertIntoPlanSafetyChecksCollection?: Maybe<PlanSafetyChecksInsertResponse>;
  /** Adds one or more `Profiles` records to the collection */
  insertIntoProfilesCollection?: Maybe<ProfilesInsertResponse>;
  /** Adds one or more `RepeatConnectionPreferences` records to the collection */
  insertIntoRepeatConnectionPreferencesCollection?: Maybe<RepeatConnectionPreferencesInsertResponse>;
  /** Adds one or more `Reports` records to the collection */
  insertIntoReportsCollection?: Maybe<ReportsInsertResponse>;
  /** Adds one or more `SpatialRefSys` records to the collection */
  insertIntoSpatialRefSysCollection?: Maybe<SpatialRefSysInsertResponse>;
  /** Adds one or more `StarterPlanSteps` records to the collection */
  insertIntoStarterPlanStepsCollection?: Maybe<StarterPlanStepsInsertResponse>;
  /** Adds one or more `StarterPlans` records to the collection */
  insertIntoStarterPlansCollection?: Maybe<StarterPlansInsertResponse>;
  /** Adds one or more `SuburbTags` records to the collection */
  insertIntoSuburbTagsCollection?: Maybe<SuburbTagsInsertResponse>;
  /** Adds one or more `Suburbs` records to the collection */
  insertIntoSuburbsCollection?: Maybe<SuburbsInsertResponse>;
  /** Adds one or more `UserInterests` records to the collection */
  insertIntoUserInterestsCollection?: Maybe<UserInterestsInsertResponse>;
  /** Adds one or more `UserReliability` records to the collection */
  insertIntoUserReliabilityCollection?: Maybe<UserReliabilityInsertResponse>;
  /** Adds one or more `UserSafetySettings` records to the collection */
  insertIntoUserSafetySettingsCollection?: Maybe<UserSafetySettingsInsertResponse>;
  /** Adds one or more `UserSocialPreferences` records to the collection */
  insertIntoUserSocialPreferencesCollection?: Maybe<UserSocialPreferencesInsertResponse>;
  /** Adds one or more `UserSuburbMatches` records to the collection */
  insertIntoUserSuburbMatchesCollection?: Maybe<UserSuburbMatchesInsertResponse>;
  /** Adds one or more `UserVerifications` records to the collection */
  insertIntoUserVerificationsCollection?: Maybe<UserVerificationsInsertResponse>;
  longtransactionsenabled?: Maybe<Scalars['Boolean']['output']>;
  postgisExtensionsUpgrade?: Maybe<Scalars['String']['output']>;
  postgisSelectivity?: Maybe<Scalars['Float']['output']>;
  stClusterkmeans?: Maybe<Scalars['Int']['output']>;
  stSymmetricdifference?: Maybe<Scalars['Opaque']['output']>;
  /** Updates zero or more records in the `ActivityGroupCheckins` collection */
  updateActivityGroupCheckinsCollection: ActivityGroupCheckinsUpdateResponse;
  /** Updates zero or more records in the `ActivityGroupMembers` collection */
  updateActivityGroupMembersCollection: ActivityGroupMembersUpdateResponse;
  /** Updates zero or more records in the `ActivityGroups` collection */
  updateActivityGroupsCollection: ActivityGroupsUpdateResponse;
  /** Updates zero or more records in the `ActivityPlans` collection */
  updateActivityPlansCollection: ActivityPlansUpdateResponse;
  /** Updates zero or more records in the `ActivityRiskLevels` collection */
  updateActivityRiskLevelsCollection: ActivityRiskLevelsUpdateResponse;
  /** Updates zero or more records in the `AiProfileSummaries` collection */
  updateAiProfileSummariesCollection: AiProfileSummariesUpdateResponse;
  /** Updates zero or more records in the `Blocks` collection */
  updateBlocksCollection: BlocksUpdateResponse;
  /** Updates zero or more records in the `BusinessCategories` collection */
  updateBusinessCategoriesCollection: BusinessCategoriesUpdateResponse;
  /** Updates zero or more records in the `BusinessImpressions` collection */
  updateBusinessImpressionsCollection: BusinessImpressionsUpdateResponse;
  /** Updates zero or more records in the `BusinessLeads` collection */
  updateBusinessLeadsCollection: BusinessLeadsUpdateResponse;
  /** Updates zero or more records in the `Businesses` collection */
  updateBusinessesCollection: BusinessesUpdateResponse;
  /** Updates zero or more records in the `Cities` collection */
  updateCitiesCollection: CitiesUpdateResponse;
  /** Updates zero or more records in the `CityFeatureFlags` collection */
  updateCityFeatureFlagsCollection: CityFeatureFlagsUpdateResponse;
  /** Updates zero or more records in the `CityInterests` collection */
  updateCityInterestsCollection: CityInterestsUpdateResponse;
  /** Updates zero or more records in the `CitySettings` collection */
  updateCitySettingsCollection: CitySettingsUpdateResponse;
  /** Updates zero or more records in the `EventInterests` collection */
  updateEventInterestsCollection: EventInterestsUpdateResponse;
  /** Updates zero or more records in the `Events` collection */
  updateEventsCollection: EventsUpdateResponse;
  /** Updates zero or more records in the `FeatureFlags` collection */
  updateFeatureFlagsCollection: FeatureFlagsUpdateResponse;
  /** Updates zero or more records in the `GroupInviteEvents` collection */
  updateGroupInviteEventsCollection: GroupInviteEventsUpdateResponse;
  /** Updates zero or more records in the `GroupInvites` collection */
  updateGroupInvitesCollection: GroupInvitesUpdateResponse;
  /** Updates zero or more records in the `GroupMessages` collection */
  updateGroupMessagesCollection: GroupMessagesUpdateResponse;
  /** Updates zero or more records in the `InterestActivations` collection */
  updateInterestActivationsCollection: InterestActivationsUpdateResponse;
  /** Updates zero or more records in the `Interests` collection */
  updateInterestsCollection: InterestsUpdateResponse;
  /** Updates zero or more records in the `LandingPlanItems` collection */
  updateLandingPlanItemsCollection: LandingPlanItemsUpdateResponse;
  /** Updates zero or more records in the `LandingPlans` collection */
  updateLandingPlansCollection: LandingPlansUpdateResponse;
  /** Updates zero or more records in the `MatchCandidates` collection */
  updateMatchCandidatesCollection: MatchCandidatesUpdateResponse;
  /** Updates zero or more records in the `ModerationActions` collection */
  updateModerationActionsCollection: ModerationActionsUpdateResponse;
  /** Updates zero or more records in the `PlanRecipes` collection */
  updatePlanRecipesCollection: PlanRecipesUpdateResponse;
  /** Updates zero or more records in the `PlanSafetyChecks` collection */
  updatePlanSafetyChecksCollection: PlanSafetyChecksUpdateResponse;
  /** Updates zero or more records in the `Profiles` collection */
  updateProfilesCollection: ProfilesUpdateResponse;
  /** Updates zero or more records in the `RepeatConnectionPreferences` collection */
  updateRepeatConnectionPreferencesCollection: RepeatConnectionPreferencesUpdateResponse;
  /** Updates zero or more records in the `Reports` collection */
  updateReportsCollection: ReportsUpdateResponse;
  /** Updates zero or more records in the `SpatialRefSys` collection */
  updateSpatialRefSysCollection: SpatialRefSysUpdateResponse;
  /** Updates zero or more records in the `StarterPlanSteps` collection */
  updateStarterPlanStepsCollection: StarterPlanStepsUpdateResponse;
  /** Updates zero or more records in the `StarterPlans` collection */
  updateStarterPlansCollection: StarterPlansUpdateResponse;
  /** Updates zero or more records in the `SuburbTags` collection */
  updateSuburbTagsCollection: SuburbTagsUpdateResponse;
  /** Updates zero or more records in the `Suburbs` collection */
  updateSuburbsCollection: SuburbsUpdateResponse;
  /** Updates zero or more records in the `UserInterests` collection */
  updateUserInterestsCollection: UserInterestsUpdateResponse;
  /** Updates zero or more records in the `UserReliability` collection */
  updateUserReliabilityCollection: UserReliabilityUpdateResponse;
  /** Updates zero or more records in the `UserSafetySettings` collection */
  updateUserSafetySettingsCollection: UserSafetySettingsUpdateResponse;
  /** Updates zero or more records in the `UserSocialPreferences` collection */
  updateUserSocialPreferencesCollection: UserSocialPreferencesUpdateResponse;
  /** Updates zero or more records in the `UserSuburbMatches` collection */
  updateUserSuburbMatchesCollection: UserSuburbMatchesUpdateResponse;
  /** Updates zero or more records in the `UserVerifications` collection */
  updateUserVerificationsCollection: UserVerificationsUpdateResponse;
  upsertBuzzProfile?: Maybe<Scalars['JSON']['output']>;
};


/** The root type for creating and mutating data */
export type MutationActivateInterestArgs = {
  interestId: Scalars['UUID']['input'];
};


/** The root type for creating and mutating data */
export type MutationDeleteFromActivityGroupCheckinsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<ActivityGroupCheckinsFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromActivityGroupMembersCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<ActivityGroupMembersFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromActivityGroupsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<ActivityGroupsFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromActivityPlansCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<ActivityPlansFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromActivityRiskLevelsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<ActivityRiskLevelsFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromAiProfileSummariesCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<AiProfileSummariesFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromBlocksCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<BlocksFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromBusinessCategoriesCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<BusinessCategoriesFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromBusinessImpressionsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<BusinessImpressionsFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromBusinessLeadsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<BusinessLeadsFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromBusinessesCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<BusinessesFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromCitiesCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<CitiesFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromCityFeatureFlagsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<CityFeatureFlagsFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromCityInterestsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<CityInterestsFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromCitySettingsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<CitySettingsFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromEventInterestsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<EventInterestsFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromEventsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<EventsFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromFeatureFlagsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<FeatureFlagsFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromGroupInviteEventsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<GroupInviteEventsFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromGroupInvitesCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<GroupInvitesFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromGroupMessagesCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<GroupMessagesFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromInterestActivationsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<InterestActivationsFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromInterestsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<InterestsFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromLandingPlanItemsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<LandingPlanItemsFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromLandingPlansCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<LandingPlansFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromMatchCandidatesCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<MatchCandidatesFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromModerationActionsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<ModerationActionsFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromPlanRecipesCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<PlanRecipesFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromPlanSafetyChecksCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<PlanSafetyChecksFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromProfilesCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<ProfilesFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromRepeatConnectionPreferencesCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<RepeatConnectionPreferencesFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromReportsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<ReportsFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromSpatialRefSysCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<SpatialRefSysFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromStarterPlanStepsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<StarterPlanStepsFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromStarterPlansCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<StarterPlansFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromSuburbTagsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<SuburbTagsFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromSuburbsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<SuburbsFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromUserInterestsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<UserInterestsFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromUserReliabilityCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<UserReliabilityFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromUserSafetySettingsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<UserSafetySettingsFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromUserSocialPreferencesCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<UserSocialPreferencesFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromUserSuburbMatchesCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<UserSuburbMatchesFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromUserVerificationsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<UserVerificationsFilter>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntoActivityGroupCheckinsCollectionArgs = {
  objects: Array<ActivityGroupCheckinsInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntoActivityGroupMembersCollectionArgs = {
  objects: Array<ActivityGroupMembersInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntoActivityGroupsCollectionArgs = {
  objects: Array<ActivityGroupsInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntoActivityPlansCollectionArgs = {
  objects: Array<ActivityPlansInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntoActivityRiskLevelsCollectionArgs = {
  objects: Array<ActivityRiskLevelsInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntoAiProfileSummariesCollectionArgs = {
  objects: Array<AiProfileSummariesInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntoBlocksCollectionArgs = {
  objects: Array<BlocksInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntoBusinessCategoriesCollectionArgs = {
  objects: Array<BusinessCategoriesInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntoBusinessImpressionsCollectionArgs = {
  objects: Array<BusinessImpressionsInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntoBusinessLeadsCollectionArgs = {
  objects: Array<BusinessLeadsInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntoBusinessesCollectionArgs = {
  objects: Array<BusinessesInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntoCitiesCollectionArgs = {
  objects: Array<CitiesInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntoCityFeatureFlagsCollectionArgs = {
  objects: Array<CityFeatureFlagsInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntoCityInterestsCollectionArgs = {
  objects: Array<CityInterestsInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntoCitySettingsCollectionArgs = {
  objects: Array<CitySettingsInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntoEventInterestsCollectionArgs = {
  objects: Array<EventInterestsInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntoEventsCollectionArgs = {
  objects: Array<EventsInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntoFeatureFlagsCollectionArgs = {
  objects: Array<FeatureFlagsInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntoGroupInviteEventsCollectionArgs = {
  objects: Array<GroupInviteEventsInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntoGroupInvitesCollectionArgs = {
  objects: Array<GroupInvitesInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntoGroupMessagesCollectionArgs = {
  objects: Array<GroupMessagesInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntoInterestActivationsCollectionArgs = {
  objects: Array<InterestActivationsInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntoInterestsCollectionArgs = {
  objects: Array<InterestsInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntoLandingPlanItemsCollectionArgs = {
  objects: Array<LandingPlanItemsInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntoLandingPlansCollectionArgs = {
  objects: Array<LandingPlansInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntoMatchCandidatesCollectionArgs = {
  objects: Array<MatchCandidatesInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntoModerationActionsCollectionArgs = {
  objects: Array<ModerationActionsInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntoPlanRecipesCollectionArgs = {
  objects: Array<PlanRecipesInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntoPlanSafetyChecksCollectionArgs = {
  objects: Array<PlanSafetyChecksInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntoProfilesCollectionArgs = {
  objects: Array<ProfilesInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntoRepeatConnectionPreferencesCollectionArgs = {
  objects: Array<RepeatConnectionPreferencesInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntoReportsCollectionArgs = {
  objects: Array<ReportsInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntoSpatialRefSysCollectionArgs = {
  objects: Array<SpatialRefSysInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntoStarterPlanStepsCollectionArgs = {
  objects: Array<StarterPlanStepsInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntoStarterPlansCollectionArgs = {
  objects: Array<StarterPlansInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntoSuburbTagsCollectionArgs = {
  objects: Array<SuburbTagsInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntoSuburbsCollectionArgs = {
  objects: Array<SuburbsInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntoUserInterestsCollectionArgs = {
  objects: Array<UserInterestsInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntoUserReliabilityCollectionArgs = {
  objects: Array<UserReliabilityInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntoUserSafetySettingsCollectionArgs = {
  objects: Array<UserSafetySettingsInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntoUserSocialPreferencesCollectionArgs = {
  objects: Array<UserSocialPreferencesInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntoUserSuburbMatchesCollectionArgs = {
  objects: Array<UserSuburbMatchesInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntoUserVerificationsCollectionArgs = {
  objects: Array<UserVerificationsInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationPostgisSelectivityArgs = {
  attName: Scalars['String']['input'];
  geom: Scalars['Opaque']['input'];
  mode?: InputMaybe<Scalars['String']['input']>;
  tbl: Scalars['Opaque']['input'];
};


/** The root type for creating and mutating data */
export type MutationStClusterkmeansArgs = {
  geom: Scalars['Opaque']['input'];
  k: Scalars['Int']['input'];
  maxRadius?: InputMaybe<Scalars['Float']['input']>;
};


/** The root type for creating and mutating data */
export type MutationStSymmetricdifferenceArgs = {
  geom1: Scalars['Opaque']['input'];
  geom2: Scalars['Opaque']['input'];
};


/** The root type for creating and mutating data */
export type MutationUpdateActivityGroupCheckinsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<ActivityGroupCheckinsFilter>;
  set: ActivityGroupCheckinsUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateActivityGroupMembersCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<ActivityGroupMembersFilter>;
  set: ActivityGroupMembersUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateActivityGroupsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<ActivityGroupsFilter>;
  set: ActivityGroupsUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateActivityPlansCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<ActivityPlansFilter>;
  set: ActivityPlansUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateActivityRiskLevelsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<ActivityRiskLevelsFilter>;
  set: ActivityRiskLevelsUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateAiProfileSummariesCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<AiProfileSummariesFilter>;
  set: AiProfileSummariesUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateBlocksCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<BlocksFilter>;
  set: BlocksUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateBusinessCategoriesCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<BusinessCategoriesFilter>;
  set: BusinessCategoriesUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateBusinessImpressionsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<BusinessImpressionsFilter>;
  set: BusinessImpressionsUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateBusinessLeadsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<BusinessLeadsFilter>;
  set: BusinessLeadsUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateBusinessesCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<BusinessesFilter>;
  set: BusinessesUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateCitiesCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<CitiesFilter>;
  set: CitiesUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateCityFeatureFlagsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<CityFeatureFlagsFilter>;
  set: CityFeatureFlagsUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateCityInterestsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<CityInterestsFilter>;
  set: CityInterestsUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateCitySettingsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<CitySettingsFilter>;
  set: CitySettingsUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateEventInterestsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<EventInterestsFilter>;
  set: EventInterestsUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateEventsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<EventsFilter>;
  set: EventsUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateFeatureFlagsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<FeatureFlagsFilter>;
  set: FeatureFlagsUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateGroupInviteEventsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<GroupInviteEventsFilter>;
  set: GroupInviteEventsUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateGroupInvitesCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<GroupInvitesFilter>;
  set: GroupInvitesUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateGroupMessagesCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<GroupMessagesFilter>;
  set: GroupMessagesUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateInterestActivationsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<InterestActivationsFilter>;
  set: InterestActivationsUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateInterestsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<InterestsFilter>;
  set: InterestsUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateLandingPlanItemsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<LandingPlanItemsFilter>;
  set: LandingPlanItemsUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateLandingPlansCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<LandingPlansFilter>;
  set: LandingPlansUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateMatchCandidatesCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<MatchCandidatesFilter>;
  set: MatchCandidatesUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateModerationActionsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<ModerationActionsFilter>;
  set: ModerationActionsUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdatePlanRecipesCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<PlanRecipesFilter>;
  set: PlanRecipesUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdatePlanSafetyChecksCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<PlanSafetyChecksFilter>;
  set: PlanSafetyChecksUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateProfilesCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<ProfilesFilter>;
  set: ProfilesUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateRepeatConnectionPreferencesCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<RepeatConnectionPreferencesFilter>;
  set: RepeatConnectionPreferencesUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateReportsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<ReportsFilter>;
  set: ReportsUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateSpatialRefSysCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<SpatialRefSysFilter>;
  set: SpatialRefSysUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateStarterPlanStepsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<StarterPlanStepsFilter>;
  set: StarterPlanStepsUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateStarterPlansCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<StarterPlansFilter>;
  set: StarterPlansUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateSuburbTagsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<SuburbTagsFilter>;
  set: SuburbTagsUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateSuburbsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<SuburbsFilter>;
  set: SuburbsUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateUserInterestsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<UserInterestsFilter>;
  set: UserInterestsUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateUserReliabilityCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<UserReliabilityFilter>;
  set: UserReliabilityUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateUserSafetySettingsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<UserSafetySettingsFilter>;
  set: UserSafetySettingsUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateUserSocialPreferencesCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<UserSocialPreferencesFilter>;
  set: UserSocialPreferencesUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateUserSuburbMatchesCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<UserSuburbMatchesFilter>;
  set: UserSuburbMatchesUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateUserVerificationsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<UserVerificationsFilter>;
  set: UserVerificationsUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpsertBuzzProfileArgs = {
  cityId: Scalars['UUID']['input'];
  displayName: Scalars['String']['input'];
  quizAnswers: Scalars['JSON']['input'];
  quizTraits: Scalars['JSON']['input'];
  userId: Scalars['UUID']['input'];
};

export type Node = {
  /** Retrieves a record by `ID` */
  nodeId: Scalars['ID']['output'];
};

/** Boolean expression comparing fields on type "Opaque" */
export type OpaqueFilter = {
  eq?: InputMaybe<Scalars['Opaque']['input']>;
  is?: InputMaybe<FilterIs>;
};

/** Defines a per-field sorting order */
export enum OrderByDirection {
  /** Ascending order, nulls first */
  AscNullsFirst = 'AscNullsFirst',
  /** Ascending order, nulls last */
  AscNullsLast = 'AscNullsLast',
  /** Descending order, nulls first */
  DescNullsFirst = 'DescNullsFirst',
  /** Descending order, nulls last */
  DescNullsLast = 'DescNullsLast'
}

export type PageInfo = {
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type PlanRecipes = Node & {
  cityApplicabilityJson: Scalars['JSON']['output'];
  createdAt: Scalars['Datetime']['output'];
  defaultDurationMinutes: Scalars['Int']['output'];
  defaultGroupSizeMax: Scalars['Int']['output'];
  defaultGroupSizeMin: Scalars['Int']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  key: Scalars['String']['output'];
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  riskLevel: Scalars['String']['output'];
  safetyDefaultsJson: Scalars['JSON']['output'];
  title: Scalars['String']['output'];
  updatedAt: Scalars['Datetime']['output'];
  venueType: Scalars['String']['output'];
};

export type PlanRecipesConnection = {
  edges: Array<PlanRecipesEdge>;
  pageInfo: PageInfo;
};

export type PlanRecipesDeleteResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<PlanRecipes>;
};

export type PlanRecipesEdge = {
  cursor: Scalars['String']['output'];
  node: PlanRecipes;
};

export type PlanRecipesFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<PlanRecipesFilter>>;
  createdAt?: InputMaybe<DatetimeFilter>;
  defaultDurationMinutes?: InputMaybe<IntFilter>;
  defaultGroupSizeMax?: InputMaybe<IntFilter>;
  defaultGroupSizeMin?: InputMaybe<IntFilter>;
  description?: InputMaybe<StringFilter>;
  id?: InputMaybe<UuidFilter>;
  key?: InputMaybe<StringFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<PlanRecipesFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<PlanRecipesFilter>>;
  riskLevel?: InputMaybe<StringFilter>;
  title?: InputMaybe<StringFilter>;
  updatedAt?: InputMaybe<DatetimeFilter>;
  venueType?: InputMaybe<StringFilter>;
};

export type PlanRecipesInsertInput = {
  cityApplicabilityJson?: InputMaybe<Scalars['JSON']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  defaultDurationMinutes?: InputMaybe<Scalars['Int']['input']>;
  defaultGroupSizeMax?: InputMaybe<Scalars['Int']['input']>;
  defaultGroupSizeMin?: InputMaybe<Scalars['Int']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  key?: InputMaybe<Scalars['String']['input']>;
  riskLevel?: InputMaybe<Scalars['String']['input']>;
  safetyDefaultsJson?: InputMaybe<Scalars['JSON']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['Datetime']['input']>;
  venueType?: InputMaybe<Scalars['String']['input']>;
};

export type PlanRecipesInsertResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<PlanRecipes>;
};

export type PlanRecipesOrderBy = {
  createdAt?: InputMaybe<OrderByDirection>;
  defaultDurationMinutes?: InputMaybe<OrderByDirection>;
  defaultGroupSizeMax?: InputMaybe<OrderByDirection>;
  defaultGroupSizeMin?: InputMaybe<OrderByDirection>;
  description?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  key?: InputMaybe<OrderByDirection>;
  riskLevel?: InputMaybe<OrderByDirection>;
  title?: InputMaybe<OrderByDirection>;
  updatedAt?: InputMaybe<OrderByDirection>;
  venueType?: InputMaybe<OrderByDirection>;
};

export type PlanRecipesUpdateInput = {
  cityApplicabilityJson?: InputMaybe<Scalars['JSON']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  defaultDurationMinutes?: InputMaybe<Scalars['Int']['input']>;
  defaultGroupSizeMax?: InputMaybe<Scalars['Int']['input']>;
  defaultGroupSizeMin?: InputMaybe<Scalars['Int']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  key?: InputMaybe<Scalars['String']['input']>;
  riskLevel?: InputMaybe<Scalars['String']['input']>;
  safetyDefaultsJson?: InputMaybe<Scalars['JSON']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['Datetime']['input']>;
  venueType?: InputMaybe<Scalars['String']['input']>;
};

export type PlanRecipesUpdateResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<PlanRecipes>;
};

export type PlanSafetyChecks = Node & {
  activityGroup?: Maybe<ActivityGroups>;
  activityGroupId?: Maybe<Scalars['UUID']['output']>;
  activityPlan?: Maybe<ActivityPlans>;
  activityPlanId?: Maybe<Scalars['UUID']['output']>;
  checklistJson: Scalars['JSON']['output'];
  createdAt: Scalars['Datetime']['output'];
  id: Scalars['UUID']['output'];
  locationVisibility: Scalars['String']['output'];
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  requiresPublicVenue: Scalars['Boolean']['output'];
  reviewedAt?: Maybe<Scalars['Datetime']['output']>;
  safetyStatus: Scalars['String']['output'];
  updatedAt: Scalars['Datetime']['output'];
};

export type PlanSafetyChecksConnection = {
  edges: Array<PlanSafetyChecksEdge>;
  pageInfo: PageInfo;
};

export type PlanSafetyChecksDeleteResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<PlanSafetyChecks>;
};

export type PlanSafetyChecksEdge = {
  cursor: Scalars['String']['output'];
  node: PlanSafetyChecks;
};

export type PlanSafetyChecksFilter = {
  activityGroupId?: InputMaybe<UuidFilter>;
  activityPlanId?: InputMaybe<UuidFilter>;
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<PlanSafetyChecksFilter>>;
  createdAt?: InputMaybe<DatetimeFilter>;
  id?: InputMaybe<UuidFilter>;
  locationVisibility?: InputMaybe<StringFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<PlanSafetyChecksFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<PlanSafetyChecksFilter>>;
  requiresPublicVenue?: InputMaybe<BooleanFilter>;
  reviewedAt?: InputMaybe<DatetimeFilter>;
  safetyStatus?: InputMaybe<StringFilter>;
  updatedAt?: InputMaybe<DatetimeFilter>;
};

export type PlanSafetyChecksInsertInput = {
  activityGroupId?: InputMaybe<Scalars['UUID']['input']>;
  activityPlanId?: InputMaybe<Scalars['UUID']['input']>;
  checklistJson?: InputMaybe<Scalars['JSON']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  locationVisibility?: InputMaybe<Scalars['String']['input']>;
  requiresPublicVenue?: InputMaybe<Scalars['Boolean']['input']>;
  reviewedAt?: InputMaybe<Scalars['Datetime']['input']>;
  safetyStatus?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['Datetime']['input']>;
};

export type PlanSafetyChecksInsertResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<PlanSafetyChecks>;
};

export type PlanSafetyChecksOrderBy = {
  activityGroupId?: InputMaybe<OrderByDirection>;
  activityPlanId?: InputMaybe<OrderByDirection>;
  createdAt?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  locationVisibility?: InputMaybe<OrderByDirection>;
  requiresPublicVenue?: InputMaybe<OrderByDirection>;
  reviewedAt?: InputMaybe<OrderByDirection>;
  safetyStatus?: InputMaybe<OrderByDirection>;
  updatedAt?: InputMaybe<OrderByDirection>;
};

export type PlanSafetyChecksUpdateInput = {
  activityGroupId?: InputMaybe<Scalars['UUID']['input']>;
  activityPlanId?: InputMaybe<Scalars['UUID']['input']>;
  checklistJson?: InputMaybe<Scalars['JSON']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  locationVisibility?: InputMaybe<Scalars['String']['input']>;
  requiresPublicVenue?: InputMaybe<Scalars['Boolean']['input']>;
  reviewedAt?: InputMaybe<Scalars['Datetime']['input']>;
  safetyStatus?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['Datetime']['input']>;
};

export type PlanSafetyChecksUpdateResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<PlanSafetyChecks>;
};

export type Profiles = Node & {
  activityGroupCheckinsCollection?: Maybe<ActivityGroupCheckinsConnection>;
  activityGroupMembersCollection?: Maybe<ActivityGroupMembersConnection>;
  activityGroupsCollection?: Maybe<ActivityGroupsConnection>;
  activityPlansCollection?: Maybe<ActivityPlansConnection>;
  aiProfileSummariesCollection?: Maybe<AiProfileSummariesConnection>;
  bio?: Maybe<Scalars['String']['output']>;
  blocksCollection?: Maybe<BlocksConnection>;
  businessImpressionsCollection?: Maybe<BusinessImpressionsConnection>;
  city?: Maybe<Cities>;
  cityId?: Maybe<Scalars['UUID']['output']>;
  createdAt: Scalars['Datetime']['output'];
  displayName?: Maybe<Scalars['String']['output']>;
  groupInviteEventsCollection?: Maybe<GroupInviteEventsConnection>;
  groupInvitesCollection?: Maybe<GroupInvitesConnection>;
  groupMessagesCollection?: Maybe<GroupMessagesConnection>;
  id: Scalars['UUID']['output'];
  interestActivationsCollection?: Maybe<InterestActivationsConnection>;
  landingPlansCollection?: Maybe<LandingPlansConnection>;
  lastActiveAt: Scalars['Datetime']['output'];
  matchCandidatesCollection?: Maybe<MatchCandidatesConnection>;
  moderationActionsCollection?: Maybe<ModerationActionsConnection>;
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  quizAnswers: Scalars['JSON']['output'];
  quizTraits: Scalars['JSON']['output'];
  repeatConnectionPreferencesCollection?: Maybe<RepeatConnectionPreferencesConnection>;
  reportsCollection?: Maybe<ReportsConnection>;
  settled: Scalars['Boolean']['output'];
  updatedAt: Scalars['Datetime']['output'];
  userInterestsCollection?: Maybe<UserInterestsConnection>;
  userReliability?: Maybe<UserReliability>;
  userSafetySettings?: Maybe<UserSafetySettings>;
  userSocialPreferences?: Maybe<UserSocialPreferences>;
  userSuburbMatchesCollection?: Maybe<UserSuburbMatchesConnection>;
  userVerificationsCollection?: Maybe<UserVerificationsConnection>;
  visible: Scalars['Boolean']['output'];
};


export type ProfilesActivityGroupCheckinsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<ActivityGroupCheckinsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<ActivityGroupCheckinsOrderBy>>;
};


export type ProfilesActivityGroupMembersCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<ActivityGroupMembersFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<ActivityGroupMembersOrderBy>>;
};


export type ProfilesActivityGroupsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<ActivityGroupsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<ActivityGroupsOrderBy>>;
};


export type ProfilesActivityPlansCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<ActivityPlansFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<ActivityPlansOrderBy>>;
};


export type ProfilesAiProfileSummariesCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<AiProfileSummariesFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<AiProfileSummariesOrderBy>>;
};


export type ProfilesBlocksCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<BlocksFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<BlocksOrderBy>>;
};


export type ProfilesBusinessImpressionsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<BusinessImpressionsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<BusinessImpressionsOrderBy>>;
};


export type ProfilesGroupInviteEventsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<GroupInviteEventsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<GroupInviteEventsOrderBy>>;
};


export type ProfilesGroupInvitesCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<GroupInvitesFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<GroupInvitesOrderBy>>;
};


export type ProfilesGroupMessagesCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<GroupMessagesFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<GroupMessagesOrderBy>>;
};


export type ProfilesInterestActivationsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<InterestActivationsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<InterestActivationsOrderBy>>;
};


export type ProfilesLandingPlansCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<LandingPlansFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<LandingPlansOrderBy>>;
};


export type ProfilesMatchCandidatesCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<MatchCandidatesFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<MatchCandidatesOrderBy>>;
};


export type ProfilesModerationActionsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<ModerationActionsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<ModerationActionsOrderBy>>;
};


export type ProfilesRepeatConnectionPreferencesCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<RepeatConnectionPreferencesFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<RepeatConnectionPreferencesOrderBy>>;
};


export type ProfilesReportsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<ReportsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<ReportsOrderBy>>;
};


export type ProfilesUserInterestsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UserInterestsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<UserInterestsOrderBy>>;
};


export type ProfilesUserSuburbMatchesCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UserSuburbMatchesFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<UserSuburbMatchesOrderBy>>;
};


export type ProfilesUserVerificationsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UserVerificationsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<UserVerificationsOrderBy>>;
};

export type ProfilesConnection = {
  edges: Array<ProfilesEdge>;
  pageInfo: PageInfo;
};

export type ProfilesDeleteResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Profiles>;
};

export type ProfilesEdge = {
  cursor: Scalars['String']['output'];
  node: Profiles;
};

export type ProfilesFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<ProfilesFilter>>;
  bio?: InputMaybe<StringFilter>;
  cityId?: InputMaybe<UuidFilter>;
  createdAt?: InputMaybe<DatetimeFilter>;
  displayName?: InputMaybe<StringFilter>;
  id?: InputMaybe<UuidFilter>;
  lastActiveAt?: InputMaybe<DatetimeFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<ProfilesFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<ProfilesFilter>>;
  settled?: InputMaybe<BooleanFilter>;
  updatedAt?: InputMaybe<DatetimeFilter>;
  visible?: InputMaybe<BooleanFilter>;
};

export type ProfilesInsertInput = {
  bio?: InputMaybe<Scalars['String']['input']>;
  cityId?: InputMaybe<Scalars['UUID']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  displayName?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  lastActiveAt?: InputMaybe<Scalars['Datetime']['input']>;
  quizAnswers?: InputMaybe<Scalars['JSON']['input']>;
  quizTraits?: InputMaybe<Scalars['JSON']['input']>;
  settled?: InputMaybe<Scalars['Boolean']['input']>;
  updatedAt?: InputMaybe<Scalars['Datetime']['input']>;
  visible?: InputMaybe<Scalars['Boolean']['input']>;
};

export type ProfilesInsertResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Profiles>;
};

export type ProfilesOrderBy = {
  bio?: InputMaybe<OrderByDirection>;
  cityId?: InputMaybe<OrderByDirection>;
  createdAt?: InputMaybe<OrderByDirection>;
  displayName?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  lastActiveAt?: InputMaybe<OrderByDirection>;
  settled?: InputMaybe<OrderByDirection>;
  updatedAt?: InputMaybe<OrderByDirection>;
  visible?: InputMaybe<OrderByDirection>;
};

export type ProfilesUpdateInput = {
  bio?: InputMaybe<Scalars['String']['input']>;
  cityId?: InputMaybe<Scalars['UUID']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  displayName?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  lastActiveAt?: InputMaybe<Scalars['Datetime']['input']>;
  quizAnswers?: InputMaybe<Scalars['JSON']['input']>;
  quizTraits?: InputMaybe<Scalars['JSON']['input']>;
  settled?: InputMaybe<Scalars['Boolean']['input']>;
  updatedAt?: InputMaybe<Scalars['Datetime']['input']>;
  visible?: InputMaybe<Scalars['Boolean']['input']>;
};

export type ProfilesUpdateResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Profiles>;
};

/** The root type for querying data */
export type Query = {
  /** A pagable collection of type `ActivityGroupCheckins` */
  activityGroupCheckinsCollection?: Maybe<ActivityGroupCheckinsConnection>;
  /** A pagable collection of type `ActivityGroupMembers` */
  activityGroupMembersCollection?: Maybe<ActivityGroupMembersConnection>;
  /** A pagable collection of type `ActivityGroups` */
  activityGroupsCollection?: Maybe<ActivityGroupsConnection>;
  /** A pagable collection of type `ActivityPlans` */
  activityPlansCollection?: Maybe<ActivityPlansConnection>;
  /** A pagable collection of type `ActivityRiskLevels` */
  activityRiskLevelsCollection?: Maybe<ActivityRiskLevelsConnection>;
  /** A pagable collection of type `AiProfileSummaries` */
  aiProfileSummariesCollection?: Maybe<AiProfileSummariesConnection>;
  /** A pagable collection of type `Blocks` */
  blocksCollection?: Maybe<BlocksConnection>;
  /** A pagable collection of type `BusinessCategories` */
  businessCategoriesCollection?: Maybe<BusinessCategoriesConnection>;
  /** A pagable collection of type `BusinessImpressions` */
  businessImpressionsCollection?: Maybe<BusinessImpressionsConnection>;
  /** A pagable collection of type `BusinessLeads` */
  businessLeadsCollection?: Maybe<BusinessLeadsConnection>;
  /** A pagable collection of type `Businesses` */
  businessesCollection?: Maybe<BusinessesConnection>;
  /** A pagable collection of type `Cities` */
  citiesCollection?: Maybe<CitiesConnection>;
  /** A pagable collection of type `CityFeatureFlags` */
  cityFeatureFlagsCollection?: Maybe<CityFeatureFlagsConnection>;
  /** A pagable collection of type `CityInterests` */
  cityInterestsCollection?: Maybe<CityInterestsConnection>;
  /** A pagable collection of type `CitySettings` */
  citySettingsCollection?: Maybe<CitySettingsConnection>;
  equals?: Maybe<Scalars['Boolean']['output']>;
  /** A pagable collection of type `EventInterests` */
  eventInterestsCollection?: Maybe<EventInterestsConnection>;
  /** A pagable collection of type `Events` */
  eventsCollection?: Maybe<EventsConnection>;
  /** A pagable collection of type `FeatureFlags` */
  featureFlagsCollection?: Maybe<FeatureFlagsConnection>;
  geometryAbove?: Maybe<Scalars['Boolean']['output']>;
  geometryBelow?: Maybe<Scalars['Boolean']['output']>;
  geometryCmp?: Maybe<Scalars['Int']['output']>;
  geometryContained3d?: Maybe<Scalars['Boolean']['output']>;
  geometryContains?: Maybe<Scalars['Boolean']['output']>;
  geometryContains3d?: Maybe<Scalars['Boolean']['output']>;
  geometryDistanceBox?: Maybe<Scalars['Float']['output']>;
  geometryDistanceCentroid?: Maybe<Scalars['Float']['output']>;
  geometryEq?: Maybe<Scalars['Boolean']['output']>;
  geometryGe?: Maybe<Scalars['Boolean']['output']>;
  geometryGt?: Maybe<Scalars['Boolean']['output']>;
  geometryLe?: Maybe<Scalars['Boolean']['output']>;
  geometryLeft?: Maybe<Scalars['Boolean']['output']>;
  geometryLt?: Maybe<Scalars['Boolean']['output']>;
  geometryOverabove?: Maybe<Scalars['Boolean']['output']>;
  geometryOverbelow?: Maybe<Scalars['Boolean']['output']>;
  geometryOverlaps?: Maybe<Scalars['Boolean']['output']>;
  geometryOverlaps3d?: Maybe<Scalars['Boolean']['output']>;
  geometryOverleft?: Maybe<Scalars['Boolean']['output']>;
  geometryOverright?: Maybe<Scalars['Boolean']['output']>;
  geometryRight?: Maybe<Scalars['Boolean']['output']>;
  geometrySame?: Maybe<Scalars['Boolean']['output']>;
  geometrySame3d?: Maybe<Scalars['Boolean']['output']>;
  geometryWithin?: Maybe<Scalars['Boolean']['output']>;
  /** A pagable collection of type `GroupInviteEvents` */
  groupInviteEventsCollection?: Maybe<GroupInviteEventsConnection>;
  /** A pagable collection of type `GroupInvites` */
  groupInvitesCollection?: Maybe<GroupInvitesConnection>;
  /** A pagable collection of type `GroupMessages` */
  groupMessagesCollection?: Maybe<GroupMessagesConnection>;
  /** A pagable collection of type `InterestActivations` */
  interestActivationsCollection?: Maybe<InterestActivationsConnection>;
  /** A pagable collection of type `Interests` */
  interestsCollection?: Maybe<InterestsConnection>;
  /** A pagable collection of type `LandingPlanItems` */
  landingPlanItemsCollection?: Maybe<LandingPlanItemsConnection>;
  /** A pagable collection of type `LandingPlans` */
  landingPlansCollection?: Maybe<LandingPlansConnection>;
  /** A pagable collection of type `MatchCandidates` */
  matchCandidatesCollection?: Maybe<MatchCandidatesConnection>;
  /** A pagable collection of type `ModerationActions` */
  moderationActionsCollection?: Maybe<ModerationActionsConnection>;
  /** Retrieve a record by its `ID` */
  node?: Maybe<Node>;
  /** A pagable collection of type `PlanRecipes` */
  planRecipesCollection?: Maybe<PlanRecipesConnection>;
  /** A pagable collection of type `PlanSafetyChecks` */
  planSafetyChecksCollection?: Maybe<PlanSafetyChecksConnection>;
  postgisConstraintDims?: Maybe<Scalars['Int']['output']>;
  postgisConstraintSrid?: Maybe<Scalars['Int']['output']>;
  postgisConstraintType?: Maybe<Scalars['String']['output']>;
  postgisDeprecate?: Maybe<Scalars['Opaque']['output']>;
  postgisFullVersion?: Maybe<Scalars['String']['output']>;
  postgisGeosVersion?: Maybe<Scalars['String']['output']>;
  postgisIndexExtent?: Maybe<Scalars['Opaque']['output']>;
  postgisLibBuildDate?: Maybe<Scalars['String']['output']>;
  postgisLibRevision?: Maybe<Scalars['String']['output']>;
  postgisLibVersion?: Maybe<Scalars['String']['output']>;
  postgisLibjsonVersion?: Maybe<Scalars['String']['output']>;
  postgisLiblwgeomVersion?: Maybe<Scalars['String']['output']>;
  postgisLibprotobufVersion?: Maybe<Scalars['String']['output']>;
  postgisLibxmlVersion?: Maybe<Scalars['String']['output']>;
  postgisPgsqlVersion?: Maybe<Scalars['String']['output']>;
  postgisProjVersion?: Maybe<Scalars['String']['output']>;
  postgisScriptsBuildDate?: Maybe<Scalars['String']['output']>;
  postgisScriptsInstalled?: Maybe<Scalars['String']['output']>;
  postgisScriptsPgsqlVersion?: Maybe<Scalars['String']['output']>;
  postgisScriptsReleased?: Maybe<Scalars['String']['output']>;
  postgisSvnVersion?: Maybe<Scalars['String']['output']>;
  postgisTypeName?: Maybe<Scalars['String']['output']>;
  postgisVersion?: Maybe<Scalars['String']['output']>;
  postgisWagyuVersion?: Maybe<Scalars['String']['output']>;
  /** A pagable collection of type `Profiles` */
  profilesCollection?: Maybe<ProfilesConnection>;
  /** A pagable collection of type `RepeatConnectionPreferences` */
  repeatConnectionPreferencesCollection?: Maybe<RepeatConnectionPreferencesConnection>;
  /** A pagable collection of type `Reports` */
  reportsCollection?: Maybe<ReportsConnection>;
  /** A pagable collection of type `SpatialRefSys` */
  spatialRefSysCollection?: Maybe<SpatialRefSysConnection>;
  st3dclosestpoint?: Maybe<Scalars['Opaque']['output']>;
  st3ddistance?: Maybe<Scalars['Float']['output']>;
  st3dintersects?: Maybe<Scalars['Boolean']['output']>;
  st3dlongestline?: Maybe<Scalars['Opaque']['output']>;
  st3dmakebox?: Maybe<Scalars['Opaque']['output']>;
  st3dmaxdistance?: Maybe<Scalars['Float']['output']>;
  st3dshortestline?: Maybe<Scalars['Opaque']['output']>;
  stAsencodedpolyline?: Maybe<Scalars['String']['output']>;
  stAslatlontext?: Maybe<Scalars['String']['output']>;
  stAsmarc21?: Maybe<Scalars['String']['output']>;
  stAsmvtgeom?: Maybe<Scalars['Opaque']['output']>;
  stAsx3d?: Maybe<Scalars['String']['output']>;
  stBoundingdiagonal?: Maybe<Scalars['Opaque']['output']>;
  stClipbybox2d?: Maybe<Scalars['Opaque']['output']>;
  stClosestpoint?: Maybe<Scalars['Opaque']['output']>;
  stConcavehull?: Maybe<Scalars['Opaque']['output']>;
  stContains?: Maybe<Scalars['Boolean']['output']>;
  stContainsproperly?: Maybe<Scalars['Boolean']['output']>;
  stCoorddim?: Maybe<Scalars['Int']['output']>;
  stCrosses?: Maybe<Scalars['Boolean']['output']>;
  stCurvetoline?: Maybe<Scalars['Opaque']['output']>;
  stDelaunaytriangles?: Maybe<Scalars['Opaque']['output']>;
  stDifference?: Maybe<Scalars['Opaque']['output']>;
  stDisjoint?: Maybe<Scalars['Boolean']['output']>;
  stEquals?: Maybe<Scalars['Boolean']['output']>;
  stForce3d?: Maybe<Scalars['Opaque']['output']>;
  stForce3dm?: Maybe<Scalars['Opaque']['output']>;
  stForce3dz?: Maybe<Scalars['Opaque']['output']>;
  stForce4d?: Maybe<Scalars['Opaque']['output']>;
  stGeometricmedian?: Maybe<Scalars['Opaque']['output']>;
  stGeomfrommarc21?: Maybe<Scalars['Opaque']['output']>;
  stHasarc?: Maybe<Scalars['Boolean']['output']>;
  stHexagon?: Maybe<Scalars['Opaque']['output']>;
  stInterpolatepoint?: Maybe<Scalars['Float']['output']>;
  stIntersects?: Maybe<Scalars['Boolean']['output']>;
  stLetters?: Maybe<Scalars['Opaque']['output']>;
  stLinecrossingdirection?: Maybe<Scalars['Int']['output']>;
  stLinefromencodedpolyline?: Maybe<Scalars['Opaque']['output']>;
  stLinelocatepoint?: Maybe<Scalars['Float']['output']>;
  stLinetocurve?: Maybe<Scalars['Opaque']['output']>;
  stLocatealong?: Maybe<Scalars['Opaque']['output']>;
  stLocatebetween?: Maybe<Scalars['Opaque']['output']>;
  stLocatebetweenelevations?: Maybe<Scalars['Opaque']['output']>;
  stLongestline?: Maybe<Scalars['Opaque']['output']>;
  stMakebox2d?: Maybe<Scalars['Opaque']['output']>;
  stMaxdistance?: Maybe<Scalars['Float']['output']>;
  stMinimumboundingcircle?: Maybe<Scalars['Opaque']['output']>;
  stNode?: Maybe<Scalars['Opaque']['output']>;
  stNormalize?: Maybe<Scalars['Opaque']['output']>;
  stOffsetcurve?: Maybe<Scalars['Opaque']['output']>;
  stOrderingequals?: Maybe<Scalars['Boolean']['output']>;
  stOverlaps?: Maybe<Scalars['Boolean']['output']>;
  stPointm?: Maybe<Scalars['Opaque']['output']>;
  stPointz?: Maybe<Scalars['Opaque']['output']>;
  stPointzm?: Maybe<Scalars['Opaque']['output']>;
  stProject?: Maybe<Scalars['Opaque']['output']>;
  stQuantizecoordinates?: Maybe<Scalars['Opaque']['output']>;
  stReduceprecision?: Maybe<Scalars['Opaque']['output']>;
  stRemoverepeatedpoints?: Maybe<Scalars['Opaque']['output']>;
  stSharedpaths?: Maybe<Scalars['Opaque']['output']>;
  stShortestline?: Maybe<Scalars['Opaque']['output']>;
  stSimplifypolygonhull?: Maybe<Scalars['Opaque']['output']>;
  stSortablehash?: Maybe<Scalars['BigInt']['output']>;
  stSplit?: Maybe<Scalars['Opaque']['output']>;
  stSquare?: Maybe<Scalars['Opaque']['output']>;
  stSwapordinates?: Maybe<Scalars['Opaque']['output']>;
  stSymdifference?: Maybe<Scalars['Opaque']['output']>;
  stTileenvelope?: Maybe<Scalars['Opaque']['output']>;
  stTouches?: Maybe<Scalars['Boolean']['output']>;
  stTriangulatepolygon?: Maybe<Scalars['Opaque']['output']>;
  stVoronoi?: Maybe<Scalars['Opaque']['output']>;
  stVoronoilines?: Maybe<Scalars['Opaque']['output']>;
  stVoronoipolygons?: Maybe<Scalars['Opaque']['output']>;
  stWithin?: Maybe<Scalars['Boolean']['output']>;
  stWkbtosql?: Maybe<Scalars['Opaque']['output']>;
  stWrapx?: Maybe<Scalars['Opaque']['output']>;
  /** A pagable collection of type `StarterPlanSteps` */
  starterPlanStepsCollection?: Maybe<StarterPlanStepsConnection>;
  /** A pagable collection of type `StarterPlans` */
  starterPlansCollection?: Maybe<StarterPlansConnection>;
  /** A pagable collection of type `SuburbTags` */
  suburbTagsCollection?: Maybe<SuburbTagsConnection>;
  /** A pagable collection of type `Suburbs` */
  suburbsCollection?: Maybe<SuburbsConnection>;
  /** A pagable collection of type `UserInterests` */
  userInterestsCollection?: Maybe<UserInterestsConnection>;
  /** A pagable collection of type `UserReliability` */
  userReliabilityCollection?: Maybe<UserReliabilityConnection>;
  /** A pagable collection of type `UserSafetySettings` */
  userSafetySettingsCollection?: Maybe<UserSafetySettingsConnection>;
  /** A pagable collection of type `UserSocialPreferences` */
  userSocialPreferencesCollection?: Maybe<UserSocialPreferencesConnection>;
  /** A pagable collection of type `UserSuburbMatches` */
  userSuburbMatchesCollection?: Maybe<UserSuburbMatchesConnection>;
  /** A pagable collection of type `UserVerifications` */
  userVerificationsCollection?: Maybe<UserVerificationsConnection>;
};


/** The root type for querying data */
export type QueryActivityGroupCheckinsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<ActivityGroupCheckinsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<ActivityGroupCheckinsOrderBy>>;
};


/** The root type for querying data */
export type QueryActivityGroupMembersCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<ActivityGroupMembersFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<ActivityGroupMembersOrderBy>>;
};


/** The root type for querying data */
export type QueryActivityGroupsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<ActivityGroupsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<ActivityGroupsOrderBy>>;
};


/** The root type for querying data */
export type QueryActivityPlansCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<ActivityPlansFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<ActivityPlansOrderBy>>;
};


/** The root type for querying data */
export type QueryActivityRiskLevelsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<ActivityRiskLevelsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<ActivityRiskLevelsOrderBy>>;
};


/** The root type for querying data */
export type QueryAiProfileSummariesCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<AiProfileSummariesFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<AiProfileSummariesOrderBy>>;
};


/** The root type for querying data */
export type QueryBlocksCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<BlocksFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<BlocksOrderBy>>;
};


/** The root type for querying data */
export type QueryBusinessCategoriesCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<BusinessCategoriesFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<BusinessCategoriesOrderBy>>;
};


/** The root type for querying data */
export type QueryBusinessImpressionsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<BusinessImpressionsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<BusinessImpressionsOrderBy>>;
};


/** The root type for querying data */
export type QueryBusinessLeadsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<BusinessLeadsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<BusinessLeadsOrderBy>>;
};


/** The root type for querying data */
export type QueryBusinessesCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<BusinessesFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<BusinessesOrderBy>>;
};


/** The root type for querying data */
export type QueryCitiesCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<CitiesFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<CitiesOrderBy>>;
};


/** The root type for querying data */
export type QueryCityFeatureFlagsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<CityFeatureFlagsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<CityFeatureFlagsOrderBy>>;
};


/** The root type for querying data */
export type QueryCityInterestsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<CityInterestsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<CityInterestsOrderBy>>;
};


/** The root type for querying data */
export type QueryCitySettingsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<CitySettingsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<CitySettingsOrderBy>>;
};


/** The root type for querying data */
export type QueryEqualsArgs = {
  geom1: Scalars['Opaque']['input'];
  geom2: Scalars['Opaque']['input'];
};


/** The root type for querying data */
export type QueryEventInterestsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<EventInterestsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<EventInterestsOrderBy>>;
};


/** The root type for querying data */
export type QueryEventsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<EventsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<EventsOrderBy>>;
};


/** The root type for querying data */
export type QueryFeatureFlagsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<FeatureFlagsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<FeatureFlagsOrderBy>>;
};


/** The root type for querying data */
export type QueryGeometryAboveArgs = {
  geom1: Scalars['Opaque']['input'];
  geom2: Scalars['Opaque']['input'];
};


/** The root type for querying data */
export type QueryGeometryBelowArgs = {
  geom1: Scalars['Opaque']['input'];
  geom2: Scalars['Opaque']['input'];
};


/** The root type for querying data */
export type QueryGeometryCmpArgs = {
  geom1: Scalars['Opaque']['input'];
  geom2: Scalars['Opaque']['input'];
};


/** The root type for querying data */
export type QueryGeometryContained3dArgs = {
  geom1: Scalars['Opaque']['input'];
  geom2: Scalars['Opaque']['input'];
};


/** The root type for querying data */
export type QueryGeometryContainsArgs = {
  geom1: Scalars['Opaque']['input'];
  geom2: Scalars['Opaque']['input'];
};


/** The root type for querying data */
export type QueryGeometryContains3dArgs = {
  geom1: Scalars['Opaque']['input'];
  geom2: Scalars['Opaque']['input'];
};


/** The root type for querying data */
export type QueryGeometryDistanceBoxArgs = {
  geom1: Scalars['Opaque']['input'];
  geom2: Scalars['Opaque']['input'];
};


/** The root type for querying data */
export type QueryGeometryDistanceCentroidArgs = {
  geom1: Scalars['Opaque']['input'];
  geom2: Scalars['Opaque']['input'];
};


/** The root type for querying data */
export type QueryGeometryEqArgs = {
  geom1: Scalars['Opaque']['input'];
  geom2: Scalars['Opaque']['input'];
};


/** The root type for querying data */
export type QueryGeometryGeArgs = {
  geom1: Scalars['Opaque']['input'];
  geom2: Scalars['Opaque']['input'];
};


/** The root type for querying data */
export type QueryGeometryGtArgs = {
  geom1: Scalars['Opaque']['input'];
  geom2: Scalars['Opaque']['input'];
};


/** The root type for querying data */
export type QueryGeometryLeArgs = {
  geom1: Scalars['Opaque']['input'];
  geom2: Scalars['Opaque']['input'];
};


/** The root type for querying data */
export type QueryGeometryLeftArgs = {
  geom1: Scalars['Opaque']['input'];
  geom2: Scalars['Opaque']['input'];
};


/** The root type for querying data */
export type QueryGeometryLtArgs = {
  geom1: Scalars['Opaque']['input'];
  geom2: Scalars['Opaque']['input'];
};


/** The root type for querying data */
export type QueryGeometryOveraboveArgs = {
  geom1: Scalars['Opaque']['input'];
  geom2: Scalars['Opaque']['input'];
};


/** The root type for querying data */
export type QueryGeometryOverbelowArgs = {
  geom1: Scalars['Opaque']['input'];
  geom2: Scalars['Opaque']['input'];
};


/** The root type for querying data */
export type QueryGeometryOverlapsArgs = {
  geom1: Scalars['Opaque']['input'];
  geom2: Scalars['Opaque']['input'];
};


/** The root type for querying data */
export type QueryGeometryOverlaps3dArgs = {
  geom1: Scalars['Opaque']['input'];
  geom2: Scalars['Opaque']['input'];
};


/** The root type for querying data */
export type QueryGeometryOverleftArgs = {
  geom1: Scalars['Opaque']['input'];
  geom2: Scalars['Opaque']['input'];
};


/** The root type for querying data */
export type QueryGeometryOverrightArgs = {
  geom1: Scalars['Opaque']['input'];
  geom2: Scalars['Opaque']['input'];
};


/** The root type for querying data */
export type QueryGeometryRightArgs = {
  geom1: Scalars['Opaque']['input'];
  geom2: Scalars['Opaque']['input'];
};


/** The root type for querying data */
export type QueryGeometrySameArgs = {
  geom1: Scalars['Opaque']['input'];
  geom2: Scalars['Opaque']['input'];
};


/** The root type for querying data */
export type QueryGeometrySame3dArgs = {
  geom1: Scalars['Opaque']['input'];
  geom2: Scalars['Opaque']['input'];
};


/** The root type for querying data */
export type QueryGeometryWithinArgs = {
  geom1: Scalars['Opaque']['input'];
  geom2: Scalars['Opaque']['input'];
};


/** The root type for querying data */
export type QueryGroupInviteEventsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<GroupInviteEventsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<GroupInviteEventsOrderBy>>;
};


/** The root type for querying data */
export type QueryGroupInvitesCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<GroupInvitesFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<GroupInvitesOrderBy>>;
};


/** The root type for querying data */
export type QueryGroupMessagesCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<GroupMessagesFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<GroupMessagesOrderBy>>;
};


/** The root type for querying data */
export type QueryInterestActivationsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<InterestActivationsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<InterestActivationsOrderBy>>;
};


/** The root type for querying data */
export type QueryInterestsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<InterestsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<InterestsOrderBy>>;
};


/** The root type for querying data */
export type QueryLandingPlanItemsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<LandingPlanItemsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<LandingPlanItemsOrderBy>>;
};


/** The root type for querying data */
export type QueryLandingPlansCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<LandingPlansFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<LandingPlansOrderBy>>;
};


/** The root type for querying data */
export type QueryMatchCandidatesCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<MatchCandidatesFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<MatchCandidatesOrderBy>>;
};


/** The root type for querying data */
export type QueryModerationActionsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<ModerationActionsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<ModerationActionsOrderBy>>;
};


/** The root type for querying data */
export type QueryNodeArgs = {
  nodeId: Scalars['ID']['input'];
};


/** The root type for querying data */
export type QueryPlanRecipesCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<PlanRecipesFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<PlanRecipesOrderBy>>;
};


/** The root type for querying data */
export type QueryPlanSafetyChecksCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<PlanSafetyChecksFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<PlanSafetyChecksOrderBy>>;
};


/** The root type for querying data */
export type QueryPostgisConstraintDimsArgs = {
  geomcolumn: Scalars['String']['input'];
  geomschema: Scalars['String']['input'];
  geomtable: Scalars['String']['input'];
};


/** The root type for querying data */
export type QueryPostgisConstraintSridArgs = {
  geomcolumn: Scalars['String']['input'];
  geomschema: Scalars['String']['input'];
  geomtable: Scalars['String']['input'];
};


/** The root type for querying data */
export type QueryPostgisConstraintTypeArgs = {
  geomcolumn: Scalars['String']['input'];
  geomschema: Scalars['String']['input'];
  geomtable: Scalars['String']['input'];
};


/** The root type for querying data */
export type QueryPostgisDeprecateArgs = {
  newname: Scalars['String']['input'];
  oldname: Scalars['String']['input'];
  version: Scalars['String']['input'];
};


/** The root type for querying data */
export type QueryPostgisIndexExtentArgs = {
  col: Scalars['String']['input'];
  tbl: Scalars['Opaque']['input'];
};


/** The root type for querying data */
export type QueryPostgisTypeNameArgs = {
  coordDimension: Scalars['Int']['input'];
  geomname: Scalars['String']['input'];
  useNewName?: InputMaybe<Scalars['Boolean']['input']>;
};


/** The root type for querying data */
export type QueryProfilesCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<ProfilesFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<ProfilesOrderBy>>;
};


/** The root type for querying data */
export type QueryRepeatConnectionPreferencesCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<RepeatConnectionPreferencesFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<RepeatConnectionPreferencesOrderBy>>;
};


/** The root type for querying data */
export type QueryReportsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<ReportsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<ReportsOrderBy>>;
};


/** The root type for querying data */
export type QuerySpatialRefSysCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<SpatialRefSysFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<SpatialRefSysOrderBy>>;
};


/** The root type for querying data */
export type QuerySt3dclosestpointArgs = {
  geom1: Scalars['Opaque']['input'];
  geom2: Scalars['Opaque']['input'];
};


/** The root type for querying data */
export type QuerySt3ddistanceArgs = {
  geom1: Scalars['Opaque']['input'];
  geom2: Scalars['Opaque']['input'];
};


/** The root type for querying data */
export type QuerySt3dintersectsArgs = {
  geom1: Scalars['Opaque']['input'];
  geom2: Scalars['Opaque']['input'];
};


/** The root type for querying data */
export type QuerySt3dlongestlineArgs = {
  geom1: Scalars['Opaque']['input'];
  geom2: Scalars['Opaque']['input'];
};


/** The root type for querying data */
export type QuerySt3dmakeboxArgs = {
  geom1: Scalars['Opaque']['input'];
  geom2: Scalars['Opaque']['input'];
};


/** The root type for querying data */
export type QuerySt3dmaxdistanceArgs = {
  geom1: Scalars['Opaque']['input'];
  geom2: Scalars['Opaque']['input'];
};


/** The root type for querying data */
export type QuerySt3dshortestlineArgs = {
  geom1: Scalars['Opaque']['input'];
  geom2: Scalars['Opaque']['input'];
};


/** The root type for querying data */
export type QueryStAsencodedpolylineArgs = {
  geom: Scalars['Opaque']['input'];
  nprecision?: InputMaybe<Scalars['Int']['input']>;
};


/** The root type for querying data */
export type QueryStAslatlontextArgs = {
  geom: Scalars['Opaque']['input'];
  tmpl?: InputMaybe<Scalars['String']['input']>;
};


/** The root type for querying data */
export type QueryStAsmarc21Args = {
  format?: InputMaybe<Scalars['String']['input']>;
  geom: Scalars['Opaque']['input'];
};


/** The root type for querying data */
export type QueryStAsmvtgeomArgs = {
  bounds: Scalars['Opaque']['input'];
  buffer?: InputMaybe<Scalars['Int']['input']>;
  clipGeom?: InputMaybe<Scalars['Boolean']['input']>;
  extent?: InputMaybe<Scalars['Int']['input']>;
  geom: Scalars['Opaque']['input'];
};


/** The root type for querying data */
export type QueryStAsx3dArgs = {
  geom: Scalars['Opaque']['input'];
  maxdecimaldigits?: InputMaybe<Scalars['Int']['input']>;
  options?: InputMaybe<Scalars['Int']['input']>;
};


/** The root type for querying data */
export type QueryStBoundingdiagonalArgs = {
  fits?: InputMaybe<Scalars['Boolean']['input']>;
  geom: Scalars['Opaque']['input'];
};


/** The root type for querying data */
export type QueryStClipbybox2dArgs = {
  box: Scalars['Opaque']['input'];
  geom: Scalars['Opaque']['input'];
};


/** The root type for querying data */
export type QueryStClosestpointArgs = {
  geom1: Scalars['Opaque']['input'];
  geom2: Scalars['Opaque']['input'];
};


/** The root type for querying data */
export type QueryStConcavehullArgs = {
  paramAllowHoles?: InputMaybe<Scalars['Boolean']['input']>;
  paramGeom: Scalars['Opaque']['input'];
  paramPctconvex: Scalars['Float']['input'];
};


/** The root type for querying data */
export type QueryStContainsArgs = {
  geom1: Scalars['Opaque']['input'];
  geom2: Scalars['Opaque']['input'];
};


/** The root type for querying data */
export type QueryStContainsproperlyArgs = {
  geom1: Scalars['Opaque']['input'];
  geom2: Scalars['Opaque']['input'];
};


/** The root type for querying data */
export type QueryStCoorddimArgs = {
  geometry: Scalars['Opaque']['input'];
};


/** The root type for querying data */
export type QueryStCrossesArgs = {
  geom1: Scalars['Opaque']['input'];
  geom2: Scalars['Opaque']['input'];
};


/** The root type for querying data */
export type QueryStCurvetolineArgs = {
  flags?: InputMaybe<Scalars['Int']['input']>;
  geom: Scalars['Opaque']['input'];
  tol?: InputMaybe<Scalars['Float']['input']>;
  toltype?: InputMaybe<Scalars['Int']['input']>;
};


/** The root type for querying data */
export type QueryStDelaunaytrianglesArgs = {
  flags?: InputMaybe<Scalars['Int']['input']>;
  g1: Scalars['Opaque']['input'];
  tolerance?: InputMaybe<Scalars['Float']['input']>;
};


/** The root type for querying data */
export type QueryStDifferenceArgs = {
  geom1: Scalars['Opaque']['input'];
  geom2: Scalars['Opaque']['input'];
  gridsize?: InputMaybe<Scalars['Float']['input']>;
};


/** The root type for querying data */
export type QueryStDisjointArgs = {
  geom1: Scalars['Opaque']['input'];
  geom2: Scalars['Opaque']['input'];
};


/** The root type for querying data */
export type QueryStEqualsArgs = {
  geom1: Scalars['Opaque']['input'];
  geom2: Scalars['Opaque']['input'];
};


/** The root type for querying data */
export type QueryStForce3dArgs = {
  geom: Scalars['Opaque']['input'];
  zvalue?: InputMaybe<Scalars['Float']['input']>;
};


/** The root type for querying data */
export type QueryStForce3dmArgs = {
  geom: Scalars['Opaque']['input'];
  mvalue?: InputMaybe<Scalars['Float']['input']>;
};


/** The root type for querying data */
export type QueryStForce3dzArgs = {
  geom: Scalars['Opaque']['input'];
  zvalue?: InputMaybe<Scalars['Float']['input']>;
};


/** The root type for querying data */
export type QueryStForce4dArgs = {
  geom: Scalars['Opaque']['input'];
  mvalue?: InputMaybe<Scalars['Float']['input']>;
  zvalue?: InputMaybe<Scalars['Float']['input']>;
};


/** The root type for querying data */
export type QueryStGeometricmedianArgs = {
  failIfNotConverged?: InputMaybe<Scalars['Boolean']['input']>;
  g: Scalars['Opaque']['input'];
  maxIter?: InputMaybe<Scalars['Int']['input']>;
  tolerance?: InputMaybe<Scalars['Float']['input']>;
};


/** The root type for querying data */
export type QueryStGeomfrommarc21Args = {
  marc21xml: Scalars['String']['input'];
};


/** The root type for querying data */
export type QueryStHasarcArgs = {
  geometry: Scalars['Opaque']['input'];
};


/** The root type for querying data */
export type QueryStHexagonArgs = {
  cellI: Scalars['Int']['input'];
  cellJ: Scalars['Int']['input'];
  origin?: InputMaybe<Scalars['Opaque']['input']>;
  size: Scalars['Float']['input'];
};


/** The root type for querying data */
export type QueryStInterpolatepointArgs = {
  line: Scalars['Opaque']['input'];
  point: Scalars['Opaque']['input'];
};


/** The root type for querying data */
export type QueryStIntersectsArgs = {
  geom1: Scalars['Opaque']['input'];
  geom2: Scalars['Opaque']['input'];
};


/** The root type for querying data */
export type QueryStLettersArgs = {
  font?: InputMaybe<Scalars['JSON']['input']>;
  letters: Scalars['String']['input'];
};


/** The root type for querying data */
export type QueryStLinecrossingdirectionArgs = {
  line1: Scalars['Opaque']['input'];
  line2: Scalars['Opaque']['input'];
};


/** The root type for querying data */
export type QueryStLinefromencodedpolylineArgs = {
  nprecision?: InputMaybe<Scalars['Int']['input']>;
  txtin: Scalars['String']['input'];
};


/** The root type for querying data */
export type QueryStLinelocatepointArgs = {
  geom1: Scalars['Opaque']['input'];
  geom2: Scalars['Opaque']['input'];
};


/** The root type for querying data */
export type QueryStLinetocurveArgs = {
  geometry: Scalars['Opaque']['input'];
};


/** The root type for querying data */
export type QueryStLocatealongArgs = {
  geometry: Scalars['Opaque']['input'];
  leftrightoffset?: InputMaybe<Scalars['Float']['input']>;
  measure: Scalars['Float']['input'];
};


/** The root type for querying data */
export type QueryStLocatebetweenArgs = {
  frommeasure: Scalars['Float']['input'];
  geometry: Scalars['Opaque']['input'];
  leftrightoffset?: InputMaybe<Scalars['Float']['input']>;
  tomeasure: Scalars['Float']['input'];
};


/** The root type for querying data */
export type QueryStLocatebetweenelevationsArgs = {
  fromelevation: Scalars['Float']['input'];
  geometry: Scalars['Opaque']['input'];
  toelevation: Scalars['Float']['input'];
};


/** The root type for querying data */
export type QueryStLongestlineArgs = {
  geom1: Scalars['Opaque']['input'];
  geom2: Scalars['Opaque']['input'];
};


/** The root type for querying data */
export type QueryStMakebox2dArgs = {
  geom1: Scalars['Opaque']['input'];
  geom2: Scalars['Opaque']['input'];
};


/** The root type for querying data */
export type QueryStMaxdistanceArgs = {
  geom1: Scalars['Opaque']['input'];
  geom2: Scalars['Opaque']['input'];
};


/** The root type for querying data */
export type QueryStMinimumboundingcircleArgs = {
  inputgeom: Scalars['Opaque']['input'];
  segsPerQuarter?: InputMaybe<Scalars['Int']['input']>;
};


/** The root type for querying data */
export type QueryStNodeArgs = {
  g: Scalars['Opaque']['input'];
};


/** The root type for querying data */
export type QueryStNormalizeArgs = {
  geom: Scalars['Opaque']['input'];
};


/** The root type for querying data */
export type QueryStOffsetcurveArgs = {
  distance: Scalars['Float']['input'];
  line: Scalars['Opaque']['input'];
  params?: InputMaybe<Scalars['String']['input']>;
};


/** The root type for querying data */
export type QueryStOrderingequalsArgs = {
  geom1: Scalars['Opaque']['input'];
  geom2: Scalars['Opaque']['input'];
};


/** The root type for querying data */
export type QueryStOverlapsArgs = {
  geom1: Scalars['Opaque']['input'];
  geom2: Scalars['Opaque']['input'];
};


/** The root type for querying data */
export type QueryStPointmArgs = {
  mcoordinate: Scalars['Float']['input'];
  srid?: InputMaybe<Scalars['Int']['input']>;
  xcoordinate: Scalars['Float']['input'];
  ycoordinate: Scalars['Float']['input'];
};


/** The root type for querying data */
export type QueryStPointzArgs = {
  srid?: InputMaybe<Scalars['Int']['input']>;
  xcoordinate: Scalars['Float']['input'];
  ycoordinate: Scalars['Float']['input'];
  zcoordinate: Scalars['Float']['input'];
};


/** The root type for querying data */
export type QueryStPointzmArgs = {
  mcoordinate: Scalars['Float']['input'];
  srid?: InputMaybe<Scalars['Int']['input']>;
  xcoordinate: Scalars['Float']['input'];
  ycoordinate: Scalars['Float']['input'];
  zcoordinate: Scalars['Float']['input'];
};


/** The root type for querying data */
export type QueryStProjectArgs = {
  azimuth: Scalars['Float']['input'];
  distance: Scalars['Float']['input'];
  geog: Scalars['Opaque']['input'];
};


/** The root type for querying data */
export type QueryStQuantizecoordinatesArgs = {
  g: Scalars['Opaque']['input'];
  precM?: InputMaybe<Scalars['Int']['input']>;
  precX: Scalars['Int']['input'];
  precY?: InputMaybe<Scalars['Int']['input']>;
  precZ?: InputMaybe<Scalars['Int']['input']>;
};


/** The root type for querying data */
export type QueryStReduceprecisionArgs = {
  geom: Scalars['Opaque']['input'];
  gridsize: Scalars['Float']['input'];
};


/** The root type for querying data */
export type QueryStRemoverepeatedpointsArgs = {
  geom: Scalars['Opaque']['input'];
  tolerance?: InputMaybe<Scalars['Float']['input']>;
};


/** The root type for querying data */
export type QueryStSharedpathsArgs = {
  geom1: Scalars['Opaque']['input'];
  geom2: Scalars['Opaque']['input'];
};


/** The root type for querying data */
export type QueryStShortestlineArgs = {
  geom1: Scalars['Opaque']['input'];
  geom2: Scalars['Opaque']['input'];
};


/** The root type for querying data */
export type QueryStSimplifypolygonhullArgs = {
  geom: Scalars['Opaque']['input'];
  isOuter?: InputMaybe<Scalars['Boolean']['input']>;
  vertexFraction: Scalars['Float']['input'];
};


/** The root type for querying data */
export type QueryStSortablehashArgs = {
  geom: Scalars['Opaque']['input'];
};


/** The root type for querying data */
export type QueryStSplitArgs = {
  geom1: Scalars['Opaque']['input'];
  geom2: Scalars['Opaque']['input'];
};


/** The root type for querying data */
export type QueryStSquareArgs = {
  cellI: Scalars['Int']['input'];
  cellJ: Scalars['Int']['input'];
  origin?: InputMaybe<Scalars['Opaque']['input']>;
  size: Scalars['Float']['input'];
};


/** The root type for querying data */
export type QueryStSwapordinatesArgs = {
  geom: Scalars['Opaque']['input'];
  ords: Scalars['Opaque']['input'];
};


/** The root type for querying data */
export type QueryStSymdifferenceArgs = {
  geom1: Scalars['Opaque']['input'];
  geom2: Scalars['Opaque']['input'];
  gridsize?: InputMaybe<Scalars['Float']['input']>;
};


/** The root type for querying data */
export type QueryStTileenvelopeArgs = {
  bounds?: InputMaybe<Scalars['Opaque']['input']>;
  margin?: InputMaybe<Scalars['Float']['input']>;
  x: Scalars['Int']['input'];
  y: Scalars['Int']['input'];
  zoom: Scalars['Int']['input'];
};


/** The root type for querying data */
export type QueryStTouchesArgs = {
  geom1: Scalars['Opaque']['input'];
  geom2: Scalars['Opaque']['input'];
};


/** The root type for querying data */
export type QueryStTriangulatepolygonArgs = {
  g1: Scalars['Opaque']['input'];
};


/** The root type for querying data */
export type QueryStVoronoiArgs = {
  clip?: InputMaybe<Scalars['Opaque']['input']>;
  g1: Scalars['Opaque']['input'];
  returnPolygons?: InputMaybe<Scalars['Boolean']['input']>;
  tolerance?: InputMaybe<Scalars['Float']['input']>;
};


/** The root type for querying data */
export type QueryStVoronoilinesArgs = {
  extendTo?: InputMaybe<Scalars['Opaque']['input']>;
  g1: Scalars['Opaque']['input'];
  tolerance?: InputMaybe<Scalars['Float']['input']>;
};


/** The root type for querying data */
export type QueryStVoronoipolygonsArgs = {
  extendTo?: InputMaybe<Scalars['Opaque']['input']>;
  g1: Scalars['Opaque']['input'];
  tolerance?: InputMaybe<Scalars['Float']['input']>;
};


/** The root type for querying data */
export type QueryStWithinArgs = {
  geom1: Scalars['Opaque']['input'];
  geom2: Scalars['Opaque']['input'];
};


/** The root type for querying data */
export type QueryStWkbtosqlArgs = {
  wkb: Scalars['Opaque']['input'];
};


/** The root type for querying data */
export type QueryStWrapxArgs = {
  geom: Scalars['Opaque']['input'];
  move: Scalars['Float']['input'];
  wrap: Scalars['Float']['input'];
};


/** The root type for querying data */
export type QueryStarterPlanStepsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<StarterPlanStepsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<StarterPlanStepsOrderBy>>;
};


/** The root type for querying data */
export type QueryStarterPlansCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<StarterPlansFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<StarterPlansOrderBy>>;
};


/** The root type for querying data */
export type QuerySuburbTagsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<SuburbTagsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<SuburbTagsOrderBy>>;
};


/** The root type for querying data */
export type QuerySuburbsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<SuburbsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<SuburbsOrderBy>>;
};


/** The root type for querying data */
export type QueryUserInterestsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UserInterestsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<UserInterestsOrderBy>>;
};


/** The root type for querying data */
export type QueryUserReliabilityCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UserReliabilityFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<UserReliabilityOrderBy>>;
};


/** The root type for querying data */
export type QueryUserSafetySettingsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UserSafetySettingsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<UserSafetySettingsOrderBy>>;
};


/** The root type for querying data */
export type QueryUserSocialPreferencesCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UserSocialPreferencesFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<UserSocialPreferencesOrderBy>>;
};


/** The root type for querying data */
export type QueryUserSuburbMatchesCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UserSuburbMatchesFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<UserSuburbMatchesOrderBy>>;
};


/** The root type for querying data */
export type QueryUserVerificationsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UserVerificationsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<UserVerificationsOrderBy>>;
};

export type RepeatConnectionPreferences = Node & {
  createdAt: Scalars['Datetime']['output'];
  id: Scalars['UUID']['output'];
  matchedMutualInterest: Scalars['Boolean']['output'];
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  otherUser?: Maybe<Profiles>;
  otherUserId: Scalars['UUID']['output'];
  sourcePlan?: Maybe<LandingPlans>;
  sourcePlanId?: Maybe<Scalars['UUID']['output']>;
  user?: Maybe<Profiles>;
  userId: Scalars['UUID']['output'];
  wouldMeetAgain?: Maybe<Scalars['Boolean']['output']>;
};

export type RepeatConnectionPreferencesConnection = {
  edges: Array<RepeatConnectionPreferencesEdge>;
  pageInfo: PageInfo;
};

export type RepeatConnectionPreferencesDeleteResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<RepeatConnectionPreferences>;
};

export type RepeatConnectionPreferencesEdge = {
  cursor: Scalars['String']['output'];
  node: RepeatConnectionPreferences;
};

export type RepeatConnectionPreferencesFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<RepeatConnectionPreferencesFilter>>;
  createdAt?: InputMaybe<DatetimeFilter>;
  id?: InputMaybe<UuidFilter>;
  matchedMutualInterest?: InputMaybe<BooleanFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<RepeatConnectionPreferencesFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<RepeatConnectionPreferencesFilter>>;
  otherUserId?: InputMaybe<UuidFilter>;
  sourcePlanId?: InputMaybe<UuidFilter>;
  userId?: InputMaybe<UuidFilter>;
  wouldMeetAgain?: InputMaybe<BooleanFilter>;
};

export type RepeatConnectionPreferencesInsertInput = {
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  matchedMutualInterest?: InputMaybe<Scalars['Boolean']['input']>;
  otherUserId?: InputMaybe<Scalars['UUID']['input']>;
  sourcePlanId?: InputMaybe<Scalars['UUID']['input']>;
  userId?: InputMaybe<Scalars['UUID']['input']>;
  wouldMeetAgain?: InputMaybe<Scalars['Boolean']['input']>;
};

export type RepeatConnectionPreferencesInsertResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<RepeatConnectionPreferences>;
};

export type RepeatConnectionPreferencesOrderBy = {
  createdAt?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  matchedMutualInterest?: InputMaybe<OrderByDirection>;
  otherUserId?: InputMaybe<OrderByDirection>;
  sourcePlanId?: InputMaybe<OrderByDirection>;
  userId?: InputMaybe<OrderByDirection>;
  wouldMeetAgain?: InputMaybe<OrderByDirection>;
};

export type RepeatConnectionPreferencesUpdateInput = {
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  matchedMutualInterest?: InputMaybe<Scalars['Boolean']['input']>;
  otherUserId?: InputMaybe<Scalars['UUID']['input']>;
  sourcePlanId?: InputMaybe<Scalars['UUID']['input']>;
  userId?: InputMaybe<Scalars['UUID']['input']>;
  wouldMeetAgain?: InputMaybe<Scalars['Boolean']['input']>;
};

export type RepeatConnectionPreferencesUpdateResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<RepeatConnectionPreferences>;
};

export type Reports = Node & {
  activityGroup?: Maybe<ActivityGroups>;
  activityGroupId?: Maybe<Scalars['UUID']['output']>;
  category: Scalars['String']['output'];
  createdAt: Scalars['Datetime']['output'];
  details?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  metadataJson: Scalars['JSON']['output'];
  moderationActionsCollection?: Maybe<ModerationActionsConnection>;
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  reason: Scalars['String']['output'];
  reporter?: Maybe<Profiles>;
  reporterId: Scalars['UUID']['output'];
  resolvedAt?: Maybe<Scalars['Datetime']['output']>;
  reviewedAt?: Maybe<Scalars['Datetime']['output']>;
  source: Scalars['String']['output'];
  status: Scalars['String']['output'];
  targetUser?: Maybe<Profiles>;
  targetUserId?: Maybe<Scalars['UUID']['output']>;
};


export type ReportsModerationActionsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<ModerationActionsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<ModerationActionsOrderBy>>;
};

export type ReportsConnection = {
  edges: Array<ReportsEdge>;
  pageInfo: PageInfo;
};

export type ReportsDeleteResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Reports>;
};

export type ReportsEdge = {
  cursor: Scalars['String']['output'];
  node: Reports;
};

export type ReportsFilter = {
  activityGroupId?: InputMaybe<UuidFilter>;
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<ReportsFilter>>;
  category?: InputMaybe<StringFilter>;
  createdAt?: InputMaybe<DatetimeFilter>;
  details?: InputMaybe<StringFilter>;
  id?: InputMaybe<UuidFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<ReportsFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<ReportsFilter>>;
  reason?: InputMaybe<StringFilter>;
  reporterId?: InputMaybe<UuidFilter>;
  resolvedAt?: InputMaybe<DatetimeFilter>;
  reviewedAt?: InputMaybe<DatetimeFilter>;
  source?: InputMaybe<StringFilter>;
  status?: InputMaybe<StringFilter>;
  targetUserId?: InputMaybe<UuidFilter>;
};

export type ReportsInsertInput = {
  activityGroupId?: InputMaybe<Scalars['UUID']['input']>;
  category?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  details?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  metadataJson?: InputMaybe<Scalars['JSON']['input']>;
  reason?: InputMaybe<Scalars['String']['input']>;
  reporterId?: InputMaybe<Scalars['UUID']['input']>;
  resolvedAt?: InputMaybe<Scalars['Datetime']['input']>;
  reviewedAt?: InputMaybe<Scalars['Datetime']['input']>;
  source?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  targetUserId?: InputMaybe<Scalars['UUID']['input']>;
};

export type ReportsInsertResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Reports>;
};

export type ReportsOrderBy = {
  activityGroupId?: InputMaybe<OrderByDirection>;
  category?: InputMaybe<OrderByDirection>;
  createdAt?: InputMaybe<OrderByDirection>;
  details?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  reason?: InputMaybe<OrderByDirection>;
  reporterId?: InputMaybe<OrderByDirection>;
  resolvedAt?: InputMaybe<OrderByDirection>;
  reviewedAt?: InputMaybe<OrderByDirection>;
  source?: InputMaybe<OrderByDirection>;
  status?: InputMaybe<OrderByDirection>;
  targetUserId?: InputMaybe<OrderByDirection>;
};

export type ReportsUpdateInput = {
  activityGroupId?: InputMaybe<Scalars['UUID']['input']>;
  category?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  details?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  metadataJson?: InputMaybe<Scalars['JSON']['input']>;
  reason?: InputMaybe<Scalars['String']['input']>;
  reporterId?: InputMaybe<Scalars['UUID']['input']>;
  resolvedAt?: InputMaybe<Scalars['Datetime']['input']>;
  reviewedAt?: InputMaybe<Scalars['Datetime']['input']>;
  source?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  targetUserId?: InputMaybe<Scalars['UUID']['input']>;
};

export type ReportsUpdateResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Reports>;
};

export type SpatialRefSys = Node & {
  authName?: Maybe<Scalars['String']['output']>;
  authSrid?: Maybe<Scalars['Int']['output']>;
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  proj4text?: Maybe<Scalars['String']['output']>;
  srid: Scalars['Int']['output'];
  srtext?: Maybe<Scalars['String']['output']>;
};

export type SpatialRefSysConnection = {
  edges: Array<SpatialRefSysEdge>;
  pageInfo: PageInfo;
};

export type SpatialRefSysDeleteResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<SpatialRefSys>;
};

export type SpatialRefSysEdge = {
  cursor: Scalars['String']['output'];
  node: SpatialRefSys;
};

export type SpatialRefSysFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<SpatialRefSysFilter>>;
  authName?: InputMaybe<StringFilter>;
  authSrid?: InputMaybe<IntFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<SpatialRefSysFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<SpatialRefSysFilter>>;
  proj4text?: InputMaybe<StringFilter>;
  srid?: InputMaybe<IntFilter>;
  srtext?: InputMaybe<StringFilter>;
};

export type SpatialRefSysInsertInput = {
  authName?: InputMaybe<Scalars['String']['input']>;
  authSrid?: InputMaybe<Scalars['Int']['input']>;
  proj4text?: InputMaybe<Scalars['String']['input']>;
  srid?: InputMaybe<Scalars['Int']['input']>;
  srtext?: InputMaybe<Scalars['String']['input']>;
};

export type SpatialRefSysInsertResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<SpatialRefSys>;
};

export type SpatialRefSysOrderBy = {
  authName?: InputMaybe<OrderByDirection>;
  authSrid?: InputMaybe<OrderByDirection>;
  proj4text?: InputMaybe<OrderByDirection>;
  srid?: InputMaybe<OrderByDirection>;
  srtext?: InputMaybe<OrderByDirection>;
};

export type SpatialRefSysUpdateInput = {
  authName?: InputMaybe<Scalars['String']['input']>;
  authSrid?: InputMaybe<Scalars['Int']['input']>;
  proj4text?: InputMaybe<Scalars['String']['input']>;
  srid?: InputMaybe<Scalars['Int']['input']>;
  srtext?: InputMaybe<Scalars['String']['input']>;
};

export type SpatialRefSysUpdateResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<SpatialRefSys>;
};

export type StarterPlanSteps = Node & {
  body?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['Datetime']['output'];
  id: Scalars['UUID']['output'];
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  starterPlan: StarterPlans;
  starterPlanId: Scalars['UUID']['output'];
  stepOrder: Scalars['Int']['output'];
  title: Scalars['String']['output'];
};

export type StarterPlanStepsConnection = {
  edges: Array<StarterPlanStepsEdge>;
  pageInfo: PageInfo;
};

export type StarterPlanStepsDeleteResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<StarterPlanSteps>;
};

export type StarterPlanStepsEdge = {
  cursor: Scalars['String']['output'];
  node: StarterPlanSteps;
};

export type StarterPlanStepsFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<StarterPlanStepsFilter>>;
  body?: InputMaybe<StringFilter>;
  createdAt?: InputMaybe<DatetimeFilter>;
  id?: InputMaybe<UuidFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<StarterPlanStepsFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<StarterPlanStepsFilter>>;
  starterPlanId?: InputMaybe<UuidFilter>;
  stepOrder?: InputMaybe<IntFilter>;
  title?: InputMaybe<StringFilter>;
};

export type StarterPlanStepsInsertInput = {
  body?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  starterPlanId?: InputMaybe<Scalars['UUID']['input']>;
  stepOrder?: InputMaybe<Scalars['Int']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type StarterPlanStepsInsertResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<StarterPlanSteps>;
};

export type StarterPlanStepsOrderBy = {
  body?: InputMaybe<OrderByDirection>;
  createdAt?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  starterPlanId?: InputMaybe<OrderByDirection>;
  stepOrder?: InputMaybe<OrderByDirection>;
  title?: InputMaybe<OrderByDirection>;
};

export type StarterPlanStepsUpdateInput = {
  body?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  starterPlanId?: InputMaybe<Scalars['UUID']['input']>;
  stepOrder?: InputMaybe<Scalars['Int']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type StarterPlanStepsUpdateResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<StarterPlanSteps>;
};

export type StarterPlans = Node & {
  city?: Maybe<Cities>;
  cityId?: Maybe<Scalars['UUID']['output']>;
  createdAt: Scalars['Datetime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  interest?: Maybe<Interests>;
  interestId?: Maybe<Scalars['UUID']['output']>;
  maxGroupSize: Scalars['Int']['output'];
  minGroupSize: Scalars['Int']['output'];
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  safetyGuidance: Scalars['String']['output'];
  starterPlanStepsCollection?: Maybe<StarterPlanStepsConnection>;
  status: Scalars['String']['output'];
  title: Scalars['String']['output'];
  updatedAt: Scalars['Datetime']['output'];
};


export type StarterPlansStarterPlanStepsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<StarterPlanStepsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<StarterPlanStepsOrderBy>>;
};

export type StarterPlansConnection = {
  edges: Array<StarterPlansEdge>;
  pageInfo: PageInfo;
};

export type StarterPlansDeleteResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<StarterPlans>;
};

export type StarterPlansEdge = {
  cursor: Scalars['String']['output'];
  node: StarterPlans;
};

export type StarterPlansFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<StarterPlansFilter>>;
  cityId?: InputMaybe<UuidFilter>;
  createdAt?: InputMaybe<DatetimeFilter>;
  description?: InputMaybe<StringFilter>;
  id?: InputMaybe<UuidFilter>;
  interestId?: InputMaybe<UuidFilter>;
  maxGroupSize?: InputMaybe<IntFilter>;
  minGroupSize?: InputMaybe<IntFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<StarterPlansFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<StarterPlansFilter>>;
  safetyGuidance?: InputMaybe<StringFilter>;
  status?: InputMaybe<StringFilter>;
  title?: InputMaybe<StringFilter>;
  updatedAt?: InputMaybe<DatetimeFilter>;
};

export type StarterPlansInsertInput = {
  cityId?: InputMaybe<Scalars['UUID']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  interestId?: InputMaybe<Scalars['UUID']['input']>;
  maxGroupSize?: InputMaybe<Scalars['Int']['input']>;
  minGroupSize?: InputMaybe<Scalars['Int']['input']>;
  safetyGuidance?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['Datetime']['input']>;
};

export type StarterPlansInsertResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<StarterPlans>;
};

export type StarterPlansOrderBy = {
  cityId?: InputMaybe<OrderByDirection>;
  createdAt?: InputMaybe<OrderByDirection>;
  description?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  interestId?: InputMaybe<OrderByDirection>;
  maxGroupSize?: InputMaybe<OrderByDirection>;
  minGroupSize?: InputMaybe<OrderByDirection>;
  safetyGuidance?: InputMaybe<OrderByDirection>;
  status?: InputMaybe<OrderByDirection>;
  title?: InputMaybe<OrderByDirection>;
  updatedAt?: InputMaybe<OrderByDirection>;
};

export type StarterPlansUpdateInput = {
  cityId?: InputMaybe<Scalars['UUID']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  interestId?: InputMaybe<Scalars['UUID']['input']>;
  maxGroupSize?: InputMaybe<Scalars['Int']['input']>;
  minGroupSize?: InputMaybe<Scalars['Int']['input']>;
  safetyGuidance?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['Datetime']['input']>;
};

export type StarterPlansUpdateResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<StarterPlans>;
};

/** Boolean expression comparing fields on type "String" */
export type StringFilter = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  in?: InputMaybe<Array<Scalars['String']['input']>>;
  iregex?: InputMaybe<Scalars['String']['input']>;
  is?: InputMaybe<FilterIs>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  neq?: InputMaybe<Scalars['String']['input']>;
  regex?: InputMaybe<Scalars['String']['input']>;
  startsWith?: InputMaybe<Scalars['String']['input']>;
};

/** Boolean expression comparing fields on type "StringList" */
export type StringListFilter = {
  containedBy?: InputMaybe<Array<Scalars['String']['input']>>;
  contains?: InputMaybe<Array<Scalars['String']['input']>>;
  eq?: InputMaybe<Array<Scalars['String']['input']>>;
  is?: InputMaybe<FilterIs>;
  overlaps?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type SuburbTags = Node & {
  createdAt: Scalars['Datetime']['output'];
  id: Scalars['UUID']['output'];
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  reason?: Maybe<Scalars['String']['output']>;
  suburb: Suburbs;
  suburbId: Scalars['UUID']['output'];
  tagKey: Scalars['String']['output'];
  weight: Scalars['BigFloat']['output'];
};

export type SuburbTagsConnection = {
  edges: Array<SuburbTagsEdge>;
  pageInfo: PageInfo;
};

export type SuburbTagsDeleteResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<SuburbTags>;
};

export type SuburbTagsEdge = {
  cursor: Scalars['String']['output'];
  node: SuburbTags;
};

export type SuburbTagsFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<SuburbTagsFilter>>;
  createdAt?: InputMaybe<DatetimeFilter>;
  id?: InputMaybe<UuidFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<SuburbTagsFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<SuburbTagsFilter>>;
  reason?: InputMaybe<StringFilter>;
  suburbId?: InputMaybe<UuidFilter>;
  tagKey?: InputMaybe<StringFilter>;
  weight?: InputMaybe<BigFloatFilter>;
};

export type SuburbTagsInsertInput = {
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  reason?: InputMaybe<Scalars['String']['input']>;
  suburbId?: InputMaybe<Scalars['UUID']['input']>;
  tagKey?: InputMaybe<Scalars['String']['input']>;
  weight?: InputMaybe<Scalars['BigFloat']['input']>;
};

export type SuburbTagsInsertResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<SuburbTags>;
};

export type SuburbTagsOrderBy = {
  createdAt?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  reason?: InputMaybe<OrderByDirection>;
  suburbId?: InputMaybe<OrderByDirection>;
  tagKey?: InputMaybe<OrderByDirection>;
  weight?: InputMaybe<OrderByDirection>;
};

export type SuburbTagsUpdateInput = {
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  reason?: InputMaybe<Scalars['String']['input']>;
  suburbId?: InputMaybe<Scalars['UUID']['input']>;
  tagKey?: InputMaybe<Scalars['String']['input']>;
  weight?: InputMaybe<Scalars['BigFloat']['input']>;
};

export type SuburbTagsUpdateResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<SuburbTags>;
};

export type Suburbs = Node & {
  city: Cities;
  cityId: Scalars['UUID']['output'];
  createdAt: Scalars['Datetime']['output'];
  defaultLatitude?: Maybe<Scalars['BigFloat']['output']>;
  defaultLongitude?: Maybe<Scalars['BigFloat']['output']>;
  id: Scalars['UUID']['output'];
  name: Scalars['String']['output'];
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  slug: Scalars['String']['output'];
  suburbTagsCollection?: Maybe<SuburbTagsConnection>;
  summary?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['Datetime']['output'];
  userSuburbMatchesCollection?: Maybe<UserSuburbMatchesConnection>;
};


export type SuburbsSuburbTagsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<SuburbTagsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<SuburbTagsOrderBy>>;
};


export type SuburbsUserSuburbMatchesCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UserSuburbMatchesFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<UserSuburbMatchesOrderBy>>;
};

export type SuburbsConnection = {
  edges: Array<SuburbsEdge>;
  pageInfo: PageInfo;
};

export type SuburbsDeleteResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Suburbs>;
};

export type SuburbsEdge = {
  cursor: Scalars['String']['output'];
  node: Suburbs;
};

export type SuburbsFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<SuburbsFilter>>;
  cityId?: InputMaybe<UuidFilter>;
  createdAt?: InputMaybe<DatetimeFilter>;
  defaultLatitude?: InputMaybe<BigFloatFilter>;
  defaultLongitude?: InputMaybe<BigFloatFilter>;
  id?: InputMaybe<UuidFilter>;
  name?: InputMaybe<StringFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<SuburbsFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<SuburbsFilter>>;
  slug?: InputMaybe<StringFilter>;
  summary?: InputMaybe<StringFilter>;
  updatedAt?: InputMaybe<DatetimeFilter>;
};

export type SuburbsInsertInput = {
  cityId?: InputMaybe<Scalars['UUID']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  defaultLatitude?: InputMaybe<Scalars['BigFloat']['input']>;
  defaultLongitude?: InputMaybe<Scalars['BigFloat']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  summary?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['Datetime']['input']>;
};

export type SuburbsInsertResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Suburbs>;
};

export type SuburbsOrderBy = {
  cityId?: InputMaybe<OrderByDirection>;
  createdAt?: InputMaybe<OrderByDirection>;
  defaultLatitude?: InputMaybe<OrderByDirection>;
  defaultLongitude?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  name?: InputMaybe<OrderByDirection>;
  slug?: InputMaybe<OrderByDirection>;
  summary?: InputMaybe<OrderByDirection>;
  updatedAt?: InputMaybe<OrderByDirection>;
};

export type SuburbsUpdateInput = {
  cityId?: InputMaybe<Scalars['UUID']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  defaultLatitude?: InputMaybe<Scalars['BigFloat']['input']>;
  defaultLongitude?: InputMaybe<Scalars['BigFloat']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  summary?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['Datetime']['input']>;
};

export type SuburbsUpdateResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Suburbs>;
};

/** Boolean expression comparing fields on type "Time" */
export type TimeFilter = {
  eq?: InputMaybe<Scalars['Time']['input']>;
  gt?: InputMaybe<Scalars['Time']['input']>;
  gte?: InputMaybe<Scalars['Time']['input']>;
  in?: InputMaybe<Array<Scalars['Time']['input']>>;
  is?: InputMaybe<FilterIs>;
  lt?: InputMaybe<Scalars['Time']['input']>;
  lte?: InputMaybe<Scalars['Time']['input']>;
  neq?: InputMaybe<Scalars['Time']['input']>;
};

/** Boolean expression comparing fields on type "TimeList" */
export type TimeListFilter = {
  containedBy?: InputMaybe<Array<Scalars['Time']['input']>>;
  contains?: InputMaybe<Array<Scalars['Time']['input']>>;
  eq?: InputMaybe<Array<Scalars['Time']['input']>>;
  is?: InputMaybe<FilterIs>;
  overlaps?: InputMaybe<Array<Scalars['Time']['input']>>;
};

/** Boolean expression comparing fields on type "UUID" */
export type UuidFilter = {
  eq?: InputMaybe<Scalars['UUID']['input']>;
  in?: InputMaybe<Array<Scalars['UUID']['input']>>;
  is?: InputMaybe<FilterIs>;
  neq?: InputMaybe<Scalars['UUID']['input']>;
};

/** Boolean expression comparing fields on type "UUIDList" */
export type UuidListFilter = {
  containedBy?: InputMaybe<Array<Scalars['UUID']['input']>>;
  contains?: InputMaybe<Array<Scalars['UUID']['input']>>;
  eq?: InputMaybe<Array<Scalars['UUID']['input']>>;
  is?: InputMaybe<FilterIs>;
  overlaps?: InputMaybe<Array<Scalars['UUID']['input']>>;
};

export type UserInterests = Node & {
  createdAt: Scalars['Datetime']['output'];
  id: Scalars['UUID']['output'];
  interest?: Maybe<Interests>;
  interestId: Scalars['UUID']['output'];
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  user?: Maybe<Profiles>;
  userId: Scalars['UUID']['output'];
};

export type UserInterestsConnection = {
  edges: Array<UserInterestsEdge>;
  pageInfo: PageInfo;
};

export type UserInterestsDeleteResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<UserInterests>;
};

export type UserInterestsEdge = {
  cursor: Scalars['String']['output'];
  node: UserInterests;
};

export type UserInterestsFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<UserInterestsFilter>>;
  createdAt?: InputMaybe<DatetimeFilter>;
  id?: InputMaybe<UuidFilter>;
  interestId?: InputMaybe<UuidFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<UserInterestsFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<UserInterestsFilter>>;
  userId?: InputMaybe<UuidFilter>;
};

export type UserInterestsInsertInput = {
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  interestId?: InputMaybe<Scalars['UUID']['input']>;
  userId?: InputMaybe<Scalars['UUID']['input']>;
};

export type UserInterestsInsertResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<UserInterests>;
};

export type UserInterestsOrderBy = {
  createdAt?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  interestId?: InputMaybe<OrderByDirection>;
  userId?: InputMaybe<OrderByDirection>;
};

export type UserInterestsUpdateInput = {
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  interestId?: InputMaybe<Scalars['UUID']['input']>;
  userId?: InputMaybe<Scalars['UUID']['input']>;
};

export type UserInterestsUpdateResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<UserInterests>;
};

export type UserReliability = Node & {
  attendedCount: Scalars['Int']['output'];
  cancelledLateCount: Scalars['Int']['output'];
  createdAt: Scalars['Datetime']['output'];
  feedbackCount: Scalars['Int']['output'];
  lastAttendedAt?: Maybe<Scalars['Datetime']['output']>;
  lastFeedbackAt?: Maybe<Scalars['Datetime']['output']>;
  noShowCount: Scalars['Int']['output'];
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  positiveFeedbackCount: Scalars['Int']['output'];
  reliabilityScore: Scalars['BigFloat']['output'];
  updatedAt: Scalars['Datetime']['output'];
  user?: Maybe<Profiles>;
  userId: Scalars['UUID']['output'];
};

export type UserReliabilityConnection = {
  edges: Array<UserReliabilityEdge>;
  pageInfo: PageInfo;
};

export type UserReliabilityDeleteResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<UserReliability>;
};

export type UserReliabilityEdge = {
  cursor: Scalars['String']['output'];
  node: UserReliability;
};

export type UserReliabilityFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<UserReliabilityFilter>>;
  attendedCount?: InputMaybe<IntFilter>;
  cancelledLateCount?: InputMaybe<IntFilter>;
  createdAt?: InputMaybe<DatetimeFilter>;
  feedbackCount?: InputMaybe<IntFilter>;
  lastAttendedAt?: InputMaybe<DatetimeFilter>;
  lastFeedbackAt?: InputMaybe<DatetimeFilter>;
  noShowCount?: InputMaybe<IntFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<UserReliabilityFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<UserReliabilityFilter>>;
  positiveFeedbackCount?: InputMaybe<IntFilter>;
  reliabilityScore?: InputMaybe<BigFloatFilter>;
  updatedAt?: InputMaybe<DatetimeFilter>;
  userId?: InputMaybe<UuidFilter>;
};

export type UserReliabilityInsertInput = {
  attendedCount?: InputMaybe<Scalars['Int']['input']>;
  cancelledLateCount?: InputMaybe<Scalars['Int']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  feedbackCount?: InputMaybe<Scalars['Int']['input']>;
  lastAttendedAt?: InputMaybe<Scalars['Datetime']['input']>;
  lastFeedbackAt?: InputMaybe<Scalars['Datetime']['input']>;
  noShowCount?: InputMaybe<Scalars['Int']['input']>;
  positiveFeedbackCount?: InputMaybe<Scalars['Int']['input']>;
  reliabilityScore?: InputMaybe<Scalars['BigFloat']['input']>;
  updatedAt?: InputMaybe<Scalars['Datetime']['input']>;
  userId?: InputMaybe<Scalars['UUID']['input']>;
};

export type UserReliabilityInsertResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<UserReliability>;
};

export type UserReliabilityOrderBy = {
  attendedCount?: InputMaybe<OrderByDirection>;
  cancelledLateCount?: InputMaybe<OrderByDirection>;
  createdAt?: InputMaybe<OrderByDirection>;
  feedbackCount?: InputMaybe<OrderByDirection>;
  lastAttendedAt?: InputMaybe<OrderByDirection>;
  lastFeedbackAt?: InputMaybe<OrderByDirection>;
  noShowCount?: InputMaybe<OrderByDirection>;
  positiveFeedbackCount?: InputMaybe<OrderByDirection>;
  reliabilityScore?: InputMaybe<OrderByDirection>;
  updatedAt?: InputMaybe<OrderByDirection>;
  userId?: InputMaybe<OrderByDirection>;
};

export type UserReliabilityUpdateInput = {
  attendedCount?: InputMaybe<Scalars['Int']['input']>;
  cancelledLateCount?: InputMaybe<Scalars['Int']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  feedbackCount?: InputMaybe<Scalars['Int']['input']>;
  lastAttendedAt?: InputMaybe<Scalars['Datetime']['input']>;
  lastFeedbackAt?: InputMaybe<Scalars['Datetime']['input']>;
  noShowCount?: InputMaybe<Scalars['Int']['input']>;
  positiveFeedbackCount?: InputMaybe<Scalars['Int']['input']>;
  reliabilityScore?: InputMaybe<Scalars['BigFloat']['input']>;
  updatedAt?: InputMaybe<Scalars['Datetime']['input']>;
  userId?: InputMaybe<Scalars['UUID']['input']>;
};

export type UserReliabilityUpdateResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<UserReliability>;
};

export type UserSafetySettings = Node & {
  allowFriendInvites: Scalars['Boolean']['output'];
  createdAt: Scalars['Datetime']['output'];
  emergencyContactJson: Scalars['JSON']['output'];
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  preferDaytimePlans: Scalars['Boolean']['output'];
  requirePublicMeeting: Scalars['Boolean']['output'];
  shareExactLocation: Scalars['Boolean']['output'];
  showVerifiedOnly: Scalars['Boolean']['output'];
  updatedAt: Scalars['Datetime']['output'];
  user?: Maybe<Profiles>;
  userId: Scalars['UUID']['output'];
};

export type UserSafetySettingsConnection = {
  edges: Array<UserSafetySettingsEdge>;
  pageInfo: PageInfo;
};

export type UserSafetySettingsDeleteResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<UserSafetySettings>;
};

export type UserSafetySettingsEdge = {
  cursor: Scalars['String']['output'];
  node: UserSafetySettings;
};

export type UserSafetySettingsFilter = {
  allowFriendInvites?: InputMaybe<BooleanFilter>;
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<UserSafetySettingsFilter>>;
  createdAt?: InputMaybe<DatetimeFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<UserSafetySettingsFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<UserSafetySettingsFilter>>;
  preferDaytimePlans?: InputMaybe<BooleanFilter>;
  requirePublicMeeting?: InputMaybe<BooleanFilter>;
  shareExactLocation?: InputMaybe<BooleanFilter>;
  showVerifiedOnly?: InputMaybe<BooleanFilter>;
  updatedAt?: InputMaybe<DatetimeFilter>;
  userId?: InputMaybe<UuidFilter>;
};

export type UserSafetySettingsInsertInput = {
  allowFriendInvites?: InputMaybe<Scalars['Boolean']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  emergencyContactJson?: InputMaybe<Scalars['JSON']['input']>;
  preferDaytimePlans?: InputMaybe<Scalars['Boolean']['input']>;
  requirePublicMeeting?: InputMaybe<Scalars['Boolean']['input']>;
  shareExactLocation?: InputMaybe<Scalars['Boolean']['input']>;
  showVerifiedOnly?: InputMaybe<Scalars['Boolean']['input']>;
  updatedAt?: InputMaybe<Scalars['Datetime']['input']>;
  userId?: InputMaybe<Scalars['UUID']['input']>;
};

export type UserSafetySettingsInsertResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<UserSafetySettings>;
};

export type UserSafetySettingsOrderBy = {
  allowFriendInvites?: InputMaybe<OrderByDirection>;
  createdAt?: InputMaybe<OrderByDirection>;
  preferDaytimePlans?: InputMaybe<OrderByDirection>;
  requirePublicMeeting?: InputMaybe<OrderByDirection>;
  shareExactLocation?: InputMaybe<OrderByDirection>;
  showVerifiedOnly?: InputMaybe<OrderByDirection>;
  updatedAt?: InputMaybe<OrderByDirection>;
  userId?: InputMaybe<OrderByDirection>;
};

export type UserSafetySettingsUpdateInput = {
  allowFriendInvites?: InputMaybe<Scalars['Boolean']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  emergencyContactJson?: InputMaybe<Scalars['JSON']['input']>;
  preferDaytimePlans?: InputMaybe<Scalars['Boolean']['input']>;
  requirePublicMeeting?: InputMaybe<Scalars['Boolean']['input']>;
  shareExactLocation?: InputMaybe<Scalars['Boolean']['input']>;
  showVerifiedOnly?: InputMaybe<Scalars['Boolean']['input']>;
  updatedAt?: InputMaybe<Scalars['Datetime']['input']>;
  userId?: InputMaybe<Scalars['UUID']['input']>;
};

export type UserSafetySettingsUpdateResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<UserSafetySettings>;
};

export type UserSocialPreferences = Node & {
  allowNightlife: Scalars['Boolean']['output'];
  budgetPreference?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['Datetime']['output'];
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  preferDaytime: Scalars['Boolean']['output'];
  preferHostedPlans: Scalars['Boolean']['output'];
  preferNoChatNeeded: Scalars['Boolean']['output'];
  preferSmallGroups: Scalars['Boolean']['output'];
  socialComfortMode: Scalars['String']['output'];
  updatedAt: Scalars['Datetime']['output'];
  user?: Maybe<Profiles>;
  userId: Scalars['UUID']['output'];
};

export type UserSocialPreferencesConnection = {
  edges: Array<UserSocialPreferencesEdge>;
  pageInfo: PageInfo;
};

export type UserSocialPreferencesDeleteResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<UserSocialPreferences>;
};

export type UserSocialPreferencesEdge = {
  cursor: Scalars['String']['output'];
  node: UserSocialPreferences;
};

export type UserSocialPreferencesFilter = {
  allowNightlife?: InputMaybe<BooleanFilter>;
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<UserSocialPreferencesFilter>>;
  budgetPreference?: InputMaybe<StringFilter>;
  createdAt?: InputMaybe<DatetimeFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<UserSocialPreferencesFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<UserSocialPreferencesFilter>>;
  preferDaytime?: InputMaybe<BooleanFilter>;
  preferHostedPlans?: InputMaybe<BooleanFilter>;
  preferNoChatNeeded?: InputMaybe<BooleanFilter>;
  preferSmallGroups?: InputMaybe<BooleanFilter>;
  socialComfortMode?: InputMaybe<StringFilter>;
  updatedAt?: InputMaybe<DatetimeFilter>;
  userId?: InputMaybe<UuidFilter>;
};

export type UserSocialPreferencesInsertInput = {
  allowNightlife?: InputMaybe<Scalars['Boolean']['input']>;
  budgetPreference?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  preferDaytime?: InputMaybe<Scalars['Boolean']['input']>;
  preferHostedPlans?: InputMaybe<Scalars['Boolean']['input']>;
  preferNoChatNeeded?: InputMaybe<Scalars['Boolean']['input']>;
  preferSmallGroups?: InputMaybe<Scalars['Boolean']['input']>;
  socialComfortMode?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['Datetime']['input']>;
  userId?: InputMaybe<Scalars['UUID']['input']>;
};

export type UserSocialPreferencesInsertResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<UserSocialPreferences>;
};

export type UserSocialPreferencesOrderBy = {
  allowNightlife?: InputMaybe<OrderByDirection>;
  budgetPreference?: InputMaybe<OrderByDirection>;
  createdAt?: InputMaybe<OrderByDirection>;
  preferDaytime?: InputMaybe<OrderByDirection>;
  preferHostedPlans?: InputMaybe<OrderByDirection>;
  preferNoChatNeeded?: InputMaybe<OrderByDirection>;
  preferSmallGroups?: InputMaybe<OrderByDirection>;
  socialComfortMode?: InputMaybe<OrderByDirection>;
  updatedAt?: InputMaybe<OrderByDirection>;
  userId?: InputMaybe<OrderByDirection>;
};

export type UserSocialPreferencesUpdateInput = {
  allowNightlife?: InputMaybe<Scalars['Boolean']['input']>;
  budgetPreference?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  preferDaytime?: InputMaybe<Scalars['Boolean']['input']>;
  preferHostedPlans?: InputMaybe<Scalars['Boolean']['input']>;
  preferNoChatNeeded?: InputMaybe<Scalars['Boolean']['input']>;
  preferSmallGroups?: InputMaybe<Scalars['Boolean']['input']>;
  socialComfortMode?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['Datetime']['input']>;
  userId?: InputMaybe<Scalars['UUID']['input']>;
};

export type UserSocialPreferencesUpdateResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<UserSocialPreferences>;
};

export type UserSuburbMatches = Node & {
  city: Cities;
  cityId: Scalars['UUID']['output'];
  createdAt: Scalars['Datetime']['output'];
  id: Scalars['UUID']['output'];
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  reasonsJson: Scalars['JSON']['output'];
  score: Scalars['BigFloat']['output'];
  source: Scalars['String']['output'];
  suburb: Suburbs;
  suburbId: Scalars['UUID']['output'];
  updatedAt: Scalars['Datetime']['output'];
  user?: Maybe<Profiles>;
  userId: Scalars['UUID']['output'];
};

export type UserSuburbMatchesConnection = {
  edges: Array<UserSuburbMatchesEdge>;
  pageInfo: PageInfo;
};

export type UserSuburbMatchesDeleteResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<UserSuburbMatches>;
};

export type UserSuburbMatchesEdge = {
  cursor: Scalars['String']['output'];
  node: UserSuburbMatches;
};

export type UserSuburbMatchesFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<UserSuburbMatchesFilter>>;
  cityId?: InputMaybe<UuidFilter>;
  createdAt?: InputMaybe<DatetimeFilter>;
  id?: InputMaybe<UuidFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<UserSuburbMatchesFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<UserSuburbMatchesFilter>>;
  score?: InputMaybe<BigFloatFilter>;
  source?: InputMaybe<StringFilter>;
  suburbId?: InputMaybe<UuidFilter>;
  updatedAt?: InputMaybe<DatetimeFilter>;
  userId?: InputMaybe<UuidFilter>;
};

export type UserSuburbMatchesInsertInput = {
  cityId?: InputMaybe<Scalars['UUID']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  reasonsJson?: InputMaybe<Scalars['JSON']['input']>;
  score?: InputMaybe<Scalars['BigFloat']['input']>;
  source?: InputMaybe<Scalars['String']['input']>;
  suburbId?: InputMaybe<Scalars['UUID']['input']>;
  updatedAt?: InputMaybe<Scalars['Datetime']['input']>;
  userId?: InputMaybe<Scalars['UUID']['input']>;
};

export type UserSuburbMatchesInsertResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<UserSuburbMatches>;
};

export type UserSuburbMatchesOrderBy = {
  cityId?: InputMaybe<OrderByDirection>;
  createdAt?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  score?: InputMaybe<OrderByDirection>;
  source?: InputMaybe<OrderByDirection>;
  suburbId?: InputMaybe<OrderByDirection>;
  updatedAt?: InputMaybe<OrderByDirection>;
  userId?: InputMaybe<OrderByDirection>;
};

export type UserSuburbMatchesUpdateInput = {
  cityId?: InputMaybe<Scalars['UUID']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  reasonsJson?: InputMaybe<Scalars['JSON']['input']>;
  score?: InputMaybe<Scalars['BigFloat']['input']>;
  source?: InputMaybe<Scalars['String']['input']>;
  suburbId?: InputMaybe<Scalars['UUID']['input']>;
  updatedAt?: InputMaybe<Scalars['Datetime']['input']>;
  userId?: InputMaybe<Scalars['UUID']['input']>;
};

export type UserSuburbMatchesUpdateResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<UserSuburbMatches>;
};

export type UserVerifications = Node & {
  createdAt: Scalars['Datetime']['output'];
  evidenceJson: Scalars['JSON']['output'];
  expiresAt?: Maybe<Scalars['Datetime']['output']>;
  id: Scalars['UUID']['output'];
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  status: Scalars['String']['output'];
  updatedAt: Scalars['Datetime']['output'];
  user?: Maybe<Profiles>;
  userId: Scalars['UUID']['output'];
  verificationType: Scalars['String']['output'];
  verifiedAt?: Maybe<Scalars['Datetime']['output']>;
};

export type UserVerificationsConnection = {
  edges: Array<UserVerificationsEdge>;
  pageInfo: PageInfo;
};

export type UserVerificationsDeleteResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<UserVerifications>;
};

export type UserVerificationsEdge = {
  cursor: Scalars['String']['output'];
  node: UserVerifications;
};

export type UserVerificationsFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<UserVerificationsFilter>>;
  createdAt?: InputMaybe<DatetimeFilter>;
  expiresAt?: InputMaybe<DatetimeFilter>;
  id?: InputMaybe<UuidFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<UserVerificationsFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<UserVerificationsFilter>>;
  status?: InputMaybe<StringFilter>;
  updatedAt?: InputMaybe<DatetimeFilter>;
  userId?: InputMaybe<UuidFilter>;
  verificationType?: InputMaybe<StringFilter>;
  verifiedAt?: InputMaybe<DatetimeFilter>;
};

export type UserVerificationsInsertInput = {
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  evidenceJson?: InputMaybe<Scalars['JSON']['input']>;
  expiresAt?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['Datetime']['input']>;
  userId?: InputMaybe<Scalars['UUID']['input']>;
  verificationType?: InputMaybe<Scalars['String']['input']>;
  verifiedAt?: InputMaybe<Scalars['Datetime']['input']>;
};

export type UserVerificationsInsertResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<UserVerifications>;
};

export type UserVerificationsOrderBy = {
  createdAt?: InputMaybe<OrderByDirection>;
  expiresAt?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  status?: InputMaybe<OrderByDirection>;
  updatedAt?: InputMaybe<OrderByDirection>;
  userId?: InputMaybe<OrderByDirection>;
  verificationType?: InputMaybe<OrderByDirection>;
  verifiedAt?: InputMaybe<OrderByDirection>;
};

export type UserVerificationsUpdateInput = {
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  evidenceJson?: InputMaybe<Scalars['JSON']['input']>;
  expiresAt?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['Datetime']['input']>;
  userId?: InputMaybe<Scalars['UUID']['input']>;
  verificationType?: InputMaybe<Scalars['String']['input']>;
  verifiedAt?: InputMaybe<Scalars['Datetime']['input']>;
};

export type UserVerificationsUpdateResponse = {
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<UserVerifications>;
};

export type BuzzHomeQueryVariables = Exact<{ [key: string]: never; }>;


export type BuzzHomeQuery = { interestsCollection: { edges: Array<{ node: { id: string, name: string, slug: string, category: string } }> } | null };

export type ActivateInterestMutationVariables = Exact<{
  interestId: string;
}>;


export type ActivateInterestMutation = { activateInterest: Record<string, unknown> | null };

export type UpsertBuzzProfileMutationVariables = Exact<{
  userId: string;
  displayName: string;
  cityId: string;
  quizAnswers: Record<string, unknown>;
  quizTraits: Record<string, unknown>;
}>;


export type UpsertBuzzProfileMutation = { upsertBuzzProfile: Record<string, unknown> | null };

export type GroupMessagesQueryVariables = Exact<{
  groupId: string;
}>;


export type GroupMessagesQuery = { groupMessagesCollection: { edges: Array<{ node: { id: string, activityGroupId: string, senderId: string, body: string, messageType: string, moderationStatus: string, createdAt: string } }> } | null };

export type ActivityGroupSummaryQueryVariables = Exact<{
  groupId: string;
}>;


export type ActivityGroupSummaryQuery = { activityGroupsCollection: { edges: Array<{ node: { id: string, title: string, status: string, city: { id: string, name: string } | null, interest: { id: string, name: string } | null, activityPlansCollection: { edges: Array<{ node: { id: string, title: string, description: string | null, startsAt: string | null, venueType: string, publicLocationName: string, capacityMin: number, capacityMax: number, safetyGuidance: string } }> } | null } }> } | null };

export type SendGroupMessageMutationVariables = Exact<{
  activityGroupId: string;
  senderId: string;
  body: string;
  moderationStatus: string;
}>;


export type SendGroupMessageMutation = { insertIntoGroupMessagesCollection: { records: Array<{ id: string, activityGroupId: string, senderId: string, body: string, messageType: string, moderationStatus: string, createdAt: string }> } | null };


export const BuzzHomeDocument = gql`
    query BuzzHome {
  interestsCollection(first: 50) {
    edges {
      node {
        id
        name
        slug
        category
      }
    }
  }
}
    `;

/**
 * __useBuzzHomeQuery__
 *
 * To run a query within a React component, call `useBuzzHomeQuery` and pass it any options that fit your needs.
 * When your component renders, `useBuzzHomeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useBuzzHomeQuery({
 *   variables: {
 *   },
 * });
 */
export function useBuzzHomeQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<BuzzHomeQuery, BuzzHomeQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<BuzzHomeQuery, BuzzHomeQueryVariables>(BuzzHomeDocument, options);
      }
export function useBuzzHomeLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<BuzzHomeQuery, BuzzHomeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<BuzzHomeQuery, BuzzHomeQueryVariables>(BuzzHomeDocument, options);
        }
// @ts-ignore
export function useBuzzHomeSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<BuzzHomeQuery, BuzzHomeQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<BuzzHomeQuery, BuzzHomeQueryVariables>;
export function useBuzzHomeSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<BuzzHomeQuery, BuzzHomeQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<BuzzHomeQuery | undefined, BuzzHomeQueryVariables>;
export function useBuzzHomeSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<BuzzHomeQuery, BuzzHomeQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<BuzzHomeQuery, BuzzHomeQueryVariables>(BuzzHomeDocument, options);
        }
export type BuzzHomeQueryHookResult = ReturnType<typeof useBuzzHomeQuery>;
export type BuzzHomeLazyQueryHookResult = ReturnType<typeof useBuzzHomeLazyQuery>;
export type BuzzHomeSuspenseQueryHookResult = ReturnType<typeof useBuzzHomeSuspenseQuery>;
export type BuzzHomeQueryResult = ApolloReactCommon.QueryResult<BuzzHomeQuery, BuzzHomeQueryVariables>;
export const ActivateInterestDocument = gql`
    mutation ActivateInterest($interestId: UUID!) {
  activateInterest(interestId: $interestId)
}
    `;
export type ActivateInterestMutationFn = ApolloReactCommon.MutationFunction<ActivateInterestMutation, ActivateInterestMutationVariables>;

/**
 * __useActivateInterestMutation__
 *
 * To run a mutation, you first call `useActivateInterestMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useActivateInterestMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [activateInterestMutation, { data, loading, error }] = useActivateInterestMutation({
 *   variables: {
 *      interestId: // value for 'interestId'
 *   },
 * });
 */
export function useActivateInterestMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<ActivateInterestMutation, ActivateInterestMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<ActivateInterestMutation, ActivateInterestMutationVariables>(ActivateInterestDocument, options);
      }
export type ActivateInterestMutationHookResult = ReturnType<typeof useActivateInterestMutation>;
export type ActivateInterestMutationResult = ApolloReactCommon.MutationResult<ActivateInterestMutation>;
export type ActivateInterestMutationOptions = ApolloReactCommon.BaseMutationOptions<ActivateInterestMutation, ActivateInterestMutationVariables>;
export const UpsertBuzzProfileDocument = gql`
    mutation UpsertBuzzProfile($userId: UUID!, $displayName: String!, $cityId: UUID!, $quizAnswers: JSON!, $quizTraits: JSON!) {
  upsertBuzzProfile(
    userId: $userId
    displayName: $displayName
    cityId: $cityId
    quizAnswers: $quizAnswers
    quizTraits: $quizTraits
  )
}
    `;
export type UpsertBuzzProfileMutationFn = ApolloReactCommon.MutationFunction<UpsertBuzzProfileMutation, UpsertBuzzProfileMutationVariables>;

/**
 * __useUpsertBuzzProfileMutation__
 *
 * To run a mutation, you first call `useUpsertBuzzProfileMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertBuzzProfileMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertBuzzProfileMutation, { data, loading, error }] = useUpsertBuzzProfileMutation({
 *   variables: {
 *      userId: // value for 'userId'
 *      displayName: // value for 'displayName'
 *      cityId: // value for 'cityId'
 *      quizAnswers: // value for 'quizAnswers'
 *      quizTraits: // value for 'quizTraits'
 *   },
 * });
 */
export function useUpsertBuzzProfileMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<UpsertBuzzProfileMutation, UpsertBuzzProfileMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<UpsertBuzzProfileMutation, UpsertBuzzProfileMutationVariables>(UpsertBuzzProfileDocument, options);
      }
export type UpsertBuzzProfileMutationHookResult = ReturnType<typeof useUpsertBuzzProfileMutation>;
export type UpsertBuzzProfileMutationResult = ApolloReactCommon.MutationResult<UpsertBuzzProfileMutation>;
export type UpsertBuzzProfileMutationOptions = ApolloReactCommon.BaseMutationOptions<UpsertBuzzProfileMutation, UpsertBuzzProfileMutationVariables>;
export const GroupMessagesDocument = gql`
    query GroupMessages($groupId: UUID!) {
  groupMessagesCollection(
    first: 50
    filter: {activityGroupId: {eq: $groupId}}
    orderBy: [{createdAt: AscNullsLast}]
  ) {
    edges {
      node {
        id
        activityGroupId
        senderId
        body
        messageType
        moderationStatus
        createdAt
      }
    }
  }
}
    `;

/**
 * __useGroupMessagesQuery__
 *
 * To run a query within a React component, call `useGroupMessagesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGroupMessagesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGroupMessagesQuery({
 *   variables: {
 *      groupId: // value for 'groupId'
 *   },
 * });
 */
export function useGroupMessagesQuery(baseOptions: ApolloReactHooks.QueryHookOptions<GroupMessagesQuery, GroupMessagesQueryVariables> & ({ variables: GroupMessagesQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GroupMessagesQuery, GroupMessagesQueryVariables>(GroupMessagesDocument, options);
      }
export function useGroupMessagesLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GroupMessagesQuery, GroupMessagesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GroupMessagesQuery, GroupMessagesQueryVariables>(GroupMessagesDocument, options);
        }
// @ts-ignore
export function useGroupMessagesSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<GroupMessagesQuery, GroupMessagesQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<GroupMessagesQuery, GroupMessagesQueryVariables>;
export function useGroupMessagesSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GroupMessagesQuery, GroupMessagesQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<GroupMessagesQuery | undefined, GroupMessagesQueryVariables>;
export function useGroupMessagesSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GroupMessagesQuery, GroupMessagesQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<GroupMessagesQuery, GroupMessagesQueryVariables>(GroupMessagesDocument, options);
        }
export type GroupMessagesQueryHookResult = ReturnType<typeof useGroupMessagesQuery>;
export type GroupMessagesLazyQueryHookResult = ReturnType<typeof useGroupMessagesLazyQuery>;
export type GroupMessagesSuspenseQueryHookResult = ReturnType<typeof useGroupMessagesSuspenseQuery>;
export type GroupMessagesQueryResult = ApolloReactCommon.QueryResult<GroupMessagesQuery, GroupMessagesQueryVariables>;
export const ActivityGroupSummaryDocument = gql`
    query ActivityGroupSummary($groupId: UUID!) {
  activityGroupsCollection(first: 1, filter: {id: {eq: $groupId}}) {
    edges {
      node {
        id
        title
        status
        city {
          id
          name
        }
        interest {
          id
          name
        }
        activityPlansCollection(first: 1, orderBy: [{createdAt: DescNullsLast}]) {
          edges {
            node {
              id
              title
              description
              startsAt
              venueType
              publicLocationName
              capacityMin
              capacityMax
              safetyGuidance
            }
          }
        }
      }
    }
  }
}
    `;

/**
 * __useActivityGroupSummaryQuery__
 *
 * To run a query within a React component, call `useActivityGroupSummaryQuery` and pass it any options that fit your needs.
 * When your component renders, `useActivityGroupSummaryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useActivityGroupSummaryQuery({
 *   variables: {
 *      groupId: // value for 'groupId'
 *   },
 * });
 */
export function useActivityGroupSummaryQuery(baseOptions: ApolloReactHooks.QueryHookOptions<ActivityGroupSummaryQuery, ActivityGroupSummaryQueryVariables> & ({ variables: ActivityGroupSummaryQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<ActivityGroupSummaryQuery, ActivityGroupSummaryQueryVariables>(ActivityGroupSummaryDocument, options);
      }
export function useActivityGroupSummaryLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<ActivityGroupSummaryQuery, ActivityGroupSummaryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<ActivityGroupSummaryQuery, ActivityGroupSummaryQueryVariables>(ActivityGroupSummaryDocument, options);
        }
// @ts-ignore
export function useActivityGroupSummarySuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<ActivityGroupSummaryQuery, ActivityGroupSummaryQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<ActivityGroupSummaryQuery, ActivityGroupSummaryQueryVariables>;
export function useActivityGroupSummarySuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<ActivityGroupSummaryQuery, ActivityGroupSummaryQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<ActivityGroupSummaryQuery | undefined, ActivityGroupSummaryQueryVariables>;
export function useActivityGroupSummarySuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<ActivityGroupSummaryQuery, ActivityGroupSummaryQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<ActivityGroupSummaryQuery, ActivityGroupSummaryQueryVariables>(ActivityGroupSummaryDocument, options);
        }
export type ActivityGroupSummaryQueryHookResult = ReturnType<typeof useActivityGroupSummaryQuery>;
export type ActivityGroupSummaryLazyQueryHookResult = ReturnType<typeof useActivityGroupSummaryLazyQuery>;
export type ActivityGroupSummarySuspenseQueryHookResult = ReturnType<typeof useActivityGroupSummarySuspenseQuery>;
export type ActivityGroupSummaryQueryResult = ApolloReactCommon.QueryResult<ActivityGroupSummaryQuery, ActivityGroupSummaryQueryVariables>;
export const SendGroupMessageDocument = gql`
    mutation SendGroupMessage($activityGroupId: UUID!, $senderId: UUID!, $body: String!, $moderationStatus: String!) {
  insertIntoGroupMessagesCollection(
    objects: [{activityGroupId: $activityGroupId, senderId: $senderId, body: $body, messageType: "text", moderationStatus: $moderationStatus}]
  ) {
    records {
      id
      activityGroupId
      senderId
      body
      messageType
      moderationStatus
      createdAt
    }
  }
}
    `;
export type SendGroupMessageMutationFn = ApolloReactCommon.MutationFunction<SendGroupMessageMutation, SendGroupMessageMutationVariables>;

/**
 * __useSendGroupMessageMutation__
 *
 * To run a mutation, you first call `useSendGroupMessageMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSendGroupMessageMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [sendGroupMessageMutation, { data, loading, error }] = useSendGroupMessageMutation({
 *   variables: {
 *      activityGroupId: // value for 'activityGroupId'
 *      senderId: // value for 'senderId'
 *      body: // value for 'body'
 *      moderationStatus: // value for 'moderationStatus'
 *   },
 * });
 */
export function useSendGroupMessageMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<SendGroupMessageMutation, SendGroupMessageMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<SendGroupMessageMutation, SendGroupMessageMutationVariables>(SendGroupMessageDocument, options);
      }
export type SendGroupMessageMutationHookResult = ReturnType<typeof useSendGroupMessageMutation>;
export type SendGroupMessageMutationResult = ApolloReactCommon.MutationResult<SendGroupMessageMutation>;
export type SendGroupMessageMutationOptions = ApolloReactCommon.BaseMutationOptions<SendGroupMessageMutation, SendGroupMessageMutationVariables>;