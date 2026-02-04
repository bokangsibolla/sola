// components/explore/FeedItem.tsx
import { useRouter } from 'expo-router';
import { EditorialCollectionCard } from './cards';
import {
  CountryPairSection,
  CitySpotlightSection,
  ActivityClusterSection
} from './sections';
import { FeedEndCard } from './FeedEndCard';
import type { FeedItem as FeedItemType } from '@/data/explore/types';

interface FeedItemProps {
  item: FeedItemType;
}

export function FeedItem({ item }: FeedItemProps) {
  const router = useRouter();

  switch (item.type) {
    case 'editorial-collection':
      return (
        <EditorialCollectionCard
          collection={item.data}
          onPress={() => {
            router.push({
              pathname: '/(tabs)/explore/collection/[slug]',
              params: { slug: item.data.slug },
            });
          }}
        />
      );

    case 'country-pair':
      return <CountryPairSection countries={item.data} />;

    case 'city-spotlight':
      return (
        <CitySpotlightSection
          city={item.data}
          activities={item.activities}
        />
      );

    case 'activity-cluster':
      return (
        <ActivityClusterSection
          activities={item.data}
          cityName={item.cityName}
          citySlug={item.citySlug}
        />
      );

    case 'end-card':
      return <FeedEndCard />;

    default:
      return null;
  }
}
