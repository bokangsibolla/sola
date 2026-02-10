// data/explore/feedBuilder.ts
import type { ExploreCollectionWithItems, Place } from '../types';
import type { Country } from '../types';
import type { FeedItem, CityWithCountry } from './types';

/**
 * Build the explore feed as distinct zones.
 *
 * The IntentHero component now handles above-the-fold orientation,
 * so the feed starts with browse content, not a featured collection.
 *
 * Order:
 * 1. Countries grid (destination browsing)
 * 2. Popular cities (horizontal scroll)
 * 3. Collections section (all active collections together)
 * 4. Community signal
 */
export function buildFeed(
  collections: ExploreCollectionWithItems[],
  cities: CityWithCountry[],
  countries: Country[],
): FeedItem[] {
  const feed: FeedItem[] = [];

  // Zone 1: Countries grid — primary browse entry
  if (countries.length > 0) {
    feed.push({ type: 'countries-grid', data: countries });
  }

  // Zone 2: Popular cities — date-seeded shuffle within featured
  if (cities.length > 0) {
    const shuffled = shuffleCitiesByDate(cities);
    feed.push({ type: 'popular-cities', data: shuffled });
  }

  // Zone 3: All collections together — shown after intent is established
  if (collections.length > 0) {
    feed.push({ type: 'collections-section', data: collections });
  }

  // Zone 4: Community signal
  feed.push({ type: 'community-signal' });

  return feed;
}

/**
 * Build the explore feed for travelling mode.
 * Prepends city-specific content (saved places, all places, safety info)
 * before the normal discover feed.
 */
export function buildTravellingFeed(
  savedPlacesInCity: Place[],
  allPlacesInCity: Place[],
  countryIso2: string,
  cityName: string,
  collections: ExploreCollectionWithItems[],
  cities: CityWithCountry[],
  countries: Country[],
): FeedItem[] {
  const feed: FeedItem[] = [];

  if (savedPlacesInCity.length > 0) {
    feed.push({ type: 'saved-in-city', data: { cityName, places: savedPlacesInCity } });
  }

  if (allPlacesInCity.length > 0) {
    const savedIds = new Set(savedPlacesInCity.map((p) => p.id));
    const unsaved = allPlacesInCity.filter((p) => !savedIds.has(p.id));
    if (unsaved.length > 0) {
      feed.push({ type: 'places-in-city', data: { cityName, places: unsaved } });
    }
  }

  if (countryIso2) {
    feed.push({ type: 'know-before-you-go', data: { countryIso2 } });
  }

  // Append the normal discover feed below
  const normalFeed = buildFeed(collections, cities, countries);
  feed.push(...normalFeed);

  return feed;
}

/**
 * Shuffle cities with a date-based seed so order changes daily
 * but stays stable within a single day.
 */
function shuffleCitiesByDate(cities: CityWithCountry[]): CityWithCountry[] {
  const dateStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const seed = hashString(dateStr);

  // Separate featured from non-featured
  const featured = cities.filter(c => c.isFeatured);
  const rest = cities.filter(c => !c.isFeatured);

  // Shuffle featured cities with date seed
  const shuffledFeatured = seededShuffle(featured, seed);

  return [...shuffledFeatured, ...rest];
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32-bit int
  }
  return Math.abs(hash);
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  let s = seed;
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
