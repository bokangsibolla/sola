// data/explore/types.ts
import type { Country, City, Place } from '../types';

export interface EditorialCollection {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  heroImageUrl: string;
  destinations: EditorialDestination[];
  isSponsored: boolean;
  sponsorName: string | null;
  orderIndex: number;
}

export interface EditorialDestination {
  type: 'country' | 'city';
  id: string;
  name: string;
  imageUrl: string | null;
}

export interface CityWithCountry extends City {
  countryName: string;
  countrySlug: string;
}

export interface ActivityWithCity extends Place {
  cityName: string;
  imageUrl: string | null;
}

export type FeedItem =
  | { type: 'editorial-collection'; data: EditorialCollection }
  | { type: 'country-pair'; data: [Country, Country] }
  | { type: 'city-spotlight'; data: CityWithCountry; activities: ActivityWithCity[] }
  | { type: 'activity-cluster'; data: ActivityWithCity[]; cityName: string; citySlug: string }
  | { type: 'end-card' };

export type FeedItemType = FeedItem['type'];
