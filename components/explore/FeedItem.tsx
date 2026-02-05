// components/explore/FeedItem.tsx
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { EditorialCollectionCard } from './cards';
import {
  CitySpotlightSection,
  ActivityClusterSection
} from './sections';
import { FeedEndCard } from './FeedEndCard';
import type { FeedItem as FeedItemType } from '@/data/explore/types';
import type { CityWithCountry } from '@/data/explore/types';
import { spacing } from '@/constants/design';

interface FeedItemProps {
  item: FeedItemType;
}

function CityPairInline({ cities }: { cities: [CityWithCountry, CityWithCountry] }) {
  const router = useRouter();
  return (
    <View style={inlineStyles.pairRow}>
      <CitySpotlightSection
        city={cities[0]}
        activities={[]}
      />
      <CitySpotlightSection
        city={cities[1]}
        activities={[]}
      />
    </View>
  );
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

    case 'city-pair':
      return <CityPairInline cities={item.data} />;

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

const inlineStyles = StyleSheet.create({
  pairRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.screenX,
    gap: spacing.md,
  },
});
