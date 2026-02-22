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
      <SelfieImage path={item.verificationSelfieUrl} />

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
      <NavigationHeader title="Review Verifications" parentTitle="Settings" />

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

const SELFIE_SIZE = 160;

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

  // Selfie
  selfieImage: {
    width: SELFIE_SIZE,
    height: SELFIE_SIZE,
    borderRadius: SELFIE_SIZE / 2,
  },
  selfiePlaceholder: {
    width: SELFIE_SIZE,
    height: SELFIE_SIZE,
    borderRadius: SELFIE_SIZE / 2,
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
