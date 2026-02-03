import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePostHog } from 'posthog-react-native';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import { useData } from '@/hooks/useData';
import {
  getPlaceById,
  getPlaceMedia,
  getPlaceTags,
  getCategory,
  getCityById,
  getProfileById,
  isPlaceSaved,
  toggleSavePlace,
} from '@/data/api';
import { useAuth } from '@/state/AuthContext';
import type { Tag } from '@/data/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CAROUSEL_HEIGHT = 260;

// ---------------------------------------------------------------------------
// Tag colors
// ---------------------------------------------------------------------------

function tagColors(filterGroup: Tag['filterGroup']): { bg: string; fg: string } {
  switch (filterGroup) {
    case 'vibe':
      return { bg: colors.orangeFill, fg: colors.orange };
    case 'safety':
      return { bg: colors.greenFill, fg: colors.greenSoft };
    case 'good_for':
      return { bg: colors.blueFill, fg: colors.blueSoft };
    default:
      return { bg: colors.borderSubtle, fg: colors.textSecondary };
  }
}

// ---------------------------------------------------------------------------
// Tag group config
// ---------------------------------------------------------------------------

const TAG_GROUP_CONFIG: Record<string, string> = {
  vibe: 'Vibe',
  safety: 'Safety',
  good_for: 'Good for',
  amenity: 'Amenities',
  cuisine: 'Cuisine',
  style: 'Style',
};

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
// Main Screen
// ---------------------------------------------------------------------------

