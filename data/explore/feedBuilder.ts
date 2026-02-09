// data/explore/feedBuilder.ts
import type { ExploreCollectionWithItems } from '../types';
import type { Country } from '../types';
import type { FeedItem, CityWithCountry } from './types';

/**
 * Build the explore feed as distinct zones:
 * 1. Featured editorial (one rotating collection)
 * 2. Countries grid (all countries)
 * 3. Popular cities (horizontal scroll)
 * 4. Collections section (all active collections)
 * 5. Community signal
 */
export function buildFeed(
  collections: ExploreCollectionWithItems[],
  cities: CityWithCountry[],
  countries: Country[],
): FeedItem[] {
  const feed: FeedItem[] = [];

  // Zone 2: Featured editorial — rotate by day of week
  if (collections.length > 0) {
    const dayIndex = new Date().getDay(); // 0-6
    const featured = collections[dayIndex % collections.length];
    feed.push({ type: 'featured-collection', data: featured });
  }

  // Zone 3: Countries grid
  if (countries.length > 0) {
    feed.push({ type: 'countries-grid', data: countries });
  }

  // Zone 4: Popular cities — date-seeded shuffle within featured
  if (cities.length > 0) {
    const shuffled = shuffleCitiesByDate(cities);
    feed.push({ type: 'popular-cities', data: shuffled });
  }

  // Zone 5: Collections section (all collections, not just the featured one)
  if (collections.length > 1) {
    // Exclude the one already shown as featured
    const dayIndex = new Date().getDay();
    const featuredIndex = dayIndex % collections.length;
    const remaining = collections.filter((_, i) => i !== featuredIndex);
    feed.push({ type: 'collections-section', data: remaining });
  }

  // Zone 6: Community signal
  feed.push({ type: 'community-signal' });

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
