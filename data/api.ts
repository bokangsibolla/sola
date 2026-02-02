/**
 * API query layer — the single import point for all screens.
 * Currently reads from mock data; when Supabase is wired up only this file changes.
 */

import type {
  Country,
  City,
  CityArea,
  Place,
  PlaceMedia,
  PlaceCategory,
  Tag,
  GeoContent,
  Profile,
  SavedPlace,
  Collection,
  Trip,
  Conversation,
  Message,
} from './types';

import { mockCountries } from './mock/countries';
import { mockCities } from './mock/cities';
import { mockCityAreas } from './mock/cityAreas';
import { mockPlaces } from './mock/places';
import { mockPlaceMedia } from './mock/placeMedia';
import { mockPlaceCategories } from './mock/placeCategories';
import { mockTags, mockTagGroups } from './mock/tags';
import { mockPlaceTags } from './mock/placeTags';
import { mockProfiles } from './mock/profiles';
import { mockSavedPlaces } from './mock/savedPlaces';
import { mockGeoContent } from './mock/geoContent';
import { mockTripsV2 } from './mock/trips';
import { mockCollectionsV2 } from './mock/collections';
import { mockConversationsV2, mockMessagesV2 } from './mock/messages';

// ---------------------------------------------------------------------------
// Mutable state (saved places — will be replaced by Supabase mutations)
// ---------------------------------------------------------------------------
let savedPlaces: SavedPlace[] = [...mockSavedPlaces];

// ---------------------------------------------------------------------------
// Geography
// ---------------------------------------------------------------------------

export function getCountries(): Country[] {
  return mockCountries
    .filter((c) => c.isActive)
    .sort((a, b) => a.orderIndex - b.orderIndex);
}

export function getCountryBySlug(slug: string): Country | undefined {
  return mockCountries.find((c) => c.slug === slug);
}

export function getCountryByIso2(iso2: string): Country | undefined {
  return mockCountries.find((c) => c.iso2 === iso2);
}

export function getCitiesByCountry(countryId: string): City[] {
  return mockCities
    .filter((c) => c.countryId === countryId && c.isActive)
    .sort((a, b) => a.orderIndex - b.orderIndex);
}

export function getCityBySlug(slug: string): City | undefined {
  return mockCities.find((c) => c.slug === slug);
}

export function getCityById(id: string): City | undefined {
  return mockCities.find((c) => c.id === id);
}

export function getAreasByCity(cityId: string): CityArea[] {
  return mockCityAreas
    .filter((a) => a.cityId === cityId && a.isActive)
    .sort((a, b) => a.orderIndex - b.orderIndex);
}

// ---------------------------------------------------------------------------
// Places
// ---------------------------------------------------------------------------

export function getPlacesByCity(cityId: string): Place[] {
  return mockPlaces.filter((p) => p.cityId === cityId && p.isActive);
}

export function getPlacesByCityAndType(
  cityId: string,
  placeType: Place['placeType'],
): Place[] {
  return mockPlaces.filter(
    (p) => p.cityId === cityId && p.placeType === placeType && p.isActive,
  );
}

export function getPlacesByArea(cityAreaId: string): Place[] {
  return mockPlaces.filter(
    (p) => p.cityAreaId === cityAreaId && p.isActive,
  );
}

export function getPlaceById(id: string): Place | undefined {
  return mockPlaces.find((p) => p.id === id);
}

export function getPlaceBySlug(slug: string): Place | undefined {
  return mockPlaces.find((p) => p.slug === slug);
}

export function getPlaceMedia(placeId: string): PlaceMedia[] {
  return mockPlaceMedia
    .filter((m) => m.placeId === placeId)
    .sort((a, b) => a.orderIndex - b.orderIndex);
}

export function getPlaceFirstImage(placeId: string): string | null {
  const media = mockPlaceMedia
    .filter((m) => m.placeId === placeId && m.mediaType === 'image')
    .sort((a, b) => a.orderIndex - b.orderIndex);
  return media.length > 0 ? media[0].url : null;
}

export function getPlaceTags(placeId: string): Tag[] {
  const tagIds = mockPlaceTags
    .filter((pt) => pt.placeId === placeId)
    .map((pt) => pt.tagId);
  return mockTags.filter((t) => tagIds.includes(t.id));
}

export function getCategory(categoryId: string): PlaceCategory | undefined {
  return mockPlaceCategories.find((c) => c.id === categoryId);
}

export function getCategories(): PlaceCategory[] {
  return mockPlaceCategories
    .filter((c) => c.isActive)
    .sort((a, b) => a.orderIndex - b.orderIndex);
}

