import { useCallback, useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
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
  getCityTripCount,
  getCityTravelerCount,
  getDestinationTags,
  getSavedPlacesCountForCity,
  type PlacesGroupedByTime,
} from '@/data/api';
import { formatDailyBudget } from '@/lib/currency';
import { useCurrency } from '@/hooks/useCurrency';
import { getCityThreadPreviews } from '@/data/community/communityApi';
import { useAuth } from '@/state/AuthContext';
import { useAppMode } from '@/state/AppModeContext';
import type { City, Country, Place, Tag, DestinationTag } from '@/data/types';
import type { ThreadWithAuthor } from '@/data/community/types';

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
    icon: '\u2615',
  },
  {
    key: 'afternoon',
    title: 'Your Afternoon',
    subtitle: 'Lunch, walks & attractions',
    icon: '\uD83C\uDF5C',
  },
  {
    key: 'evening',
    title: 'Your Evening',
    subtitle: 'Dinner, bars & nightlife',
    icon: '\uD83C\uDF19',
  },
  {
    key: 'fullDay',
    title: 'If You Have a Full Day',
    subtitle: 'Day trips and activities worth the time',
    icon: '\uD83D\uDDFA\uFE0F',
  },
  {
    key: 'accommodations',
    title: 'Where to Stay',
    subtitle: 'Sola-verified places to rest',
    icon: '\uD83C\uDFE8',
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
  const [expanded, setExpanded] = useState(false);

  if (places.length === 0) return null;

  const showDuration = section.key === 'fullDay';
  const visiblePlaces = expanded ? places : places.slice(0, 6);

  return (
    <View style={styles.timeSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionIcon}>{section.icon}</Text>
        <View style={styles.sectionTitleGroup}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <Text style={styles.sectionSubtitle}>{section.subtitle}</Text>
        </View>
      </View>
      {visiblePlaces.map((place) => (
        section.key === 'fullDay' ? (
          <FullDayCard key={place.id} place={place} />
        ) : (
          <PlaceCard key={place.id} place={place} showDuration={showDuration} />
        )
      ))}
      {places.length > 6 && !expanded && (
        <Pressable onPress={() => setExpanded(true)} hitSlop={8}>
          <Text style={styles.moreText}>
            +{places.length - 6} more places
          </Text>
        </Pressable>
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

function formatBudgetLabel(usd: number): string {
  if (usd <= 25) return 'Very budget-friendly';
  if (usd <= 40) return 'Budget-friendly';
  if (usd <= 60) return 'Moderate cost';
  return 'Higher budget';
}

function CityContext({ city, preferredCurrency }: { city: City; preferredCurrency: string }) {
  const signals: { icon: string; label: string }[] = [];

  // Budget — varies meaningfully ($20–$80)
  if (city.avgDailyBudgetUsd) {
    signals.push({
      icon: 'wallet-outline',
      label: `${formatBudgetLabel(city.avgDailyBudgetUsd)} (${formatDailyBudget(city.avgDailyBudgetUsd, preferredCurrency)})`,
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
      <Text style={styles.sectionLabel}>AT A GLANCE</Text>
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
// Women's Insights — editorial distillation of community signals
// ---------------------------------------------------------------------------

function WomenInsights({
  threads,
  safetyWomenMd,
  highlights,
  fallbackText,
}: {
  threads: ThreadWithAuthor[];
  safetyWomenMd: string | null;
  highlights: string[];
  fallbackText: string | null;
}) {
  const insights: string[] = [];
  let sectionTitle = 'FROM WOMEN WHO\u2019VE BEEN HERE';

  // 1. Community thread titles — only statements, not bare questions
  //    Skip titles that are short questions ("any X in Y?"), all-caps, or too vague
  for (const thread of threads.slice(0, 5)) {
    if (insights.length >= 3) break;
    const t = thread.title?.trim();
    if (!t || t.length < 20) continue; // too short to be a real insight
    if (t === t.toUpperCase()) continue; // all-caps spam
    if (t.endsWith('?') && t.length < 50) continue; // short questions aren't insights
    insights.push(t);
  }

  // 2. safetyWomenMd sentences — real editorial content
  if (safetyWomenMd && insights.length < 4) {
    if (insights.length === 0) sectionTitle = 'WHAT WOMEN SHOULD KNOW';
    const sentences = safetyWomenMd
      .replace(/^#+\s.*/gm, '')
      .replace(/\*\*/g, '')
      .split(/[.!?]\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 20 && s.length < 120);
    for (const s of sentences.slice(0, 3)) {
      if (insights.length >= 5) break;
      insights.push(s);
    }
  }

  // 3. City highlights
  if (highlights.length > 0 && insights.length < 3) {
    if (insights.length === 0) sectionTitle = 'WHAT MAKES THIS CITY SPECIAL';
    for (const h of highlights.slice(0, 3)) {
      if (insights.length >= 5) break;
      insights.push(`Known for: ${h}`);
    }
  }

  // 4. Ultimate fallback — never return null
  if (insights.length === 0 && fallbackText) {
    sectionTitle = 'WHAT MAKES THIS CITY SPECIAL';
    insights.push(fallbackText);
  }

  if (insights.length === 0) {
    // Absolute edge case — should never happen
    return null;
  }

  return (
    <View style={styles.insightsSection}>
      <Text style={styles.sectionLabel}>{sectionTitle}</Text>
      {insights.map((insight, i) => (
        <View key={i} style={styles.insightRow}>
          <View style={styles.insightAccent} />
          <Text style={styles.insightText}>
            {insight.endsWith('?') || insight.endsWith('.') || insight.endsWith('!')
              ? insight
              : insight + '.'}
          </Text>
        </View>
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Credibility Line
// ---------------------------------------------------------------------------

function CredibilityLine({
  threadCount,
  tripCount,
}: {
  threadCount: number;
  tripCount: number;
}) {
  const parts: string[] = [];
  if (threadCount > 0) {
    parts.push(`${threadCount} discussion${threadCount === 1 ? '' : 's'}`);
  }
  if (tripCount > 0) {
    parts.push(`${tripCount} traveler${tripCount === 1 ? '' : 's'}\u2019 experiences`);
  }

  if (parts.length === 0) return null;

  return (
    <Text style={styles.credibilityLine}>
      Based on {parts.join(' and ')}
    </Text>
  );
}

// ---------------------------------------------------------------------------
// Signal Pills — what women mention most
// ---------------------------------------------------------------------------

function SignalPills({
  city,
  cityTags,
}: {
  city: City;
  cityTags: DestinationTag[];
}) {
  const signals: string[] = [];

  for (const tag of cityTags.slice(0, 3)) {
    signals.push(tag.tagLabel);
  }

  const interests = city.goodForInterests ?? [];
  for (const interest of interests.slice(0, 2)) {
    const label = INTEREST_LABELS[interest.toLowerCase()];
    if (label && !signals.includes(label)) {
      signals.push(label);
    }
  }

  const highlights = city.highlights ?? [];
  for (const h of highlights.slice(0, 2)) {
    if (h.length <= 25 && signals.length < 6) {
      signals.push(h);
    }
  }

  const unique = Array.from(new Set(signals)).slice(0, 5);
  if (unique.length === 0) return null;

  return (
    <View style={styles.signalSection}>
      <Text style={styles.sectionLabel}>WHAT WOMEN MENTION MOST</Text>
      <View style={styles.signalRow}>
        {unique.map((signal, i) => (
          <View key={i} style={styles.signalPill}>
            <Text style={styles.signalDiamond}>{'\u25C7'}</Text>
            <Text style={styles.signalText}>{signal}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Thread Preview Section — inline community discussions
// ---------------------------------------------------------------------------

function ThreadPreviewSection({
  threads,
  totalCount,
  cityId,
  countryId,
  cityName,
  countryName,
}: {
  threads: ThreadWithAuthor[];
  totalCount: number;
  cityId: string;
  countryId: string;
  cityName: string;
  countryName: string | null;
}) {
  const router = useRouter();

  if (threads.length === 0) return null;

  const placeName = cityName + (countryName ? `, ${countryName}` : '');

  return (
    <View style={styles.threadPreviewSection}>
      <View style={styles.threadPreviewHeader}>
        <Text style={styles.sectionLabel}>COMMUNITY DISCUSSIONS</Text>
        {totalCount > threads.length && (
          <Pressable
            onPress={() => router.push({
              pathname: '/(tabs)/community',
              params: { countryId, cityId, placeName },
            } as any)}
            hitSlop={8}
          >
            <Text style={styles.seeAllLink}>See all</Text>
          </Pressable>
        )}
      </View>
      {threads.map((thread) => (
        <Pressable
          key={thread.id}
          onPress={() => router.push(`/(tabs)/community/thread/${thread.id}` as any)}
          style={({ pressed }) => [styles.threadCard, pressed && styles.threadCardPressed]}
        >
          <Feather name="message-circle" size={16} color={colors.textMuted} style={styles.threadIcon} />
          <View style={styles.threadCardBody}>
            <Text style={styles.threadTitle} numberOfLines={2}>{thread.title}</Text>
            <Text style={styles.threadMeta}>
              {thread.replyCount} {thread.replyCount === 1 ? 'reply' : 'replies'}
              {thread.topicLabel ? `  \u00B7  ${thread.topicLabel}` : ''}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.borderDefault} />
        </Pressable>
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Good to Know — cultural context
// ---------------------------------------------------------------------------

function GoodToKnow({ cultureEtiquetteMd }: { cultureEtiquetteMd: string | null }) {
  if (!cultureEtiquetteMd) return null;

  const items = cultureEtiquetteMd
    .split('\n')
    .map(line => line.replace(/^[-*\u2022]\s*/, '').replace(/^\d+\.\s*/, '').replace(/^#+\s*/, '').replace(/\*\*/g, '').trim())
    .filter(line => line.length > 10 && line.length < 150)
    .slice(0, 4);

  if (items.length === 0) return null;

  return (
    <View style={styles.goodToKnowSection}>
      <Text style={styles.sectionLabel}>GOOD TO KNOW</Text>
      {items.map((item, i) => (
        <View key={i} style={styles.goodToKnowRow}>
          <Ionicons name="information-circle-outline" size={16} color={colors.textMuted} style={{ marginTop: 2 }} />
          <Text style={styles.goodToKnowText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Traveler Presence
// ---------------------------------------------------------------------------

function TravelerPresence({
  count,
  tripCount,
  cityName,
}: {
  count: number;
  tripCount: number;
  cityName: string;
}) {
  if (count === 0 && tripCount === 0) return null;

  let message = '';
  if (count > 0 && tripCount > 0) {
    message = `${count} Sola traveler${count === 1 ? '' : 's'} nearby \u00B7 ${tripCount} trip${tripCount === 1 ? '' : 's'} planned`;
  } else if (count > 0) {
    message = `${count} Sola traveler${count === 1 ? ' is' : 's are'} in ${cityName} now`;
  } else {
    message = `${tripCount} traveler${tripCount === 1 ? ' has' : 's have'} planned trips to ${cityName}`;
  }

  return (
    <View style={styles.travelerPresenceSection}>
      <Text style={styles.sectionLabel}>WOMEN TRAVELING HERE</Text>
      <View style={styles.travelerPresenceRow}>
        <Ionicons name="people-outline" size={16} color={colors.textSecondary} />
        <Text style={styles.travelerPresenceText}>{message}</Text>
      </View>
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

  // Women-first signals — community threads for this city
  const { data: cityThreadData } = useData(
    () => city?.id ? getCityThreadPreviews(city.id, 5) : Promise.resolve(null),
    ['cityThreadPreviews', city?.id],
  );

  // Credibility signals
  const { data: tripCount } = useData(
    () => city?.id ? getCityTripCount(city.id) : Promise.resolve(0),
    ['cityTripCount', city?.id],
  );
  const { data: travelerCount } = useData(
    () => city?.name ? getCityTravelerCount(city.name) : Promise.resolve(0),
    ['cityTravelerCount', city?.name],
  );
  const { data: cityTags } = useData(
    () => city?.id ? getDestinationTags('city', city.id) : Promise.resolve([]),
    ['cityDestTags', city?.id],
  );

  const { userId } = useAuth();
  const { mode } = useAppMode();
  const { data: savedInCityCount } = useData(
    () => (userId && city?.id) ? getSavedPlacesCountForCity(userId, city.id) : Promise.resolve(0),
    ['savedInCity', userId, city?.id],
  );

  const { currency: preferredCurrency } = useCurrency();

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
      {/* Simplified navigation */}
      <View style={styles.nav}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
          <Text style={styles.backText}>
            {country?.name ?? 'Explore'}
          </Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero with overlay */}
        <View style={styles.heroContainer}>
          {heroUrl ? (
            <Image source={{ uri: heroUrl }} style={styles.hero} contentFit="cover" transition={200} />
          ) : (
            <View style={[styles.hero, { backgroundColor: colors.neutralFill }]} />
          )}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.55)']}
            style={styles.heroGradient}
          />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroCity}>{city.name}</Text>
            {country && (
              <Text style={styles.heroCountry}>{country.name}</Text>
            )}
          </View>
        </View>
        {city.imageAttribution && (
          <Text style={styles.imageAttribution}>Photo: {city.imageAttribution}</Text>
        )}

        <View style={styles.content}>
          {/* 1. Women-first positioning line */}
          {city.bestFor && (
            <Text style={styles.positioningLine}>{city.bestFor}</Text>
          )}

          {/* 2. "From women who've been here" insights */}
          <WomenInsights
            threads={cityThreadData?.threads ?? []}
            safetyWomenMd={city.safetyWomenMd ?? null}
            highlights={city.highlights ?? []}
            fallbackText={city.subtitle ?? city.bestFor ?? null}
          />

          {/* 3. Credibility sourcing */}
          {cityThreadData && (
            <CredibilityLine
              threadCount={cityThreadData.totalCount}
              tripCount={tripCount ?? 0}
            />
          )}

          {/* Save-cluster nudge — prompt trip creation when user saves 2+ places (discover mode only) */}
          {mode === 'discover' && (savedInCityCount ?? 0) >= 2 && (
            <Pressable
              style={styles.tripNudge}
              onPress={() => {
                posthog.capture('save_cluster_nudge_tapped', { city_slug: slug, city_name: city.name });
                router.push({
                  pathname: '/trips/new',
                  params: { cityName: city.name, cityId: city.id, countryIso2: country?.iso2 },
                } as any);
              }}
            >
              <Ionicons name="airplane-outline" size={18} color={colors.orange} />
              <View style={styles.tripNudgeText}>
                <Text style={styles.tripNudgeTitle}>Got dates for {city.name}?</Text>
                <Text style={styles.tripNudgeSubtitle}>
                  You&apos;ve saved {savedInCityCount} places here. Add dates and we&apos;ll help you on the ground.
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </Pressable>
          )}

          {/* 4. Signal pills */}
          <SignalPills city={city} cityTags={cityTags ?? []} />

          {/* 5. At a glance — practical context */}
          <CityContext city={city} preferredCurrency={preferredCurrency} />

          {/* 6. What to expect — editorial */}
          <CityEditorial summary={city.summary} bestFor={null} />

          {/* 7. Community thread previews */}
          {cityThreadData && cityThreadData.threads.length > 0 && city?.id && (
            <ThreadPreviewSection
              threads={cityThreadData.threads}
              totalCount={cityThreadData.totalCount}
              cityId={city.id}
              countryId={city.countryId}
              cityName={city.name}
              countryName={country?.name ?? null}
            />
          )}

          {/* 8. Neighborhood pills */}
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

          {/* 9. Time-based sections */}
          {hasPlaces && (
            <>
              <View style={styles.planHeader}>
                <Text style={styles.planTitle}>Your day in {city.name}</Text>
                <Text style={styles.planSubtitle}>
                  Curated places, organized by time of day
                </Text>
              </View>
              {TIME_SECTIONS.map((section) => (
                <TimeBasedSection
                  key={section.key}
                  section={section}
                  places={groupedPlaces?.[section.key] ?? []}
                />
              ))}
            </>
          )}

          {/* 10. Good to know — cultural context */}
          <GoodToKnow cultureEtiquetteMd={city.cultureEtiquetteMd ?? null} />

          {/* 11. Traveler presence */}
          <TravelerPresence
            count={travelerCount ?? 0}
            tripCount={tripCount ?? 0}
            cityName={city.name}
          />

          {/* Empty state */}
          {!hasPlaces && (!cityThreadData || cityThreadData.threads.length === 0) && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>{'\uD83D\uDDFA\uFE0F'}</Text>
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

  // Navigation
  nav: {
    paddingHorizontal: spacing.screenX,
    paddingVertical: spacing.md,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  backText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textPrimary,
  },

  // Hero
  heroContainer: {
    position: 'relative',
    height: 240,
  },
  hero: {
    width: '100%',
    height: 240,
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  heroOverlay: {
    position: 'absolute',
    bottom: spacing.xl,
    left: spacing.screenX,
    right: spacing.screenX,
  },
  heroCity: {
    fontFamily: fonts.serif,
    fontSize: 32,
    color: '#FFFFFF',
    lineHeight: 36,
  },
  heroCountry: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: spacing.xs,
  },

  imageAttribution: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textMuted,
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.xs,
  },
  // Content
  content: {
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxxxl,
  },

  // Positioning line
  positioningLine: {
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 24,
    color: colors.textPrimary,
    marginBottom: spacing.xxl,
  },

  // Section label (reused across sections)
  sectionLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },

  // Women's insights
  insightsSection: {
    marginBottom: spacing.xl,
  },
  insightRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  insightAccent: {
    width: 2,
    backgroundColor: colors.orange,
    opacity: 0.3,
    borderRadius: 1,
    marginRight: spacing.md,
    marginTop: 2,
    marginBottom: 2,
  },
  insightText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textPrimary,
    flex: 1,
  },

  // Credibility line
  credibilityLine: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
    marginBottom: spacing.xxl,
  },

  // Signal pills
  signalSection: {
    marginBottom: spacing.xxl,
  },
  signalRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  signalPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutralFill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    gap: spacing.xs,
  },
  signalDiamond: {
    fontSize: 10,
    color: colors.textMuted,
  },
  signalText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textPrimary,
  },

  // Trip nudge card
  tripNudge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.orangeFill,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.xxl,
    gap: spacing.md,
  },
  tripNudgeText: {
    flex: 1,
  },
  tripNudgeTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  tripNudgeSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: 2,
  },

  // Context signals (At a glance)
  contextSection: {
    marginBottom: spacing.xxl,
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

  // Editorial
  editorial: {
    marginBottom: spacing.xxl,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
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

  // Thread previews
  threadPreviewSection: {
    marginBottom: spacing.xxl,
  },
  threadPreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  seeAllLink: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.orange,
  },
  threadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  threadCardPressed: {
    opacity: 0.7,
  },
  threadIcon: {
    marginRight: spacing.md,
    marginTop: 2,
  },
  threadCardBody: {
    flex: 1,
    marginRight: spacing.sm,
  },
  threadTitle: {
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  threadMeta: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },

  // Neighborhood section
  neighborhoodSection: {
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
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
    borderRadius: radius.card,
  },
  tagText: {
    fontFamily: fonts.medium,
    fontSize: 11,
  },

  // Card description
  cardDesc: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 18,
    marginTop: 4,
  },

  // Full day card
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
    borderRadius: radius.full,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Plan header
  planHeader: {
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
    paddingTop: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  planTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    color: colors.textPrimary,
  },
  planSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },

  // Good to know
  goodToKnowSection: {
    marginTop: spacing.xxl,
    marginBottom: spacing.xl,
  },
  goodToKnowRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  goodToKnowText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    flex: 1,
  },

  // Traveler presence
  travelerPresenceSection: {
    marginTop: spacing.lg,
    marginBottom: spacing.xxl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  travelerPresenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  travelerPresenceText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
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
});
