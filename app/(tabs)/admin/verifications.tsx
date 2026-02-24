import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePostHog } from 'posthog-react-native';
import * as Sentry from '@sentry/react-native';
import { useAuth } from '@/state/AuthContext';
import {
  getPendingVerifications,
  approveVerification,
  rejectVerification,
  getVerificationSelfieSignedUrl,
} from '@/data/api';
import type { PendingVerification } from '@/data/types';
import { formatTimeAgo } from '@/utils/timeAgo';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';
import NavigationHeader from '@/components/NavigationHeader';

// ---------------------------------------------------------------------------
// SelfieImage — loads signed URL on mount
// ---------------------------------------------------------------------------

function SelfieImage({ path }: { path: string }) {
  const [uri, setUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getVerificationSelfieSignedUrl(path).then((url) => {
      if (!cancelled) {
        setUri(url);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [path]);

  if (loading) {
    return (
      <View style={styles.selfiePlaceholder}>
        <ActivityIndicator color={colors.textMuted} />
      </View>
    );
  }

  if (!uri) {
    return (
      <View style={styles.selfiePlaceholder}>
        <Ionicons name="image-outline" size={32} color={colors.textMuted} />
      </View>
    );
  }

  return <Image source={{ uri }} style={styles.selfieImage} />;
}

// ---------------------------------------------------------------------------
// VerificationCard
// ---------------------------------------------------------------------------

interface CardProps {
  item: PendingVerification;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  busy: boolean;
}

function VerificationCard({ item, onApprove, onReject, busy }: CardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.photoCompare}>
        <View style={styles.photoColumn}>
          {item.avatarUrl ? (
            <Image source={{ uri: item.avatarUrl }} style={styles.profileImage} />
          ) : (
            <View style={styles.profilePlaceholder}>
              <Ionicons name="person-outline" size={28} color={colors.textMuted} />
            </View>
          )}
          <Text style={styles.photoLabel}>Profile</Text>
        </View>

        <Ionicons name="arrow-forward" size={18} color={colors.textMuted} />

        <View style={styles.photoColumn}>
          <SelfieImage path={item.verificationSelfieUrl} />
          <Text style={styles.photoLabel}>Selfie</Text>
        </View>
      </View>

      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>{item.firstName}</Text>
        <Text style={styles.cardTime}>
          Submitted {formatTimeAgo(item.verificationSubmittedAt)}
        </Text>
      </View>

      <View style={styles.cardActions}>
        <Pressable
          style={[styles.actionBtn, styles.approveBtn]}
          onPress={() => onApprove(item.id)}
          disabled={busy}
        >
          <Ionicons name="checkmark" size={18} color="#FFFFFF" />
          <Text style={styles.actionBtnText}>Approve</Text>
        </Pressable>

        <Pressable
          style={[styles.actionBtn, styles.rejectBtn]}
          onPress={() => onReject(item.id)}
          disabled={busy}
        >
          <Ionicons name="close" size={18} color="#FFFFFF" />
          <Text style={styles.actionBtnText}>Reject</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function AdminVerificationsScreen() {
  const insets = useSafeAreaInsets();
  const { userId } = useAuth();
  const posthog = usePostHog();

  const [items, setItems] = useState<PendingVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchPending = useCallback(async () => {
    try {
      const data = await getPendingVerifications();
      setItems(data);
    } catch (err) {
      Sentry.captureException(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    posthog.capture('admin_verifications_viewed');
    fetchPending();
  }, [fetchPending, posthog]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPending();
  };

  const handleApprove = async (targetUserId: string) => {
    if (!userId) return;
    setBusyId(targetUserId);
    try {
      await approveVerification(targetUserId, userId);
      setItems((prev) => prev.filter((i) => i.id !== targetUserId));
      posthog.capture('admin_verification_approved', { targetUserId });
    } catch (err) {
      Sentry.captureException(err);
      Alert.alert('Error', 'Could not approve verification. Please try again.');
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = (targetUserId: string) => {
    Alert.alert(
      'Reject verification?',
      'The user will be asked to re-submit their selfie.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            if (!userId) return;
            setBusyId(targetUserId);
            try {
              await rejectVerification(targetUserId, userId);
              setItems((prev) => prev.filter((i) => i.id !== targetUserId));
              posthog.capture('admin_verification_rejected', { targetUserId });
            } catch (err) {
              Sentry.captureException(err);
              Alert.alert('Error', 'Could not reject verification. Please try again.');
            } finally {
              setBusyId(null);
            }
          },
        },
      ],
    );
  };

  const renderItem = ({ item }: { item: PendingVerification }) => (
    <VerificationCard
      item={item}
      onApprove={handleApprove}
      onReject={handleReject}
      busy={busyId === item.id}
    />
  );

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="shield-checkmark-outline" size={48} color={colors.textMuted} />
        <Text style={styles.emptyTitle}>No pending verifications</Text>
        <Text style={styles.emptySubtitle}>
          All submissions have been reviewed
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <NavigationHeader title="Review Verifications" parentTitle="Admin" />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.orange} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.list}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const PHOTO_SIZE = 100;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },

  // Card
  card: {
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  cardInfo: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  cardName: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  cardTime: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
    width: '100%',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.button,
  },
  approveBtn: {
    backgroundColor: colors.greenSoft,
  },
  rejectBtn: {
    backgroundColor: colors.emergency,
  },
  actionBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: '#FFFFFF',
  },

  // Photo comparison
  photoCompare: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  photoColumn: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  photoLabel: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.textMuted,
  },
  profileImage: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: PHOTO_SIZE / 2,
  },
  profilePlaceholder: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: PHOTO_SIZE / 2,
    backgroundColor: colors.neutralFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selfieImage: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: PHOTO_SIZE / 2,
  },
  selfiePlaceholder: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: PHOTO_SIZE / 2,
    backgroundColor: colors.neutralFill,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Empty state
  emptyContainer: {
    alignItems: 'center',
    paddingTop: spacing.xxxxl,
    gap: spacing.sm,
  },
  emptyTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.textMuted,
  },
});
