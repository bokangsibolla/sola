import { useEffect } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { usePostHog } from 'posthog-react-native';
import AppScreen from '@/components/AppScreen';
import AppHeader from '@/components/AppHeader';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import { getProfilesPaginated, getCityById, getBlockedUserIds } from '@/data/api';
import { useData } from '@/hooks/useData';
import { usePaginatedData } from '@/hooks/usePaginatedData';
import { useAuth } from '@/state/AuthContext';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';
import { getImageUrl } from '@/lib/image';
import type { Profile } from '@/data/types';

function countryFlag(iso2: string): string {
  return [...iso2.toUpperCase()]
    .map((c) => String.fromCodePoint(0x1f1e6 - 65 + c.charCodeAt(0)))
    .join('');
}

export default function HomeScreen() {
  const router = useRouter();
  const { userId } = useAuth();
  const posthog = usePostHog();
  const { data: allProfiles, loading, error, fetchMore, hasMore, isFetchingMore, refetch } = usePaginatedData({
    queryKey: ['profiles'],
    fetcher: (page) => getProfilesPaginated(page),
  });
  const { data: blockedIds } = useData(
    () => (userId ? getBlockedUserIds(userId) : Promise.resolve([])),
    [userId],
  );

  useEffect(() => {
    posthog.capture('home_screen_viewed');
  }, [posthog]);

  const visibleProfiles = allProfiles.filter(
    (p) => p.id !== userId && !(blockedIds ?? []).includes(p.id),
  );

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error.message} onRetry={refetch} />;

  return (
    <AppScreen>
      <AppHeader
        title=""
        leftComponent={
          <Image
            source={require('@/assets/images/sola-logo.png')}
            style={styles.logo}
            contentFit="contain"
          />
        }
        rightComponent={
          <Pressable onPress={() => {
            posthog.capture('inbox_opened');
            router.push('/home/dm');
          }} hitSlop={12} style={styles.inboxBtn}>
            <Feather name="message-circle" size={20} color={colors.orange} />
          </Pressable>
        }
      />

      <FlatList
        data={visibleProfiles}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <Text style={styles.sectionTitle}>Travelers near you</Text>
            <Text style={styles.sectionSubtitle}>Women exploring the world right now</Text>
          </>
        }
        contentContainerStyle={styles.feed}
        renderItem={({ item }) => <ProfileCard profile={item} />}
        onEndReached={() => { if (hasMore) fetchMore(); }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={isFetchingMore ? <ActivityIndicator style={{ padding: 16 }} /> : null}
      />
    </AppScreen>
  );
}

function ProfileCard({ profile }: { profile: Profile }) {
  const router = useRouter();
  const posthog = usePostHog();
  const { data: city } = useData(
    () => profile.currentCityId ? getCityById(profile.currentCityId) : Promise.resolve(null),
    [profile.currentCityId],
  );

  return (
    <Pressable
      style={styles.card}
      onPress={() => {
        posthog.capture('traveler_profile_tapped', { profile_id: profile.id });
        router.push(`/home/user/${profile.id}`);
      }}
    >
      <View style={styles.cardTop}>
        <View style={styles.avatarWrap}>
          {profile.avatarUrl ? (
            <Image source={{ uri: getImageUrl(profile.avatarUrl, { width: 112, height: 112 })! }} style={styles.avatar} contentFit="cover" transition={200} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Feather name="user" size={24} color={colors.textMuted} />
            </View>
          )}
          {profile.isOnline && <View style={styles.onlineDot} />}
        </View>

        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>
            {profile.homeCountryIso2 ? countryFlag(profile.homeCountryIso2) + ' ' : ''}
            {profile.firstName}
          </Text>
          {(city || profile.currentCityName) && (
            <View style={styles.locationRow}>
              <Feather name="map-pin" size={12} color={colors.orange} />
              <Text style={styles.locationText}>
                {city?.name ?? profile.currentCityName}
              </Text>
            </View>
          )}
          {profile.bio && (
            <Text style={styles.cardBio} numberOfLines={1}>
              {profile.bio}
            </Text>
          )}
        </View>
      </View>

      {profile.interests.length > 0 && (
        <View style={styles.tags}>
          {profile.interests.map((interest) => (
            <View key={interest} style={styles.tag}>
              <Text style={styles.tagText}>{interest}</Text>
            </View>
          ))}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  logo: {
    height: 30,
    width: 90,
  },
  inboxBtn: {
    backgroundColor: colors.orangeFill,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  sectionSubtitle: {
    ...typography.body,
    color: colors.textMuted,
    marginBottom: spacing.xl,
  },
  feed: {
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    padding: spacing.lg,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrap: {
    position: 'relative',
    marginRight: spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    backgroundColor: colors.borderDefault,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.greenSoft,
    borderWidth: 2,
    borderColor: colors.background,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  locationText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.orange,
  },
  cardBio: {
    ...typography.captionSmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: spacing.md,
  },
  tag: {
    backgroundColor: colors.orangeFill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  tagText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.orange,
  },
});
