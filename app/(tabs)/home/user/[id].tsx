import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePostHog } from 'posthog-react-native';
import { useQueryClient } from '@tanstack/react-query';
import {
  getProfileById,
  getSavedPlaces,
  getPlaceById,
  getPlaceFirstImage,
  getCityById,
  getConnectionStatus,
  sendConnectionRequest,
  respondToConnectionRequest,
  getOrCreateConversationGuarded,
  blockUser,
  reportUser,
  getConnectionRequests,
} from '@/data/api';
import { getConnectionContext, getSharedInterests } from '@/data/travelers/connectionContext';
import { useData } from '@/hooks/useData';
import { useAuth } from '@/state/AuthContext';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';
import { getImageUrl } from '@/lib/image';
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

  useEffect(() => {
    if (id) {
      posthog.capture('user_profile_viewed', { viewed_user_id: id });
    }
  }, [id, posthog]);

  const { data: profile, loading, error, refetch } = useData(
    () => getProfileById(id ?? ''),
    [id],
  );

  const { data: fetchedStatus, refetch: refetchStatus } = useData(
    () => (userId && id ? getConnectionStatus(userId, id) : Promise.resolve('none' as ConnectionStatus)),
    [userId, id],
  );

  const { data: userProfile } = useData(
    () => (userId ? getProfileById(userId) : Promise.resolve(null)),
    [userId],
  );

  // Find the pending request ID if we received one from this user
  const { data: pendingRequests } = useData(
    () => (userId ? getConnectionRequests(userId, 'received') : Promise.resolve([])),
    [userId],
  );
  const incomingRequest = (pendingRequests ?? []).find((r) => r.senderId === id);

  const status = localStatus ?? fetchedStatus ?? 'none';
  const shared = profile && userProfile ? getSharedInterests(userProfile, profile) : [];
  const contextLabel = profile && userProfile ? getConnectionContext(userProfile, profile) : undefined;

  const handleConnect = useCallback(async () => {
    if (!userId || !id) return;
    posthog.capture('connection_request_sent', { recipient_id: id });
    setLocalStatus('pending_sent');
    try {
      await sendConnectionRequest(userId, id, contextLabel);
      queryClient.invalidateQueries({ queryKey: ['travelers'] });
    } catch {
      setLocalStatus(null);
    }
  }, [userId, id, contextLabel, posthog, queryClient]);

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
      router.push(`/home/dm/${convoId}`);
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

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error.message} onRetry={refetch} />;

  if (!profile) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.notFound}>User not found</Text>
      </View>
    );
  }

  const { data: currentCity } = useData(
    () => profile.currentCityId ? getCityById(profile.currentCityId) : Promise.resolve(null),
    [profile.currentCityId],
  );
  const { data: savedPlaces } = useData(() => getSavedPlaces(profile.id), [profile.id]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Nav */}
      <View style={styles.nav}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Feather name="arrow-left" size={24} color={colors.textPrimary} />
        </Pressable>
        <Pressable onPress={handleMoreMenu} hitSlop={12}>
          <Feather name="more-horizontal" size={24} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Avatar + name */}
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
          {(profile.homeCountryName || profile.nationality) && (
            <Text style={styles.origin}>
              {profile.homeCountryIso2 ? countryFlag(profile.homeCountryIso2) + ' ' : ''}
              {profile.homeCountryName}
              {profile.nationality ? ` · ${profile.nationality}` : ''}
            </Text>
          )}
          {(currentCity || profile.currentCityName || profile.locationCityName) && (
            <View style={styles.locationRow}>
              <Feather name="map-pin" size={14} color={colors.orange} />
              <Text style={styles.currentCity}>
                Currently in {currentCity?.name ?? profile.currentCityName ?? profile.locationCityName}
              </Text>
            </View>
          )}
          {contextLabel && (
            <View style={styles.contextBadge}>
              <Text style={styles.contextBadgeText}>{contextLabel}</Text>
            </View>
          )}
        </View>

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

        {/* Saved places */}
        {(savedPlaces ?? []).length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Saved places</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.placesRow}
            >
              {(savedPlaces ?? []).map((sp) => (
                <SavedPlaceCard key={sp.placeId} placeId={sp.placeId} />
              ))}
            </ScrollView>
          </>
        )}
      </ScrollView>

      {/* Connection-gated bottom bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
        {status === 'none' && (
          <Pressable
            style={[styles.connectButton, actionLoading && { opacity: 0.6 }]}
            onPress={handleConnect}
            disabled={actionLoading}
          >
            <Feather name="user-plus" size={18} color={colors.background} />
            <Text style={styles.connectButtonText}>Connect</Text>
          </Pressable>
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

function SavedPlaceCard({ placeId }: { placeId: string }) {
  const { data: place } = useData(() => getPlaceById(placeId), [placeId]);
  const { data: imageUrl } = useData(
    () => place ? getPlaceFirstImage(place.id) : Promise.resolve(null),
    [place?.id],
  );

  if (!place) return null;

  return (
    <View style={styles.placeCard}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.placeImage} contentFit="cover" transition={200} />
      ) : (
        <View style={[styles.placeImage, styles.placeImagePlaceholder]}>
          <Feather name="image" size={20} color={colors.textMuted} />
        </View>
      )}
      <Text style={styles.placeName} numberOfLines={1}>
        {place.name}
      </Text>
    </View>
  );
}

function countryFlag(iso2: string): string {
  return [...iso2.toUpperCase()]
    .map((c) => String.fromCodePoint(0x1f1e6 - 65 + c.charCodeAt(0)))
    .join('');
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
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
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
    borderRadius: 48,
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
    borderRadius: 14,
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
  placesRow: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  placeCard: {
    width: 140,
  },
  placeImage: {
    width: 140,
    height: 100,
    borderRadius: radius.sm,
    marginBottom: spacing.xs,
  },
  placeImagePlaceholder: {
    backgroundColor: colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeName: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textPrimary,
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
