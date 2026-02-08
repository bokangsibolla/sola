import { useCallback, useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePostHog } from 'posthog-react-native';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import { useData } from '@/hooks/useData';
import {
  getCityBySlug,
  getAreasByCity,
  getPlacesGroupedByTime,
  getPlacesGroupedByTimeForArea,
  getPlaceFirstImage,
  getPlaceTags,
  isPlaceSaved,
  toggleSavePlace,
  getCountryById,
  type PlacesGroupedByTime,
} from '@/data/api';
import { useAuth } from '@/state/AuthContext';
import type { City, Country, Place, Tag } from '@/data/types';

// ---------------------------------------------------------------------------
// Time-based section configuration
// ---------------------------------------------------------------------------

interface TimeSection {
  key: keyof PlacesGroupedByTime;
  title: string;
  subtitle: string;
  icon: string;
}

const TIME_SECTIONS: TimeSection[] = [
  {
    key: 'morning',
    title: 'Your Morning',
    subtitle: 'Cafes, breakfast spots & coworking',
    icon: '☕',
  },
  {
    key: 'afternoon',
    title: 'Your Afternoon',
    subtitle: 'Lunch, walks & attractions',
    icon: '🍜',
  },
  {
    key: 'evening',
    title: 'Your Evening',
    subtitle: 'Dinner, bars & nightlife',
    icon: '🌙',
  },
  {
    key: 'fullDay',
    title: 'If You Have a Full Day',
    subtitle: 'Day trips and activities worth the time',
    icon: '🗺️',
  },
  {
    key: 'accommodations',
    title: 'Where to Stay',
    subtitle: 'Sola-verified places to rest',
    icon: '🏨',
  },
];

// ---------------------------------------------------------------------------
// Tag pill color helpers
// ---------------------------------------------------------------------------

function tagColors(filterGroup: Tag['filterGroup']): {
  bg: string;
  fg: string;
} {
  switch (filterGroup) {
    case 'safety':
      return { bg: colors.greenFill, fg: colors.greenSoft };
    case 'good_for':
      return { bg: colors.blueFill, fg: colors.blueSoft };
    case 'vibe':
      return { bg: colors.orangeFill, fg: colors.orange };
    default:
      return { bg: colors.borderSubtle, fg: colors.textSecondary };
  }
}

// ---------------------------------------------------------------------------
// Price label
// ---------------------------------------------------------------------------

function PriceLabel({ level }: { level: number | null }) {
  if (!level || level <= 0) return null;
  return <Text style={styles.priceLabel}>{'$'.repeat(level)}</Text>;
}

// ---------------------------------------------------------------------------
// Duration badge (for activities)
// ---------------------------------------------------------------------------

