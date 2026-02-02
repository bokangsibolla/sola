import { useCallback, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  getTripById,
  getCityById,
  getCountryByIso2,
  getPlacesByCity,
  getPlaceFirstImage,
  getPlaceTags,
  isPlaceSaved,
  toggleSavePlace,
} from '@/data/api';
import { useData } from '@/hooks/useData';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import { getEmergencyNumbers } from '@/data/safety';
import type { Place, Tag } from '@/data/types';
import { useAuth } from '@/state/AuthContext';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string): string {
  const d = new Date(iso);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function getFlag(iso2: string): string {
  return iso2
    .toUpperCase()
    .split('')
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join('');
}

function tagColors(filterGroup: Tag['filterGroup']): { bg: string; fg: string } {
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
// Place Card (same style as city detail)
// ---------------------------------------------------------------------------

function PlaceCard({ place }: { place: Place }) {
  const router = useRouter();
  const imageUrl = getPlaceFirstImage(place.id);
  const tags = getPlaceTags(place.id).slice(0, 3);
  const { userId } = useAuth();
  const [saved, setSaved] = useState(() => isPlaceSaved(userId, place.id));

  const handleSave = useCallback(() => {
    const next = toggleSavePlace(userId, place.id);
    setSaved(next);
  }, [place.id]);

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
        <Text style={styles.cardName} numberOfLines={1}>
          {place.name}
        </Text>

        {tags.length > 0 && (
          <View style={styles.tagRow}>
            {tags.map((tag) => {
              const tc = tagColors(tag.filterGroup);
              return (
                <View key={tag.id} style={[styles.tagPill, { backgroundColor: tc.bg }]}>
                  <Text style={[styles.tagText, { color: tc.fg }]}>{tag.label}</Text>
                </View>
              );
            })}
          </View>
        )}

        {place.description ? (
          <Text style={styles.cardDesc} numberOfLines={2}>{place.description}</Text>
        ) : null}

        <Pressable onPress={handleSave} style={styles.saveBtn} hitSlop={8}>
          <Ionicons
            name={saved ? 'heart' : 'heart-outline'}
            size={18}
            color={saved ? colors.orange : colors.textMuted}
          />
          <Text style={[styles.saveBtnText, { color: saved ? colors.orange : colors.textMuted }]}>
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

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data: trip, loading, error, refetch } = useData(() => getTripById(id ?? ''), [id]);

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error.message} onRetry={refetch} />;

  const city = trip ? getCityById(trip.destinationCityId) : undefined;
  const country = trip ? getCountryByIso2(trip.countryIso2) : undefined;
  const emergency = trip ? getEmergencyNumbers(trip.countryIso2) : null;
  const places = city ? getPlacesByCity(city.id).slice(0, 4) : [];
  const heroUrl = city?.heroImageUrl ?? null;
  const flag = trip ? getFlag(trip.countryIso2) : '';

  if (!trip) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.nav}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </Pressable>
        </View>
        <Text style={styles.notFound}>Trip not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.nav}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero image */}
        {heroUrl && (
          <Image source={{ uri: heroUrl }} style={styles.hero} />
        )}

        <View style={styles.content}>
          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={styles.flag}>{flag}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.destination}>{trip.destinationName}</Text>
              <Text style={styles.countryName}>{country?.name ?? ''}</Text>
            </View>
          </View>

          {/* Date info */}
          <View style={styles.dateRow}>
            <View style={styles.dateChip}>
              <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.dateText}>
                {formatDate(trip.arriving)} - {formatDate(trip.leaving)}
              </Text>
            </View>
            <View style={styles.nightsChip}>
              <Text style={styles.nightsText}>
                {trip.nights} {trip.nights === 1 ? 'night' : 'nights'}
              </Text>
            </View>
          </View>

          {/* Notes */}
          {trip.notes ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notes</Text>
              <Text style={styles.notesText}>{trip.notes}</Text>
            </View>
          ) : null}

          {/* Places to visit */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Places to visit</Text>
            {places.length > 0 ? (
              places.map((place) => <PlaceCard key={place.id} place={place} />)
            ) : (
              <Text style={styles.emptyText}>No places found for this city</Text>
            )}
            <Pressable style={styles.addPlaceBtn}>
              <Ionicons name="add-circle-outline" size={18} color={colors.orange} />
              <Text style={styles.addPlaceText}>Add a place</Text>
            </Pressable>
          </View>

          {/* Emergency numbers */}
          {emergency && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Emergency numbers</Text>
              <View style={styles.emergencyCard}>
                <EmergencyRow label="Police" number={emergency.police} />
                <EmergencyRow label="Ambulance" number={emergency.ambulance} />
                <EmergencyRow label="Fire" number={emergency.fire} />
                {emergency.general && (
                  <EmergencyRow label="General" number={emergency.general} last />
                )}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function EmergencyRow({ label, number, last }: { label: string; number: string; last?: boolean }) {
  return (
    <View style={[styles.emergencyRow, last && { borderBottomWidth: 0 }]}>
      <Text style={styles.emergencyLabel}>{label}</Text>
      <Text style={styles.emergencyNumber}>{number}</Text>
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

  // Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  flag: {
    fontSize: 40,
  },
  destination: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  countryName: {
    ...typography.caption,
    marginTop: 2,
  },

  // Dates
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.borderSubtle,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  dateText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  nightsChip: {
    backgroundColor: colors.orangeFill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  nightsText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.orange,
  },

  // Sections
  section: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  notesText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
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
  cardName: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
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
  cardDesc: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 18,
    marginTop: 4,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 4,
    marginTop: 4,
  },
  saveBtnText: {
    fontFamily: fonts.medium,
    fontSize: 12,
  },

  // Add place button
  addPlaceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    borderStyle: 'dashed',
    marginTop: spacing.xs,
  },
  addPlaceText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.orange,
  },

  // Emergency
  emergencyCard: {
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  emergencyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  emergencyLabel: {
    ...typography.body,
    color: colors.textPrimary,
  },
  emergencyNumber: {
    ...typography.label,
    color: colors.orange,
  },
});
