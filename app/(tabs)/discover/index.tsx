// app/(tabs)/discover/index.tsx
import React from 'react';
import {
  Dimensions,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AppScreen from '@/components/AppScreen';
import AppHeader from '@/components/AppHeader';
import MenuButton from '@/components/MenuButton';
import NotificationButton from '@/components/NotificationButton';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import SectionHeader from '@/components/explore/SectionHeader';
import { useDiscoverData } from '@/data/discover/useDiscoverData';
import type { RecommendedCity } from '@/data/discover/types';
import type { ExploreCollectionWithItems } from '@/data/types';
import { colors, fonts, spacing, radius, pressedState } from '@/constants/design';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CITY_CARD_WIDTH = (SCREEN_WIDTH - spacing.screenX * 2 - spacing.md) / 2.3;
const CITY_CARD_HEIGHT = CITY_CARD_WIDTH * 1.3;
// No longer need explicit card width — grid cards use flex: 1 in row containers

// ── Inline components ──────────────────────────────────────

function CompactSearchBar({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.searchBar, pressed && { opacity: pressedState.opacity }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Search destinations"
    >
      <Feather name="search" size={16} color={colors.textMuted} />
      <Text style={styles.searchText}>Find a destination</Text>
    </Pressable>
  );
}

function BrowseDestinationsCard({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.browseCard, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Browse destinations"
    >
      <Image
        source={require('@/assets/images/pexels-driving.png')}
        style={styles.browseImage}
        contentFit="cover"
        transition={200}
      />
      <View style={styles.browseBody}>
        <View>
          <Text style={styles.browseTitle}>Browse destinations</Text>
          <Text style={styles.browseSubtitle}>All countries and cities</Text>
        </View>
        <Feather name="chevron-right" size={18} color={colors.textMuted} />
      </View>
    </Pressable>
  );
}

function RecommendedCityCard({
  city,
  onPress,
}: {
  city: RecommendedCity;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.cityCard, pressed && styles.pressed]}
    >
      <Image
        source={{ uri: city.heroImageUrl }}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
        transition={200}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.55)']}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.cityCardContent}>
        <Text style={styles.cityCardName} numberOfLines={1}>
          {city.cityName}
        </Text>
        <Text style={styles.cityCardCountry} numberOfLines={1}>
          {city.countryName}
        </Text>
        {city.planningCount > 0 && (
          <Text style={styles.cityCardSignal}>
            {city.planningCount} women planning
          </Text>
        )}
      </View>
    </Pressable>
  );
}

function CollectionHeroCard({
  collection,
  onPress,
}: {
  collection: ExploreCollectionWithItems;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.collectionHero, pressed && styles.pressed]}
    >
      <Image
        source={{ uri: collection.heroImageUrl ?? undefined }}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
        transition={200}
      />
      <LinearGradient
        colors={['transparent', 'transparent', 'rgba(0,0,0,0.6)']}
        locations={[0, 0.3, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.collectionCardContent}>
        <Text style={styles.collectionHeroTitle} numberOfLines={2}>
          {collection.title}
        </Text>
        <Text style={styles.collectionCardCount}>
          {collection.items.length}{' '}
          {collection.items.length === 1 ? 'destination' : 'destinations'}
        </Text>
      </View>
    </Pressable>
  );
}

function CollectionGridCard({
  collection,
  onPress,
}: {
  collection: ExploreCollectionWithItems;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.collectionGridItem, pressed && styles.pressed]}
    >
      <Image
        source={{ uri: collection.heroImageUrl ?? undefined }}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
        transition={200}
      />
      <LinearGradient
        colors={['transparent', 'transparent', 'rgba(0,0,0,0.6)']}
        locations={[0, 0.3, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.collectionGridContent}>
        <Text style={styles.collectionGridTitle} numberOfLines={1}>
          {collection.title}
        </Text>
        <Text style={styles.collectionCardCount} numberOfLines={1}>
          {collection.items.length}{' '}
          {collection.items.length === 1 ? 'destination' : 'destinations'}
        </Text>
      </View>
    </Pressable>
  );
}

// ── Main screen ──────────────────────────────────────────────

