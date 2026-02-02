import { useCallback, useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import { useData } from '@/hooks/useData';
import {
  getCityBySlug,
  getCityContent,
  getAreasByCity,
  getPlacesByCity,
  getPlacesByArea,
  getPlaceFirstImage,
  getPlaceTags,
  isPlaceSaved,
  toggleSavePlace,
} from '@/data/api';
import { useAuth } from '@/state/AuthContext';
import type { Place, Tag } from '@/data/types';

// ---------------------------------------------------------------------------
// Category grouping
// ---------------------------------------------------------------------------

const SECTIONS: { title: string; types: Place['placeType'][] }[] = [
  { title: 'Where to stay', types: ['hotel', 'hostel'] },
  { title: 'Eat & Drink', types: ['restaurant', 'cafe', 'bar'] },
  { title: 'Things to do', types: ['activity', 'landmark', 'wellness'] },
  { title: 'Coworking', types: ['coworking'] },
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
// Price dots
// ---------------------------------------------------------------------------

function PriceDots({ level }: { level: number | null }) {
  if (!level) return null;
  const max = 4;
  const dots: string[] = [];
  for (let i = 0; i < max; i++) {
    dots.push(i < level ? '\u25CF' : '\u25CB');
  }
  return <Text style={styles.priceDots}>{dots.join('')}</Text>;
}

// ---------------------------------------------------------------------------
// Place Card
// ---------------------------------------------------------------------------

function PlaceCard({ place }: { place: Place }) {
  const router = useRouter();
  const { data: imageUrl } = useData(() => getPlaceFirstImage(place.id), [place.id]);
  const { userId } = useAuth();
  const { data: tags } = useData(() => getPlaceTags(place.id), [place.id]);
  const { data: isSaved } = useData(() => isPlaceSaved(userId!, place.id), [userId, place.id]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isSaved !== null) setSaved(isSaved);
  }, [isSaved]);

  const handleSave = useCallback(async () => {
    setSaved((prev) => !prev);
    await toggleSavePlace(userId!, place.id);
  }, [userId, place.id]);

  return (
    <Pressable
      onPress={() => router.push(`/explore/place-detail/${place.id}`)}
      style={styles.card}
    >
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.cardImage} />
      ) : (
        <View style={[styles.cardImage, styles.cardImagePlaceholder]} />
      )}

      <View style={styles.cardBody}>
        {/* Top row: name + price */}
        <View style={styles.cardTopRow}>
          <Text style={styles.cardName} numberOfLines={1}>
            {place.name}
          </Text>
          <PriceDots level={place.priceLevel} />
        </View>

        {/* Tag pills */}
        {(tags ?? []).length > 0 && (
          <View style={styles.tagRow}>
            {(tags ?? []).map((tag) => {
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

        {/* Description */}
        {place.description ? (
          <Text style={styles.cardDesc} numberOfLines={2}>
            {place.description}
          </Text>
        ) : null}

        {/* Save button */}
        <Pressable onPress={handleSave} style={styles.saveBtn} hitSlop={8}>
          <Ionicons
            name={saved ? 'heart' : 'heart-outline'}
            size={18}
            color={saved ? colors.orange : colors.textMuted}
          />
          <Text
            style={[
              styles.saveText,
              { color: saved ? colors.orange : colors.textMuted },
            ]}
          >
            {saved ? 'Saved' : 'Save'}
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Main Screen
// ---------------------------------------------------------------------------

export default function PlaceScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data: city, loading, error, refetch } = useData(() => getCityBySlug(slug ?? ''), [slug]);
  const { data: content } = useData(
    () => city ? getCityContent(city.id) : Promise.resolve(undefined),
    [city?.id],
  );
  const { data: areas } = useData(
    () => city ? getAreasByCity(city.id) : Promise.resolve([]),
    [city?.id],
  );

  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);

  const { data: allPlaces } = useData(
    () => {
      if (selectedAreaId) return getPlacesByArea(selectedAreaId);
      if (city) return getPlacesByCity(city.id);
      return Promise.resolve([]);
    },
    [selectedAreaId, city?.id],
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

  const heroUrl = city.heroImageUrl ?? content?.heroImageUrl ?? null;
  const tagline = content?.subtitle ?? null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Navigation */}
      <View style={styles.nav}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        {heroUrl && (
          <Image source={{ uri: heroUrl }} style={styles.hero} />
        )}

        <View style={styles.content}>
          <Text style={styles.cityName}>{city.name}</Text>
          {tagline && (
            <Text style={styles.tagline}>{tagline}</Text>
          )}

          {/* Neighborhood pills */}
          {(areas ?? []).length > 0 && (
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
                  All
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
          )}

          {/* Categorized sections */}
          {SECTIONS.map((section) => {
            const places = (allPlaces ?? []).filter((p) =>
              section.types.includes(p.placeType),
            );
            if (places.length === 0) return null;
            return (
              <View key={section.title}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                {places.map((place) => (
                  <PlaceCard key={place.id} place={place} />
                ))}
              </View>
            );
          })}
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

  // Neighborhood pills
  pillScroll: {
    marginTop: spacing.xl,
  },
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

  // Section
  sectionTitle: {
    ...typography.label,
    color: colors.textPrimary,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
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
  priceDots: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    letterSpacing: 1,
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

  // Save
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 4,
    marginTop: 4,
  },
  saveText: {
    fontFamily: fonts.medium,
    fontSize: 12,
  },
});
