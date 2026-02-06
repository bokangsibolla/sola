/** Community feature types — mirrors Supabase schema. */

export type ThreadStatus = 'active' | 'locked' | 'removed';
export type ReplyStatus = 'active' | 'removed';
export type ReportStatus = 'open' | 'reviewed' | 'actioned';
export type CommunityEntityType = 'thread' | 'reply';

export interface CommunityTopic {
  id: string;
  label: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
}

export interface CommunityThread {
  id: string;
  authorId: string;
  title: string;
  body: string;
  countryId: string | null;
  cityId: string | null;
  topicId: string | null;
  status: ThreadStatus;
  visibility: string;
  pinned: boolean;
  helpfulCount: number;
  replyCount: number;
  authorType: string;
  isSeed: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Thread with joined author profile + place names for display. */
export interface ThreadWithAuthor extends CommunityThread {
  author: {
    id: string;
    firstName: string;
    avatarUrl: string | null;
  };
  countryName: string | null;
  cityName: string | null;
  topicLabel: string | null;
  /** Whether the current user has marked this helpful. */
  isHelpful: boolean;
}

export interface CommunityReply {
  id: string;
  threadId: string;
  authorId: string;
  body: string;
  parentReplyId: string | null;
  status: ReplyStatus;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
}

/** Reply with joined author profile for display. */
export interface ReplyWithAuthor extends CommunityReply {
  author: {
    id: string;
    firstName: string;
    avatarUrl: string | null;
  };
  isHelpful: boolean;
}

export interface CommunityReaction {
  id: string;
  userId: string;
  entityType: CommunityEntityType;
  entityId: string;
  createdAt: string;
}

export interface CommunityReport {
  id: string;
  reporterId: string;
  entityType: CommunityEntityType;
  entityId: string;
  reason: string;
  details: string | null;
  status: ReportStatus;
  createdAt: string;
}

/** Params for fetching a filtered thread feed. */
export interface ThreadFeedParams {
  countryId?: string;
  cityId?: string;
  topicId?: string;
  searchQuery?: string;
  sort: 'relevant' | 'new' | 'helpful';
  page: number;
  pageSize: number;
}

/** Params for creating a new thread. */
export interface CreateThreadInput {
  title: string;
  body: string;
  countryId?: string;
  cityId?: string;
  topicId?: string;
}

/** Params for creating a reply. */
export interface CreateReplyInput {
  threadId: string;
  body: string;
  parentReplyId?: string;
}
