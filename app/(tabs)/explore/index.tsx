// app/(tabs)/explore/index.tsx
import { FlatList, StyleSheet, View, Text, Pressable, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AppScreen from '@/components/AppScreen';
import AppHeader from '@/components/AppHeader';
import InboxButton from '@/components/InboxButton';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import SearchBar from '@/components/explore/SearchBar';
import SectionHeader from '@/components/explore/SectionHeader';
import { EditorialCollectionCard } from '@/components/explore/cards/EditorialCollectionCard';
import { HeroGrid } from '@/components/explore/HeroGrid';
import { DiscoveryLensesSection } from '@/components/explore/DiscoveryLensesSection';
import { useFeedItems } from '@/data/explore/useFeedItems';
import type { FeedItem } from '@/data/explore/types';
import type { CityWithCountry } from '@/data/explore/types';
import { colors, fonts, spacing, radius } from '@/constants/design';

const SCREEN_WIDTH = Dimensions.get('window').width;

/** Derive a useful tag from city data — badgeLabel, first interest, or country name. */
function getCityTag(city: CityWithCountry): string {
  if (city.badgeLabel) return city.badgeLabel;
  if (city.goodForInterests && city.goodForInterests.length > 0) {
    return city.goodForInterests[0];
  }
  return city.countryName;
}

// Frosted type label pill — sits top-left of image cards
function TypeLabel({ label }: { label: string }) {
  return (
    <View style={styles.typeLabel}>
      <Text style={styles.typeLabelText}>{label}</Text>
    </View>
  );
}

// City card with hero image
function CitySmallCard({ city, onPress }: { city: CityWithCountry; onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.smallCard, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${city.name}, ${city.countryName}`}
    >
      {city.heroImageUrl && (
        <Image
          source={{ uri: city.heroImageUrl }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={200}
        />
      )}
      <TypeLabel label={getCityTag(city)} />
      <View style={styles.smallCardOverlay}>
        <Text style={styles.smallCardTitle}>{city.name}</Text>
        <Text style={styles.smallCardBlurb} numberOfLines={1}>{city.countryName}</Text>
      </View>
    </Pressable>
  );
}

// City pair - two city cards side by side
function CityPairCard({ cities, onCityPress }: {
  cities: [CityWithCountry, CityWithCountry];
  onCityPress: (slug: string) => void;
}) {
  return (
    <View style={styles.pairRow}>
      <CitySmallCard
        city={cities[0]}
        onPress={() => onCityPress(cities[0].slug)}
      />
      <CitySmallCard
        city={cities[1]}
        onPress={() => onCityPress(cities[1].slug)}
      />
    </View>
  );
}

// City spotlight card with hero image
function CitySpotlightCard({ city, onPress }: {
  city: CityWithCountry;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.spotlightCard, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${city.name}, ${city.countryName}`}
    >
      {city.heroImageUrl && (
        <Image
          source={{ uri: city.heroImageUrl }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={200}
        />
      )}
      <LinearGradient
        colors={['transparent', colors.overlayMedium]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <TypeLabel label={getCityTag(city)} />
      <View style={styles.spotlightOverlay}>
        <Text style={styles.spotlightTitle}>{city.name}</Text>
        <Text style={styles.spotlightSubtitle}>{city.countryName}</Text>
        {city.shortBlurb && (
          <Text style={styles.spotlightBlurb} numberOfLines={2}>{city.shortBlurb}</Text>
        )}
      </View>
    </Pressable>
  );
}

export default function ExploreScreen() {
  const router = useRouter();
  const { feedItems, isLoading, error, refresh } = useFeedItems();

  const renderItem = ({ item }: { item: FeedItem }) => {
    switch (item.type) {
      case 'search-bar':
        return (
          <SearchBar onPress={() => router.push('/explore/search')} />
        );

      case 'section-header':
        return (
          <SectionHeader
            title={item.title}
            subtitle={item.subtitle}
            variant={item.variant}
          />
        );

      case 'featured-collection':
        return (
          <EditorialCollectionCard
            collection={item.data}
            onPress={() => router.push(`/explore/collection/${item.data.slug}`)}
          />
        );

      case 'hero-grid':
        return (
          <HeroGrid
            collection={item.data.collection}
            city1={item.data.city1}
            city2={item.data.city2}
            onCollectionPress={() =>
              item.data.collection
                ? router.push(`/explore/collection/${item.data.collection.slug}`)
                : router.push('/explore/all-destinations')
            }
            onCity1Press={() => item.data.city1 && router.push(`/explore/city/${item.data.city1.slug}`)}
            onCity2Press={() =>
              item.data.city2
                ? router.push(`/explore/city/${item.data.city2.slug}`)
                : router.push('/explore/all-destinations')
            }
          />
        );

      case 'editorial-collection':
        return (
          <EditorialCollectionCard
            collection={item.data}
            onPress={() => router.push(`/explore/collection/${item.data.slug}`)}
          />
        );

      case 'discovery-lenses':
        return <DiscoveryLensesSection lenses={item.data} />;

      case 'city-pair':
        return (
          <View>
            {item.sectionLabel && (
              <Text style={styles.sectionLabel}>{item.sectionLabel}</Text>
            )}
            <CityPairCard
              cities={item.data}
              onCityPress={(slug) => router.push(`/explore/city/${slug}`)}
            />
          </View>
        );

      case 'city-spotlight':
        return (
          <CitySpotlightCard
            city={item.data}
            onPress={() => router.push(`/explore/city/${item.data.slug}`)}
          />
        );

      case 'activity-cluster':
        return null;

      case 'meet-travellers':
        return (
          <Pressable
            style={({ pressed }) => [styles.meetCard, pressed && styles.pressed]}
            onPress={() => router.push('/home/dm')}
            accessibilityRole="button"
            accessibilityLabel="Meet other travellers"
          >
            <Image
              source={require('@/assets/images/pexels-paddleboarding.png')}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              transition={200}
              pointerEvents="none"
            />
            <LinearGradient
              colors={['transparent', colors.overlayMedium]}
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            />
            <TypeLabel label="Community" />
            <View style={styles.meetCardContent} pointerEvents="none">
              <Text style={styles.meetCardTitle}>Meet other travellers</Text>
              <Text style={styles.meetCardSubtitle}>
                Connect with solo women exploring the world
              </Text>
            </View>
          </Pressable>
        );

      default:
        return null;
    }
  };

  const keyExtractor = (item: FeedItem, index: number): string => {
    switch (item.type) {
      case 'search-bar':
        return 'search-bar';
      case 'section-header':
        return `section-${item.title}`;
      case 'featured-collection':
        return `featured-${item.data.slug}`;
      case 'hero-grid':
        return `hero-grid-${item.data.city1?.slug ?? 'unknown'}`;
      case 'editorial-collection':
        return `collection-${item.data.slug}`;
      case 'discovery-lenses':
        return 'discovery-lenses';
      case 'city-pair':
        return `city-pair-${item.data[0].slug}-${item.data[1].slug}`;
      case 'city-spotlight':
        return `city-spotlight-${item.data.slug}`;
      case 'activity-cluster':
        return `activity-cluster-${item.citySlug}`;
      case 'meet-travellers':
        return 'meet-travellers';
      default:
        return `item-${index}`;
    }
  };

  // Show loading screen only on initial load with no feed items
  if (isLoading && feedItems.length <= 1) {
    return (
      <AppScreen>
        <AppHeader
        title=""
        leftComponent={
          <Image
            source={require('@/assets/images/sola-logo.png')}
            style={styles.headerLogo}
            contentFit="contain"
          />
        }
        rightComponent={<InboxButton />}
      />
        <LoadingScreen />
      </AppScreen>
    );
  }

  // Show error screen if there's an error and no feed items
  if (error && feedItems.length <= 1) {
    return (
      <AppScreen>
        <AppHeader
        title=""
        leftComponent={
          <Image
            source={require('@/assets/images/sola-logo.png')}
            style={styles.headerLogo}
            contentFit="contain"
          />
        }
        rightComponent={<InboxButton />}
      />
        <ErrorScreen message={error.message} onRetry={refresh} />
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <AppHeader
        title=""
        leftComponent={
          <Image
            source={require('@/assets/images/sola-logo.png')}
            style={styles.headerLogo}
            contentFit="contain"
          />
        }
        rightComponent={<InboxButton />}
      />
      <FlatList
        data={feedItems}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        style={styles.list}
        contentContainerStyle={feedItems.length === 0 ? styles.emptyContent : styles.content}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyFeed}>
            <Text style={styles.emptyFeedText}>No destinations available right now</Text>
            <Pressable onPress={refresh} style={styles.emptyFeedButton}>
              <Text style={styles.emptyFeedLink}>Try again</Text>
            </Pressable>
          </View>
        }
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  headerLogo: {
    height: 22,
    width: 76,
  },
  list: {
    flex: 1,
  },
  content: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.screenX,
    gap: spacing.lg,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  // Type label pill
  typeLabel: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    zIndex: 1,
    backgroundColor: colors.overlaySoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  typeLabelText: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: 'rgba(255,255,255,0.9)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  // City pair row
  pairRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  smallCard: {
    flex: 1,
    height: 160,
    backgroundColor: colors.neutralFill,
    borderRadius: radius.card,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  smallCardOverlay: {
    padding: spacing.md,
    paddingTop: spacing.xl,
    backgroundColor: colors.overlaySoft,
  },
  smallCardTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: '#FFFFFF',
  },
  smallCardBlurb: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  // City spotlight
  spotlightCard: {
    height: 220,
    backgroundColor: colors.neutralFill,
    borderRadius: radius.card,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  spotlightOverlay: {
    padding: spacing.lg,
    paddingTop: 60,
  },
  spotlightTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 22,
    color: '#FFFFFF',
  },
  spotlightSubtitle: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  spotlightBlurb: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginTop: spacing.xs,
  },
  // Meet travellers card
  meetCard: {
    height: 200,
    borderRadius: radius.card,
    overflow: 'hidden',
    backgroundColor: colors.neutralFill,
  },
  meetCardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
  },
  meetCardTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 22,
    color: '#FFFFFF',
  },
  meetCardSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginTop: spacing.xs,
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: 'center' as const,
  },
  emptyFeed: {
    alignItems: 'center' as const,
    paddingVertical: spacing.xxl,
    gap: spacing.md,
  },
  emptyFeedText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textMuted,
  },
  emptyFeedButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  emptyFeedLink: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.orange,
  },
  sectionLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.textPrimary,
    letterSpacing: -0.3,
    marginBottom: spacing.md,
  },
});
