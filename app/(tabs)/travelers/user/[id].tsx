import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePostHog } from 'posthog-react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { haptics } from '@/lib/haptics';
import {
  sendConnectionRequest,
  respondToConnectionRequest,
  getOrCreateConversationGuarded,
  blockUserFull,
  reportUser,
  removeConnection,
} from '@/data/api';
import { useTravelerProfile } from '@/data/travelers/useTravelerProfile';
import { getFlag } from '@/data/trips/helpers';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import ProfileTripCard from '@/components/profile/ProfileTripCard';
import { TravelMap } from '@/components/profile/TravelMap';
import { InterestPills } from '@/components/profile/InterestPills';
import { getProfileTags } from '@/data/api';
import { getOpenPostsByUser } from '@/data/together/togetherApi';
import { useData } from '@/hooks/useData';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';
import NavigationHeader from '@/components/NavigationHeader';
import { getImageUrl } from '@/lib/image';
import { useAuth } from '@/state/AuthContext';
import { VerificationBanner } from '@/components/VerificationBanner';
import type { ConnectionStatus, ProfileTag } from '@/data/types';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const CATEGORY_LABELS: Record<string, string> = {
  food: 'Food',
  culture: 'Culture',
  adventure: 'Adventure',
  nightlife: 'Nightlife',
  day_trip: 'Day trip',
  wellness: 'Wellness',
  shopping: 'Shopping',
  other: 'Other',
};

function formatPlanDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userId } = useAuth();
  const posthog = usePostHog();
  const queryClient = useQueryClient();
  const [actionLoading, setActionLoading] = useState(false);
  const [localStatus, setLocalStatus] = useState<ConnectionStatus | null>(null);
  const [showPastTrips, setShowPastTrips] = useState(false);

  const isOwn = !!userId && userId === id;

  useEffect(() => {
    if (id) {
      posthog.capture('user_profile_viewed', { viewed_user_id: id });
    }
  }, [id, posthog]);

  const {
    profile,
    userProfile,
    connectionStatus: fetchedStatus,
    incomingRequest,
    sharedInterests: shared,
    contextLabel,
    trips,
    tripOverlaps,
    visitedCountries,
    userManagedCountries,
    profileTags,
    totalTripCount,
    isLoading,
    error,
    refetch,
  } = useTravelerProfile(id);

  const status = localStatus ?? fetchedStatus;
  const connectionStatus = status ?? 'none';
  const showExtended = connectionStatus === 'connected' || isOwn;
  const isVerified = (userProfile?.verificationStatus ?? 'unverified') === 'verified';

  // Merge trip-derived and user-managed countries into deduplicated ISO2 array
  const allCountryIso2s = useMemo(() => {
    const set = new Set<string>();
    for (const vc of visitedCountries) set.add(vc.countryIso2);
    for (const umc of userManagedCountries) {
      if (umc.countryIso2) set.add(umc.countryIso2);
    }
    return Array.from(set);
  }, [visitedCountries, userManagedCountries]);

  const { data: viewerTags } = useData(
    () => (!isOwn && userId ? getProfileTags(userId) : Promise.resolve([])),
    [isOwn, userId, 'viewer-tags'],
  );
  const viewerTagSlugs = (viewerTags ?? []).map((t: ProfileTag) => t.tagSlug);

  // Her Plans — fetch open together posts for this user
  const { data: userActivities = [] } = useQuery({
    queryKey: ['user-activities', id],
    queryFn: () => getOpenPostsByUser(id!),
    enabled: !!id && !isOwn,
  });
  const openActivities = userActivities.filter(a => a.status === 'open');

  const countriesCount = allCountryIso2s.length;
  const joinedDate = profile ? new Date(profile.createdAt) : null;
  const joinedLabel = joinedDate ? `Joined ${MONTHS[joinedDate.getMonth()]} ${joinedDate.getFullYear()}` : '';

  const doConnect = useCallback(async (message?: string) => {
    try {
      setLocalStatus('pending_sent');
      await sendConnectionRequest(userId!, id!, contextLabel, message || undefined);
      haptics.action();
      queryClient.invalidateQueries({ queryKey: ['travelers'] });
    } catch {
      setLocalStatus(null);
      Alert.alert('Error', 'Could not send request');
    }
  }, [userId, id, contextLabel, queryClient]);

  const handleConnect = useCallback(async () => {
    if (!userId || !id) return;
    posthog.capture('connection_request_sent', { recipient_id: id });

    Alert.prompt(
      'Send connection request',
      contextLabel ? contextLabel : 'Send a connection request?',
      [
        { text: 'Skip', onPress: () => doConnect() },
        { text: 'Send', onPress: (msg?: string) => doConnect(msg) },
      ],
      'plain-text',
      '',
      'default',
    );
  }, [userId, id, contextLabel, posthog, doConnect]);

  const handleAccept = useCallback(async () => {
    if (!incomingRequest) return;
    setActionLoading(true);
    try {
      await respondToConnectionRequest(incomingRequest.id, 'accepted');
      haptics.confirm();
      setLocalStatus('connected');
      queryClient.invalidateQueries({ queryKey: ['travelers'] });
    } catch {
      // Silently fail
    } finally {
      setActionLoading(false);
    }
  }, [incomingRequest, queryClient]);

  const handleDecline = useCallback(async () => {
    if (!incomingRequest) return;
    setActionLoading(true);
    try {
      await respondToConnectionRequest(incomingRequest.id, 'declined');
      setLocalStatus('none');
      queryClient.invalidateQueries({ queryKey: ['travelers'] });
    } catch {
      // Silently fail
    } finally {
      setActionLoading(false);
    }
  }, [incomingRequest, queryClient]);

  const handleMessage = useCallback(async () => {
    if (!userId || !id) return;
    posthog.capture('message_button_tapped', { recipient_id: id });
    setActionLoading(true);
    try {
      const convoId = await getOrCreateConversationGuarded(userId, id);
      posthog.capture('conversation_started', { conversation_id: convoId, recipient_id: id });
      router.push(`/travelers/dm/${convoId}`);
    } catch {
      Alert.alert('Cannot message', 'You must be connected to message this traveler.');
    } finally {
      setActionLoading(false);
    }
  }, [userId, id, posthog, router]);

  const handleMoreMenu = useCallback(() => {
    if (!userId || !id) return;
    const buttons: Array<{ text: string; style?: 'destructive' | 'cancel' | 'default'; onPress?: () => void }> = [];

    if (connectionStatus === 'connected' || localStatus === 'connected') {
      buttons.push({
        text: 'Remove connection',
        style: 'destructive' as const,
        onPress: () => {
          Alert.alert(
            'Remove connection',
            "They won't be notified. You'll lose access to each other's full profile and messages.",
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Remove',
                style: 'destructive',
                onPress: async () => {
                  try {
                    await removeConnection(userId!, id);
                    setLocalStatus('none');
                    queryClient.invalidateQueries({ queryKey: ['travelers'] });
                    queryClient.invalidateQueries({ queryKey: ['connections'] });
                  } catch {
                    Alert.alert('Error', 'Could not remove connection');
                  }
                },
              },
            ],
          );
        },
      });
    }

    buttons.push({
      text: 'Block',
      style: 'destructive' as const,
      onPress: () => {
        Alert.alert(
          'Block this traveler?',
          'They won\'t be able to see your profile or contact you.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Block',
              style: 'destructive',
              onPress: async () => {
                await blockUserFull(userId!, id);
                posthog.capture('user_blocked', { blocked_id: id });
                queryClient.invalidateQueries({ queryKey: ['travelers'] });
                router.back();
              },
            },
          ],
        );
      },
    });

    buttons.push({
      text: 'Report',
      style: 'destructive' as const,
      onPress: () => {
        Alert.alert('Report this traveler', 'Select a reason:', [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Fake profile',
            onPress: async () => {
              await reportUser(userId, id, 'fake_profile');
              posthog.capture('user_reported', { reported_id: id, reason: 'fake_profile' });
              Alert.alert('Report submitted', 'Thank you for helping keep Sola safe.');
            },
          },
          {
            text: 'Inappropriate behavior',
            onPress: async () => {
              await reportUser(userId, id, 'inappropriate_behavior');
              posthog.capture('user_reported', { reported_id: id, reason: 'inappropriate_behavior' });
              Alert.alert('Report submitted', 'Thank you for helping keep Sola safe.');
            },
          },
          {
            text: 'Spam',
            onPress: async () => {
              await reportUser(userId, id, 'spam');
              posthog.capture('user_reported', { reported_id: id, reason: 'spam' });
              Alert.alert('Report submitted', 'Thank you for helping keep Sola safe.');
            },
          },
        ]);
      },
    });

    buttons.push({ text: 'Cancel', style: 'cancel' as const });

    Alert.alert('', '', buttons);
  }, [userId, id, connectionStatus, localStatus, posthog, queryClient, router]);

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error.message} onRetry={refetch} />;

  if (!profile) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.notFound}>User not found</Text>
      </View>
    );
  }

  const hasTrips = trips.current || trips.upcoming.length > 0 || trips.past.length > 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <NavigationHeader
        title={isOwn ? 'Profile' : (profile?.firstName ?? 'Traveler')}
        parentTitle="Travelers"
        backHref="/(tabs)/travelers"
        rightActions={
          isOwn ? (
            <Pressable onPress={() => router.push('/(tabs)/home/settings')} hitSlop={12}>
              <Feather name="settings" size={22} color={colors.textPrimary} />
            </Pressable>
          ) : (
            <Pressable onPress={handleMoreMenu} hitSlop={12}>
              <Feather name="more-horizontal" size={24} color={colors.textPrimary} />
            </Pressable>
          )
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* 1. Profile Header — avatar, name, flag, username, bio, location */}
        <View style={styles.profileHeader}>
          {profile.avatarUrl ? (
            <Image
              source={{ uri: getImageUrl(profile.avatarUrl, { width: 176, height: 176 }) ?? undefined }}
              style={styles.avatar}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Feather name="user" size={36} color={colors.textMuted} />
            </View>
          )}

          <View style={styles.nameRow}>
            <Text style={styles.name}>
              {profile.firstName} {profile.homeCountryIso2 ? getFlag(profile.homeCountryIso2) : ''}
            </Text>
            {profile.verificationStatus === 'verified' && (
              <Ionicons name="checkmark-circle" size={18} color={colors.greenSoft} style={{ marginLeft: 4 }} />
            )}
          </View>

          {profile.username && (
            <Text style={styles.username}>@{profile.username}</Text>
          )}

          {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}

          {profile.locationSharingEnabled && profile.locationCityName && (
            <View style={styles.locationRow}>
              <Feather name="map-pin" size={14} color={colors.orange} />
              <Text style={styles.currentCity}>
                Currently in {profile.locationCityName}
              </Text>
            </View>
          )}

          {contextLabel && (
            <View style={styles.contextBadge}>
              <Text style={styles.contextBadgeText}>{contextLabel}</Text>
            </View>
          )}
        </View>

        {/* 2. Edit Button — own profile only */}
        {isOwn && (
          <Pressable
            style={({ pressed }) => [styles.editButton, pressed && { opacity: 0.7 }]}
            onPress={() => router.push('/(tabs)/home/edit-profile')}
          >
            <Feather name="edit-2" size={16} color={colors.textPrimary} />
            <Text style={styles.editButtonText}>Edit profile</Text>
          </Pressable>
        )}

        {/* 3. Travel Style Tags — visible to everyone, vibe indicator */}
        {(profileTags.length > 0 || (profile.interests ?? []).length > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Travel style</Text>
            {profileTags.length > 0 ? (
              <InterestPills
                tags={profileTags}
                viewerTagSlugs={isOwn ? undefined : viewerTagSlugs}
              />
            ) : profile?.interests && profile.interests.length > 0 ? (
              <View style={styles.interestsGrid}>
                {profile.interests.map((interest: string) => (
                  <View key={interest} style={styles.interestPill}>
                    <Text style={styles.interestText}>{interest}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        )}

        {/* 4. Her Trip — current trip route (visible to everyone) */}
        {trips.current && trips.current.stops && trips.current.stops.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Her trip</Text>
            <Text style={styles.tripRoute}>
              {trips.current.stops.map(s => s.cityName ?? s.countryIso2).join(' \u2192 ')}
            </Text>
          </View>
        )}

        {/* 5. Her Plans — open together posts (non-own only) */}
        {!isOwn && openActivities.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Her plans</Text>
            {openActivities.map(a => (
              <Pressable
                key={a.id}
                style={({ pressed }) => [styles.planRow, pressed && { opacity: 0.7 }]}
                onPress={() => router.push(`/(tabs)/travelers/together/${a.id}`)}
              >
                <View style={styles.planCategoryPill}>
                  <Text style={styles.planCategoryText}>
                    {CATEGORY_LABELS[a.activityCategory] ?? a.activityCategory}
                  </Text>
                </View>
                <Text style={styles.planTitle} numberOfLines={1}>{a.title}</Text>
                <Text style={styles.planDate}>
                  {a.isFlexible ? 'Flexible' : formatPlanDate(a.activityDate)}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* 6. Connected Gate — countries map + full trip history */}
        {showExtended && allCountryIso2s.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Countries visited</Text>
            <TravelMap
              countries={allCountryIso2s}
              onAddCountry={isOwn ? () => router.push('/(tabs)/home/edit-profile' as any) : undefined}
            />
          </View>
        )}

        {showExtended && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trips</Text>

            {trips.current && (
              <ProfileTripCard trip={trips.current} overlapLabel={tripOverlaps.get(trips.current.id)} isOwn={isOwn} />
            )}
            {trips.upcoming.map((trip) => (
              <ProfileTripCard key={trip.id} trip={trip} overlapLabel={tripOverlaps.get(trip.id)} isOwn={isOwn} />
            ))}

            {trips.past.length > 0 && (
              <>
                <Pressable style={styles.pastHeader} onPress={() => setShowPastTrips(!showPastTrips)} hitSlop={8}>
                  <Text style={styles.pastHeaderText}>Past trips ({trips.past.length})</Text>
                  <Feather name={showPastTrips ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textMuted} />
                </Pressable>
                {showPastTrips && trips.past.map((trip) => (
                  <ProfileTripCard key={trip.id} trip={trip} isOwn={isOwn} />
                ))}
              </>
            )}

            {isOwn && !hasTrips && (
              <View>
                <Text style={styles.noTripsText}>No trips yet</Text>
                <Pressable
                  style={({ pressed }) => [styles.tripsCta, pressed && { opacity: 0.7 }]}
                  onPress={() => router.push('/(tabs)/trips/new')}
                >
                  <Feather name="plus" size={16} color={colors.orange} />
                  <Text style={styles.tripsCtaText}>Plan your first trip</Text>
                </Pressable>
              </View>
            )}
          </View>
        )}

        {/* 7. Locked Section — only for non-own, non-connected */}
        {!isOwn && !showExtended && (
          <View style={styles.lockedSection}>
            <Ionicons name="lock-closed-outline" size={24} color={colors.textMuted} />
            <Text style={styles.lockedTitle}>Full profile</Text>
            <Text style={styles.lockedText}>Connect to see trips, countries, and more</Text>
          </View>
        )}

        {/* 8. Footer Stats — subtle line at bottom */}
        <Text style={styles.footerStats}>
          {countriesCount > 0
            ? `${countriesCount} ${countriesCount === 1 ? 'country' : 'countries'} \u00B7 `
            : ''
          }{joinedLabel}
        </Text>
      </ScrollView>

      {/* Connection Bottom Bar — only for non-own */}
      {!isOwn && (
        <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
          {!isVerified && (
            <View style={{ marginBottom: spacing.md }}>
              <VerificationBanner
                verificationStatus={userProfile?.verificationStatus ?? 'unverified'}
                featureLabel="connect with travelers"
              />
            </View>
          )}
          {status === 'none' && (
            <View>
              <Pressable
                style={[styles.connectButton, (actionLoading || !isVerified) && { opacity: 0.4 }]}
                onPress={handleConnect}
                disabled={actionLoading || !isVerified}
              >
                <Feather name="user-plus" size={18} color={colors.background} />
                <Text style={styles.connectButtonText}>Connect</Text>
              </Pressable>
              {contextLabel && (
                <Text style={styles.connectContext}>{contextLabel}</Text>
              )}
            </View>
          )}
          {status === 'pending_sent' && (
            <View style={styles.pendingBar}>
              <Feather name="clock" size={16} color={colors.textMuted} />
              <Text style={styles.pendingText}>Connection request sent</Text>
            </View>
          )}
          {status === 'pending_received' && (
            <View style={styles.respondRow}>
              <Pressable
                style={[styles.acceptButton, actionLoading && { opacity: 0.6 }]}
                onPress={handleAccept}
                disabled={actionLoading}
              >
                <Feather name="check" size={16} color={colors.background} />
                <Text style={styles.acceptButtonText}>Accept</Text>
              </Pressable>
              <Pressable
                style={[styles.declineButton, actionLoading && { opacity: 0.6 }]}
                onPress={handleDecline}
                disabled={actionLoading}
              >
                <Text style={styles.declineButtonText}>Decline</Text>
              </Pressable>
            </View>
          )}
          {status === 'connected' && (
            <Pressable
              style={[styles.messageButton, (actionLoading || !isVerified) && { opacity: 0.4 }]}
              onPress={handleMessage}
              disabled={actionLoading || !isVerified}
            >
              <Feather name="message-circle" size={18} color={colors.background} />
              <Text style={styles.messageButtonText}>
                {actionLoading ? 'Opening...' : 'Message'}
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  notFound: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
  scroll: {
    paddingBottom: spacing.xxl,
  },

  // Profile header
  profileHeader: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: radius.full,
    marginBottom: spacing.md,
  },
  avatarPlaceholder: {
    backgroundColor: colors.neutralFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  bio: {
    ...typography.body,
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xs,
  },
  currentCity: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.orange,
  },
  contextBadge: {
    marginTop: spacing.sm,
    backgroundColor: colors.orangeFill,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  contextBadgeText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.orange,
  },

  // Edit button
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.button,
    paddingVertical: spacing.md,
    marginBottom: spacing.xl,
  },
  editButtonText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textPrimary,
  },

  // Sections
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },

  // Interest tags (legacy fallback)
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  interestPill: {
    backgroundColor: colors.neutralFill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.card,
  },
  interestText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textSecondary,
  },

  // Her Trip
  tripRoute: {
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textPrimary,
  },

  // Her Plans
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  planCategoryPill: {
    backgroundColor: colors.orangeFill,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  planCategoryText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.orange,
  },
  planTitle: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textPrimary,
  },
  planDate: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },

  // Footer Stats
  footerStats: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },

  // Trips
  pastHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  pastHeaderText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textMuted,
  },
  noTripsText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  tripsCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.md,
  },
  tripsCtaText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.orange,
  },

  // Locked
  lockedSection: {
    alignItems: 'center' as const,
    paddingVertical: spacing.xxxl,
    gap: spacing.sm,
  },
  lockedTitle: {
    fontSize: 17,
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
  },
  lockedText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },

  // Bottom bar
  bottomBar: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderDefault,
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.orange,
    borderRadius: radius.button,
    paddingVertical: spacing.md,
  },
  connectButtonText: {
    ...typography.button,
    color: colors.background,
  },
  connectContext: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  pendingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: spacing.md,
    borderRadius: radius.button,
    backgroundColor: colors.neutralFill,
  },
  pendingText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textMuted,
  },
  respondRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.orange,
    borderRadius: radius.button,
    paddingVertical: spacing.md,
  },
  acceptButtonText: {
    ...typography.button,
    color: colors.background,
  },
  declineButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.button,
    paddingVertical: spacing.md,
  },
  declineButtonText: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.textMuted,
  },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.orange,
    borderRadius: radius.button,
    paddingVertical: spacing.md,
  },
  messageButtonText: {
    ...typography.button,
    color: colors.background,
  },
});
