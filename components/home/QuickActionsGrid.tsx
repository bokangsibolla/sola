import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors, fonts, spacing, radius, pressedState } from '@/constants/design';

interface QuickActionsGridProps {
  savedCount: number;
  unreadCount: number;
  /** If user has a trip, show trip-contextual actions */
  hasTrip?: boolean;
  tripCityName?: string;
}

interface ActionItem {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  badge?: number;
  route: string;
}

export default function QuickActionsGrid({
  savedCount,
  unreadCount,
  hasTrip,
  tripCityName,
}: QuickActionsGridProps) {
  const router = useRouter();

  const actions: ActionItem[] = hasTrip
    ? [
        { icon: 'compass', label: 'Explore', route: '/(tabs)/discover' },
        { icon: 'bookmark', label: `Saved`, badge: savedCount || undefined, route: '/home/saved' },
        { icon: 'send', label: 'Messages', badge: unreadCount || undefined, route: '/connect/dm' },
        { icon: 'message-circle', label: 'Community', route: '/(tabs)/connect' },
      ]
    : [
        { icon: 'compass', label: 'Explore', route: '/(tabs)/discover' },
        { icon: 'bookmark', label: 'Saved', badge: savedCount || undefined, route: '/home/saved' },
        { icon: 'send', label: 'Messages', badge: unreadCount || undefined, route: '/connect/dm' },
        { icon: 'message-circle', label: 'Community', route: '/(tabs)/connect' },
      ];

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {actions.map((action) => (
          <Pressable
            key={action.label}
            style={({ pressed }) => [
              styles.cell,
              pressed && { opacity: pressedState.opacity, transform: pressedState.transform },
            ]}
            onPress={() => router.push(action.route as any)}
          >
            <View style={styles.iconWrap}>
              <Feather name={action.icon} size={20} color={colors.textPrimary} />
              {action.badge !== undefined && action.badge > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {action.badge > 99 ? '99+' : action.badge}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.label}>{action.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.screenX,
  },
  grid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    backgroundColor: colors.neutralFill,
    borderRadius: radius.card,
  },
  iconWrap: {
    position: 'relative',
    marginBottom: spacing.xs,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    backgroundColor: colors.orange,
    borderRadius: radius.full,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 9,
    fontFamily: fonts.semiBold,
    color: '#FFFFFF',
  },
  label: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
  },
});
