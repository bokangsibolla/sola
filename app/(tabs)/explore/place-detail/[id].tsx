import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  Linking,
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
// Rating display
// ---------------------------------------------------------------------------

function RatingBadge({ rating, reviewCount }: { rating: number | null; reviewCount: number | null }) {
  if (!rating) return null;
  return (
    <View style={styles.ratingContainer}>
      <Ionicons name="star" size={14} color={colors.orange} />
      <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
      {reviewCount && reviewCount > 0 && (
        <Text style={styles.reviewCount}>({reviewCount.toLocaleString()} reviews)</Text>
      )}
    </View>
  );
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
    () => place?.primaryCategoryId ? getCategory(place.primaryCategoryId) : Promise.resolve(null),
    [place?.primaryCategoryId],
  );
  const { data: city } = useData(
    () => place?.cityId ? getCityById(place.cityId) : Promise.resolve(null),
    [place?.cityId],
  );

  const { userId } = useAuth();
  const { data: profile } = useData(
    () => userId ? getProfileById(userId) : Promise.resolve(null),
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

  const handleOpenMaps = useCallback(() => {
    if (!place) return;

    // Use googleMapsUrl if available, otherwise construct from coordinates
    const url = place.googleMapsUrl
      || (place.lat && place.lng
        ? `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`
        : place.googlePlaceId
          ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}&query_place_id=${place.googlePlaceId}`
          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' ' + (place.address || ''))}`
        );

    posthog.capture('place_maps_opened', { place_id: id, place_name: place.name });
    Linking.openURL(url);
  }, [place, id, posthog]);

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

  // Get highlights and considerations arrays
  const highlights = place?.highlights ?? [];
  const considerations = place?.considerations ?? [];

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error.message} onRetry={refetch} />;

  if (!place) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.notFound}>Place not found</Text>
      </View>
    );
  }

  // Determine display type (more specific than placeType)
  const displayType = place.originalType
    ? place.originalType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    : category?.name || place.placeType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header with contextual back */}
      <View style={styles.header}>
        <Pressable
          onPress={() => city ? router.push(`/(tabs)/explore/city/${city.slug}` as any) : router.back()}
          hitSlop={12}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
          {city && (
            <Text style={styles.backLabel}>Back to {city.name}</Text>
          )}
        </Pressable>
        <Pressable onPress={handleSave} hitSlop={12} disabled={!canSave}>
          <Ionicons
            name={saved ? 'heart' : 'heart-outline'}
            size={24}
            color={saved ? colors.orange : canSave ? colors.textPrimary : colors.textMuted}
          />
        </Pressable>
      </View>

      {/* Breadcrumb */}
      {city && (
        <View style={styles.breadcrumb}>
          <Pressable onPress={() => router.push(`/(tabs)/explore/city/${city.slug}` as any)}>
            <Text style={styles.breadcrumbLink}>{city.name}</Text>
          </Pressable>
          <Text style={styles.breadcrumbSeparator}>→</Text>
          <Text style={styles.breadcrumbCurrent} numberOfLines={1}>{place.name}</Text>
        </View>
      )}

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

          {/* Type + city */}
          <View style={styles.metaRow}>
            <View style={styles.categoryPill}>
              <Text style={styles.categoryText}>{displayType}</Text>
            </View>
            {city && <Text style={styles.cityLabel}>{city.name}</Text>}
            {place.pricePerNight && (
              <Text style={styles.pricePerNight}>~${place.pricePerNight}/night</Text>
            )}
          </View>

          {/* Rating */}
          <RatingBadge rating={place.googleRating} reviewCount={place.googleReviewCount} />

          {/* Highlights */}
          {highlights.length > 0 && (
            <View style={styles.highlightsSection}>
              <Text style={styles.sectionTitle}>Highlights</Text>
              <View style={styles.highlightsRow}>
                {highlights.map((highlight, idx) => (
                  <View key={idx} style={styles.highlightPill}>
                    <Ionicons name="checkmark-circle" size={14} color={colors.greenSoft} />
                    <Text style={styles.highlightText}>{highlight}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Why We Love It */}
          {place.whySelected && (
            <View style={styles.whySection}>
              <Text style={styles.sectionTitle}>Why We Love It</Text>
              <Text style={styles.whyText}>{place.whySelected}</Text>
            </View>
          )}

          {/* Solo Travelers Say */}
          {place.soloFemaleReviews && (
            <View style={styles.reviewsSection}>
              <Text style={styles.sectionTitle}>Solo Travelers Say</Text>
              <View style={styles.quoteBox}>
                <Ionicons name="chatbubble-outline" size={16} color={colors.textMuted} style={styles.quoteIcon} />
                <Text style={styles.quoteText}>{place.soloFemaleReviews}</Text>
              </View>
            </View>
          )}

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

          {/* Good to Know (Considerations) */}
          {considerations.length > 0 && (
            <View style={styles.considerationsSection}>
              <Text style={styles.sectionTitle}>Good to Know</Text>
              {considerations.map((item, idx) => (
                <View key={idx} style={styles.considerationRow}>
                  <Ionicons name="information-circle-outline" size={16} color={colors.textMuted} />
                  <Text style={styles.considerationText}>{item}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Description (fallback if no whySelected) */}
          {!place.whySelected && place.description && (
            <Text style={styles.description}>{place.description}</Text>
          )}

          {/* Details */}
          {(place.address || place.hoursText || place.phone || place.website) && (
            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>Details</Text>
              {place.address && (
                <View style={styles.detailRow}>
                  <Ionicons name="location-outline" size={16} color={colors.textMuted} />
                  <Text style={styles.detailText}>{place.address}</Text>
                </View>
              )}
              {place.hoursText && (
                <View style={styles.detailRow}>
                  <Ionicons name="time-outline" size={16} color={colors.textMuted} />
                  <Text style={styles.detailText}>{place.hoursText}</Text>
                </View>
              )}
              {place.phone && (
                <View style={styles.detailRow}>
                  <Ionicons name="call-outline" size={16} color={colors.textMuted} />
                  <Text style={styles.detailText}>{place.phone}</Text>
                </View>
              )}
              {place.website && (
                <Pressable
                  style={styles.detailRow}
                  onPress={() => Linking.openURL(place.website!.startsWith('http') ? place.website! : `https://${place.website}`)}
                >
                  <Ionicons name="globe-outline" size={16} color={colors.blueSoft} />
                  <Text style={[styles.detailText, styles.linkText]} numberOfLines={1}>
                    {place.website}
                  </Text>
                </Pressable>
              )}
            </View>
          )}

          {/* Why this fits you */}
          {fitMessage && (
            <>
              <View style={styles.separator} />
              <View style={styles.fitSection}>
                <Text style={styles.sectionTitle}>Why this fits you</Text>
                <Text style={styles.fitBody}>{fitMessage}</Text>
              </View>
            </>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {/* Save button */}
            <Pressable
              onPress={handleSave}
              disabled={!canSave}
              style={[
                styles.actionBtn,
                styles.saveBtn,
                saved && styles.saveBtnSaved,
                !canSave && styles.actionBtnDisabled,
              ]}
            >
              <Ionicons
                name={saved ? 'heart' : 'heart-outline'}
                size={20}
                color={saved ? colors.background : colors.background}
              />
              <Text style={styles.actionBtnText}>
                {!canSave ? 'Sign in to save' : saved ? 'Saved' : 'Save'}
              </Text>
            </Pressable>

            {/* Google Maps button */}
            <Pressable
              onPress={handleOpenMaps}
              style={[styles.actionBtn, styles.mapsBtn]}
            >
              <Ionicons name="map-outline" size={20} color={colors.textPrimary} />
              <Text style={styles.mapsBtnText}>View on Maps</Text>
            </Pressable>
          </View>
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  backLabel: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textSecondary,
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
  },
  breadcrumbLink: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.orange,
  },
  breadcrumbSeparator: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
  breadcrumbCurrent: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
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
    flexWrap: 'wrap',
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
  pricePerNight: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textSecondary,
  },

  // Rating
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.sm,
  },
  ratingText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  reviewCount: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },

  // Section title
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },

  // Highlights
  highlightsSection: {
    marginTop: spacing.xl,
  },
  highlightsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  highlightPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.greenFill,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  highlightText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.greenSoft,
  },

  // Why We Love It
  whySection: {
    marginTop: spacing.xl,
  },
  whyText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },

  // Solo Travelers Say
  reviewsSection: {
    marginTop: spacing.xl,
  },
  quoteBox: {
    backgroundColor: colors.neutralFill,
    borderRadius: radius.card,
    padding: spacing.md,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  quoteIcon: {
    marginTop: 2,
  },
  quoteText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 20,
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

  // Good to Know (Considerations)
  considerationsSection: {
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  considerationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  considerationText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
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
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  detailText: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
  },
  linkText: {
    color: colors.blueSoft,
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
  fitBody: {
    ...typography.body,
    color: colors.textSecondary,
  },

  // Action buttons
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xxl,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: 14,
    borderRadius: radius.button,
  },
  saveBtn: {
    backgroundColor: colors.orange,
  },
  saveBtnSaved: {
    backgroundColor: colors.greenSoft,
  },
  actionBtnDisabled: {
    backgroundColor: colors.textMuted,
  },
  actionBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.background,
  },
  mapsBtn: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  mapsBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
});
