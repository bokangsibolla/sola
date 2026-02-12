// app/(tabs)/discover/index.tsx
import React from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AppScreen from '@/components/AppScreen';
import AppHeader from '@/components/AppHeader';
import MenuButton from '@/components/MenuButton';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import SectionHeader from '@/components/explore/SectionHeader';
import { useFeedItems } from '@/data/explore/useFeedItems';
import type { FeedItem, CityWithCountry } from '@/data/explore/types';
import { colors, fonts, spacing, radius, pressedState } from '@/constants/design';

const MAX_COUNTRIES_SHOWN = 9;
const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_GAP = spacing.sm;
const COUNTRY_CARD_SIZE =
  (SCREEN_WIDTH - spacing.screenX * 2 - GRID_GAP * 2) / 3;

/** Chunk array into groups of n */
function chunk<T>(arr: T[], n: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += n) {
    result.push(arr.slice(i, i + n));
  }
  return result;
}

// City card sizing: show ~2.3 cards so user sees there's more to scroll
const CITY_CARD_WIDTH = (SCREEN_WIDTH - spacing.screenX * 2 - spacing.md) / 2.3;
const CITY_CARD_HEIGHT = CITY_CARD_WIDTH * 1.3;

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

function CountryGridCard({
  country,
  onPress,
}: {
  country: { id: string; name: string; heroImageUrl: string | null; slug: string };
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.countryCard, pressed && styles.pressed]}
    >
      <Image
        source={{ uri: country.heroImageUrl ?? undefined }}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
        transition={200}
      />
      <LinearGradient
        colors={['transparent', 'transparent', 'rgba(0,0,0,0.6)']}
        locations={[0, 0.35, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.countryCardContent}>
        <Text style={styles.countryCardName} numberOfLines={1}>
          {country.name}
        </Text>
      </View>
    </Pressable>
  );
}

function CityCard({ city, onPress }: { city: CityWithCountry; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.cityCard, pressed && styles.pressed]}
    >
      <Image
        source={{ uri: city.heroImageUrl ?? undefined }}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
        transition={200}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.55)']}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.cityCardContent}>
        <Text style={styles.cityCardName} numberOfLines={1}>{city.name}</Text>
        <Text style={styles.cityCardCountry} numberOfLines={1}>{city.countryName}</Text>
      </View>
    </Pressable>
  );
}

