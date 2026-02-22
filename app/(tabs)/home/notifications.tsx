import React, { useEffect, useCallback } from 'react';
import {
  View,
  SectionList,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SolaText } from '@/components/ui/SolaText';
import AppScreen from '@/components/AppScreen';
import NavigationHeader from '@/components/NavigationHeader';
import { NotificationRow } from '@/components/notifications/NotificationRow';
import { NotificationSectionHeader } from '@/components/notifications/NotificationSectionHeader';
import { useNotifications } from '@/data/notifications/useNotifications';
import { colors, fonts, spacing } from '@/constants/design';
import type { Notification } from '@/data/notifications/types';

export default function NotificationsScreen() {
  const { grouped, loading, refetch, markAllRead } = useNotifications();

  // Mark all as read when the screen opens
  useEffect(() => {
    markAllRead();
  }, [markAllRead]);

  const sections = [];
  if (grouped.today.length > 0) {
    sections.push({ title: 'Today', data: grouped.today });
  }
  if (grouped.thisWeek.length > 0) {
    sections.push({ title: 'This week', data: grouped.thisWeek });
  }
  if (grouped.earlier.length > 0) {
    sections.push({ title: 'Earlier', data: grouped.earlier });
  }

  const renderItem = useCallback(
    ({ item }: { item: Notification }) => <NotificationRow notification={item} />,
    [],
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: { title: string } }) => (
      <View style={styles.sectionHeaderWrap}>
        <NotificationSectionHeader title={section.title} />
      </View>
    ),
    [],
  );

  return (
    <AppScreen>
      <NavigationHeader title="Activity" parentTitle="Home" />

      {/* Loading state */}
      {loading && sections.length === 0 && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.orange} />
        </View>
      )}

      {/* Notification list */}
      {sections.length > 0 ? (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refetch}
              tintColor={colors.orange}
            />
          }
        />
      ) : (
        !loading && (
          <View style={styles.emptyState}>
            <SolaText style={styles.emptyText}>You're all caught up</SolaText>
          </View>
        )
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: spacing.xxl,
  },
  sectionHeaderWrap: {
    paddingHorizontal: spacing.screenX,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textMuted,
  },
});