export default function DiscoverScreen() {
  const { recommended, isPersonalized, collections, isLoading, error, refresh } =
    useDiscoverData();
  const router = useRouter();

  const headerLeft = (
    <Image
      source={require('@/assets/images/sola-logo.png')}
      style={styles.headerLogo}
      contentFit="contain"
    />
  );

  const headerRight = (
    <View style={styles.headerRight}>
      <NotificationButton />
      <MenuButton />
    </View>
  );

  // Loading state
  if (isLoading && recommended.length === 0) {
    return (
      <AppScreen>
        <AppHeader title="" leftComponent={headerLeft} rightComponent={headerRight} />
        <LoadingScreen />
      </AppScreen>
    );
  }

  // Error state
  if (error && recommended.length === 0) {
    return (
      <AppScreen>
        <AppHeader title="" leftComponent={headerLeft} rightComponent={headerRight} />
        <ErrorScreen message="Something went wrong" onRetry={refresh} />
      </AppScreen>
    );
  }

  // Determine featured collection (first isFeatured or index 0)
  const featuredCollection =
    collections.find((c) => c.isFeatured) ?? collections[0] ?? null;
  const gridCollections = collections.filter((c) => c !== featuredCollection);

  // Pair grid collections into rows of 2 (avoids flexWrap issues in RN)
  const gridRows: ExploreCollectionWithItems[][] = [];
  for (let i = 0; i < gridCollections.length; i += 2) {
    gridRows.push(gridCollections.slice(i, i + 2));
  }

  return (
    <AppScreen>
      <AppHeader title="" leftComponent={headerLeft} rightComponent={headerRight} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refresh} />
        }
      >
        {/* Section 1: Search bar */}
        <View style={styles.searchBarWrap}>
          <CompactSearchBar
            onPress={() => router.push('/(tabs)/discover/search')}
          />
        </View>

        {/* Section 2: Browse destinations entry point */}
        <View style={styles.sectionPadded}>
          <BrowseDestinationsCard
            onPress={() => router.push('/(tabs)/discover/all-destinations')}
          />
        </View>

        {/* Section 3: Recommended cities carousel */}
        {recommended.length > 0 && (
          <View style={styles.sectionWide}>
            <View style={styles.sectionPaddedHeader}>
              <SectionHeader
                title={
                  isPersonalized
                    ? 'Recommended for you'
                    : 'Popular with solo women'
                }
              />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.citiesScroll}
              snapToInterval={CITY_CARD_WIDTH + spacing.md}
              decelerationRate="fast"
            >
              {recommended.map((city) => (
                <RecommendedCityCard
                  key={city.cityId}
                  city={city}
                  onPress={() =>
                    router.push(`/(tabs)/discover/city/${city.citySlug}`)
                  }
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Section 4: Collections — featured hero + 2-col grid */}
        {collections.length > 0 && (
          <View style={styles.sectionPadded}>
            <SectionHeader title="Ways to travel solo" />

            {featuredCollection && (
              <CollectionHeroCard
                collection={featuredCollection}
                onPress={() =>
                  router.push(
                    `/(tabs)/discover/collection/${featuredCollection.slug}`,
                  )
                }
              />
            )}

            {gridRows.length > 0 &&
              gridRows.map((row, rowIdx) => (
                <View key={rowIdx} style={styles.gridRow}>
                  {row.map((collection) => (
                    <CollectionGridCard
                      key={collection.id}
                      collection={collection}
                      onPress={() =>
                        router.push(
                          `/(tabs)/discover/collection/${collection.slug}`,
                        )
                      }
                    />
                  ))}
                  {/* Fill empty slot if odd number */}
                  {row.length === 1 && <View style={styles.gridSpacer} />}
                </View>
              ))}
          </View>
        )}
      </ScrollView>
    </AppScreen>
  );
}

// ── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing.xxxxl,
  },

  // Header
  headerLogo: {
    height: 22,
    width: 76,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },

  // Search bar
  searchBarWrap: {
    paddingHorizontal: spacing.screenX,
    marginTop: spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutralFill,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    gap: spacing.sm,
  },
  searchText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
  },

  // Shared
  pressed: {
    opacity: pressedState.opacity,
    transform: pressedState.transform,
  },

  // Section wrappers
  sectionPadded: {
    paddingHorizontal: spacing.screenX,
    marginTop: spacing.xxxl,
  },
  sectionWide: {
    marginTop: spacing.xxxl,
  },
  sectionPaddedHeader: {
    paddingHorizontal: spacing.screenX,
  },

  // Browse destinations card
  browseCard: {
    backgroundColor: colors.neutralFill,
    borderRadius: radius.card,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  browseImage: {
    width: 80,
    height: 80,
  },
  browseBody: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  browseTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  browseSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // Recommended cities carousel
  citiesScroll: {
    paddingHorizontal: spacing.screenX,
    gap: spacing.md,
    marginTop: spacing.md,
  },
  cityCard: {
    width: CITY_CARD_WIDTH,
    height: CITY_CARD_HEIGHT,
    borderRadius: radius.card,
    overflow: 'hidden',
    backgroundColor: colors.neutralFill,
  },
  cityCardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
  },
  cityCardName: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  cityCardCountry: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  cityCardSignal: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginTop: spacing.xs,
  },

  // Collections — hero
  collectionHero: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.neutralFill,
    marginTop: spacing.md,
  },
  collectionCardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
  },
  collectionHeroTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    lineHeight: 24,
    color: '#FFFFFF',
  },
  collectionCardCount: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: spacing.xs,
  },

  // Collections — 2-col grid (explicit rows, no flexWrap)
  gridRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  gridSpacer: {
    flex: 1,
  },
  collectionGridItem: {
    flex: 1,
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.neutralFill,
  },
  collectionGridContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
  },
  collectionGridTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    lineHeight: 20,
    color: '#FFFFFF',
  },
});
