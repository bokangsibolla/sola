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
import NavigationHeader from '@/components/NavigationHeader';
import { useNavContext } from '@/hooks/useNavContext';
import { usePostHog } from 'posthog-react-native';
import * as Sentry from '@sentry/react-native';
import { eventTracker } from '@/data/events/eventTracker';
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
import type { Place, Tag } from '@/data/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CAROUSEL_HEIGHT = 300;

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
  vibe: 'VIBE',
  safety: 'SAFETY',
  good_for: 'GOOD FOR',
  amenity: 'AMENITIES',
  cuisine: 'CUISINE',
  style: 'STYLE',
};

// ---------------------------------------------------------------------------
// PriceLabel ($ repeat — matches city page)
// ---------------------------------------------------------------------------

function PriceLabel({ level }: { level: number | null }) {
  if (!level || level <= 0) return null;
  return <Text style={styles.priceLabel}>{'$'.repeat(level)}</Text>;
}

// ---------------------------------------------------------------------------
// Place type icon for no-image placeholder
// ---------------------------------------------------------------------------

function placeTypeIcon(placeType: string): keyof typeof Ionicons.glyphMap {
  switch (placeType) {
    case 'hotel':
    case 'hostel':
    case 'homestay':
      return 'bed-outline';
    case 'restaurant':
    case 'cafe':
    case 'bakery':
      return 'cafe-outline';
    case 'bar':
    case 'club':
    case 'rooftop':
      return 'wine-outline';
    case 'activity':
    case 'tour':
      return 'compass-outline';
    case 'coworking':
      return 'laptop-outline';
    case 'wellness':
    case 'spa':
    case 'salon':
    case 'gym':
      return 'leaf-outline';
    case 'landmark':
      return 'camera-outline';
    default:
      return 'location-outline';
  }
}

// ---------------------------------------------------------------------------
// TrustStrip — enriched places only
// ---------------------------------------------------------------------------

