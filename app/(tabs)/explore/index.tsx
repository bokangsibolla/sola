// app/(tabs)/explore/index.tsx
import { FlatList, StyleSheet, View, Text, Pressable, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AppScreen from '@/components/AppScreen';
import AppHeader from '@/components/AppHeader';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import SearchBar from '@/components/explore/SearchBar';
import { EditorialCollectionCard } from '@/components/explore/cards/EditorialCollectionCard';
import { HeroGrid } from '@/components/explore/HeroGrid';
import { QuickActionsRow } from '@/components/explore/QuickActionsRow';
import { DiscoveryLensesSection } from '@/components/explore/DiscoveryLensesSection';
import { useFeedItems } from '@/data/explore/useFeedItems';
import type { FeedItem } from '@/data/explore/types';
import type { CityWithCountry } from '@/data/explore/types';
import { colors, fonts, spacing, radius } from '@/constants/design';

const SCREEN_WIDTH = Dimensions.get('window').width;

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
      <TypeLabel label="City" />
      <View style={styles.smallCardOverlay}>
        <Text style={styles.smallCardTitle}>{city.name}</Text>
        <Text style={styles.smallCardBlurb} numberOfLines={1}>{city.countryName}</Text>
      </View>
    </Pressable>
  );
}

// City pair - two city cards side by side
function CityPairCard({ cities, sectionLabel, onCityPress, onViewAll }: {
  cities: [CityWithCountry, CityWithCountry];
  sectionLabel?: string;
  onCityPress: (slug: string) => void;
  onViewAll: () => void;
}) {
  return (
    <View>
      {sectionLabel && (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>{sectionLabel}</Text>
          <Pressable onPress={onViewAll} hitSlop={8}>
            <Text style={styles.seeAllLink}>See all</Text>
          </Pressable>
        </View>
      )}
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
      <TypeLabel label="City" />
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

// End card component
function EndCard() {
  const router = useRouter();
  return (
    <View style={styles.endCard}>
      <Text style={styles.endCardText}>More destinations coming soon</Text>
      <Pressable
        style={styles.endCardButton}
        onPress={() => router.push('/explore/all-destinations')}
        hitSlop={8}
      >
        <Text style={styles.endCardLink}>Browse all destinations</Text>
      </Pressable>
    </View>
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
            onCity1Press={() => router.push(`/explore/city/${item.data.city1.slug}`)}
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

      case 'quick-actions':
        return <QuickActionsRow />;

      case 'city-pair':
        return (
          <CityPairCard
            cities={item.data}
            sectionLabel={item.sectionLabel}
            onCityPress={(slug) => router.push(`/explore/city/${slug}`)}
            onViewAll={() => router.push('/explore/all-destinations')}
          />
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
              colors={['transparent', 'rgba(0,0,0,0.6)']}
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

      case 'end-card':
        return <EndCard />;

      default:
        return null;
    }
  };

  const keyExtractor = (item: FeedItem, index: number): string => {
    switch (item.type) {
      case 'search-bar':
        return 'search-bar';
      case 'hero-grid':
        return `hero-grid-${item.data.city1.slug}`;
      case 'editorial-collection':
        return `collection-${item.data.slug}`;
      case 'discovery-lenses':
        return 'discovery-lenses';
      case 'quick-actions':
        return 'quick-actions';
      case 'city-pair':
        return `city-pair-${item.data[0].slug}-${item.data[1].slug}`;
      case 'city-spotlight':
        return `city-spotlight-${item.data.slug}`;
      case 'activity-cluster':
        return `activity-cluster-${item.citySlug}`;
      case 'meet-travellers':
        return 'meet-travellers';
      case 'end-card':
        return 'end-card';
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
        rightComponent={
          <Pressable
            onPress={() => router.push('/home/dm')}
            hitSlop={12}
            style={styles.headerAction}
            accessibilityRole="button"
            accessibilityLabel="Messages"
          >
            <Image
              source={require('@/assets/images/icons/icon-inbox.png')}
              style={styles.headerIcon}
              contentFit="contain"
              tintColor={colors.orange}
            />
          </Pressable>
        }
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
        rightComponent={
          <Pressable
            onPress={() => router.push('/home/dm')}
            hitSlop={12}
            style={styles.headerAction}
            accessibilityRole="button"
            accessibilityLabel="Messages"
          >
            <Image
              source={require('@/assets/images/icons/icon-inbox.png')}
              style={styles.headerIcon}
              contentFit="contain"
              tintColor={colors.orange}
            />
          </Pressable>
        }
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
        rightComponent={
          <Pressable
            onPress={() => router.push('/home/dm')}
            hitSlop={12}
            style={styles.headerAction}
            accessibilityRole="button"
            accessibilityLabel="Messages"
          >
            <Image
              source={require('@/assets/images/icons/icon-inbox.png')}
              style={styles.headerIcon}
              contentFit="contain"
              tintColor={colors.orange}
            />
          </Pressable>
        }
      />
      <FlatList
        data={feedItems}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        style={styles.list}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  headerLogo: {
    height: 22,
    width: 76,
  },
  headerAction: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    width: 22,
    height: 22,
  },
  list: {
    flex: 1,
  },
  content: {
    paddingVertical: spacing.lg,
    gap: spacing.xl,
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
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  typeLabelText: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: 'rgba(255,255,255,0.9)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  // Section header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionLabel: {
    fontFamily: fonts.medium,
    fontSize: 12,
    letterSpacing: 1,
    color: colors.textMuted,
  },
  seeAllLink: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.orange,
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
    backgroundColor: 'rgba(0,0,0,0.35)',
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
    backgroundColor: 'rgba(0,0,0,0.4)',
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
  // End card
  endCard: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.md,
  },
  endCardText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
  },
  endCardButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  endCardLink: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.orange,
  },
});
