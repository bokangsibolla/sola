// app/(tabs)/explore/see-all.tsx
import { useCallback, useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { colors, fonts, radius, spacing } from '@/constants/design';
import {
  mockCountries,
  getCountriesByContinent,
  getCitiesByCategory,
  getActivitiesByCategory,
  getTopRatedActivities,
  MockCountry,
  MockCity,
  MockActivity,
} from '@/data/exploreMockData';

type ListItem = MockCountry | MockCity | MockActivity;

export default function SeeAllScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ category: string; title: string }>();

  const { items, itemType } = useMemo(() => {
    const category = params.category || '';

    // Countries
    if (category === 'all-countries') {
      return { items: mockCountries, itemType: 'country' as const };
    }
    if (category.startsWith('continent-')) {
      const continent = category.replace('continent-', '') as MockCountry['continent'];
      return { items: getCountriesByContinent(continent), itemType: 'country' as const };
    }

    // Cities
    if (category.startsWith('cities-')) {
      const cityCategory = category.replace('cities-', '') as MockCity['category'];
      return { items: getCitiesByCategory(cityCategory), itemType: 'city' as const };
    }

    // Activities
    if (category === 'activities-top') {
      return { items: getTopRatedActivities(20), itemType: 'activity' as const };
    }
    if (category.startsWith('activities-')) {
      const activityCategory = category.replace('activities-', '') as MockActivity['category'];
      return { items: getActivitiesByCategory(activityCategory), itemType: 'activity' as const };
    }

    return { items: [], itemType: 'country' as const };
  }, [params.category]);

  const handleItemPress = useCallback((item: ListItem, type: string) => {
    switch (type) {
      case 'country':
        router.push(`/(tabs)/explore/country/${(item as MockCountry).slug}` as any);
        break;
      case 'city':
        router.push(`/(tabs)/explore/city/${(item as MockCity).slug}` as any);
        break;
      case 'activity':
        router.push(`/(tabs)/explore/activity/${(item as MockActivity).slug}` as any);
        break;
    }
  }, [router]);

  const renderItem = useCallback(({ item }: { item: ListItem }) => {
    let imageUrl = '';
    let title = '';
    let subtitle = '';
    let rating: number | undefined;
    let reviewCount: number | undefined;
    let price: { amount: number; suffix: string } | undefined;

    if (itemType === 'country') {
      const country = item as MockCountry;
      imageUrl = country.heroImageUrl;
      title = country.name;
      subtitle = country.subtitle;
      rating = country.rating;
      reviewCount = country.reviewCount;
    } else if (itemType === 'city') {
      const city = item as MockCity;
      imageUrl = city.heroImageUrl;
      title = city.name;
      subtitle = city.countryName;
      rating = city.rating;
      reviewCount = city.reviewCount;
    } else {
      const activity = item as MockActivity;
      imageUrl = activity.heroImageUrl;
      title = activity.name;
      subtitle = `${activity.cityName}, ${activity.countryName}`;
      rating = activity.rating;
      reviewCount = activity.reviewCount;
      price = { amount: activity.priceFrom, suffix: '/ person' };
    }

    return (
      <Pressable
        style={styles.listItem}
        onPress={() => handleItemPress(item, itemType)}
      >
        <Image source={{ uri: imageUrl }} style={styles.listImage} contentFit="cover" />
        <View style={styles.listContent}>
          <Text style={styles.listTitle} numberOfLines={2}>{title}</Text>
          <Text style={styles.listSubtitle} numberOfLines={1}>{subtitle}</Text>
          {price && (
            <Text style={styles.listPrice}>From ${price.amount} {price.suffix}</Text>
          )}
          {rating !== undefined && (
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={12} color={colors.textPrimary} />
              <Text style={styles.ratingText}>{rating.toFixed(2)}</Text>
              {reviewCount !== undefined && (
                <Text style={styles.reviewCount}>({reviewCount.toLocaleString()})</Text>
              )}
            </View>
          )}
        </View>
        <View style={styles.favoriteButton}>
          <Ionicons name="heart-outline" size={20} color={colors.textPrimary} />
        </View>
      </Pressable>
    );
  }, [itemType, handleItemPress]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{params.title || 'Browse'}</Text>
        <Pressable style={styles.filterButton} hitSlop={8}>
          <Ionicons name="options-outline" size={20} color={colors.textPrimary} />
        </Pressable>
      </View>

      {/* List */}
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screenX,
    paddingVertical: spacing.md,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  headerTitle: {
    flex: 1,
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  filterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    padding: spacing.screenX,
    gap: spacing.xl,
  },
  listItem: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  listImage: {
    width: 120,
    height: 120,
    borderRadius: radius.card,
  },
  listContent: {
    flex: 1,
    paddingVertical: spacing.xs,
  },
  listTitle: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  listSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  listPrice: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textPrimary,
    marginTop: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  ratingText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textPrimary,
  },
  reviewCount: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  favoriteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
});