function TrustStrip({ place }: { place: Place }) {
  const hasWhySelected = Boolean(place.whySelected);
  const sourcesCount = place.sourcesChecked?.length ?? 0;

  if (!hasWhySelected && sourcesCount === 0) return null;

  const isSolaChecked = place.verificationStatus === 'sola_checked';
  const shieldColor = isSolaChecked ? colors.greenSoft : colors.textSecondary;

  let sourceLine: string | null = null;
  if (sourcesCount > 0) {
    sourceLine =
      sourcesCount === 1
        ? 'Editorially reviewed'
        : sourcesCount <= 3
          ? `Checked across ${sourcesCount} sources`
          : `Cross-referenced with ${sourcesCount} sources`;
  }

  let dateLine: string | null = null;
  if (place.solaCheckedAt) {
    const d = new Date(place.solaCheckedAt);
    const month = d.toLocaleString('en-US', { month: 'short' });
    dateLine = `Verified ${month} ${d.getFullYear()}`;
  }

  return (
    <View style={styles.trustSection}>
      <Text style={styles.sectionLabel}>VERIFIED BY SOLA</Text>
      <View style={styles.trustRow}>
        <Ionicons name="shield-checkmark" size={16} color={shieldColor} />
        <View style={styles.trustContent}>
          {sourceLine && <Text style={styles.trustText}>{sourceLine}</Text>}
          {dateLine && <Text style={styles.trustDate}>{dateLine}</Text>}
        </View>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// AtAGlance — icon + label rows
// ---------------------------------------------------------------------------

function AtAGlance({ place }: { place: Place }) {
  const signals: { icon: keyof typeof Ionicons.glyphMap; label: string }[] = [];

  if (place.bestTimeOfDay && place.bestTimeOfDay !== 'any') {
    const timeLabels: Record<string, string> = {
      morning: 'Best visited in the morning',
      afternoon: 'Best visited in the afternoon',
      evening: 'Best visited in the evening',
    };
    const label = timeLabels[place.bestTimeOfDay];
    if (label) signals.push({ icon: 'sunny-outline', label });
  }

  if (place.estimatedDuration) {
    signals.push({ icon: 'time-outline', label: `Allow ~${place.estimatedDuration}` });
  }

  if (place.physicalLevel) {
    const levelLabels: Record<string, string> = {
      easy: 'Easy \u2014 accessible for all',
      moderate: 'Moderate physical activity',
      challenging: 'Challenging \u2014 good fitness helpful',
    };
    const label = levelLabels[place.physicalLevel];
    if (label) signals.push({ icon: 'fitness-outline', label });
  }

  if (place.bookingInfo) {
    signals.push({ icon: 'calendar-outline', label: place.bookingInfo });
  }

  if (place.pricePerNight) {
    signals.push({ icon: 'wallet-outline', label: `~$${place.pricePerNight}/night` });
  }

  if (signals.length === 0) return null;

  return (
    <View style={styles.glanceSection}>
      <Text style={styles.sectionLabel}>AT A GLANCE</Text>
      {signals.slice(0, 4).map((signal, i) => (
        <View key={i} style={styles.glanceRow}>
          <Ionicons name={signal.icon} size={16} color={colors.textSecondary} />
          <Text style={styles.glanceText}>{signal.label}</Text>
        </View>
      ))}
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

  useEffect(() => {
    if (id) {
      eventTracker.track('viewed_place', 'place', id);
    }
  }, [id]);

  const { data: place, loading, error, refetch } = useData(
    () => id ? getPlaceById(id) : Promise.resolve(undefined),
    ['place', id ?? ''],
  );
  const { data: media } = useData(
    () => id ? getPlaceMedia(id) : Promise.resolve([]),
    ['placeMedia', id ?? ''],
  );
  const { data: tags } = useData(
    () => id ? getPlaceTags(id) : Promise.resolve([]),
    ['placeTags', id ?? ''],
  );
  const { data: category } = useData(
    () => place?.primaryCategoryId ? getCategory(place.primaryCategoryId) : Promise.resolve(undefined),
    ['category', place?.primaryCategoryId ?? ''],
  );
  const { data: city } = useData(
    () => place?.cityId ? getCityById(place.cityId) : Promise.resolve(undefined),
    ['city', place?.cityId ?? ''],
  );

  const { parentTitle, ancestors, handleBack } = useNavContext({
    title: place?.name ?? 'Place',
    path: `/(tabs)/discover/place-detail/${id}`,
    fallbackCrumbs: [
      { label: 'Discover', path: '/(tabs)/discover' },
      ...(city ? [{ label: city.name, path: `/(tabs)/discover/city/${city.slug}` }] : []),
    ],
  });

  const { userId } = useAuth();
  const { data: profile } = useData(
    () => userId ? getProfileById(userId) : Promise.resolve(null),
    ['profile', userId],
  );
  const { data: isSaved } = useData(
    () => (userId && id) ? isPlaceSaved(userId, id) : Promise.resolve(false),
    ['placeSaved', userId, id],
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
      Sentry.captureException(error);
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

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error.message} onRetry={refetch} />;

  if (!place) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.notFound}>Place not found</Text>
      </View>
    );
  }

  // Now safe to access place properties directly
  const mediaArr = Array.isArray(media) ? media : [];
  const images = mediaArr.filter((m) => m.mediaType === 'image');
  const highlights = place.highlights ?? [];
  const considerations = place.considerations ?? [];
  const displayType = place.originalType
    ? place.originalType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    : category?.name || place.placeType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const useSerifName = false;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <NavigationHeader
        title={place.name}
        parentTitle={parentTitle ?? city?.name ?? 'Back'}
        ancestors={ancestors}
        onBack={handleBack}
        rightActions={
          <Pressable onPress={handleSave} hitSlop={12} disabled={!canSave}>
            <Ionicons
              name={saved ? 'heart' : 'heart-outline'}
              size={24}
              color={saved ? colors.orange : canSave ? colors.textPrimary : colors.textMuted}
            />
          </Pressable>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image carousel */}
        {images.length > 0 ? (
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
              <View style={styles.counterPill}>
                <Text style={styles.counterText}>
                  {activeImageIndex + 1}/{images.length}
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.noImagePlaceholder}>
            <Ionicons
              name={placeTypeIcon(place.placeType)}
              size={40}
              color={colors.textMuted}
            />
          </View>
        )}

        <View style={styles.content}>
          {/* Identity block */}
          <Text style={styles.typeLabel}>{displayType.toUpperCase()}</Text>
          <View style={styles.nameRow}>
            <Text style={useSerifName ? styles.placeNameSerif : styles.placeNameSans}>
              {place.name}
            </Text>
            <PriceLabel level={place.priceLevel} />
          </View>
          {city && <Text style={styles.cityLabel}>{city.name}</Text>}

          {/* Trust Strip — enriched only */}
          <TrustStrip place={place} />

          {/* Editorial — OUR TAKE (enriched) or plain description (basic) */}
          {place.whySelected ? (
            <View style={styles.editorialSection}>
              <Text style={styles.sectionLabel}>OUR TAKE</Text>
              <View style={styles.accentRow}>
                <View style={styles.accentBar} />
                <Text style={styles.editorialText}>{place.whySelected}</Text>
              </View>
            </View>
          ) : place.description ? (
            <View style={styles.editorialSection}>
              <Text style={styles.descriptionText}>{place.description}</Text>
            </View>
          ) : null}

          {/* Women's voice — enriched only */}
          {place.soloFemaleReviews && (
            <View style={styles.womensVoiceSection}>
              <Text style={styles.sectionLabel}>FROM WOMEN WHO'VE BEEN HERE</Text>
              <View style={styles.accentRow}>
                <View style={styles.accentBar} />
                <Text style={styles.womensVoiceText}>{place.soloFemaleReviews}</Text>
              </View>
            </View>
          )}

          {/* At a Glance */}
          <AtAGlance place={place} />

          {/* Highlights → WHAT STANDS OUT */}
          {highlights.length > 0 && (
            <View style={styles.highlightsSection}>
              <Text style={styles.sectionLabel}>WHAT STANDS OUT</Text>
              <View style={styles.highlightsRow}>
                {highlights.map((highlight, idx) => (
                  <View key={idx} style={styles.signalPill}>
                    <Text style={styles.signalDiamond}>{'\u25C7'}</Text>
                    <Text style={styles.signalText}>{highlight}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Good to Know */}
          {considerations.length > 0 && (
            <View style={styles.considerationsSection}>
              <Text style={styles.sectionLabel}>GOOD TO KNOW</Text>
              {considerations.map((item, idx) => (
                <View key={idx} style={styles.considerationRow}>
                  <Ionicons name="information-circle-outline" size={16} color={colors.textMuted} />
                  <Text style={styles.considerationText}>{item}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Tags grouped */}
          {Object.keys(groupedTags).length > 0 && (
            <View style={styles.tagsSection}>
              {Object.entries(groupedTags).map(([group, groupTags]) => (
                <View key={group} style={styles.tagGroup}>
                  <Text style={styles.tagGroupLabel}>
                    {TAG_GROUP_CONFIG[group] ?? group.toUpperCase()}
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

          {/* Details */}
          {(place.address || place.hoursText || place.phone || place.website) && (
            <View style={styles.detailsSection}>
              <Text style={styles.sectionLabel}>DETAILS</Text>
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

          {/* Why This Fits You */}
          {fitMessage && (
            <View style={styles.fitSection}>
              <Text style={styles.sectionLabel}>WHY THIS FITS YOU</Text>
              <View style={styles.fitCard}>
                <Ionicons name="sparkles" size={16} color={colors.orange} />
                <Text style={styles.fitBody}>{fitMessage}</Text>
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
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
                color={colors.background}
              />
              <Text style={styles.actionBtnText}>
                {!canSave ? 'Sign in to save' : saved ? 'Saved' : 'Save'}
              </Text>
            </Pressable>

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

  // Carousel
  carouselImage: {
    width: SCREEN_WIDTH,
    height: CAROUSEL_HEIGHT,
  },
  counterPill: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  counterText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.background,
  },
  noImagePlaceholder: {
    width: SCREEN_WIDTH,
    height: CAROUSEL_HEIGHT,
    backgroundColor: colors.neutralFill,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Content
  content: {
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.xl,
  },

  // Identity block
  typeLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    letterSpacing: 0.5,
    color: colors.orange,
    marginBottom: spacing.xs,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  placeNameSerif: {
    fontFamily: fonts.semiBold,
    fontSize: 26,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  placeNameSans: {
    fontFamily: fonts.semiBold,
    fontSize: 24,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  priceLabel: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textMuted,
  },
  cityLabel: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },

  // Section label (shared)
  sectionLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },

  // Trust strip
  trustSection: {
    marginTop: spacing.xxl,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  trustContent: {
    flex: 1,
    gap: spacing.xs,
  },
  trustText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textSecondary,
  },
  trustDate: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },

  // Editorial (OUR TAKE)
  editorialSection: {
    marginTop: spacing.xxl,
  },
  accentRow: {
    flexDirection: 'row',
  },
  accentBar: {
    width: 2,
    backgroundColor: colors.orange,
    opacity: 0.3,
    borderRadius: 1,
    marginRight: spacing.md,
    marginTop: 2,
    marginBottom: 2,
  },
  editorialText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
    flex: 1,
  },
  descriptionText: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 22,
  },

  // Women's voice
  womensVoiceSection: {
    marginTop: spacing.xxl,
  },
  womensVoiceText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    fontStyle: 'italic',
    flex: 1,
  },

  // At a Glance
  glanceSection: {
    marginTop: spacing.xxl,
    gap: spacing.sm,
  },
  glanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  glanceText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
  },

  // Highlights (signal pills)
  highlightsSection: {
    marginTop: spacing.xxl,
  },
  highlightsRow: {
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

  // Good to Know (Considerations)
  considerationsSection: {
    marginTop: spacing.xxl,
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

  // Tags
  tagsSection: {
    marginTop: spacing.xxl,
    gap: spacing.md,
  },
  tagGroup: {
    gap: spacing.xs,
  },
  tagGroupLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.textMuted,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: spacing.xs,
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

  // Details
  detailsSection: {
    marginTop: spacing.xxl,
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

  // Fit section
  fitSection: {
    marginTop: spacing.xxl,
  },
  fitCard: {
    backgroundColor: colors.orangeFill,
    borderRadius: radius.card,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  fitBody: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
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
    borderRadius: radius.full,
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
