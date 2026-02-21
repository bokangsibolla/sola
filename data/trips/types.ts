export type TripStatus = 'draft' | 'planned' | 'active' | 'completed';
export type PrivacyLevel = 'private' | 'friends' | 'public';
export type TripKind = 'plan_future' | 'currently_traveling' | 'past_trip';
export type EntryType = 'note' | 'arrival' | 'departure' | 'stay' | 'tip' | 'comfort_check' | 'highlight';
export type MoodTag = 'calm' | 'happy' | 'uneasy' | 'unsafe';
export type EntryVisibility = 'private' | 'shared' | 'public';
export type SavedItemCategory = 'general' | 'accommodation' | 'food' | 'activity' | 'transport' | 'other';

export interface TripStop {
  id: string;
  tripId: string;
  stopOrder: number;
  countryIso2: string;
  cityId: string | null;
  cityName: string | null;
  startDate: string | null;
  endDate: string | null;
  notes: string | null;
  createdAt: string;
}

export interface TripEntry {
  id: string;
  tripId: string;
  userId: string;
  entryType: EntryType;
  title: string | null;
  body: string | null;
  locationName: string | null;
  moodTag: MoodTag | null;
  visibility: EntryVisibility;
  isShareableTip: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TripSavedItem {
  id: string;
  tripId: string;
  entityType: 'place' | 'city' | 'country' | 'activity';
  entityId: string;
  category: SavedItemCategory;
  notes: string | null;
  sortOrder: number;
  createdAt: string;
}

export interface TripMatchingPrefs {
  tripId: string;
  styleTags: string[];
  matchRadiusKm: number;
  showProfile: boolean;
  showDates: boolean;
  showStops: boolean;
}

export interface TripOverlapMatch {
  myTripId: string;
  myUserId: string;
  theirTripId: string;
  theirUserId: string;
  overlapCity: string | null;
  overlapCountry: string;
  overlapStart: string;
  overlapEnd: string;
  theirStyleTags: string[];
}

export interface TripBuddy {
  id: string;
  tripId: string;
  userId: string;
  addedAt: string;
}

export interface TripFull {
  id: string;
  userId: string;
  destinationCityId: string | null;
  destinationName: string;
  countryIso2: string;
  title: string | null;
  summary: string | null;
  arriving: string | null;
  leaving: string | null;
  nights: number;
  status: TripStatus;
  privacyLevel: PrivacyLevel;
  matchingOptIn: boolean;
  travelStyleTags: string[];
  flexibleDates: boolean;
  coverImageUrl: string | null;
  notes: string | null;
  timezone: string | null;
  currency: string | null;
  budgetTotal: number | null;
  pace: string | null;
  createdAt: string;
}

export interface TripWithStops extends TripFull {
  stops: TripStop[];
}

export interface GroupedTrips {
  current: TripWithStops | null;
  upcoming: TripWithStops[];
  past: TripWithStops[];
}

export interface CreateTripInput {
  title?: string;
  summary?: string;
  tripKind?: TripKind;
  stops: {
    countryIso2: string;
    cityId?: string;
    cityName?: string;
    startDate?: string;
    endDate?: string;
  }[];
  arriving?: string;
  leaving?: string;
  flexibleDates?: boolean;
  travelStyleTags?: string[];
  privacyLevel?: PrivacyLevel;
  matchingOptIn?: boolean;
  coverImageUrl?: string;
  buddyUserIds?: string[];
  notes?: string;
}

export interface CreateEntryInput {
  tripId: string;
  entryType: EntryType;
  title?: string;
  body?: string;
  locationName?: string;
  moodTag?: MoodTag;
  visibility?: EntryVisibility;
  isShareableTip?: boolean;
}
