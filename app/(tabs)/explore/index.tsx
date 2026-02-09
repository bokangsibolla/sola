// app/(tabs)/explore/index.tsx
import React from 'react';
import { FlatList, ScrollView, StyleSheet, View, Text, Pressable, Dimensions } from 'react-native';
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
import { CountryCard } from '@/components/explore/cards/CountryCard';
import { useFeedItems } from '@/data/explore/useFeedItems';
import type { FeedItem, CityWithCountry } from '@/data/explore/types';
import { colors, fonts, spacing, radius, pressedState } from '@/constants/design';

const SCREEN_WIDTH = Dimensions.get('window').width;

// ── Inline components for zones ──────────────────────────────

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

function CollectionRow({
  collection,
  onPress
}: {
  collection: { title: string; heroImageUrl: string | null; items: { length: number } };
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.collectionRow, pressed && styles.collectionRowPressed]}
    >
      <Image
        source={{ uri: collection.heroImageUrl ?? undefined }}
        style={styles.collectionRowImage}
        contentFit="cover"
        transition={200}
      />
      <View style={styles.collectionRowText}>
        <Text style={styles.collectionRowTitle} numberOfLines={2}>{collection.title}</Text>
        <Text style={styles.collectionRowCount}>
          {collection.items.length} {collection.items.length === 1 ? 'destination' : 'destinations'}
        </Text>
      </View>
    </Pressable>
  );
}

// ── Main screen ──────────────────────────────────────────────

export default function ExploreScreen() {
  const { feedItems, isLoading, error, refresh } = useFeedItems();
  const router = useRouter();

  const renderItem = ({ item }: { item: FeedItem }) => {
    switch (item.type) {
      case 'featured-collection':
        return (
          <View style={styles.zone}>
            <EditorialCollectionCard
              collection={item.data}
              onPress={() => router.push(`/(tabs)/explore/collection/${item.data.slug}`)}
            />
          </View>
        );

      case 'countries-grid':
        return (
          <View style={styles.zone}>
            <SectionHeader title="Where do you want to go?" />
            <View style={styles.countriesGrid}>
              {item.data.map((country) => (
                <View key={country.id} style={styles.countriesGridItem}>
                  <CountryCard
                    country={country}
                    onPress={() => router.push(`/(tabs)/explore/country/${country.slug}`)}
                  />
                </View>
              ))}
            </View>
          </View>
        );

      case 'popular-cities':
        return (
          <View style={styles.zoneNoPadding}>
            <View style={styles.zonePaddedHeader}>
              <SectionHeader title="Popular destinations" />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.citiesScroll}
            >
              {item.data.map((city) => (
                <CityCard
                  key={city.id}
                  city={city}
                  onPress={() => router.push(`/(tabs)/explore/city/${city.slug}`)}
                />
              ))}
            </ScrollView>
          </View>
        );

      case 'collections-section':
        return (
          <View style={styles.zone}>
            <SectionHeader title="Explore by theme" />
            <View style={styles.collectionsListGap}>
              {item.data.map((collection) => (
                <CollectionRow
                  key={collection.id}
                  collection={collection}
                  onPress={() => router.push(`/(tabs)/explore/collection/${collection.slug}`)}
                />
              ))}
            </View>
          </View>
        );

      case 'community-signal':
        return (
          <View style={styles.zone}>
            <Pressable
              onPress={() => router.push('/(tabs)/community')}
              style={({ pressed }) => [styles.communityCard, pressed && styles.pressed]}
            >
              <View style={styles.communityContent}>
                <Text style={styles.communityLabel}>FROM THE COMMUNITY</Text>
                <Text style={styles.communityTitle}>
                  Real questions from women traveling solo
                </Text>
                <Text style={styles.communityAction}>Join the conversation</Text>
              </View>
            </Pressable>
          </View>
        );

      default:
        return null;
    }
  };

  const keyExtractor = (item: FeedItem, index: number) => `${item.type}-${index}`;

  if (isLoading && feedItems.length === 0) {
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

  if (error && feedItems.length === 0) {
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
        <ErrorScreen message="Something went wrong" onRetry={refresh} />
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
      <SearchBar onPress={() => router.push('/(tabs)/explore/search')} />
      <FlatList
        data={feedItems}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        onRefresh={refresh}
        refreshing={isLoading}
      />
    </AppScreen>
  );
}

// ── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  headerLogo: {
    height: 22,
    width: 76,
  },
  list: {
    paddingBottom: spacing.xxxxl,
  },
  zone: {
    paddingHorizontal: spacing.screenX,
    marginTop: spacing.xl,
  },
  zoneNoPadding: {
    marginTop: spacing.xl,
  },
  zonePaddedHeader: {
    paddingHorizontal: spacing.screenX,
  },
  pressed: {
    opacity: pressedState.opacity,
    transform: pressedState.transform,
  },

  // Countries grid
  countriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  countriesGridItem: {
    width: (SCREEN_WIDTH - spacing.screenX * 2 - spacing.md) / 2,
  },

  // Popular cities horizontal scroll
  citiesScroll: {
    paddingHorizontal: spacing.screenX,
    gap: spacing.md,
    marginTop: spacing.md,
  },
  cityCard: {
    width: 160,
    height: 200,
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
    fontSize: 16,
    color: '#FFFFFF',
  },
  cityCardCountry: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },

  // Collections list
  collectionsListGap: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
  collectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutralFill,
    borderRadius: radius.card,
    overflow: 'hidden',
    height: 80,
  },
  collectionRowPressed: {
    opacity: pressedState.opacity,
  },
  collectionRowImage: {
    width: 80,
    height: 80,
  },
  collectionRowText: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  collectionRowTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  collectionRowCount: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },

  // Community signal
  communityCard: {
    backgroundColor: colors.orangeFill,
    borderRadius: radius.card,
    padding: spacing.xl,
  },
  communityContent: {},
  communityLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 10,
    letterSpacing: 0.5,
    color: colors.orange,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  communityTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  communityAction: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.orange,
  },
});