function CollectionCard({
  collection,
  onPress,
}: {
  collection: {
    title: string;
    subtitle: string | null;
    heroImageUrl: string | null;
    items: { length: number };
  };
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.collectionCard, pressed && styles.pressed]}
    >
      <Image
        source={{ uri: collection.heroImageUrl ?? undefined }}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
        transition={200}
      />
      <LinearGradient
        colors={['transparent', 'transparent', 'rgba(0,0,0,0.7)']}
        locations={[0, 0.3, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.collectionTypeLabel}>
        <Text style={styles.collectionTypeLabelText}>COLLECTION</Text>
      </View>
      <View style={styles.collectionCardContent}>
        <Text style={styles.collectionCardTitle} numberOfLines={2}>
          {collection.title}
        </Text>
        {collection.subtitle ? (
          <Text style={styles.collectionCardSubtitle} numberOfLines={1}>
            {collection.subtitle}
          </Text>
        ) : (
          <Text style={styles.collectionCardCount}>
            {collection.items.length}{' '}
            {collection.items.length === 1 ? 'destination' : 'destinations'}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

// ── Main screen ──────────────────────────────────────────────

export default function DiscoverScreen() {
  const { feedItems, isLoading, error, refresh } = useFeedItems();
  const router = useRouter();

  const discoverItems = feedItems.filter(
    (item) =>
      item.type === 'countries-grid' ||
      item.type === 'featured-islands' ||
      item.type === 'collections-section',
  );

  const headerLeft = (
    <Image
      source={require('@/assets/images/sola-logo.png')}
      style={styles.headerLogo}
      contentFit="contain"
    />
  );

  const renderItem = ({ item }: { item: FeedItem }) => {
    switch (item.type) {
      case 'countries-grid': {
        const visible = item.data.slice(0, MAX_COUNTRIES_SHOWN);
        const hasMore = item.data.length > MAX_COUNTRIES_SHOWN;
        const rows = chunk(visible, 3);
        return (
          <View style={styles.zone}>
            <View style={styles.countryGrid}>
              {rows.map((row, rowIndex) => (
                <View key={rowIndex} style={styles.countryRow}>
                  {row.map((country) => (
                    <CountryGridCard
                      key={country.id}
                      country={country}
                      onPress={() => router.push(`/(tabs)/discover/country/${country.slug}`)}
                    />
                  ))}
                </View>
              ))}
            </View>
            {hasMore && (
              <Pressable
                style={({ pressed }) => [
                  styles.seeAllButton,
                  pressed && { opacity: pressedState.opacity },
                ]}
                onPress={() => router.push('/(tabs)/discover/all-destinations')}
              >
                <Text style={styles.seeAllText}>See all destinations</Text>
                <Ionicons name="arrow-forward" size={14} color={colors.orange} />
              </Pressable>
            )}
          </View>
        );
      }

      case 'featured-islands':
        return (
          <View style={styles.zoneWide}>
            <View style={styles.zonePaddedHeader}>
              <SectionHeader title="Featured islands" />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.citiesScroll}
              snapToInterval={CITY_CARD_WIDTH + spacing.md}
              decelerationRate="fast"
            >
              {item.data.map((city) => (
                <CityCard
                  key={city.id}
                  city={city}
                  onPress={() => router.push(`/(tabs)/discover/city/${city.slug}`)}
                />
              ))}
            </ScrollView>
          </View>
        );

      case 'collections-section':
        return (
          <View style={styles.zone}>
            <SectionHeader title="Ways to travel solo" />
            <View style={styles.collectionsList}>
              {item.data.map((collection) => (
                <CollectionCard
                  key={collection.id}
                  collection={collection}
                  onPress={() =>
                    router.push(`/(tabs)/discover/collection/${collection.slug}`)
                  }
                />
              ))}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  const keyExtractor = (item: FeedItem, index: number) => `${item.type}-${index}`;

  if (isLoading && discoverItems.length === 0) {
    return (
      <AppScreen>
        <AppHeader title="" leftComponent={headerLeft} rightComponent={<MenuButton />} />
        <LoadingScreen />
      </AppScreen>
    );
  }

  if (error && discoverItems.length === 0) {
    return (
      <AppScreen>
        <AppHeader title="" leftComponent={headerLeft} rightComponent={<MenuButton />} />
        <ErrorScreen message="Something went wrong" onRetry={refresh} />
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <AppHeader title="" leftComponent={headerLeft} rightComponent={<MenuButton />} />
      <FlatList
        data={discoverItems}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        onRefresh={refresh}
        refreshing={isLoading}
        ListHeaderComponent={
          <View style={styles.searchBarWrap}>
            <CompactSearchBar onPress={() => router.push('/(tabs)/discover/search')} />
          </View>
        }
      />
    </AppScreen>
  );
}

// ── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  list: {
    paddingBottom: spacing.xxxxl,
  },

  // Header
  headerLogo: {
    height: 22,
    width: 76,
  },

  // Search bar — compact, matches Home's MiniSearchBar
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

  // Zone spacing
  zone: {
    paddingHorizontal: spacing.screenX,
    marginTop: spacing.xxxl,
  },
  zoneWide: {
    marginTop: spacing.xl,
  },
  zonePaddedHeader: {
    paddingHorizontal: spacing.screenX,
  },
  pressed: {
    opacity: pressedState.opacity,
    transform: pressedState.transform,
  },

  // Country grid — 3 per row, equal size
  countryGrid: {
    gap: GRID_GAP,
  },
  countryRow: {
    flexDirection: 'row',
    gap: GRID_GAP,
  },
  countryCard: {
    width: COUNTRY_CARD_SIZE,
    height: COUNTRY_CARD_SIZE * 1.2,
    borderRadius: radius.card,
    overflow: 'hidden',
    backgroundColor: colors.neutralFill,
  },
  countryCardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  countryCardName: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: '#FFFFFF',
  },

  // See all button — below the grid
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.lg,
    marginTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderSubtle,
  },
  seeAllText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.orange,
  },

  // Featured cities/islands horizontal scroll
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

  // Collections — full-width image cards
  collectionsList: {
    gap: spacing.lg,
    marginTop: spacing.md,
  },
  collectionCard: {
    width: '100%',
    height: 180,
    borderRadius: radius.card,
    overflow: 'hidden',
    backgroundColor: colors.neutralFill,
  },
  collectionTypeLabel: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    backgroundColor: colors.overlaySoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  collectionTypeLabelText: {
    fontFamily: fonts.semiBold,
    fontSize: 10,
    letterSpacing: 0.5,
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  collectionCardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
  },
  collectionCardTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    lineHeight: 24,
    color: '#FFFFFF',
  },
  collectionCardSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginTop: spacing.xs,
  },
  collectionCardCount: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: spacing.xs,
  },
});
