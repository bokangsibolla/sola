export type TripStatus = 'draft' | 'planned' | 'active' | 'completed';
export type PrivacyLevel = 'private' | 'friends' | 'public';
export type TripKind = 'plan_future' | 'currently_traveling' | 'past_trip';
export type EntryType = 'note' | 'arrival' | 'departure' | 'stay' | 'tip' | 'comfort_check' | 'highlight';
export type MoodTag = 'calm' | 'happy' | 'uneasy' | 'unsafe';
export type EntryVisibility = 'private' | 'shared' | 'public';
export type SavedItemCategory = 'general' | 'accommodation' | 'food' | 'activity' | 'transport' | 'other';
export type SavedItemSource = 'manual' | 'collection_import' | 'suggestion';
export type AccommodationStatus = 'planned' | 'booked' | 'confirmed';
export type TransportType = 'flight' | 'train' | 'bus' | 'car' | 'ferry' | 'other';

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

// ── Accommodation ──────────────────────────────────────────

export interface TripAccommodation {
  id: string;
  tripId: string;
  placeId: string | null;
  name: string;
  checkIn: string;
  checkOut: string;
  address: string | null;
  locationLat: number | null;
  locationLng: number | null;
  bookingUrl: string | null;
  bookingRef: string | null;
  cost: number | null;
  currency: string;
  status: AccommodationStatus;
  notes: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccommodationInput {
  tripId: string;
  placeId?: string;
  name: string;
  checkIn: string;
  checkOut: string;
  address?: string;
  locationLat?: number;
  locationLng?: number;
  bookingUrl?: string;
  bookingRef?: string;
  cost?: number;
  currency?: string;
  status?: AccommodationStatus;
  notes?: string;
}

export interface UpdateAccommodationInput {
  name?: string;
  checkIn?: string;
  checkOut?: string;
  address?: string | null;
  locationLat?: number | null;
  locationLng?: number | null;
  bookingUrl?: string | null;
  bookingRef?: string | null;
  cost?: number | null;
  currency?: string;
  status?: AccommodationStatus;
  notes?: string | null;
}

// ── Transport ──────────────────────────────────────────────

export interface TripTransport {
  id: string;
  tripId: string;
  fromStopOrder: number | null;
  toStopOrder: number | null;
  transportType: TransportType;
  carrier: string | null;
  reference: string | null;
  departureAt: string | null;
  arrivalAt: string | null;
  departureLocation: string | null;
  arrivalLocation: string | null;
  bookingUrl: string | null;
  cost: number | null;
  currency: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransportInput {
  tripId: string;
  fromStopOrder?: number;
  toStopOrder?: number;
  transportType: TransportType;
  carrier?: string;
  reference?: string;
  departureAt?: string;
  arrivalAt?: string;
  departureLocation?: string;
  arrivalLocation?: string;
  bookingUrl?: string;
  cost?: number;
  currency?: string;
  notes?: string;
}

export interface UpdateTransportInput {
  fromStopOrder?: number | null;
  toStopOrder?: number | null;
  transportType?: TransportType;
  carrier?: string | null;
  reference?: string | null;
  departureAt?: string | null;
  arrivalAt?: string | null;
  departureLocation?: string | null;
  arrivalLocation?: string | null;
  bookingUrl?: string | null;
  cost?: number | null;
  currency?: string;
  notes?: string | null;
}

// ── Notification Settings ──────────────────────────────────

export interface TripNotificationSettings {
  tripId: string;
  morningSummary: boolean;
  stopReminders: boolean;
  eveningJournal: boolean;
  departureAlerts: boolean;
  reminderMinutes: number;
  morningHour: number;
  eveningHour: number;
}
