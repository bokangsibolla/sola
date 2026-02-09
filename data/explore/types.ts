// data/explore/types.ts
import type { Country, City, Place, ExploreCollectionWithItems, DiscoveryLens } from '../types';

export interface CityWithCountry extends City {
  countryName: string;
  countrySlug: string;
}

export interface ActivityWithCity extends Place {
  cityName: string;
  imageUrl: string | null;
}

export type FeedItem =
  | { type: 'featured-collection'; data: ExploreCollectionWithItems }
  | { type: 'countries-grid'; data: Country[] }
  | { type: 'popular-cities'; data: CityWithCountry[] }
  | { type: 'collections-section'; data: ExploreCollectionWithItems[] }
  | { type: 'community-signal' }
  // Keep these for potential future use but they won't be emitted by the new builder:
  | { type: 'section-header'; data: { title: string; subtitle?: string; variant: 'default' | 'editorial' } }
  | { type: 'editorial-collection'; data: ExploreCollectionWithItems }
  | { type: 'city-pair'; data: [CityWithCountry, CityWithCountry]; sectionLabel?: string }
  | { type: 'city-spotlight'; data: CityWithCountry; activities: ActivityWithCity[] };

export type FeedItemType = FeedItem['type'];
