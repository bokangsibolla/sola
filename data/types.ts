export interface Country {
  id: string;
  slug: string;
  continent: 'africa' | 'asia' | 'europe' | 'latin_america' | 'middle_east' | 'oceania';
  name: string;
  iso2: string;
  iso3: string | null;
  currencyCode: string | null;
  isActive: boolean;
  orderIndex: number;
  heroImageUrl: string | null;
  shortBlurb: string | null;
  badgeLabel: string | null;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  // Image enrichment metadata
  imageSource: string | null;
  imageAttribution: string | null;
  imageCachedAt: string | null;
  // Content fields (merged from geo_content)
  title: string | null;
  subtitle: string | null;
  summary: string | null;
  summaryMd: string | null;
  contentMd: string | null;
  whyWeLoveMd: string | null;
  safetyRating: 'very_safe' | 'generally_safe' | 'use_caution' | 'exercise_caution' | null;
  soloFriendly: boolean | null;
  soloLevel: 'beginner' | 'intermediate' | 'expert' | null;
  bestMonths: string | null;
  bestTimeToVisit: string | null;
  currency: string | null;
  language: string | null;
  visaNote: string | null;
  highlights: string[] | null;
  avgDailyBudgetUsd: number | null;
  internetQuality: 'excellent' | 'good' | 'fair' | 'poor' | null;
  englishFriendliness: 'high' | 'moderate' | 'low' | null;
  goodForInterests: string[] | null;
  bestFor: string | null;
  gettingThereMd: string | null;
  visaEntryMd: string | null;
  simConnectivityMd: string | null;
  moneyMd: string | null;
  cultureEtiquetteMd: string | null;
  safetyWomenMd: string | null;
  portraitMd: string | null;
  // Dimension content (markdown)
  sovereigntyMd: string | null;
  soloInfrastructureMd: string | null;
  healthAccessMd: string | null;
  experienceDensityMd: string | null;
  communityConnectionMd: string | null;
  costRealityMd: string | null;
  // Practical links
  immigrationUrl: string | null;
  arrivalCardUrl: string | null;
  simProviders: Array<{ name: string; url: string; note?: string }> | null;
  healthSearchTerms: string[] | null;
  // Structured fields (country page redesign)
  budgetBreakdown: BudgetBreakdown | null;
  destinationHighlights: DestinationHighlight[] | null;
  budgetTips: BudgetTip[] | null;
  vibeSummary: string | null;
  socialVibe: string | null;
  culturalNote: string | null;
  transportSummary: string | null;
  introMd: string | null;
  // Country guide v2 fields
  bestForMd: string | null;
  mightStruggleMd: string | null;
  legalContextMd: string | null;
  finalNoteMd: string | null;
  cashVsCard: string | null;
  plugType: string | null;
  publishedAt: string | null;
}

export interface BudgetRange {
  low: number;
  high: number;
  currency: string;
  note: string;
}

export interface BudgetBreakdown {
  accommodation: BudgetRange;
  food: BudgetRange;
  transport: BudgetRange;
  activities: BudgetRange;
}

export interface DestinationHighlight {
  type: 'city' | 'place';
  id: string;
  label: string;
  tagline: string;
  imageUrl: string | null;
}

export interface BudgetTip {
  category: 'accommodation' | 'transport' | 'food' | 'activities' | 'general';
  tip: string;
  type: 'save' | 'dont_skimp';
  level: 'essential' | 'insider';
}

export type PlaceKind = 'city' | 'island' | 'town' | 'beach_town' | 'mountain_town' | 'village' | 'region';

