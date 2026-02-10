// app/(tabs)/explore/index.tsx
import React, { useState } from 'react';
import { FlatList, ScrollView, StyleSheet, View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AppScreen from '@/components/AppScreen';
import AppHeader from '@/components/AppHeader';
import InboxButton from '@/components/InboxButton';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import SectionHeader from '@/components/explore/SectionHeader';
import { CountryCard } from '@/components/explore/cards/CountryCard';
import { Feather } from '@expo/vector-icons';
import { ModeSwitchSheet } from '@/components/ModeSwitchSheet';
import { ModeIndicatorPill } from '@/components/explore/ModeIndicatorPill';
import { IntentHero } from '@/components/explore/IntentHero';
import { TravellingModeWelcomeSheet } from '@/components/explore/TravellingModeWelcomeSheet';
import { useData } from '@/hooks/useData';
import { getPlaceFirstImage } from '@/data/api';
import { useFeedItems } from '@/data/explore/useFeedItems';
import { useAppMode } from '@/state/AppModeContext';
import { getEmergencyNumbers } from '@/data/safety';
import type { FeedItem, CityWithCountry } from '@/data/explore/types';
import type { Place } from '@/data/types';
import { colors, fonts, spacing, radius, pressedState } from '@/constants/design';

const MAX_COUNTRIES_SHOWN = 6;

/** Split array into two columns for masonry layout */
function toColumns<T>(arr: T[]): [T[], T[]] {
  const left: T[] = [];
  const right: T[] = [];
  arr.forEach((item, i) => (i % 2 === 0 ? left : right).push(item));
  return [left, right];
}

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

// ── Place card for travelling feed sections ─────────────────

function PlaceFeedCard({ place, onPress }: { place: Place; onPress: () => void }) {
  const { data: imageUrl } = useData(
    () => getPlaceFirstImage(place.id),
    ['placeImage', place.id],
  );

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.cityCard, pressed && styles.pressed]}
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.neutralFill }]} />
      )}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.55)']}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.cityCardContent}>
        <Text style={styles.cityCardName} numberOfLines={1}>{place.name}</Text>
      </View>
    </Pressable>
  );
}

// ── Main screen ──────────────────────────────────────────────

