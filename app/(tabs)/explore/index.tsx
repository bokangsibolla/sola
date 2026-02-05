// app/(tabs)/explore/index.tsx
import { FlatList, StyleSheet, View, Text, Pressable, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import AppScreen from '@/components/AppScreen';
import AppHeader from '@/components/AppHeader';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import { EditorialCollectionCard } from '@/components/explore/cards/EditorialCollectionCard';
import { useFeedItems } from '@/data/explore/useFeedItems';
import type { FeedItem } from '@/data/explore/types';
import type { Country } from '@/data/types';
import type { CityWithCountry } from '@/data/explore/types';
import { colors, fonts, spacing, radius } from '@/constants/design';

const SCREEN_WIDTH = Dimensions.get('window').width;

// Country card with hero image
function CountryCard({ country, onPress }: { country: Country; onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.smallCard, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={country.name}
    >
      {country.heroImageUrl && (
        <Image
          source={{ uri: country.heroImageUrl }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={200}
        />
      )}
      <View style={styles.smallCardOverlay}>
        <Text style={styles.smallCardTitle}>{country.name}</Text>
        {country.shortBlurb && (
          <Text style={styles.smallCardBlurb} numberOfLines={1}>{country.shortBlurb}</Text>
        )}
      </View>
    </Pressable>
  );
}

// Country pair - two country cards side by side
function CountryPairCard({ countries, onCountryPress }: {
  countries: [Country, Country];
  onCountryPress: (slug: string) => void;
}) {
  return (
    <View style={styles.pairRow}>
      <CountryCard
        country={countries[0]}
        onPress={() => onCountryPress(countries[0].slug)}
      />
      <CountryCard
        country={countries[1]}
        onPress={() => onCountryPress(countries[1].slug)}
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
  return (
    <View style={styles.endCard}>
      <Text style={styles.endCardText}>More destinations coming soon</Text>
    </View>
  );
}

export default function ExploreScreen() {
  const router = useRouter();
  const { feedItems, isLoading, error, refresh } = useFeedItems();

  const renderItem = ({ item }: { item: FeedItem }) => {
    switch (item.type) {
      case 'editorial-collection':
        return (
          <EditorialCollectionCard
            collection={item.data}
            onPress={() => router.push(`/explore/collection/${item.data.slug}`)}
          />
        );

      case 'country-pair':
        return (
          <CountryPairCard
            countries={item.data}
            onCountryPress={(slug) => router.push(`/explore/country/${slug}`)}
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
        // Activity clusters not yet implemented — skip
        return null;

      case 'end-card':
        return <EndCard />;

      default:
        return null;
    }
  };

  const keyExtractor = (item: FeedItem, index: number): string => {
    switch (item.type) {
      case 'editorial-collection':
        return `collection-${item.data.slug}`;
      case 'country-pair':
        return `country-pair-${item.data[0].slug}-${item.data[1].slug}`;
      case 'city-spotlight':
        return `city-spotlight-${item.data.slug}`;
      case 'activity-cluster':
        return `activity-cluster-${item.citySlug}`;
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
  // Country pair row
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
  // End card
  endCard: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  endCardText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
  },
});