// ---------------------------------------------------------------------------
// Geo Content
// ---------------------------------------------------------------------------

export function getCountryContent(countryId: string): GeoContent | undefined {
  return mockGeoContent.find(
    (gc) => gc.scope === 'country' && gc.countryId === countryId,
  );
}

export function getCityContent(cityId: string): GeoContent | undefined {
  return mockGeoContent.find(
    (gc) => gc.scope === 'city' && gc.cityId === cityId,
  );
}

// ---------------------------------------------------------------------------
// Profiles
// ---------------------------------------------------------------------------

export function getProfiles(): Profile[] {
  return mockProfiles;
}

export function getProfileById(id: string): Profile | undefined {
  return mockProfiles.find((p) => p.id === id);
}

// ---------------------------------------------------------------------------
// Saved Places (mutable in-memory)
// ---------------------------------------------------------------------------

export function getSavedPlaces(userId: string): SavedPlace[] {
  return savedPlaces.filter((sp) => sp.userId === userId);
}

export function isPlaceSaved(userId: string, placeId: string): boolean {
  return savedPlaces.some(
    (sp) => sp.userId === userId && sp.placeId === placeId,
  );
}

export function toggleSavePlace(
  userId: string,
  placeId: string,
  collectionId?: string,
): boolean {
  const idx = savedPlaces.findIndex(
    (sp) => sp.userId === userId && sp.placeId === placeId,
  );
  if (idx >= 0) {
    savedPlaces.splice(idx, 1);
    return false; // unsaved
  }
  savedPlaces.push({
    id: `sp-${Date.now()}`,
    userId,
    placeId,
    collectionId: collectionId ?? null,
    createdAt: new Date().toISOString(),
  });
  return true; // saved
}

// ---------------------------------------------------------------------------
// Collections
// ---------------------------------------------------------------------------

export function getCollections(userId: string): Collection[] {
  return mockCollectionsV2.filter((c) => c.userId === userId);
}

export function getCollectionById(id: string): Collection | undefined {
  return mockCollectionsV2.find((c) => c.id === id);
}

export function getCollectionPlaces(
  collectionId: string,
  userId: string,
): Place[] {
  const placeIds = savedPlaces
    .filter((sp) => sp.userId === userId && sp.collectionId === collectionId)
    .map((sp) => sp.placeId);
  return mockPlaces.filter((p) => placeIds.includes(p.id));
}

// ---------------------------------------------------------------------------
// Trips
// ---------------------------------------------------------------------------

export function getTrips(userId: string): Trip[] {
  return mockTripsV2.filter((t) => t.userId === userId);
}

export function getTripById(id: string): Trip | undefined {
  return mockTripsV2.find((t) => t.id === id);
}

// ---------------------------------------------------------------------------
// Messages
// ---------------------------------------------------------------------------

export function getConversations(): Conversation[] {
  return [...mockConversationsV2].sort(
    (a, b) =>
      new Date(b.lastMessageAt).getTime() -
      new Date(a.lastMessageAt).getTime(),
  );
}

export function getMessages(conversationId: string): Message[] {
  return mockMessagesV2
    .filter((m) => m.conversationId === conversationId)
    .sort(
      (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime(),
    );
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

interface DestinationResult {
  type: 'country' | 'city';
  id: string;
  name: string;
  slug: string;
  /** Country name for cities, null for countries */
  parentName: string | null;
}

export function searchDestinations(query: string): DestinationResult[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const results: DestinationResult[] = [];

  for (const country of mockCountries) {
    if (country.isActive && country.name.toLowerCase().includes(q)) {
      results.push({
        type: 'country',
        id: country.id,
        name: country.name,
        slug: country.slug,
        parentName: null,
      });
    }
  }

  for (const city of mockCities) {
    if (city.isActive && city.name.toLowerCase().includes(q)) {
      const country = mockCountries.find((c) => c.id === city.countryId);
      results.push({
        type: 'city',
        id: city.id,
        name: city.name,
        slug: city.slug,
        parentName: country?.name ?? null,
      });
    }
  }

  return results.slice(0, 10);
}

export function searchPlaces(query: string, cityId?: string): Place[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  return mockPlaces.filter((p) => {
    if (!p.isActive) return false;
    if (cityId && p.cityId !== cityId) return false;
    const inName = p.name.toLowerCase().includes(q);
    const inDesc = p.description?.toLowerCase().includes(q) ?? false;
    return inName || inDesc;
  });
}
