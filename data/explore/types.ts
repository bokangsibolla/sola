// data/explore/types.ts
import type { Country, City, Place, ExploreCollectionWithItems } from '../types';

export interface CityWithCountry extends City {
  countryName: string;
  countrySlug: string;
}

export interface ActivityWithCity extends Place {
  cityName: string;
  imageUrl: string | null;
}

export type FeedItem =
  | { type: 'editorial-collection'; data: ExploreCollectionWithItems }
  | { type: 'quick-actions' }
  | { type: 'country-pair'; data: [Country, Country] }
  | { type: 'city-spotlight'; data: CityWithCountry; activities: ActivityWithCity[] }
  | { type: 'activity-cluster'; data: ActivityWithCity[]; cityName: string; citySlug: string }
  | { type: 'end-card' };

export type FeedItemType = FeedItem['type'];
