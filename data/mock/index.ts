// Legacy exports (kept for backward compatibility until Task 17 cleanup)
export { mockUsers, type User } from './users';
export { mockTrips } from './trips';
export { mockConversations, mockMessages } from './messages';
export { mockCountryGuides, type CountryGuide, type CityGuide, type PlaceEntry } from './guides';
export { mockCollections } from './collections';

// ─── New normalized data ──────────────────────────────────────
export { mockCountries } from './countries';
export { mockCities } from './cities';
export { mockCityAreas } from './cityAreas';
export { mockPlaceCategories } from './placeCategories';
export { mockPlaces } from './places';
export { mockPlaceMedia } from './placeMedia';
export { mockTagGroups, mockTags } from './tags';
export { mockPlaceTags } from './placeTags';
export { mockPlaceSignals } from './placeSignals';
export { mockProfiles } from './profiles';
export { mockSavedPlaces } from './savedPlaces';
export { mockGeoContent } from './geoContent';

// V2 versions of restructured data
export { mockTripsV2 } from './trips';
export { mockCollectionsV2 } from './collections';
export { mockConversationsV2, mockMessagesV2 } from './messages';

// Re-export all types from the canonical location
export type {
  Country,
  City,
  CityArea,
  PlaceCategory,
  Place,
  PlaceMedia,
  TagGroup,
  Tag,
  PlaceTag,
  PlaceSignal,
  Profile,
  SavedPlace,
  Collection,
  GeoContent,
  Trip,
  TripPlace,
  Conversation,
  Message,
} from '../types';
