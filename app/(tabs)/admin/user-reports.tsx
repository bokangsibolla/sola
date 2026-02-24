import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Sentry from '@sentry/react-native';
import {
  getUserReports,
  resolveUserReport,
} from '@/data/admin/adminApi';
import type { UserReport } from '@/data/admin/adminApi';
import { formatTimeAgo } from '@/utils/timeAgo';
import { colors, fonts, radius, spacing } from '@/constants/design';
import NavigationHeader from '@/components/NavigationHeader';

// ---------------------------------------------------------------------------
// ReportCard
// ---------------------------------------------------------------------------

interface CardProps {
  item: UserReport;
  onResolve: (id: string) => void;
  onDismiss: (id: string) => void;
  busy: boolean;
}

function ReportCard({ item, onResolve, onDismiss, busy }: CardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTopRow}>
        <View style={styles.reasonBadge}>
          <Text style={styles.reasonBadgeText}>{item.reason}</Text>
        </View>
        <Text style={styles.cardTime}>{formatTimeAgo(item.createdAt)}</Text>
      </View>

      <Text style={styles.cardLabel}>
        {item.reportedName} reported by {item.reporterName}
      </Text>

      {item.details ? (
        <Text style={styles.cardDetails}>{item.details}</Text>
      ) : null}

      <View style={styles.cardActions}>
        <Pressable
          style={[styles.actionBtn, styles.resolveBtn]}
          onPress={() => onResolve(item.id)}
          disabled={busy}
        >
          <Text style={styles.resolveBtnText}>Resolve</Text>
        </Pressable>

        <Pressable
          style={[styles.actionBtn, styles.dismissBtn]}
          onPress={() => onDismiss(item.id)}
          disabled={busy}
        >
          <Text style={styles.dismissBtnText}>Dismiss</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function UserReportsScreen() {
  const insets = useSafeAreaInsets();

  const [items, setItems] = useState<UserReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    try {
      const data = await getUserReports();
      setItems(data);
    } catch (err) {
      Sentry.captureException(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  const handleResolve = (reportId: string) => {
    Alert.alert(
      'Resolve report?',
      'This will mark the report as resolved.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Resolve',
          onPress: async () => {
            setBusyId(reportId);
            try {
              await resolveUserReport(reportId, 'resolved');
              setItems((prev) => prev.filter((i) => i.id !== reportId));
            } catch (err) {
              Sentry.captureException(err);
              Alert.alert('Error', 'Could not resolve report. Please try again.');
            } finally {
              setBusyId(null);
            }
          },
        },
      ],
    );
  };

  const handleDismiss = (reportId: string) => {
    Alert.alert(
      'Dismiss report?',
      'The report will be closed without action.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Dismiss',
          onPress: async () => {
            setBusyId(reportId);
            try {
              await resolveUserReport(reportId, 'dismissed');
              setItems((prev) => prev.filter((i) => i.id !== reportId));
            } catch (err) {
              Sentry.captureException(err);
              Alert.alert('Error', 'Could not dismiss report. Please try again.');
            } finally {
              setBusyId(null);
            }
          },
        },
      ],
    );
  };

  const renderItem = ({ item }: { item: UserReport }) => (
    <ReportCard
      item={item}
      onResolve={handleResolve}
      onDismiss={handleDismiss}
      busy={busyId === item.id}
    />
  );

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="checkmark-circle-outline" size={48} color={colors.textMuted} />
        <Text style={styles.emptyTitle}>No pending reports</Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <NavigationHeader title="User Reports" parentTitle="Admin" />

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
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reasonBadge: {
    backgroundColor: colors.warningFill,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  reasonBadgeText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.warning,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardTime: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
  cardLabel: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  cardDetails: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.button,
  },
  resolveBtn: {
    backgroundColor: colors.orange,
  },
  resolveBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  dismissBtn: {
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  dismissBtnText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textMuted,
  },

  // Empty state
  emptyContainer: {
    alignItems: 'center',
    paddingTop: spacing.xxxxl,
  },
  emptyTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
});
