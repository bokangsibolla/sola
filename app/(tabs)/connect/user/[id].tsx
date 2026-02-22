import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SolaText } from '@/components/ui/SolaText';
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
import { colors, fonts, radius, spacing } from '@/constants/design';
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
        <SolaText variant="body" color={colors.textMuted} style={styles.notFound}>User not found</SolaText>
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
          <SolaText variant="h2">{profile.firstName}</SolaText>
          {profile.username && (
            <SolaText style={styles.username}>@{profile.username}</SolaText>
          )}
          {(profile.homeCountryName || profile.nationality) && (
            <SolaText variant="body" color={colors.textMuted} style={styles.origin}>
              {profile.homeCountryIso2 ? getFlag(profile.homeCountryIso2) + ' ' : ''}
              {profile.homeCountryName}
              {profile.nationality ? ` \u00b7 ${profile.nationality}` : ''}
            </SolaText>
          )}
          {profile.locationSharingEnabled && profile.locationCityName && (
            <View style={styles.locationRow}>
              <Feather name="map-pin" size={14} color={colors.orange} />
              <SolaText style={styles.currentCity}>
                Currently in {profile.locationCityName}
              </SolaText>
            </View>
          )}
          {contextLabel && (
            <View style={styles.contextBadge}>
              <SolaText style={styles.contextBadgeText}>{contextLabel}</SolaText>
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
        {profile.bio && <SolaText variant="body" style={styles.bio}>{profile.bio}</SolaText>}

        {/* Interests */}
        {(profile.interests ?? []).length > 0 && (
          <>
            <SolaText variant="label" style={styles.sectionTitle}>Interests</SolaText>
            <View style={styles.tags}>
              {(profile.interests ?? []).map((interest) => (
                <View
                  key={interest}
                  style={[styles.tag, shared.includes(interest) && styles.tagShared]}
                >
                  <SolaText
                    style={[styles.tagText, shared.includes(interest) && styles.tagTextShared]}
                  >
                    {interest}
                  </SolaText>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Trips Section */}
        {hasTrips && (
          <>
            <SolaText variant="label" style={styles.sectionTitle}>Trips</SolaText>

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
                  <SolaText style={styles.pastHeaderText}>
                    Past trips ({trips.past.length})
                  </SolaText>
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
            <SolaText variant="label" style={styles.sectionTitle}>Countries visited</SolaText>
            <View style={styles.tags}>
              {userManagedCountries.map((vc) => (
                <View key={vc.countryId} style={styles.tag}>
                  <SolaText style={styles.tagText}>
                    {vc.countryIso2 ? getFlag(vc.countryIso2) + ' ' : ''}{vc.countryName}
                  </SolaText>
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
              <SolaText variant="button" color={colors.background}>Connect</SolaText>
            </Pressable>
            {contextLabel && (
              <SolaText style={styles.connectContext}>{contextLabel}</SolaText>
            )}
          </View>
        )}
        {status === 'pending_sent' && (
          <View style={styles.pendingBar}>
            <Feather name="clock" size={16} color={colors.textMuted} />
            <SolaText style={styles.pendingText}>Connection request sent</SolaText>
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
              <SolaText variant="button" color={colors.background}>Accept</SolaText>
            </Pressable>
            <Pressable
              style={[styles.declineButton, actionLoading && { opacity: 0.6 }]}
              onPress={handleDecline}
              disabled={actionLoading}
            >
              <SolaText style={styles.declineButtonText}>Decline</SolaText>
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
            <SolaText variant="button" color={colors.background}>
              {actionLoading ? 'Opening...' : 'Message'}
            </SolaText>
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
    textAlign: 'center' as const,
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
  name: {},
  username: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 2,
  },
  origin: {
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
    textAlign: 'center' as const,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
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
  connectButtonText: {},
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
  acceptButtonText: {},
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
  messageButtonText: {},
});
