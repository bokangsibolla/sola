// data/explore/feedBuilder.ts
import type { ExploreCollectionWithItems, DiscoveryLens } from '../types';
import type {
  FeedItem,
  CityWithCountry,
} from './types';

/**
 * Build the Explore feed with a city-first, women-first structure.
 *
 * Layout:
 *   1. Hero grid (collection hero + 2 city cards)
 *   2. Search bar (mid-page break)
 *   3. City pair — first pair gets "POPULAR WITH SOLO WOMEN" label
 *   4. Interleaved: spotlights, collections, city pairs (no label)
 *   5. Remaining collections
 *   6. Remaining city spotlights
 *   7. Quick actions
 *   8. Meet travellers
 *   9. End card
 *
 * Max 4 city pairs shown. Rest as spotlights.
 */
export function buildFeed(
  collections: ExploreCollectionWithItems[],
  cities: CityWithCountry[],
  _lenses: DiscoveryLens[] = [],
): FeedItem[] {
  const feed: FeedItem[] = [];
  let ci = 0; // collection index
  let si = 0; // city index
  const MAX_CITY_PAIRS = 4;
  let pairsShown = 0;

  // --- Hero grid (collection hero + 2 city cards) ---
  const heroCollection = ci < collections.length ? collections[ci++] : null;
  const heroCity1 = si < cities.length ? cities[si++] : null;
  const heroCity2 = si < cities.length ? cities[si++] : null;
  if (heroCity1) {
    feed.push({
      type: 'hero-grid',
      data: { collection: heroCollection, city1: heroCity1, city2: heroCity2 },
    });
  }

  // --- Search bar (mid-page visual break) ---
  feed.push({ type: 'search-bar' });

  // --- First city pair with women-first label ---
  if (si + 1 < cities.length && pairsShown < MAX_CITY_PAIRS) {
    feed.push({
      type: 'city-pair',
      data: [cities[si], cities[si + 1]],
      sectionLabel: 'POPULAR WITH SOLO WOMEN',
    });
    si += 2;
    pairsShown++;
  }

  // --- Interleave: spotlight, collection, city pair ---
  while (
    pairsShown < MAX_CITY_PAIRS &&
    (ci < collections.length || si + 1 < cities.length)
  ) {
    // City spotlight
    if (si < cities.length) {
      feed.push({ type: 'city-spotlight', data: cities[si++], activities: [] });
    }

    // Editorial collection (sponsorship slot)
    if (ci < collections.length) {
      feed.push({ type: 'editorial-collection', data: collections[ci++] });
    }

    // City pair (no label after first)
    if (si + 1 < cities.length && pairsShown < MAX_CITY_PAIRS) {
      feed.push({
        type: 'city-pair',
        data: [cities[si], cities[si + 1]],
      });
      si += 2;
      pairsShown++;
    }
  }

  // --- Remaining editorial collections ---
  while (ci < collections.length) {
    feed.push({ type: 'editorial-collection', data: collections[ci++] });
  }

  // --- Remaining city spotlights ---
  while (si < cities.length) {
    feed.push({ type: 'city-spotlight', data: cities[si++], activities: [] });
  }

  // --- Quick actions (bottom) ---
  feed.push({ type: 'quick-actions' });

  // --- Meet travellers ---
  feed.push({ type: 'meet-travellers' });

  // --- End card ---
  feed.push({ type: 'end-card' });

  return feed;
}
