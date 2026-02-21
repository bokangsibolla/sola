import React from 'react';
import { Dimensions, FlatList, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { spacing } from '@/constants/design';
import { SectionHeader } from './SectionHeader';
import { DestinationCard } from './DestinationCard';
import type { PersonalizedCity } from '@/data/home/types';

interface DestinationCarouselProps {
  cities: PersonalizedCity[];
  title?: string;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_GAP = spacing.md;
const CARD_WIDTH = Math.round(SCREEN_WIDTH * 0.42);

export function DestinationCarousel({ cities, title }: DestinationCarouselProps) {
  const router = useRouter();

  if (cities.length === 0) return null;

  return (
    <View style={styles.container}>
      <SectionHeader
        title={title ?? 'Go Anywhere'}
        onSeeAll={() => router.push('/discover/browse' as any)}
      />
      <FlatList
        data={cities}
        keyExtractor={(item) => item.cityId}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <DestinationCard city={item} width={CARD_WIDTH} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xxl,
  },
  listContent: {
    paddingHorizontal: spacing.screenX,
    gap: CARD_GAP,
  },
});
