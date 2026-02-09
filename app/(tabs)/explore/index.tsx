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
  onPress,
}: {
  collection: { title: string; subtitle: string | null; heroImageUrl: string | null; items: { length: number } };
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
        {collection.subtitle ? (
          <Text style={styles.collectionRowSubtitle} numberOfLines={1}>{collection.subtitle}</Text>
        ) : (
          <Text style={styles.collectionRowCount}>
            {collection.items.length} {collection.items.length === 1 ? 'destination' : 'destinations'}
          </Text>
        )}
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
          <View style={styles.zoneHero}>
            <EditorialCollectionCard
              collection={item.data}
              onPress={() => router.push(`/(tabs)/explore/collection/${item.data.slug}`)}
            />
          </View>
        );

      case 'countries-grid':
        return (
          <View style={styles.zone}>
            <SectionHeader title="Choose a destination" />
            <View style={styles.countriesGrid}>
              {item.data.map((country, index) => (
                <CountryCard
                  key={country.id}
                  country={country}
                  index={index}
                  onPress={() => router.push(`/(tabs)/explore/country/${country.slug}`)}
                />
              ))}
            </View>
          </View>
        );

      case 'popular-cities':
        return (
          <View style={styles.zoneWide}>
            <View style={styles.zonePaddedHeader}>
              <SectionHeader title="Loved by solo women" />
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
            <SectionHeader title="Ways to travel solo" />
            <View style={styles.collectionsList}>
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
          <View style={styles.zoneCommunity}>
            <Pressable
              onPress={() => router.push('/(tabs)/community')}
              style={({ pressed }) => [styles.communityCard, pressed && styles.pressed]}
            >
              <Text style={styles.communityLabel}>FROM WOMEN TRAVELING SOLO RIGHT NOW</Text>
              <Text style={styles.communityTitle}>
                Real questions. Honest answers.
              </Text>
              <Text style={styles.communityAction}>Join the conversation</Text>
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

  // Zone spacing — varied rhythm, not uniform
  zoneHero: {
    paddingHorizontal: spacing.screenX,
    marginTop: spacing.lg,
  },
  zone: {
    paddingHorizontal: spacing.screenX,
    marginTop: spacing.xxxl,
  },
  zoneWide: {
    marginTop: spacing.xxxl,
  },
  zonePaddedHeader: {
    paddingHorizontal: spacing.screenX,
  },
  zoneCommunity: {
    paddingHorizontal: spacing.screenX,
    marginTop: spacing.xxxxl,
    marginBottom: spacing.xl,
  },
  pressed: {
    opacity: pressedState.opacity,
    transform: pressedState.transform,
  },

  // Countries grid — 2-column, cards handle their own asymmetric heights
  countriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.md,
  },

  // Popular cities horizontal scroll
  citiesScroll: {
    paddingHorizontal: spacing.screenX,
    gap: spacing.md,
    marginTop: spacing.md,
  },
  cityCard: {
    width: 150,
    height: 190,
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

  // Collections — editorial feel, not settings rows
  collectionsList: {
    gap: spacing.lg,
    marginTop: spacing.md,
  },
  collectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutralFill,
    borderRadius: radius.card,
    overflow: 'hidden',
    height: 96,
  },
  collectionRowPressed: {
    opacity: pressedState.opacity,
  },
  collectionRowImage: {
    width: 96,
    height: 96,
  },
  collectionRowText: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    justifyContent: 'center',
  },
  collectionRowTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  collectionRowSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  collectionRowCount: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },

  // Community signal — warm, living, not promotional
  communityCard: {
    backgroundColor: colors.orangeFill,
    borderRadius: radius.card,
    padding: spacing.xl,
  },
  communityLabel: {
    fontFamily: fonts.medium,
    fontSize: 10,
    letterSpacing: 0.8,
    color: colors.orange,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  communityTitle: {
    fontFamily: fonts.serif,
    fontSize: 22,
    color: colors.textPrimary,
    lineHeight: 28,
    marginBottom: spacing.md,
  },
  communityAction: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.orange,
  },
});