export default function ExploreScreen() {
  const { feedItems, isLoading, error, refresh } = useFeedItems();
  const router = useRouter();
  const { activeTripInfo, justActivated, clearJustActivated } = useAppMode();
  const [showModeSheet, setShowModeSheet] = useState(false);

  const headerLeft = (
    <Image
      source={require('@/assets/images/sola-logo.png')}
      style={styles.headerLogo}
      contentFit="contain"
    />
  );

  const headerRight = (
    <View style={styles.headerRight}>
      <ModeIndicatorPill onPress={() => setShowModeSheet(true)} />
      <InboxButton />
    </View>
  );

  const renderItem = ({ item }: { item: FeedItem }) => {
    switch (item.type) {
      case 'countries-grid': {
        const visible = item.data.slice(0, MAX_COUNTRIES_SHOWN);
        const hasMore = item.data.length > MAX_COUNTRIES_SHOWN;
        const [leftCol, rightCol] = toColumns(visible);
        return (
          <View style={styles.zone}>
            <SectionHeader
              title="Choose a destination"
              onSeeAll={hasMore ? () => router.push('/(tabs)/explore/all-destinations') : undefined}
            />
            <View style={styles.masonry}>
              <View style={styles.masonryColumn}>
                {leftCol.map((country, i) => (
                  <CountryCard
                    key={country.id}
                    country={country}
                    index={i * 2}
                    onPress={() => router.push(`/(tabs)/explore/country/${country.slug}`)}
                  />
                ))}
              </View>
              <View style={[styles.masonryColumn, styles.masonryColumnRight]}>
                {rightCol.map((country, i) => (
                  <CountryCard
                    key={country.id}
                    country={country}
                    index={i * 2 + 1}
                    onPress={() => router.push(`/(tabs)/explore/country/${country.slug}`)}
                  />
                ))}
              </View>
            </View>
          </View>
        );
      }

      case 'popular-cities':
        return (
          <View style={styles.zoneWide}>
            <View style={styles.zonePaddedHeader}>
              <SectionHeader title="Featured cities" />
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

      case 'saved-in-city':
        return (
          <View style={styles.zoneWide}>
            <View style={styles.zonePaddedHeader}>
              <SectionHeader title={`Your saved places in ${item.data.cityName}`} />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.citiesScroll}
            >
              {item.data.places.map((place) => (
                <PlaceFeedCard
                  key={place.id}
                  place={place}
                  onPress={() => router.push(`/(tabs)/explore/place-detail/${place.id}`)}
                />
              ))}
            </ScrollView>
          </View>
        );

      case 'places-in-city':
        return (
          <View style={styles.zoneWide}>
            <View style={styles.zonePaddedHeader}>
              <SectionHeader title={`Places in ${item.data.cityName}`} />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.citiesScroll}
            >
              {item.data.places.slice(0, 10).map((place) => (
                <PlaceFeedCard
                  key={place.id}
                  place={place}
                  onPress={() => router.push(`/(tabs)/explore/place-detail/${place.id}`)}
                />
              ))}
            </ScrollView>
          </View>
        );

      case 'know-before-you-go': {
        const emergency = getEmergencyNumbers(item.data.countryIso2);
        return (
          <View style={styles.zone}>
            <SectionHeader title="Good to know" />
            <View style={styles.safetyCard}>
              <View style={styles.safetyRow}>
                <Feather name="phone" size={16} color={colors.emergency} />
                <Text style={styles.safetyText}>
                  Emergency: {emergency.general || emergency.police}
                </Text>
              </View>
              <View style={styles.safetyRow}>
                <Feather name="shield" size={16} color={colors.greenSoft} />
                <Text style={styles.safetyText}>
                  Police: {emergency.police} {'\u00B7'} Ambulance: {emergency.ambulance}
                </Text>
              </View>
            </View>
          </View>
        );
      }

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
          leftComponent={headerLeft}
          rightComponent={headerRight}
        />
        <LoadingScreen />
        <ModeSwitchSheet visible={showModeSheet} onClose={() => setShowModeSheet(false)} />
      </AppScreen>
    );
  }

  if (error && feedItems.length === 0) {
    return (
      <AppScreen>
        <AppHeader
          title=""
          leftComponent={headerLeft}
          rightComponent={headerRight}
        />
        <ErrorScreen message="Something went wrong" onRetry={refresh} />
        <ModeSwitchSheet visible={showModeSheet} onClose={() => setShowModeSheet(false)} />
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <AppHeader
        title=""
        leftComponent={headerLeft}
        rightComponent={headerRight}
      />
      <FlatList
        data={feedItems}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        onRefresh={refresh}
        refreshing={isLoading}
        ListHeaderComponent={<IntentHero />}
      />
      <ModeSwitchSheet visible={showModeSheet} onClose={() => setShowModeSheet(false)} />
      {justActivated && activeTripInfo && (
        <TravellingModeWelcomeSheet
          visible
          onDismiss={clearJustActivated}
          tripInfo={activeTripInfo}
        />
      )}
    </AppScreen>
  );
}

// ── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  headerLogo: {
    height: 22,
    width: 76,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  list: {
    paddingBottom: spacing.xxxxl,
  },

  // Zone spacing — varied rhythm, not uniform
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

  // Masonry — two columns with stagger offset
  masonry: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  masonryColumn: {
    flex: 1,
    gap: spacing.md,
  },
  masonryColumnRight: {
    paddingTop: spacing.xxxl,
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
    fontFamily: fonts.semiBold,
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

  // Safety card — travelling mode
  safetyCard: {
    backgroundColor: colors.neutralFill,
    borderRadius: radius.card,
    padding: spacing.lg,
    gap: spacing.md,
    marginTop: spacing.md,
  },
  safetyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  safetyText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textPrimary,
  },
});