export interface City {
  id: string;
  countryId: string;
  slug: string;
  name: string;
  timezone: string;
  centerLat: number | null;
  centerLng: number | null;
  isActive: boolean;
  orderIndex: number;
  heroImageUrl: string | null;
  shortBlurb: string | null;
  badgeLabel: string | null;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  // Image enrichment metadata
  imageSource: string | null;
  imageAttribution: string | null;
  imageCachedAt: string | null;
  // Content fields (merged from geo_content)
  title: string | null;
  subtitle: string | null;
  summary: string | null;
  summaryMd: string | null;
  contentMd: string | null;
  whyWeLoveMd: string | null;
  safetyRating: 'very_safe' | 'generally_safe' | 'use_caution' | 'exercise_caution' | null;
  soloFriendly: boolean | null;
  soloLevel: 'beginner' | 'intermediate' | 'expert' | null;
  bestMonths: string | null;
  bestTimeToVisit: string | null;
  currency: string | null;
  language: string | null;
  visaNote: string | null;
  highlights: string[] | null;
  avgDailyBudgetUsd: number | null;
  internetQuality: 'excellent' | 'good' | 'fair' | 'poor' | null;
  englishFriendliness: 'high' | 'moderate' | 'low' | null;
  goodForInterests: string[] | null;
  bestFor: string | null;
  cultureEtiquetteMd: string | null;
  safetyWomenMd: string | null;
  portraitMd: string | null;
  publishedAt: string | null;
  // City-specific content fields
  transportMd: string | null;
  topThingsToDo: string[] | null;
  // City page redesign — structured content
  positioningLine: string | null;
  budgetTier: 'budget' | 'moderate' | 'premium' | null;
  vibe: string | null;
  walkability: 'very_walkable' | 'walkable' | 'somewhat_walkable' | 'car_needed' | null;
  transitEase: 'excellent' | 'good' | 'limited' | 'minimal' | null;
  womenShouldKnow: string[] | null;
  experiencePillars: { title: string; descriptor: string }[] | null;
  howWomenUse: { summary: string; bullets: string[] } | null;
  awareness: { summary: string; bullets: string[] } | null;
  // Place kind (country destinations grouping)
  placeKind: PlaceKind;
  placeKindDescriptor: string | null;
}

export interface CityArea {
  id: string;
  cityId: string;
  slug: string;
  name: string;
  areaKind: 'neighborhood' | 'beach' | 'island' | 'district';
  isPrimary: boolean;
  isActive: boolean;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
  // City page redesign enrichment
  positioningLine: string | null;
  whoItSuits: string | null;
  heroImageUrl: string | null;
  // Area enrichment (Feb 2026)
  vibeDescription: string | null;
  crowdVibe: string | null;
  practicalInfo: Record<string, string> | null;
}

export interface PlaceCategory {
  id: string;
  slug: string;
  name: string;
  parentId: string | null;
  icon: string | null;
  orderIndex: number;
  isActive: boolean;
  createdAt: string;
}

export type PlaceVerificationStatus =
  | 'unverified'
  | 'pending'
  | 'baseline_passed'
  | 'baseline_failed'
  | 'insufficient_data'
  | 'sola_checked';

