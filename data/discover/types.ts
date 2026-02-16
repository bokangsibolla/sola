export type ContinentKey = 'africa' | 'asia' | 'europe' | 'latin_america' | 'middle_east' | 'oceania';

export interface RecommendedCity {
  cityId: string;
  cityName: string;
  citySlug: string;
  countryName: string;
  countrySlug: string;
  heroImageUrl: string;
  soloLevel: string | null;
  safetyRating: string | null;
  planningCount: number;
  finalScore: number;
}

export interface BrowseCountry {
  id: string;
  name: string;
  slug: string;
  continent: ContinentKey;
  heroImageUrl: string | null;
  cities: { id: string; name: string; slug: string }[];
}

export const CONTINENT_LABELS: Record<ContinentKey, string> = {
  africa: 'Africa',
  asia: 'Asia',
  europe: 'Europe',
  latin_america: 'Latin America',
  middle_east: 'Middle East',
  oceania: 'Oceania',
};

export const CONTINENT_ORDER: ContinentKey[] = [
  'africa', 'asia', 'europe', 'latin_america', 'middle_east', 'oceania',
];