export default function PlaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const posthog = usePostHog();

  useEffect(() => {
    if (id) {
      posthog.capture('place_detail_viewed', { place_id: id });
    }
  }, [id, posthog]);

  const { data: place, loading, error, refetch } = useData(() => getPlaceById(id ?? ''), [id]);
  const { data: media } = useData(() => getPlaceMedia(id ?? ''), [id]);
  const { data: tags } = useData(() => getPlaceTags(id ?? ''), [id]);
  const { data: category } = useData(
    () => place?.primaryCategoryId ? getCategory(place.primaryCategoryId) : Promise.resolve(undefined),
    [place?.primaryCategoryId],
  );
  const { data: city } = useData(
    () => place?.cityId ? getCityById(place.cityId) : Promise.resolve(undefined),
    [place?.cityId],
  );

  const { userId } = useAuth();
  const { data: profile } = useData(
    () => userId ? getProfileById(userId) : Promise.resolve(undefined),
    [userId],
  );
  const { data: isSaved } = useData(
    () => (userId && id) ? isPlaceSaved(userId, id) : Promise.resolve(false),
    [userId, id],
  );
  const [saved, setSaved] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (isSaved !== null) setSaved(isSaved);
  }, [isSaved]);

  const canSave = Boolean(userId && id);

  const handleSave = useCallback(async () => {
    if (!userId || !id) return;

    const newSaved = !saved;
    setSaved(newSaved);
    posthog.capture(newSaved ? 'place_saved' : 'place_unsaved', { place_id: id });

    try {
      await toggleSavePlace(userId, id);
    } catch (error) {
      // Revert on error
      setSaved(saved);
      console.error('Failed to save place:', error);
    }
  }, [userId, id, saved, posthog]);

  // Group tags by filterGroup
  const groupedTags = useMemo(() => {
    const groups: Record<string, Tag[]> = {};
    for (const tag of (tags ?? [])) {
      const key = tag.filterGroup;
      if (!groups[key]) groups[key] = [];
      groups[key].push(tag);
    }
    return groups;
  }, [tags]);

  // "Why this fits you" matching
  const fitMessage = useMemo(() => {
    const userInterests = (profile?.interests ?? []).map((s) =>
      s.toLowerCase(),
    );
    if (userInterests.length === 0) return null;

    const matchingTags = (tags ?? []).filter((t) =>
      userInterests.some(
        (interest) =>
          t.label.toLowerCase().includes(interest) ||
          interest.includes(t.label.toLowerCase()),
      ),
    );

    if (matchingTags.length === 0) return null;

    const tagLabels = matchingTags
      .slice(0, 3)
      .map((t) => t.label.toLowerCase());
    const lastTag = tagLabels.pop();
    const tagStr =
      tagLabels.length > 0
        ? `${tagLabels.join(', ')} and ${lastTag}`
        : lastTag;

    return `Based on your preferences, this place matches your interest in ${tagStr}.`;
  }, [tags, profile]);

  const images = (media ?? []).filter((m) => m.mediaType === 'image');

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error.message} onRetry={refetch} />;

  if (!place) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.notFound}>Place not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Pressable onPress={handleSave} hitSlop={12} disabled={!canSave}>
          <Ionicons
            name={saved ? 'heart' : 'heart-outline'}
            size={24}
            color={saved ? colors.orange : canSave ? colors.textPrimary : colors.textMuted}
          />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image carousel */}
        {images.length > 0 && (
          <View>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                const index = Math.round(
                  e.nativeEvent.contentOffset.x / SCREEN_WIDTH,
                );
                setActiveImageIndex(index);
              }}
            >
              {images.map((img) => (
                <Image
                  key={img.id}
                  source={{ uri: img.url }}
                  style={styles.carouselImage}
                  contentFit="cover"
                  transition={200}
                />
              ))}
            </ScrollView>
            {images.length > 1 && (
              <View style={styles.dotsRow}>
                {images.map((img, i) => (
                  <View
                    key={img.id}
                    style={[
                      styles.dot,
                      i === activeImageIndex && styles.dotActive,
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        <View style={styles.content}>
          {/* Name + price */}
          <View style={styles.nameRow}>
            <Text style={styles.placeName}>{place.name}</Text>
            <PriceDots level={place.priceLevel} />
          </View>

          {/* Category + city */}
          <View style={styles.metaRow}>
            {category && (
              <View style={styles.categoryPill}>
                <Text style={styles.categoryText}>{category.name}</Text>
              </View>
            )}
            {city && <Text style={styles.cityLabel}>{city.name}</Text>}
          </View>

          {/* Tags grouped */}
          {Object.keys(groupedTags).length > 0 && (
            <View style={styles.tagsSection}>
              {Object.entries(groupedTags).map(([group, groupTags]) => (
                <View key={group} style={styles.tagGroup}>
                  <Text style={styles.tagGroupLabel}>
                    {TAG_GROUP_CONFIG[group] ?? group}
                  </Text>
                  <View style={styles.tagRow}>
                    {groupTags.map((tag) => {
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
                </View>
              ))}
            </View>
          )}

          {/* Description */}
          {place.description && (
            <Text style={styles.description}>{place.description}</Text>
          )}

          {/* Details */}
          {(place.address || place.hoursText || place.phone || place.website) && (
            <View style={styles.detailsSection}>
              <Text style={styles.detailsSectionTitle}>Details</Text>
              {place.address && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailIcon}>📍</Text>
                  <Text style={styles.detailText}>{place.address}</Text>
                </View>
              )}
              {place.hoursText && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailIcon}>🕐</Text>
                  <Text style={styles.detailText}>{place.hoursText}</Text>
                </View>
              )}
              {place.phone && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailIcon}>📞</Text>
                  <Text style={styles.detailText}>{place.phone}</Text>
                </View>
              )}
              {place.website && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailIcon}>🌐</Text>
                  <Text style={styles.detailText} numberOfLines={1}>
                    {place.website}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Why this fits you */}
          {fitMessage && (
            <>
              <View style={styles.separator} />
              <View style={styles.fitSection}>
                <Text style={styles.fitTitle}>Why this fits you</Text>
                <Text style={styles.fitBody}>{fitMessage}</Text>
              </View>
            </>
          )}

          {/* Large save button */}
          <Pressable
            onPress={handleSave}
            disabled={!canSave}
            style={[
              styles.saveBtnLarge,
              saved && styles.saveBtnLargeSaved,
              !canSave && styles.saveBtnLargeDisabled,
            ]}
          >
            <Ionicons
              name={saved ? 'heart' : 'heart-outline'}
              size={20}
              color={colors.background}
            />
            <Text style={styles.saveBtnLargeText}>
              {!canSave ? 'Sign in to save' : saved ? 'Saved' : 'Save to collection'}
            </Text>
          </Pressable>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: insets.bottom + spacing.xxl }} />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },

  // Carousel
  carouselImage: {
    width: SCREEN_WIDTH,
    height: CAROUSEL_HEIGHT,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.borderDefault,
  },
  dotActive: {
    backgroundColor: colors.orange,
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // Content
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  placeName: {
    ...typography.h2,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  priceDots: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    letterSpacing: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  categoryPill: {
    backgroundColor: colors.orangeFill,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  categoryText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.orange,
  },
  cityLabel: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
  },

  // Tags
  tagsSection: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  tagGroup: {
    gap: spacing.xs,
  },
  tagGroupLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.textSecondary,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  tagText: {
    fontFamily: fonts.medium,
    fontSize: 12,
  },

  // Description
  description: {
    ...typography.body,
    color: colors.textPrimary,
    marginTop: spacing.xl,
  },

  // Details
  detailsSection: {
    marginTop: spacing.xl,
  },
  detailsSectionTitle: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  detailIcon: {
    fontSize: 16,
    lineHeight: 22,
  },
  detailText: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
  },

  // Separator
  separator: {
    height: 1,
    backgroundColor: colors.borderDefault,
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },

  // Fit section
  fitSection: {
    gap: spacing.sm,
  },
  fitTitle: {
    ...typography.label,
    color: colors.textPrimary,
  },
  fitBody: {
    ...typography.body,
    color: colors.textSecondary,
  },

  // Large save button
  saveBtnLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.orange,
    borderRadius: radius.button,
    paddingVertical: 14,
    marginTop: spacing.xxl,
  },
  saveBtnLargeSaved: {
    backgroundColor: colors.greenSoft,
  },
  saveBtnLargeDisabled: {
    backgroundColor: colors.textMuted,
  },
  saveBtnLargeText: {
    ...typography.button,
    color: colors.background,
  },
});
