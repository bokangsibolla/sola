import React, { useState, useEffect } from 'react';
import { View, Pressable, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { StackActions } from '@react-navigation/native';
import { colors, fonts, spacing } from '@/constants/design';
import { useAuth } from '@/state/AuthContext';
import { getCommunityLastVisit, setCommunityLastVisit } from '@/data/community/lastVisit';
import { getNewCommunityActivity } from '@/data/community/communityApi';
import { useData } from '@/hooks/useData';
import { getProfileById } from '@/data/api';
import { getAdminPendingCounts } from '@/data/admin/adminApi';

// ─── Icon mapping ────────────────────────────────────────────────────────────

const TAB_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  home: 'home-outline',
  discover: 'search-outline',
  discussions: 'chatbubbles-outline',
  travelers: 'people-outline',
  trips: 'airplane-outline',
  admin: 'shield-outline',
};

const TAB_ICONS_ACTIVE: Record<string, keyof typeof Ionicons.glyphMap> = {
  home: 'home',
  discover: 'search',
  discussions: 'chatbubbles',
  travelers: 'people',
  trips: 'airplane',
  admin: 'shield',
};

const ICON_SIZE = 26;
const TAB_HIT_SIZE = 48; // meets 44pt minimum touch target
const BAR_HEIGHT = 50;

/** Height to reserve at bottom of scrollable content so items aren't hidden behind the bar. */
export const FLOATING_TAB_BAR_HEIGHT = BAR_HEIGHT + spacing.xxl;

// ─── Individual Tab Item ─────────────────────────────────────────────────────

interface TabItemProps {
  isFocused: boolean;
  routeName: string;
  label: string;
  onPress: () => void;
  onLongPress: () => void;
  showBadge: boolean;
  badgeCount?: number;
}

function TabItem({ isFocused, routeName, label, onPress, onLongPress, showBadge, badgeCount }: TabItemProps) {
  const iconName = isFocused
    ? TAB_ICONS_ACTIVE[routeName]
    : TAB_ICONS[routeName];

  if (!iconName) return null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={label}
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tab}
    >
      <View style={styles.iconContainer}>
        <Ionicons
          name={iconName}
          size={ICON_SIZE}
          color={isFocused ? colors.orange : colors.floatingNavIconInactive}
        />
        {showBadge && badgeCount != null && badgeCount > 0 ? (
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>
              {badgeCount > 99 ? '99+' : badgeCount}
            </Text>
          </View>
        ) : showBadge ? (
          <View style={styles.badge} />
        ) : null}
      </View>
    </Pressable>
  );
}

// ─── Tab Bar ─────────────────────────────────────────────────────────────────

export default function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, spacing.xs);
  const { userId } = useAuth();
  const [discussionsHasNew, setDiscussionsHasNew] = useState(false);

  // Check for new community activity on mount
  useEffect(() => {
    if (!userId) return;
    const uid = userId;

    async function checkActivity() {
      try {
        const lastVisit = await getCommunityLastVisit();
        if (!lastVisit) return;
        const activity = await getNewCommunityActivity(uid, lastVisit);
        setDiscussionsHasNew(activity.newReplyCount > 0);
      } catch {
        // Non-critical
      }
    }

    checkActivity();
  }, [userId]);

  // Clear badge when Discussions tab is focused
  useEffect(() => {
    if (state.routes[state.index]?.name === 'discussions') {
      setDiscussionsHasNew(false);
      setCommunityLastVisit();
    }
  }, [state.index]);

  // Admin — profile check + pending count
  const { data: profile } = useData(
    () => userId ? getProfileById(userId) : Promise.resolve(null),
    ['profile', userId],
  );
  const isAdmin = profile?.isAdmin === true;

  const [adminCount, setAdminCount] = useState(0);
  useEffect(() => {
    if (!isAdmin) return;
    getAdminPendingCounts()
      .then((c) => setAdminCount(c.total))
      .catch(() => {});
  }, [isAdmin]);

  const visibleRoutes = state.routes.filter((route) => {
    if (route.name === 'admin') return isAdmin;
    return true;
  });

  return (
    <View style={[styles.wrapper, { paddingBottom: bottomInset }]}>
      <View style={styles.bar}>
        {visibleRoutes.map((route) => {
          const index = state.routes.indexOf(route);
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const label = options.title ?? route.name;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (event.defaultPrevented) return;

            if (!isFocused) {
              navigation.navigate(route.name, route.params);
            } else {
              // Already on this tab — pop to root of the nested stack
              const nestedState = state.routes[index]?.state;
              if (nestedState?.key && typeof nestedState.index === 'number' && nestedState.index > 0) {
                navigation.dispatch({
                  ...StackActions.popToTop(),
                  target: nestedState.key,
                });
              }
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: 'tabLongPress', target: route.key });
          };

          const showBadge =
            (route.name === 'discussions' && discussionsHasNew && !isFocused) ||
            (route.name === 'admin' && adminCount > 0 && !isFocused);

          return (
            <TabItem
              key={route.key}
              isFocused={isFocused}
              routeName={route.name}
              label={label}
              onPress={onPress}
              onLongPress={onLongPress}
              showBadge={showBadge}
              badgeCount={route.name === 'admin' ? adminCount : undefined}
            />
          );
        })}
      </View>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.background,
    // Subtle upward shadow for separation from content
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: BAR_HEIGHT,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: TAB_HIT_SIZE,
  },
  iconContainer: {
    width: TAB_HIT_SIZE,
    height: TAB_HIT_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.orange,
  },
  countBadge: {
    position: 'absolute',
    top: 4,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.emergency,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  countBadgeText: {
    fontFamily: fonts.semiBold,
    fontSize: 10,
    color: '#FFFFFF',
  },
});
