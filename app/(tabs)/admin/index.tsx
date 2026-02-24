import React, { useCallback, useEffect, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AppScreen from '@/components/AppScreen';
import NavigationHeader from '@/components/NavigationHeader';
import { getAdminPendingCounts, AdminPendingCounts } from '@/data/admin/adminApi';
import { colors, fonts, radius, spacing } from '@/constants/design';

// ---------------------------------------------------------------------------
// Section card config
// ---------------------------------------------------------------------------

interface SectionItem {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  countKey: keyof Omit<AdminPendingCounts, 'total'>;
  route: string;
}

const SECTIONS: SectionItem[] = [
  {
    icon: 'shield-checkmark-outline',
    title: 'Verification Queue',
    subtitle: 'Pending identity reviews',
    countKey: 'verifications',
    route: '/(tabs)/admin/verifications',
  },
  {
    icon: 'flag-outline',
    title: 'Content Reports',
    subtitle: 'Flagged posts and replies',
    countKey: 'contentReports',
    route: '/(tabs)/admin/content-reports',
  },
  {
    icon: 'person-circle-outline',
    title: 'User Reports',
    subtitle: 'Reported user accounts',
    countKey: 'userReports',
    route: '/(tabs)/admin/user-reports',
  },
];

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function AdminDashboardScreen() {
  const router = useRouter();
  const [counts, setCounts] = useState<AdminPendingCounts>({
    verifications: 0,
    contentReports: 0,
    userReports: 0,
    total: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  const fetchCounts = useCallback(async () => {
    try {
      const data = await getAdminPendingCounts();
      setCounts(data);
    } catch {
      // Silently fail — counts stay at 0
    }
  }, []);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchCounts();
    setRefreshing(false);
  }, [fetchCounts]);

  return (
    <AppScreen>
      <NavigationHeader title="Admin" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.orange}
          />
        }
        contentContainerStyle={styles.scroll}
      >
        {SECTIONS.map((section) => {
          const count = counts[section.countKey];
          return (
            <Pressable
              key={section.countKey}
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              onPress={() => router.push(section.route as any)}
            >
              <View style={styles.iconCircle}>
                <Ionicons name={section.icon} size={22} color={colors.orange} />
              </View>

              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{section.title}</Text>
                <Text style={styles.cardSubtitle}>{section.subtitle}</Text>
              </View>

              {count > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{count}</Text>
                </View>
              )}

              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.textMuted}
              />
            </Pressable>
          );
        })}
      </ScrollView>
    </AppScreen>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    gap: spacing.md,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: radius.card,
    backgroundColor: colors.orangeFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  cardSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  badge: {
    backgroundColor: colors.orange,
    borderRadius: radius.full,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  badgeText: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: '#FFFFFF',
  },
});
