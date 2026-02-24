import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { colors, fonts, spacing } from '@/constants/design';
import { useWishlist } from '@/data/wishlist/useWishlist';
import { WishlistCard } from './WishlistCard';
import type { WishlistItemWithData } from '@/data/wishlist/types';

const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_GAP = spacing.md;
const CARD_WIDTH = (SCREEN_WIDTH - spacing.screenX * 2 - GRID_GAP) / 2;

export const WishlistGrid: React.FC = () => {
  const { cities, countries, loading } = useWishlist();

  // Combine cities and countries, excluding individual places
  const destinations = [...cities, ...countries];

  if (loading || destinations.length === 0) return null;

  const handlePlanTrip = (item: WishlistItemWithData) => {
    router.push({
      pathname: '/(tabs)/trips/new',
      params: {
        prefillType: item.entityType,
        prefillId: item.entityId,
        prefillName: item.name,
        prefillCountry: item.countryIso2 ?? '',
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>PLACES I WANT TO GO</Text>

      <View style={styles.grid}>
        {destinations.map((item) => (
          <WishlistCard
            key={item.id}
            item={item}
            onPlanTrip={handlePlanTrip}
            width={CARD_WIDTH}
          />
        ))}
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.screenX,
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
  },
});
