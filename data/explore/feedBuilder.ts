// data/explore/feedBuilder.ts
import type { Country, ExploreCollectionWithItems } from '../types';
import type {
  FeedItem,
  CityWithCountry,
  ActivityWithCity,
} from './types';

/**
 * Build the Explore feed with rhythmic content interleaving.
 * Pattern: Editorial → Country pair → City spotlight → Activities → Editorial...
 */
export function buildFeed(
  collections: ExploreCollectionWithItems[],
  countries: Country[],
  citiesWithActivities: { city: CityWithCountry; activities: ActivityWithCity[] }[]
): FeedItem[] {
  const feed: FeedItem[] = [];

  let collectionIndex = 0;
  let countryIndex = 0;
  let cityIndex = 0;
  let beat = 0;

  // Build ~15-20 items following the rhythm
  const maxItems = 18;

  while (feed.length < maxItems) {
    const beatPosition = beat % 5;
    beat++;

    switch (beatPosition) {
      case 0: // Editorial collection
        if (collectionIndex < collections.length) {
          feed.push({
            type: 'editorial-collection',
            data: collections[collectionIndex++],
          });
        }
        break;

      case 1: // Country pair
        if (countryIndex + 1 < countries.length) {
          feed.push({
            type: 'country-pair',
            data: [countries[countryIndex], countries[countryIndex + 1]],
          });
          countryIndex += 2;
        }
        break;

      case 2: // City spotlight
        if (cityIndex < citiesWithActivities.length) {
          const { city, activities } = citiesWithActivities[cityIndex];
          feed.push({
            type: 'city-spotlight',
            data: city,
            activities: activities.slice(0, 4),
          });
          cityIndex++;
        }
        break;

      case 3: // Activity cluster (from next city)
        if (cityIndex < citiesWithActivities.length) {
          const { city, activities } = citiesWithActivities[cityIndex];
          if (activities.length > 0) {
            feed.push({
              type: 'activity-cluster',
              data: activities.slice(0, 4),
              cityName: city.name,
              citySlug: city.slug,
            });
          }
          cityIndex++;
        }
        break;

      case 4: // Another editorial or skip
        if (collectionIndex < collections.length) {
          feed.push({
            type: 'editorial-collection',
            data: collections[collectionIndex++],
          });
        }
        break;
    }

    // Safety: if we can't add anything, break
    if (
      collectionIndex >= collections.length &&
      countryIndex >= countries.length &&
      cityIndex >= citiesWithActivities.length
    ) {
      break;
    }
  }

  // Add end card
  feed.push({ type: 'end-card' });

  return feed;
}
