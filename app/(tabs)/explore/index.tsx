// app/(tabs)/explore/index.tsx
import { FlatList, StyleSheet, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import AppScreen from '@/components/AppScreen';
import AppHeader from '@/components/AppHeader';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import { EditorialCollectionCard } from '@/components/explore/cards/EditorialCollectionCard';
import { useFeedItems } from '@/data/explore/useFeedItems';
import type { FeedItem } from '@/data/explore/types';
import { colors, fonts, spacing, radius } from '@/constants/design';

// Placeholder card for country pair
function CountryPairCard({ countries }: { countries: [{ name: string }, { name: string }] }) {
  return (
    <View style={styles.pairRow}>
      <Pressable
        style={styles.smallCard}
        accessibilityRole="button"
        accessibilityLabel={countries[0].name}
      >
        <View style={styles.smallCardContent}>
          <Text style={styles.smallCardTitle}>{countries[0].name}</Text>
        </View>
      </Pressable>
      <Pressable
        style={styles.smallCard}
        accessibilityRole="button"
        accessibilityLabel={countries[1].name}
      >
        <View style={styles.smallCardContent}>
          <Text style={styles.smallCardTitle}>{countries[1].name}</Text>
        </View>
      </Pressable>
    </View>
  );
}

// Placeholder card for city spotlight
function CitySpotlightCard({ cityName }: { cityName: string }) {
  return (
    <Pressable
      style={[styles.card, { height: 220 }]}
      accessibilityRole="button"
      accessibilityLabel={`${cityName} city spotlight`}
    >
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{cityName}</Text>
        <Text style={styles.cardSubtitle}>City Spotlight</Text>
      </View>
    </Pressable>
  );
}

// Placeholder card for activity cluster
function ActivityClusterCard({ cityName }: { cityName: string }) {
  return (
    <Pressable
      style={[styles.card, { height: 160 }]}
      accessibilityRole="button"
      accessibilityLabel={`Activities in ${cityName}`}
    >
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>Activities in {cityName}</Text>
        <Text style={styles.cardSubtitle}>Activity Cluster</Text>
      </View>
    </Pressable>
  );
}

// End card component
function EndCard() {
  return (
    <View style={styles.endCard}>
      <Text style={styles.endCardText}>You&apos;ve seen it all!</Text>
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
        return <CountryPairCard countries={item.data} />;

      case 'city-spotlight':
        return <CitySpotlightCard cityName={item.data.name} />;

      case 'activity-cluster':
        return <ActivityClusterCard cityName={item.cityName} />;

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
        <AppHeader title="Explore" />
        <LoadingScreen />
      </AppScreen>
    );
  }

  // Show error screen if there's an error and no feed items
  if (error && feedItems.length <= 1) {
    return (
      <AppScreen>
        <AppHeader title="Explore" />
        <ErrorScreen message={error.message} onRetry={refresh} />
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <AppHeader title="Explore" />
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
  list: {
    flex: 1,
  },
  content: {
    paddingVertical: spacing.lg,
    gap: spacing.xl,
  },
  card: {
    backgroundColor: colors.neutralFill,
    borderRadius: radius.card,
    marginHorizontal: spacing.md,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  cardContent: {
    padding: spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  cardTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    color: '#FFFFFF',
  },
  cardSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  pairRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
  },
  smallCard: {
    flex: 1,
    height: 140,
    backgroundColor: colors.neutralFill,
    borderRadius: radius.card,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  smallCardContent: {
    padding: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  smallCardTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: '#FFFFFF',
  },
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
