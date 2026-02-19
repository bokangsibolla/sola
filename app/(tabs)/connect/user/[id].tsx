import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePostHog } from 'posthog-react-native';
import { useQueryClient } from '@tanstack/react-query';
import {
  sendConnectionRequest,
  respondToConnectionRequest,
  getOrCreateConversationGuarded,
  blockUser,
  reportUser,
} from '@/data/api';
import { useTravelerProfile } from '@/data/travelers/useTravelerProfile';
import { getFlag } from '@/data/trips/helpers';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import CredibilityStats from '@/components/travelers/CredibilityStats';
import ProfileTripCard from '@/components/travelers/ProfileTripCard';
import VisitedCountries from '@/components/travelers/VisitedCountries';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';
import NavigationHeader from '@/components/NavigationHeader';
import { getImageUrl } from '@/lib/image';
import { useAuth } from '@/state/AuthContext';
import { requireVerification } from '@/lib/verification';
import type { ConnectionStatus } from '@/data/types';

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
    totalTripCount,
    isLoading,
    error,
    refetch,
  } = useTravelerProfile(id);

  const status = localStatus ?? fetchedStatus;

  const handleConnect = useCallback(async () => {
    if (!userId || !id) return;
    if (!requireVerification(userProfile?.verificationStatus || 'unverified', 'connect with travelers')) return;
    posthog.capture('connection_request_sent', { recipient_id: id });
    setLocalStatus('pending_sent');
    try {
      await sendConnectionRequest(userId, id, contextLabel);
      queryClient.invalidateQueries({ queryKey: ['travelers'] });
    } catch {
      setLocalStatus(null);
    }
  }, [userId, id, contextLabel, posthog, queryClient, userProfile]);

  const handleAccept = useCallback(async () => {
    if (!incomingRequest) return;
    setActionLoading(true);
    try {
      await respondToConnectionRequest(incomingRequest.id, 'accepted');
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
      router.push(`/connect/dm/${convoId}`);
    } catch {
      Alert.alert('Cannot message', 'You must be connected to message this traveler.');
    } finally {
      setActionLoading(false);
    }
  }, [userId, id, posthog, router]);

  const handleMoreMenu = useCallback(() => {
    if (!userId || !id) return;
    Alert.alert('', '', [
      {
        text: 'Block',
        style: 'destructive',
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
                  await blockUser(userId, id);
                  posthog.capture('user_blocked', { blocked_id: id });
                  queryClient.invalidateQueries({ queryKey: ['travelers'] });
                  router.back();
                },
              },
            ],
          );
        },
      },
      {
        text: 'Report',
        style: 'destructive',
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
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, [userId, id, posthog, queryClient, router]);

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
        title={profile?.firstName ?? 'Traveler'}
        parentTitle="Connect"
        rightActions={
          <Pressable onPress={handleMoreMenu} hitSlop={12}>
            <Feather name="more-horizontal" size={24} color={colors.textPrimary} />
          </Pressable>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Identity Layer */}
        <View style={styles.profileHeader}>
          {profile.avatarUrl ? (
            <Image
              source={{ uri: getImageUrl(profile.avatarUrl, { width: 192, height: 192 }) ?? undefined }}
              style={styles.avatar}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Feather name="user" size={36} color={colors.textMuted} />
            </View>
          )}
          <Text style={styles.name}>{profile.firstName}</Text>
          {profile.username && (
            <Text style={styles.username}>@{profile.username}</Text>
          )}
          {(profile.homeCountryName || profile.nationality) && (
            <Text style={styles.origin}>
              {profile.homeCountryIso2 ? getFlag(profile.homeCountryIso2) + ' ' : ''}
              {profile.homeCountryName}
              {profile.nationality ? ` \u00b7 ${profile.nationality}` : ''}
            </Text>
          )}
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

        {/* Credibility Stats */}
        <CredibilityStats
          countriesCount={visitedCountries.length}
          tripCount={totalTripCount}
          memberSince={profile.createdAt}
        />

        {/* Bio */}
        {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}

        {/* Interests */}
        {(profile.interests ?? []).length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Interests</Text>
            <View style={styles.tags}>
              {(profile.interests ?? []).map((interest) => (
                <View
                  key={interest}
                  style={[styles.tag, shared.includes(interest) && styles.tagShared]}
                >
                  <Text
                    style={[styles.tagText, shared.includes(interest) && styles.tagTextShared]}
                  >
                    {interest}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Trips Section */}
        {hasTrips && (
          <>
            <Text style={styles.sectionTitle}>Trips</Text>

            {trips.current && (
              <ProfileTripCard trip={trips.current} overlapLabel={tripOverlaps.get(trips.current.id)} />
            )}

            {trips.upcoming.map((trip) => (
              <ProfileTripCard key={trip.id} trip={trip} overlapLabel={tripOverlaps.get(trip.id)} />
            ))}

            {trips.past.length > 0 && (
              <>
                <Pressable
                  style={styles.pastHeader}
                  onPress={() => setShowPastTrips(!showPastTrips)}
                  hitSlop={8}
                >
                  <Text style={styles.pastHeaderText}>
                    Past trips ({trips.past.length})
                  </Text>
                  <Feather
                    name={showPastTrips ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={colors.textMuted}
                  />
                </Pressable>
                {showPastTrips && trips.past.map((trip) => (
                  <ProfileTripCard key={trip.id} trip={trip} />
                ))}
              </>
            )}
          </>
        )}

        {/* Visited Countries (from trips) */}
        <VisitedCountries countries={visitedCountries} />

        {/* User-listed countries (self-reported) */}
        {userManagedCountries.length > 0 && (
          <View style={styles.userCountriesSection}>
            <Text style={styles.sectionTitle}>Countries visited</Text>
            <View style={styles.tags}>
              {userManagedCountries.map((vc) => (
                <View key={vc.countryId} style={styles.tag}>
                  <Text style={styles.tagText}>
                    {vc.countryIso2 ? getFlag(vc.countryIso2) + ' ' : ''}{vc.countryName}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Connection Bottom Bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
        {status === 'none' && (
          <View>
            <Pressable
              style={[styles.connectButton, actionLoading && { opacity: 0.6 }]}
              onPress={handleConnect}
              disabled={actionLoading}
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
            style={[styles.messageButton, actionLoading && { opacity: 0.6 }]}
            onPress={handleMessage}
            disabled={actionLoading}
          >
            <Feather name="message-circle" size={18} color={colors.background} />
            <Text style={styles.messageButtonText}>
              {actionLoading ? 'Opening...' : 'Message'}
            </Text>
          </Pressable>
        )}
      </View>
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
  profileHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: radius.full,
    marginBottom: spacing.md,
  },
  avatarPlaceholder: {
    backgroundColor: colors.neutralFill,
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
  bio: {
    ...typography.body,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: spacing.xl,
  },
  tag: {
    backgroundColor: colors.neutralFill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.card,
  },
  tagShared: {
    backgroundColor: colors.orangeFill,
  },
  tagText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  tagTextShared: {
    color: colors.orange,
  },
  userCountriesSection: {
    marginBottom: spacing.xl,
  },
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
