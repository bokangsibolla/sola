import React, { useCallback, useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { usePostHog } from 'posthog-react-native';
import AppScreen from '@/components/AppScreen';
import AppHeader from '@/components/AppHeader';
import { getCollections, getProfileById, getSavedPlaces, getUserVisitedCountries } from '@/data/api';
import { useData } from '@/hooks/useData';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import { useAuth } from '@/state/AuthContext';
import { useAppMode } from '@/state/AppModeContext';
import { countries } from '@/data/geo';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';
import { getImageUrl } from '@/lib/image';

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
    ['profile', userId],
  );

  const country = profile?.homeCountryIso2
    ? countries.find((c) => c.iso2 === profile.homeCountryIso2)
    : undefined;
  const { data: collections, loading: loadingCol, error: errorCol, refetch: refetchCol } = useData(() => userId ? getCollections(userId) : Promise.resolve([]), ['collections', userId]);
  const { data: saved, loading: loadingSaved, error: errorSaved, refetch: refetchSaved } = useData(() => userId ? getSavedPlaces(userId) : Promise.resolve([]), ['savedPlaces', userId]);
  const { data: visitedCountries, loading: loadingVC, refetch: refetchVC } = useData(() => userId ? getUserVisitedCountries(userId) : Promise.resolve([]), ['visitedCountries', userId]);

  // Re-fetch profile every time tab is focused (picks up edits)
  useFocusEffect(
    useCallback(() => {
      refetchProfile();
      refetchVC();
    }, [refetchProfile, refetchVC]),
  );

  if (loadingProfile || loadingCol || loadingSaved || loadingVC) return <LoadingScreen />;
  if (errorProfile) return <ErrorScreen message={errorProfile.message} onRetry={refetchProfile} />;
  if (errorCol) return <ErrorScreen message={errorCol.message} onRetry={refetchCol} />;
  if (errorSaved) return <ErrorScreen message={errorSaved.message} onRetry={refetchSaved} />;

  return (
    <AppScreen>
      <AppHeader
        title="Profile"
        rightComponent={
          <Pressable
            onPress={() => {
              posthog.capture('settings_tapped', { source: 'header' });
              router.push('/home/settings');
            }}
            hitSlop={12}
            style={styles.headerAction}
            accessibilityRole="button"
            accessibilityLabel="Settings"
          >
            <Ionicons name="settings-outline" size={22} color={colors.textPrimary} />
          </Pressable>
        }
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Avatar + info */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            {profile?.avatarUrl ? (
              <Image source={{ uri: getImageUrl(profile.avatarUrl, { width: 160, height: 160 }) ?? undefined }} style={styles.avatar} contentFit="cover" transition={200} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Ionicons name="person" size={32} color={colors.textMuted} />
              </View>
            )}
          </View>
          <Text style={styles.name}>{profile?.firstName || 'Traveler'}</Text>
          {profile?.username && (
            <Text style={styles.username}>@{profile.username}</Text>
          )}
          {country && (
            <Text style={styles.origin}>
              {profile?.homeCountryIso2 ? countryFlag(profile.homeCountryIso2) + ' ' : ''}{country.name}
            </Text>
          )}
          {mode === 'travelling' && activeTripInfo && (
            <View style={styles.travellingBadge}>
              <Ionicons name="navigate" size={14} color={colors.orange} />
              <Text style={styles.travellingBadgeText}>
                Currently in {activeTripInfo.city.name}
              </Text>
            </View>
          )}
          {profile?.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}
        </View>

        {/* Interests */}
        {(profile?.interests ?? []).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Interests</Text>
            <View style={styles.tags}>
              {(profile?.interests ?? []).map((interest) => (
                <View key={interest} style={styles.tag}>
                  <Text style={styles.tagText}>{interest}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Countries visited */}
        {(visitedCountries ?? []).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {(visitedCountries ?? []).length} {(visitedCountries ?? []).length === 1 ? 'country' : 'countries'} visited
            </Text>
            <View style={styles.tags}>
              {(visitedCountries ?? []).map((vc) => (
                <View key={vc.countryId} style={styles.tag}>
                  <Text style={styles.tagText}>
                    {vc.countryIso2 ? countryFlag(vc.countryIso2) + ' ' : ''}{vc.countryName}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Stats */}
        <Text style={styles.stats}>
          {(saved ?? []).length} {(saved ?? []).length === 1 ? 'place' : 'places'} saved
          {'  ·  '}
          {(collections ?? []).length} {(collections ?? []).length === 1 ? 'collection' : 'collections'}
        </Text>

        {/* Collections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Collections</Text>
          {(collections ?? []).length === 0 ? (
            <Text style={styles.emptyText}>
              Save places into collections as you explore.
            </Text>
          ) : (
            (collections ?? []).map((col) => {
              const placeCount = (saved ?? []).filter((s) => s.collectionId === col.id).length;
              return (
                <Pressable
                  key={col.id}
                  style={styles.collectionRow}
                  onPress={() => {
                    posthog.capture('collection_tapped', { collection_id: col.id });
                    router.push(`/home/collections/${col.id}`);
                  }}
                >
                  <Text style={styles.collectionEmoji}>{col.emoji}</Text>
                  <View style={styles.collectionText}>
                    <Text style={styles.collectionName}>{col.name}</Text>
                    <Text style={styles.collectionCount}>
                      {placeCount} {placeCount === 1 ? 'place' : 'places'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                </Pressable>
              );
            })
          )}
        </View>

        {/* Action buttons */}
        <View style={styles.actionRow}>
          <Pressable
            style={styles.actionButton}
            onPress={() => {
              posthog.capture('edit_profile_tapped');
              router.push('/home/edit-profile');
            }}
          >
            <Ionicons name="create-outline" size={18} color={colors.orange} />
            <Text style={styles.actionLabel}>Edit profile</Text>
          </Pressable>
          <Pressable
            style={styles.actionButton}
            onPress={() => {
              posthog.capture('settings_tapped');
              router.push('/home/settings');
            }}
          >
            <Ionicons name="settings-outline" size={18} color={colors.orange} />
            <Text style={styles.actionLabel}>Settings</Text>
          </Pressable>
          <Pressable
            style={styles.actionButton}
            onPress={() => {
              posthog.capture('messages_tapped', { source: 'profile' });
              router.push('/connect/dm');
            }}
          >
            <Ionicons name="chatbubbles-outline" size={18} color={colors.orange} />
            <Text style={styles.actionLabel}>Messages</Text>
          </Pressable>
        </View>

        <View style={{ height: spacing.xxl }} />
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
  header: {
    alignItems: 'center',
    paddingBottom: spacing.xl,
  },
  avatarContainer: {
    marginBottom: spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
  },
  avatarPlaceholder: {
    backgroundColor: colors.borderDefault,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  username: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 2,
  },
  origin: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  travellingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.orangeFill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    marginTop: spacing.sm,
  },
  travellingBadgeText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.orange,
  },
  bio: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  stats: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: colors.orangeFill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.card,
  },
  tagText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.orange,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
  },
  collectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  collectionEmoji: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  collectionText: {
    flex: 1,
  },
  collectionName: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  collectionCount: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.orange,
    borderRadius: radius.button,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  actionLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.orange,
  },
});
