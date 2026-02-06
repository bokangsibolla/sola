// data/explore/feedBuilder.ts
import type { ExploreCollectionWithItems, DiscoveryLens } from '../types';
import type {
  FeedItem,
  CityWithCountry,
} from './types';

/**
 * Build the Explore feed with a search-first, women-first structure.
 *
 * Layout:
 *   1. Search bar (always first — primary entry point)
 *   2. Featured collection (one editorial, data-driven — inspiration above the fold)
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

  // --- Search bar (always first) ---
  feed.push({ type: 'search-bar' });

  // --- Featured collection (one editorial above the fold) ---
  if (ci < collections.length) {
    feed.push({ type: 'featured-collection', data: collections[ci++] });
  }

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
