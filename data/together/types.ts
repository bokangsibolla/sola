/**
 * Together feature types — mirrors Supabase schema.
 * "Together" lets travelers find activity companions for specific plans.
 */

export type TogetherPostType = 'open_plan' | 'looking_for';
export type TogetherPostStatus = 'open' | 'closed' | 'cancelled';
export type TogetherRequestStatus = 'pending' | 'accepted' | 'declined' | 'cancelled';
export type ActivityCategory =
  | 'food'
  | 'culture'
  | 'adventure'
  | 'nightlife'
  | 'day_trip'
  | 'wellness'
  | 'shopping'
  | 'other';

export interface TogetherPost {
  id: string;
  userId: string;
  tripId: string | null;
  postType: TogetherPostType;
  itineraryBlockId: string | null;
  title: string;
  description: string | null;
  cityId: string | null;          // uuid in DB
  countryIso2: string | null;
  activityDate: string | null;    // "YYYY-MM-DD"
  startTime: string | null;       // "HH:MM:SS"
  endTime: string | null;
  isFlexible: boolean;
  activityCategory: ActivityCategory;
  maxCompanions: number;
  status: TogetherPostStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TogetherPostWithAuthor extends TogetherPost {
  author: {
    id: string;
    firstName: string;
    avatarUrl: string | null;
    bio: string | null;
    travelStyleTags: string[];
  };
  cityName: string | null;
  countryName: string | null;
  requestCount: number;
  acceptedCount: number;
  userRequestStatus: TogetherRequestStatus | null;
  userRequestId: string | null;
}

export interface TogetherRequest {
  id: string;
  postId: string;
  requesterId: string;
  note: string | null;
  status: TogetherRequestStatus;
  respondedAt: string | null;
  createdAt: string;
}

export interface TogetherRequestWithProfile extends TogetherRequest {
  requester: {
    id: string;
    firstName: string;
    avatarUrl: string | null;
    bio: string | null;
    travelStyleTags: string[];
  };
}

export interface CreateTogetherPostInput {
  postType: TogetherPostType;
  title: string;
  description?: string;
  tripId?: string;
  itineraryBlockId?: string;
  cityId?: string;
  countryIso2?: string;
  activityDate?: string;
  startTime?: string;
  endTime?: string;
  isFlexible?: boolean;
  activityCategory: ActivityCategory;
  maxCompanions?: number;
}

export interface TogetherFeedParams {
  cityId?: string;
  countryIso2?: string;
  category?: ActivityCategory;
  timeframe?: 'today' | 'this_week' | 'flexible' | 'all';
  page: number;
  pageSize: number;
}
