import React, { useCallback, useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { usePostHog } from 'posthog-react-native';
import AppScreen from '@/components/AppScreen';
import NavigationHeader from '@/components/NavigationHeader';
import { InterestPills } from '@/components/profile/InterestPills';
import { TravelMap } from '@/components/profile/TravelMap';
import { getCollections, getProfileById, getSavedPlaces, getUserVisitedCountries, getProfileTags } from '@/data/api';
import { getTripsGrouped } from '@/data/trips/tripApi';
import { useData } from '@/hooks/useData';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import { useAuth } from '@/state/AuthContext';
import { useAppMode } from '@/state/AppModeContext';
import { countries } from '@/data/geo';
import { colors, fonts, radius, spacing, pressedState } from '@/constants/design';
import { getImageUrl } from '@/lib/image';
import type { ProfileTag } from '@/data/types';

const AVATAR_SIZE = 100;

function countryFlag(iso2: string): string {
  return [...iso2.toUpperCase()]
    .map((c) => String.fromCodePoint(0x1f1e6 - 65 + c.charCodeAt(0)))
    .join('');
}

export default function ProfileScreen() {
  const router = useRouter();
  const { userId } = useAuth();
  const posthog = usePostHog();
  const { mode, activeTripInfo } = useAppMode();

  useEffect(() => {
    posthog.capture('profile_screen_viewed');
  }, [posthog]);

  const { data: profile, loading: loadingProfile, error: errorProfile, refetch: refetchProfile } = useData(
    () => userId ? getProfileById(userId) : Promise.resolve(null),
    ['my-profile', userId],
  );

  const country = profile?.homeCountryIso2
    ? countries.find((c) => c.iso2 === profile.homeCountryIso2)
    : undefined;

  const { data: collections, loading: loadingCol, error: errorCol, refetch: refetchCol } = useData(
    () => userId ? getCollections(userId) : Promise.resolve([]),
    ['collections', userId],
  );
  const { data: saved, loading: loadingSaved, error: errorSaved, refetch: refetchSaved } = useData(
    () => userId ? getSavedPlaces(userId) : Promise.resolve([]),
    ['savedPlaces', userId],
  );
  const { data: visitedCountries, loading: loadingVC, refetch: refetchVC } = useData(
    () => userId ? getUserVisitedCountries(userId) : Promise.resolve([]),
    ['visitedCountries', userId],
  );
  const { data: profileTags, refetch: refetchTags } = useData<ProfileTag[]>(
    () => userId ? getProfileTags(userId) : Promise.resolve([]),
    ['profile-tags', userId],
  );
  const { data: tripsGrouped, refetch: refetchTrips } = useData(
    () => userId ? getTripsGrouped(userId) : Promise.resolve(null),
    ['profile-trips', userId],
  );

  // Re-fetch everything when screen is focused
  useFocusEffect(
    useCallback(() => {
      refetchProfile();
      refetchVC();
      refetchTags();
      refetchTrips();
    }, [refetchProfile, refetchVC, refetchTags, refetchTrips]),
  );

  const tripCount = tripsGrouped
    ? (tripsGrouped.current ? 1 : 0) + tripsGrouped.upcoming.length + tripsGrouped.past.length
    : 0;
  const vcList = visitedCountries ?? [];
  const vcIso2s = vcList.map((vc) => vc.countryIso2).filter(Boolean);
  const tagsList = profileTags ?? [];

  if (loadingProfile || loadingCol || loadingSaved || loadingVC) return <LoadingScreen />;
  if (errorProfile) return <ErrorScreen message={errorProfile.message} onRetry={refetchProfile} />;
  if (errorCol) return <ErrorScreen message={errorCol.message} onRetry={refetchCol} />;
  if (errorSaved) return <ErrorScreen message={errorSaved.message} onRetry={refetchSaved} />;

  return (
    <AppScreen>
      <NavigationHeader
        title="Profile"
        rightActions={
          <Pressable
            onPress={() => {
              posthog.capture('edit_profile_tapped', { source: 'header' });
              router.push('/home/edit-profile');
            }}
            hitSlop={12}
            style={styles.headerAction}
            accessibilityRole="button"
            accessibilityLabel="Edit profile"
          >
            <Ionicons name="create-outline" size={22} color={colors.textPrimary} />
          </Pressable>
        }
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Hero section ── */}
        <View style={styles.heroSection}>
          <View style={styles.heroWarmBg} />
          <View style={styles.avatarRing}>
            {profile?.avatarUrl ? (
              <Image
                source={{ uri: getImageUrl(profile.avatarUrl, { width: AVATAR_SIZE * 2, height: AVATAR_SIZE * 2 }) ?? undefined }}
                style={styles.avatar}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Ionicons name="person" size={36} color={colors.textMuted} />
              </View>
            )}
          </View>

          <Text style={styles.name}>{profile?.firstName || 'Traveler'}</Text>
          {profile?.username && (
            <Text style={styles.username}>@{profile.username}</Text>
          )}
          {country && (
            <Text style={styles.origin}>
              {profile?.homeCountryIso2 ? countryFlag(profile.homeCountryIso2) + '  ' : ''}
              {country.name}
            </Text>
          )}
          {mode === 'travelling' && activeTripInfo && (
            <View style={styles.travellingBadge}>
              <Ionicons name="navigate" size={13} color={colors.orange} />
              <Text style={styles.travellingText}>Currently in {activeTripInfo.city.name}</Text>
            </View>
          )}
          {profile?.bio ? (
            <Text style={styles.bio}>{profile.bio}</Text>
          ) : null}
        </View>

        {/* ── Stats row ── */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{tripCount}</Text>
            <Text style={styles.statLabel}>{tripCount === 1 ? 'Trip' : 'Trips'}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{vcList.length}</Text>
            <Text style={styles.statLabel}>{vcList.length === 1 ? 'Country' : 'Countries'}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{(saved ?? []).length}</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </View>
        </View>

        <View style={styles.contentArea}>
          {/* ── Interests ── */}
          {tagsList.length > 0 && (
            <View style={styles.section}>
              <InterestPills tags={tagsList} />
            </View>
          )}

          {/* ── Countries visited ── */}
          {vcIso2s.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Countries visited</Text>
              <TravelMap
                countries={vcIso2s}
                onAddCountry={() => router.push('/home/edit-profile')}
              />
            </View>
          )}

          {/* ── Collections ── */}
          {(collections ?? []).length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Collections</Text>
              <View style={styles.collectionsGrid}>
                {(collections ?? []).map((col) => {
                  const placeCount = (saved ?? []).filter((s) => s.collectionId === col.id).length;
                  return (
                    <Pressable
                      key={col.id}
                      style={({ pressed }) => [styles.collectionCard, pressed && pressedState]}
                      onPress={() => {
                        posthog.capture('collection_tapped', { collection_id: col.id });
                        router.push(`/home/collections/${col.id}`);
                      }}
                    >
                      <Text style={styles.collectionEmoji}>{col.emoji}</Text>
                      <Text style={styles.collectionName} numberOfLines={1}>{col.name}</Text>
                      <Text style={styles.collectionCount}>
                        {placeCount} {placeCount === 1 ? 'place' : 'places'}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}
        </View>

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  headerAction: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ── Hero ── */
  heroSection: {
    alignItems: 'center',
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.screenX,
  },
  heroWarmBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: colors.orangeFill,
    borderBottomLeftRadius: radius.module,
    borderBottomRightRadius: radius.module,
  },
  avatarRing: {
    width: AVATAR_SIZE + 8,
    height: AVATAR_SIZE + 8,
    borderRadius: radius.full,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xxl,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: radius.full,
  },
  avatarPlaceholder: {
    backgroundColor: colors.neutralFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontFamily: fonts.semiBold,
    fontSize: 24,
    lineHeight: 30,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  username: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textMuted,
    marginTop: 2,
  },
  origin: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  travellingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.orangeFill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    marginTop: spacing.sm,
  },
  travellingText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.orange,
  },
  bio: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },

  /* ── Stats ── */
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.screenX,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: spacing.xl,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statNumber: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    color: colors.textPrimary,
  },
  statLabel: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.borderSubtle,
  },

  /* ── Content ── */
  contentArea: {
    paddingHorizontal: spacing.screenX,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },

  /* ── Collections ── */
  collectionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  collectionCard: {
    backgroundColor: colors.neutralFill,
    borderRadius: radius.cardLg,
    padding: spacing.lg,
    width: '48%' as any,
    gap: spacing.xs,
  },
  collectionEmoji: {
    fontSize: 28,
  },
  collectionName: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  collectionCount: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
});
