import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import AppScreen from '@/components/AppScreen';
import NavigationHeader from '@/components/NavigationHeader';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import { getConnectionRequests, getProfileById, respondToConnectionRequest } from '@/data/api';
import { useData } from '@/hooks/useData';
import { useAuth } from '@/state/AuthContext';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';
import { getImageUrl } from '@/lib/image';
import type { ConnectionRequest, Profile } from '@/data/types';

export default function ConnectionsScreen() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  const { data: requests, loading, error, refetch } = useData(
    () => (userId ? getConnectionRequests(userId, 'received') : Promise.resolve([])),
    [userId],
  );

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error.message} onRetry={refetch} />;

  const pendingRequests = (requests ?? []).filter((r) => r.status === 'pending');

  return (
    <AppScreen>
      <NavigationHeader title="Connection Requests" parentTitle="Connect" />

      <FlatList
        data={pendingRequests}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="inbox" size={40} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No pending requests</Text>
            <Text style={styles.emptySubtitle}>
              When someone wants to connect, their request will appear here
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <RequestCard
            request={item}
            onRespond={() => {
              queryClient.invalidateQueries({ queryKey: ['travelers'] });
              refetch();
            }}
          />
        )}
      />
    </AppScreen>
  );
}

function RequestCard({
  request,
  onRespond,
}: {
  request: ConnectionRequest;
  onRespond: () => void;
}) {
  const router = useRouter();
  const [responding, setResponding] = useState<'accepting' | 'declining' | null>(null);

  const { data: profile } = useData(
    () => getProfileById(request.senderId),
    [request.senderId],
  );

  const handleRespond = useCallback(
    async (status: 'accepted' | 'declined') => {
      setResponding(status === 'accepted' ? 'accepting' : 'declining');
      try {
        await respondToConnectionRequest(request.id, status);
        onRespond();
      } catch {
        // Silently fail
      } finally {
        setResponding(null);
      }
    },
    [request.id, onRespond],
  );

  if (!profile) {
    return (
      <View style={styles.card}>
        <ActivityIndicator size="small" color={colors.orange} />
      </View>
    );
  }

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => router.push(`/connect/user/${profile.id}`)}
    >
      <View style={styles.cardHeader}>
        {profile.avatarUrl ? (
          <Image
            source={{ uri: getImageUrl(profile.avatarUrl, { width: 112, height: 112 }) ?? undefined }}
            style={styles.avatar}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Feather name="user" size={22} color={colors.textMuted} />
          </View>
        )}
        <View style={styles.cardInfo}>
          <Text style={styles.name}>{profile.firstName}</Text>
          {(profile.locationCityName || profile.homeCountryName) && (
            <Text style={styles.location}>
              {profile.locationCityName ?? profile.homeCountryName}
              {profile.nationality ? ` · ${profile.nationality}` : ''}
            </Text>
          )}
          {request.context && (
            <Text style={styles.contextLabel}>{request.context}</Text>
          )}
        </View>
      </View>

      {profile.bio && (
        <Text style={styles.bio} numberOfLines={2}>{profile.bio}</Text>
      )}

      {(profile.interests ?? []).length > 0 && (
        <View style={styles.tags}>
          {(profile.interests ?? []).slice(0, 4).map((interest) => (
            <View key={interest} style={styles.tag}>
              <Text style={styles.tagText}>{interest}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.actions}>
        <Pressable
          style={[styles.acceptButton, responding === 'accepting' && { opacity: 0.6 }]}
          onPress={(e) => {
            e.stopPropagation();
            handleRespond('accepted');
          }}
          disabled={responding !== null}
        >
          <Feather name="check" size={16} color={colors.background} />
          <Text style={styles.acceptButtonText}>
            {responding === 'accepting' ? 'Accepting...' : 'Accept'}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.declineButton, responding === 'declining' && { opacity: 0.6 }]}
          onPress={(e) => {
            e.stopPropagation();
            handleRespond('declined');
          }}
          disabled={responding !== null}
        >
          <Text style={styles.declineButtonText}>
            {responding === 'declining' ? 'Declining...' : 'Decline'}
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
    gap: spacing.md,
  },
  emptyTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    marginRight: spacing.md,
  },
  avatarPlaceholder: {
    backgroundColor: colors.neutralFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  name: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  location: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  contextLabel: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.orange,
    marginTop: 2,
  },
  bio: {
    ...typography.captionSmall,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: spacing.md,
  },
  tag: {
    backgroundColor: colors.neutralFill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  tagText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.orange,
    borderRadius: radius.button,
    paddingVertical: spacing.sm,
  },
  acceptButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.background,
  },
  declineButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.button,
    paddingVertical: spacing.sm,
  },
  declineButtonText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textMuted,
  },
});
