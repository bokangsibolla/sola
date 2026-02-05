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
  | { type: 'search-bar' }
  | { type: 'hero-grid'; data: { collection: ExploreCollectionWithItems | null; city1: CityWithCountry; city2: CityWithCountry | null } }
  | { type: 'editorial-collection'; data: ExploreCollectionWithItems }
  | { type: 'discovery-lenses'; data: DiscoveryLens[] }
  | { type: 'quick-actions' }
  | { type: 'city-pair'; data: [CityWithCountry, CityWithCountry]; sectionLabel?: string }
  | { type: 'city-spotlight'; data: CityWithCountry; activities: ActivityWithCity[] }
  | { type: 'activity-cluster'; data: ActivityWithCity[]; cityName: string; citySlug: string }
  | { type: 'meet-travellers' }
  | { type: 'end-card' };

export type FeedItemType = FeedItem['type'];