function DurationBadge({ duration }: { duration: string | null }) {
  if (!duration) return null;
  return (
    <View style={styles.durationBadge}>
      <Ionicons name="time-outline" size={12} color={colors.textMuted} />
      <Text style={styles.durationText}>{duration}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Place Card
// ---------------------------------------------------------------------------

function PlaceCard({ place, showDuration = false }: { place: Place; showDuration?: boolean }) {
  const router = useRouter();
  const posthog = usePostHog();
  const { data: imageUrl } = useData(
    () => place?.id ? getPlaceFirstImage(place.id) : Promise.resolve(null),
    ['placeImage', place?.id ?? ''],
  );
  const { userId } = useAuth();
  const { data: tags } = useData(
    () => place?.id ? getPlaceTags(place.id) : Promise.resolve([]),
    ['placeTags', place?.id ?? ''],
  );
  const { data: isSaved } = useData(
    () => (userId && place?.id) ? isPlaceSaved(userId, place.id) : Promise.resolve(false),
    ['placeSaved', userId, place?.id ?? ''],
  );
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isSaved !== null) setSaved(isSaved);
  }, [isSaved]);

  const handleSave = useCallback(async () => {
    if (!userId) return;
    const newSaved = !saved;
    setSaved(newSaved);
    posthog.capture(newSaved ? 'place_saved' : 'place_unsaved', { place_id: place.id, place_name: place.name });
    await toggleSavePlace(userId, place.id);
  }, [userId, place.id, saved, posthog]);

  return (
    <Pressable
      onPress={() => {
        if (!place?.id) return;
        posthog.capture('place_card_tapped', { place_id: place.id, place_name: place.name });
        router.push(`/explore/place-detail/${place.id}`);
      }}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.cardImage} contentFit="cover" transition={200} pointerEvents="none" />
        ) : (
          <View style={[styles.cardImage, styles.cardImagePlaceholder]} pointerEvents="none" />
        )}

      <View style={styles.cardBody} pointerEvents="box-none">
        {/* Top row: name + price */}
        <View style={styles.cardTopRow}>
          <Text style={styles.cardName} numberOfLines={1}>
            {place.name}
          </Text>
          <View style={styles.cardTopRight}>
            <PriceLabel level={place.priceLevel} />
            <Pressable onPress={handleSave} hitSlop={8}>
              <Ionicons
                name={saved ? 'heart' : 'heart-outline'}
                size={16}
                color={saved ? colors.orange : colors.textMuted}
              />
            </Pressable>
          </View>
        </View>

        {/* Duration badge for activities */}
        {showDuration && place.estimatedDuration && (
          <DurationBadge duration={place.estimatedDuration} />
        )}

        {/* Tag pills — max 2 for scannability */}
        {Array.isArray(tags) && tags.length > 0 && (
          <View style={styles.tagRow}>
            {tags.slice(0, 2).map((tag) => {
              const tc = tagColors(tag.filterGroup);
              return (
                <View
                  key={tag.id}
                  style={[styles.tagPill, { backgroundColor: tc.bg }]}
                >
                  <Text style={[styles.tagText, { color: tc.fg }]}>
                    {tag.label}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Description - show whySelected for curated places */}
        {(place.whySelected || place.description) ? (
          <Text style={styles.cardDesc} numberOfLines={2}>
            {place.whySelected || place.description}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Full Day Activity Card (larger, shows duration + transport)
// ---------------------------------------------------------------------------

function FullDayCard({ place }: { place: Place }) {
  const router = useRouter();
  const posthog = usePostHog();
  const { data: imageUrl } = useData(
    () => place?.id ? getPlaceFirstImage(place.id) : Promise.resolve(null),
    ['placeImage', place?.id ?? ''],
  );
  const { userId } = useAuth();
  const { data: isSaved } = useData(
    () => (userId && place?.id) ? isPlaceSaved(userId, place.id) : Promise.resolve(false),
    ['placeSaved', userId, place?.id ?? ''],
  );
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isSaved !== null) setSaved(isSaved);
  }, [isSaved]);

  const handleSave = useCallback(async () => {
    if (!userId) return;
    const newSaved = !saved;
    setSaved(newSaved);
    posthog.capture(newSaved ? 'place_saved' : 'place_unsaved', { place_id: place.id, place_name: place.name });
    await toggleSavePlace(userId, place.id);
  }, [userId, place.id, saved, posthog]);

  return (
    <Pressable
      onPress={() => {
        if (!place?.id) return;
        posthog.capture('fullday_card_tapped', { place_id: place.id, place_name: place.name });
        router.push(`/explore/place-detail/${place.id}`);
      }}
      style={({ pressed }) => [styles.fullDayCard, pressed && styles.fullDayCardPressed]}
    >
      <View style={styles.fullDayImageContainer}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.fullDayImage} contentFit="cover" transition={200} pointerEvents="none" />
        ) : (
          <View style={[styles.fullDayImage, styles.fullDayImagePlaceholder]} pointerEvents="none" />
        )}
        <Pressable onPress={handleSave} style={styles.fullDaySaveOverlay} hitSlop={8}>
          <Ionicons
            name={saved ? 'heart' : 'heart-outline'}
            size={18}
            color={saved ? colors.orange : '#FFFFFF'}
          />
        </Pressable>
      </View>
      <View style={styles.fullDayBody} pointerEvents="box-none">
        <Text style={styles.fullDayName} numberOfLines={2}>{place.name}</Text>
        {place.whySelected && (
          <Text style={styles.fullDayDesc} numberOfLines={2}>{place.whySelected}</Text>
        )}
        <View style={styles.fullDayMeta}>
          {place.estimatedDuration && (
            <View style={styles.fullDayMetaItem}>
              <Ionicons name="time-outline" size={14} color={colors.textMuted} />
              <Text style={styles.fullDayMetaText}>{place.estimatedDuration}</Text>
            </View>
          )}
          {place.physicalLevel && (
            <View style={styles.fullDayMetaItem}>
              <Ionicons name="walk-outline" size={14} color={colors.textMuted} />
              <Text style={styles.fullDayMetaText}>{place.physicalLevel}</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Time Section Component
// ---------------------------------------------------------------------------

function TimeBasedSection({
  section,
  places,
}: {
  section: TimeSection;
  places: Place[];
}) {
  if (places.length === 0) return null;

  const showDuration = section.key === 'fullDay';

  return (
    <View style={styles.timeSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionIcon}>{section.icon}</Text>
        <View style={styles.sectionTitleGroup}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <Text style={styles.sectionSubtitle}>{section.subtitle}</Text>
        </View>
      </View>
      {places.slice(0, 6).map((place) => (
        section.key === 'fullDay' ? (
          <FullDayCard key={place.id} place={place} />
        ) : (
          <PlaceCard key={place.id} place={place} showDuration={showDuration} />
        )
      ))}
      {places.length > 6 && (
        <Text style={styles.moreText}>
          +{places.length - 6} more places
        </Text>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// City Editorial Section
// ---------------------------------------------------------------------------

function CityEditorial({
  summary,
  bestFor,
}: {
  summary: string | null;
  bestFor: string | null;
}) {
  if (!summary && !bestFor) return null;

  return (
    <View style={styles.editorial}>
      {summary && (
        <Text style={styles.editorialText}>{summary}</Text>
      )}
      {bestFor && (
        <View style={styles.bestForContainer}>
          <Text style={styles.bestForLabel}>Best for: </Text>
          <Text style={styles.bestForText}>{bestFor}</Text>
        </View>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// City Context Signals — surfaces unique per-city data
// ---------------------------------------------------------------------------

const INTEREST_LABELS: Record<string, string> = {
  food: 'Food lovers',
  culture: 'Culture seekers',
  nature: 'Nature & outdoors',
  history: 'History buffs',
  photography: 'Photography',
  adventure: 'Adventure',
  nightlife: 'Nightlife',
  beach: 'Beach life',
  beaches: 'Beach life',
  diving: 'Diving & snorkeling',
  relaxation: 'Relaxation',
  wellness: 'Wellness & yoga',
  'digital-nomad': 'Digital nomads',
  'digital nomad': 'Digital nomads',
  shopping: 'Shopping',
  surfing: 'Surfing',
  hiking: 'Hiking',
  art: 'Art & galleries',
  music: 'Live music',
  architecture: 'Architecture',
};

function formatBudget(usd: number): string {
  if (usd <= 25) return 'Very budget-friendly';
  if (usd <= 40) return 'Budget-friendly';
  if (usd <= 60) return 'Moderate cost';
  return 'Higher budget';
}

function CityContext({ city }: { city: City }) {
  const signals: { icon: string; label: string }[] = [];

  // Budget — varies meaningfully ($20–$80)
  if (city.avgDailyBudgetUsd) {
    signals.push({
      icon: 'wallet-outline',
      label: `${formatBudget(city.avgDailyBudgetUsd)} (~$${city.avgDailyBudgetUsd}/day)`,
    });
  }

  // Best time to visit — varies per city
  if (city.bestTimeToVisit) {
    signals.push({ icon: 'calendar-outline', label: `Best: ${city.bestTimeToVisit}` });
  }

  // Top interests — unique per city, show first 2
  const interests = city.goodForInterests ?? [];
  const mapped = interests
    .map((i) => INTEREST_LABELS[i.toLowerCase()])
    .filter(Boolean);
  // Deduplicate (e.g. "beach" and "beaches" both map to "Beach life")
  const unique = Array.from(new Set(mapped));
  if (unique.length > 0) {
    signals.push({
      icon: 'sparkles-outline',
      label: `Great for ${unique.slice(0, 2).join(' & ').toLowerCase()}`,
    });
  }

  // Solo level — only show if NOT beginner (since most are beginner)
  if (city.soloLevel === 'intermediate') {
    signals.push({ icon: 'compass-outline', label: 'Some solo experience helpful' });
  } else if (city.soloLevel === 'expert') {
    signals.push({ icon: 'compass-outline', label: 'Best for experienced solo travelers' });
  }

  if (signals.length === 0) return null;

  return (
    <View style={styles.contextSection}>
      {signals.slice(0, 3).map((signal, i) => (
        <View key={i} style={styles.contextRow}>
          <Ionicons name={signal.icon as any} size={16} color={colors.textSecondary} />
          <Text style={styles.contextText}>{signal.label}</Text>
        </View>
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// City Highlights — what to expect, using existing data
// ---------------------------------------------------------------------------

function CityHighlights({ city }: { city: City }) {
  const items = city.topThingsToDo ?? city.highlights ?? [];
  if (items.length === 0) return null;

  return (
    <View style={styles.cityHighlightsSection}>
      <Text style={styles.cityHighlightsLabel}>What to expect</Text>
      {items.slice(0, 4).map((item, i) => (
        <View key={i} style={styles.cityHighlightRow}>
          <View style={styles.cityHighlightBullet} />
          <Text style={styles.cityHighlightText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main Screen
// ---------------------------------------------------------------------------

export default function PlaceScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const posthog = usePostHog();

  useEffect(() => {
    if (slug) {
      posthog.capture('city_places_viewed', { city_slug: slug });
    }
  }, [slug, posthog]);

  const { data: city, loading, error, refetch } = useData(() => getCityBySlug(slug ?? ''), ['cityBySlug', slug]);
  const { data: country } = useData(
    () => city?.countryId ? getCountryById(city.countryId) : Promise.resolve(null),
    ['country', city?.countryId],
  );
  const { data: areas } = useData(
    () => city ? getAreasByCity(city.id) : Promise.resolve([]),
    ['cityAreas', city?.id],
  );

  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);

  // Use time-grouped places API
  const { data: groupedPlaces } = useData(
    () => {
      if (selectedAreaId) return getPlacesGroupedByTimeForArea(selectedAreaId);
      if (city) return getPlacesGroupedByTime(city.id);
      return Promise.resolve({
        morning: [],
        afternoon: [],
        evening: [],
        fullDay: [],
        accommodations: [],
      } as PlacesGroupedByTime);
    },
    ['groupedPlaces', selectedAreaId, city?.id],
  );

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error.message} onRetry={refetch} />;

  if (!city) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.notFound}>Place not found</Text>
      </View>
    );
  }

  const heroUrl = city.heroImageUrl;
  const tagline = city.subtitle;

  // Check if we have any places at all
  const hasPlaces = groupedPlaces && (
    groupedPlaces.morning.length > 0 ||
    groupedPlaces.afternoon.length > 0 ||
    groupedPlaces.evening.length > 0 ||
    groupedPlaces.fullDay.length > 0 ||
    groupedPlaces.accommodations.length > 0
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Navigation */}
      <View style={styles.nav}>
        <Pressable
          onPress={() => router.push('/(tabs)/explore' as any)}
          hitSlop={12}
          style={styles.backToExplore}
        >
          <Ionicons name="compass-outline" size={18} color={colors.textMuted} />
          <Text style={styles.backToExploreText}>Explore</Text>
        </Pressable>
      </View>

      {/* Breadcrumb trail */}
      <View style={styles.breadcrumb}>
        <Pressable onPress={() => router.push('/(tabs)/explore' as any)}>
          <Text style={styles.breadcrumbLink}>Explore</Text>
        </Pressable>
        <Ionicons name="chevron-forward" size={12} color={colors.textMuted} style={styles.breadcrumbChevron} />
        {country && (
          <>
            <Pressable onPress={() => router.push(`/(tabs)/explore/country/${country.slug}` as any)}>
              <Text style={styles.breadcrumbLink}>{country.name}</Text>
            </Pressable>
            <Ionicons name="chevron-forward" size={12} color={colors.textMuted} style={styles.breadcrumbChevron} />
          </>
        )}
        <Text style={styles.breadcrumbCurrent}>{city?.name}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        {heroUrl && (
          <Image source={{ uri: heroUrl }} style={styles.hero} contentFit="cover" transition={200} />
        )}

        <View style={styles.content}>
          <Text style={styles.cityName}>{city.name}</Text>
          {tagline && (
            <Text style={styles.tagline}>{tagline}</Text>
          )}

          {/* City editorial intro */}
          <CityEditorial
            summary={city.summary}
            bestFor={city.bestFor}
          />

          {/* Context signals — solo-friendliness, safety, etc. */}
          <CityContext city={city} />

          {/* Highlights — what to expect */}
          <CityHighlights city={city} />

          {/* Neighborhood pills */}
          {(areas ?? []).length > 0 && (
            <View style={styles.neighborhoodSection}>
              <Text style={styles.neighborhoodLabel}>Explore by area</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.pillScroll}
                contentContainerStyle={styles.pillRow}
              >
                <Pressable
                  onPress={() => setSelectedAreaId(null)}
                  style={[
                    styles.pill,
                    !selectedAreaId && styles.pillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.pillText,
                      !selectedAreaId && styles.pillTextActive,
                    ]}
                  >
                    All areas
                  </Text>
                </Pressable>
                {(areas ?? []).map((area) => {
                  const active = selectedAreaId === area.id;
                  return (
                    <Pressable
                      key={area.id}
                      onPress={() =>
                        setSelectedAreaId(active ? null : area.id)
                      }
                      style={[styles.pill, active && styles.pillActive]}
                    >
                      <Text
                        style={[
                          styles.pillText,
                          active && styles.pillTextActive,
                        ]}
                      >
                        {area.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Section intro */}
          {hasPlaces && (
            <View style={styles.planHeader}>
              <Text style={styles.planTitle}>Your day in {city.name}</Text>
              <Text style={styles.planSubtitle}>
                We picked these by time of day so you can build your own itinerary
              </Text>
            </View>
          )}

          {/* Time-based sections */}
          {hasPlaces ? (
            <>
              {TIME_SECTIONS.map((section) => (
                <TimeBasedSection
                  key={section.key}
                  section={section}
                  places={groupedPlaces?.[section.key] ?? []}
                />
              ))}

              {/* Community discussions — after places for content-first hierarchy */}
              {city?.id && (
                <View style={styles.communitySection}>
                  <View style={styles.communitySectionHeader}>
                    <Text style={styles.sectionTitle}>Community</Text>
                    <Pressable
                      onPress={() => router.push({
                        pathname: '/(tabs)/community',
                        params: { countryId: city.countryId, cityId: city.id, placeName: city.name + (country?.name ? `, ${country.name}` : '') },
                      } as any)}
                      style={({ pressed }) => pressed && { opacity: 0.7 }}
                    >
                      <Text style={styles.communitySeeAll}>See all</Text>
                    </Pressable>
                  </View>
                  <Text style={styles.communitySubtitle}>
                    Questions and tips from solo women travelers
                  </Text>
                  <Pressable
                    onPress={() => router.push({
                      pathname: '/(tabs)/community',
                      params: { countryId: city.countryId, cityId: city.id, placeName: city.name + (country?.name ? `, ${country.name}` : '') },
                    } as any)}
                    style={({ pressed }) => [styles.communityCard, pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }]}
                  >
                    <Feather name="message-circle" size={20} color={colors.orange} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.communityCardTitle}>
                        Discussions about {city.name}
                      </Text>
                      <Text style={styles.communityCardSubtitle}>
                        Ask questions, share experiences, get advice
                      </Text>
                    </View>
                    <Feather name="chevron-right" size={18} color={colors.textMuted} />
                  </Pressable>
                </View>
              )}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🗺️</Text>
              <Text style={styles.emptyTitle}>We&apos;re still exploring here</Text>
              <Text style={styles.emptyText}>
                Our team is adding places to {city.name}. Check back soon!
              </Text>
              <Pressable
                style={styles.emptyButton}
                onPress={() => router.push('/(tabs)/explore' as any)}
              >
                <Text style={styles.emptyButtonText}>Browse other cities</Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  notFound: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
  nav: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  backToExplore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  backToExploreText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textMuted,
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    flexWrap: 'wrap',
  },
  breadcrumbLink: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.orange,
  },
  breadcrumbChevron: {
    marginHorizontal: spacing.xs,
  },
  breadcrumbCurrent: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  hero: {
    width: '100%',
    height: 200,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  cityName: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  tagline: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },

  // Editorial
  editorial: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.borderSubtle,
  },
  editorialText: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  bestForContainer: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  bestForLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.textSecondary,
  },
  bestForText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.orange,
    flex: 1,
  },

  // Neighborhood section
  neighborhoodSection: {
    marginTop: spacing.xl,
  },
  neighborhoodLabel: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  pillScroll: {},
  pillRow: {
    gap: 8,
    paddingRight: spacing.lg,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    backgroundColor: colors.background,
  },
  pillActive: {
    backgroundColor: colors.orangeFill,
    borderColor: colors.orange,
  },
  pillText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  pillTextActive: {
    color: colors.orange,
  },

  // Time-based section
  timeSection: {
    marginTop: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  sectionTitleGroup: {
    flex: 1,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.textPrimary,
  },
  sectionSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  moreText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.orange,
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },

  // Place card
  card: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  cardImage: {
    width: 88,
    height: 88,
  },
  cardImagePlaceholder: {
    backgroundColor: colors.borderSubtle,
  },
  cardBody: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'center',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardName: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  priceLabel: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textMuted,
  },
  cardTopRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  // Duration badge
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  durationText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },

  // Tags
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  tagPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  tagText: {
    fontFamily: fonts.medium,
    fontSize: 11,
  },

  // Description
  cardDesc: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 18,
    marginTop: 4,
  },

  // Context signals
  contextSection: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  contextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  contextText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
  },

  // City highlights
  cityHighlightsSection: {
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  cityHighlightsLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  cityHighlightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  cityHighlightBullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.orange,
    marginTop: 8,
  },
  cityHighlightText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },

  // Full day card (larger format)
  fullDayCard: {
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    overflow: 'hidden',
    marginBottom: spacing.md,
    backgroundColor: colors.background,
  },
  fullDayCardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  fullDayImage: {
    width: '100%',
    height: 140,
  },
  fullDayImagePlaceholder: {
    backgroundColor: colors.borderSubtle,
  },
  fullDayBody: {
    padding: spacing.md,
  },
  fullDayName: {
    fontFamily: fonts.semiBold,
    fontSize: 17,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  fullDayDesc: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  fullDayMeta: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  fullDayMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  fullDayMetaText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textMuted,
    textTransform: 'capitalize',
  },
  fullDayImageContainer: {
    position: 'relative',
  },
  fullDaySaveOverlay: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Plan header
  planHeader: {
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  planTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 22,
    color: colors.textPrimary,
  },
  planSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 2,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 280,
  },
  emptyButton: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.orangeFill,
    borderRadius: radius.pill,
  },
  emptyButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.orange,
  },
  communitySection: {
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  communitySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  communitySeeAll: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.orange,
  },
  communitySubtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  communityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.orangeFill,
    borderRadius: radius.card,
    padding: spacing.lg,
    gap: spacing.md,
  },
  communityCardTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  communityCardSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
});