export interface Place {
  id: string;
  cityId: string;
  cityAreaId: string | null;
  slug: string;
  name: string;
  placeType:
    | 'hotel' | 'hostel' | 'homestay'
    | 'restaurant' | 'cafe' | 'bakery' | 'bar' | 'club' | 'rooftop'
    | 'activity' | 'coworking' | 'landmark' | 'transport' | 'shop'
    | 'wellness' | 'spa' | 'salon' | 'gym'
    | 'laundry' | 'pharmacy' | 'clinic' | 'hospital' | 'atm' | 'police' | 'tour'
    | 'volunteer';
  primaryCategoryId: string | null;
  lat: number | null;
  lng: number | null;
  address: string | null;
  googlePlaceId: string | null;
  phone: string | null;
  website: string | null;
  priceLevel: number | null;
  hoursText: string | null;
  description: string | null;
  isActive: boolean;
  verificationStatus: PlaceVerificationStatus;
  verifiedAt: string | null;
  solaCheckedAt: string | null;
  solaCheckedBy: string | null;
  // Internal curation fields
  curationNotes: string | null;
  curationScore: number | null;
  googleRating: number | null;
  googleReviewCount: number | null;
  discoveredAt: string | null;
  discoveryQuery: string | null;
  // Rich curation data
  whySelected: string | null;
  highlights: string[];
  considerations: string[];
  soloFemaleReviews: string | null;
  googleMapsUrl: string | null;
  originalType: string | null;
  pricePerNight: string | null;
  sourcesChecked: string[];
  // Time-based organization (for city page sections)
  bestTimeOfDay: 'morning' | 'afternoon' | 'evening' | 'any' | null;
  estimatedDuration: string | null;
  bookingInfo: string | null;
  physicalLevel: 'easy' | 'moderate' | 'challenging' | null;
  badgeLabel: string | null;
  isFeatured: boolean;
  // Activity detail structured fields
  pickupIncluded: boolean | null;
  bookAheadText: string | null;
  ourTakeBullets: string[];
  imageUrlCached: string | null;
  // Accommodation detail fields
  womenOnly: boolean;
  positioningSummary: string | null;
  whyWomenChoose: string | null;
  checkInTime: string | null;
  checkOutTime: string | null;
  paymentTypes: string[];
  nearestTransport: string | null;
  locationContext: string | null;
  // Volunteer-specific fields
  volunteerType: string | null;
  minCommitment: string | null;
  volunteerDetails: {
    skillsNeeded?: string[];
    languages?: string[];
    includesAccommodation?: boolean;
    includesMeals?: boolean;
    costNote?: string;
    howToApply?: string;
    whatVolunteersDo?: string;
    email?: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface PlaceMedia {
  id: string;
  placeId: string;
  url: string;
  mediaType: 'image' | 'video';
  caption: string | null;
  source: 'editorial' | 'google' | 'user';
  orderIndex: number;
  createdAt: string;
}

export interface TagGroup {
  id: string;
  slug: string;
  label: string;
  scope: 'global' | 'city' | 'country';
  orderIndex: number;
  isActive: boolean;
  createdAt: string;
}

export interface Tag {
  id: string;
  tagGroupId: string | null;
  slug: string;
  label: string;
  filterGroup: 'vibe' | 'good_for' | 'amenity' | 'safety' | 'cuisine' | 'style' | 'music' | 'physical_level' | 'diet';
  scope: 'global';
  tagType: 'place' | 'profile';
  icon: string | null;
  orderIndex: number;
  isActive: boolean;
  createdAt: string;
}

export interface ProfileTag {
  profileId: string;
  tagSlug: string;
  tagLabel: string;
  tagGroup: string;
  createdAt: string;
}

export interface PlaceTag {
  placeId: string;
  tagId: string;
  weight: number;
  source: 'editorial' | 'model' | 'user';
  createdAt: string;
}

export interface DestinationTag {
  id: string;
  entityType: 'country' | 'city' | 'neighborhood';
  entityId: string;
  tagCategory: string;
  tagSlug: string;
  tagLabel: string;
  orderIndex: number;
  createdAt: string;
}

export interface PlaceSignal {
  id: string;
  userId: string | null;
  placeId: string;
  signalType: 'liked' | 'disliked' | 'visited' | 'rated' | 'hidden';
  rating: number | null;
  note: string | null;
  createdAt: string;
}

export interface Profile {
  id: string;
  username: string | null;
  firstName: string;
  bio: string | null;
  avatarUrl: string | null;
  homeCountryIso2: string;
  homeCountryName: string;
  homeCityId: string | null;
  currentCityId: string | null;
  currentCityName: string | null;
  interests: string[];
  travelStyle: string | null;
  isOnline: boolean;
  locationSharingEnabled: boolean;
  locationLat: number | null;
  locationLng: number | null;
  locationCityName: string | null;
  locationCountryName: string | null;
  locationUpdatedAt: string | null;
  dateOfBirth: string | null;
  nationality: string | null;
  isDiscoverable: boolean;
  preferredCurrency: string;
  preferredLanguage: string;
  verificationStatus: 'unverified' | 'pending' | 'verified' | 'rejected';
  isAdmin: boolean;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  emergencyContactRelationship: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConnectionRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'declined';
  context: string | null;
  message?: string | null;
  createdAt: string;
  respondedAt: string | null;
}

export type ConnectionStatus = 'none' | 'pending_sent' | 'pending_received' | 'connected';

export interface SavedPlace {
  id: string;
  userId: string;
  placeId: string;
  collectionId: string | null;
  createdAt: string;
}

export interface Collection {
  id: string;
  userId: string;
  name: string;
  emoji: string;
  isPublic: boolean;
  createdAt: string;
}

/**
 * @deprecated Use Country or City interfaces directly instead.
 * Content fields have been merged into the countries and cities tables.
 * This interface will be removed once the geo_content table is dropped.
 */
export interface GeoContent {
  id: string;
  scope: 'country' | 'city';
  countryId: string | null;
  cityId: string | null;
  title: string;
  subtitle: string | null;
  summary: string | null;
  contentMd: string | null;
  heroImageUrl: string | null;
  safetyRating: 'very_safe' | 'generally_safe' | 'use_caution' | 'exercise_caution';
  soloFriendly: boolean;
  bestMonths: string | null;
  currency: string | null;
  language: string | null;
  visaNote: string | null;
  highlights: string[];
  internetQuality: 'excellent' | 'good' | 'fair' | 'poor' | null;
  englishFriendliness: 'high' | 'moderate' | 'low' | null;
  soloLevel: 'beginner' | 'intermediate' | 'expert' | null;
  goodForInterests: string[];
  gettingThereMd: string | null;
  visaEntryMd: string | null;
  simConnectivityMd: string | null;
  moneyMd: string | null;
  cultureEtiquetteMd: string | null;
  safetyWomenMd: string | null;
  transportMd: string | null;
  topThingsToDo: string[];
  portraitMd: string | null;
  bestFor: string | null;
  updatedBy: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Trip {
  id: string;
  userId: string;
  destinationCityId: string;
  destinationName: string;
  countryIso2: string;
  arriving: string;
  leaving: string;
  nights: number;
  status: 'planned' | 'active' | 'completed';
  notes: string | null;
  createdAt: string;
}

export interface CityEvent {
  id: string;
  cityId: string;
  name: string;
  slug: string;
  eventType: 'festival' | 'holiday' | 'seasonal' | 'parade' | 'conference' | 'sports';
  description: string | null;
  soloTip: string | null;
  startMonth: number;
  endMonth: number;
  specificDates: string | null;
  recurrence: 'annual' | 'one_time';
  year: number | null;
  heroImageUrl: string | null;
  websiteUrl: string | null;
  isFree: boolean;
  crowdLevel: 'low' | 'moderate' | 'high' | null;
  isActive: boolean;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface CityEventWithLocation extends CityEvent {
  cityName: string;
  citySlug: string;
  countryName: string;
  countrySlug: string;
  countryId: string;
}

export interface TripPlace {
  tripId: string;
  placeId: string;
  dayNumber: number | null;
  notes: string | null;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  sentAt: string;
  readAt: string | null;
  isDeleted?: boolean;
}

// ---------------------------------------------------------------------------
// Verification System Types
// ---------------------------------------------------------------------------

export interface PendingVerification {
  id: string;
  firstName: string;
  avatarUrl: string | null;
  verificationSelfieUrl: string;
  verificationSubmittedAt: string;
}

export interface PlaceVerification {
  id: string;
  placeId: string;
  status: PlaceVerificationStatus;
  sourcesChecked: { source: string; url?: string; checkedAt: string }[];
  rawFindings: Record<string, unknown>;
  confidenceScore: number | null;
  createdAt: string;
}

export interface PlaceVerificationSignal {
  id: string;
  placeId: string;
  signalKey: string;
  signalValue: string | null;
  signalType: 'boolean' | 'text' | 'category';
  confidence: number | null;
  source: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PlaceSolaNote {
  id: string;
  placeId: string;
  noteType: 'highlight' | 'context' | 'consideration';
  noteText: string;
  displayContext: string | null;
  orderIndex: number;
  createdAt: string;
}

export interface PlaceWithCity extends Place {
  cityName: string;
  imageUrl: string | null;
}

// ---------------------------------------------------------------------------
// Utility Types
// ---------------------------------------------------------------------------

export interface PaginatedResult<T> {
  data: T[];
  hasMore: boolean;
}

// ---------------------------------------------------------------------------
// Explore Collections (Editorial)
// ---------------------------------------------------------------------------

export interface ExploreCollection {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  introMd: string | null;
  heroImageUrl: string | null;
  badgeLabel: string | null;
  includeTags: string[];
  excludeTags: string[];
  entityTypes: ('country' | 'city' | 'neighborhood')[];
  minItems: number;
  maxItems: number;
  sortBy: 'order_index' | 'name' | 'random' | 'featured_first';
  orderIndex: number;
  isActive: boolean;
  isFeatured: boolean;
  isSponsored: boolean;
  sponsorName: string | null;
  sponsorLogoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExploreCollectionItem {
  collectionId: string;
  collectionSlug: string;
  entityType: 'country' | 'city' | 'neighborhood';
  entityId: string;
  entityName: string;
  entitySlug: string;
  entityImageUrl: string | null;
  isFeatured: boolean;
  orderIndex: number;
}

export interface ExploreCollectionWithItems extends ExploreCollection {
  items: ExploreCollectionItem[];
}

// ---------------------------------------------------------------------------
// Discovery Lenses (Women-First)
// ---------------------------------------------------------------------------

export interface DiscoveryLens {
  id: string;
  slug: string;
  title: string;
  helperText: string | null;
  iconName: string;
  introMd: string | null;
  includeTags: string[];
  excludeTags: string[];
  entityTypes: ('country' | 'city' | 'neighborhood')[];
  sortBy: string;
  maxItems: number;
  orderIndex: number;
  isActive: boolean;
  isSponsored: boolean;
  sponsorName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DiscoveryLensWithResults extends DiscoveryLens {
  results: ExploreCollectionItem[];
}
