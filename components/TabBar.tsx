import React, { useState, useEffect } from 'react';
import { View, Pressable, StyleSheet, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { colors, spacing, radius } from '@/constants/design';
import { useAuth } from '@/state/AuthContext';
import { getCommunityLastVisit, setCommunityLastVisit } from '@/data/community/lastVisit';
import { getNewCommunityActivity } from '@/data/community/communityApi';

// ─── Icon mapping ────────────────────────────────────────────────────────────
// All Ionicons — consistent stroke weight, clear silhouettes, equal visual density

const TAB_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  home: 'home-outline',
  discover: 'search-outline',
  connect: 'people-outline',
  trips: 'airplane-outline',
};

const TAB_ICONS_ACTIVE: Record<string, keyof typeof Ionicons.glyphMap> = {
  home: 'home',
  discover: 'search',
  connect: 'people',
  trips: 'airplane',
};

const ICON_SIZE = 22;
const ACTIVE_CIRCLE_SIZE = spacing.xxxxl; // 48 — meets 44pt minimum touch target
const ANIMATION_DURATION = 250;

/** Height to reserve at bottom of scrollable content so items aren't hidden behind the bar. */
export const FLOATING_TAB_BAR_HEIGHT = ACTIVE_CIRCLE_SIZE + spacing.xxl + spacing.xxl;

// ─── Individual Tab Item ─────────────────────────────────────────────────────

interface TabItemProps {
  isFocused: boolean;
  routeName: string;
  label: string;
  onPress: () => void;
  onLongPress: () => void;
  showBadge: boolean;
}

function TabItem({ isFocused, routeName, label, onPress, onLongPress, showBadge }: TabItemProps) {
  const active = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    active.value = withTiming(isFocused ? 1 : 0, {
      duration: ANIMATION_DURATION,
      easing: Easing.out(Easing.cubic),
    });
  }, [isFocused, active]);

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: active.value }],
    opacity: active.value,
  }));

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
        <Animated.View style={[styles.activeCircle, circleStyle]} />
        <Ionicons
          name={iconName}
          size={ICON_SIZE}
          color={isFocused ? colors.orange : colors.floatingNavIconInactive}
        />
        {showBadge && <View style={styles.badge} />}
      </View>
    </Pressable>
  );
}

// ─── Floating Tab Bar ────────────────────────────────────────────────────────

export default function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, spacing.sm) + spacing.lg;
  const { userId } = useAuth();
  const [connectHasNew, setConnectHasNew] = useState(false);

  // Check for new community activity on mount
  useEffect(() => {
    if (!userId) return;
    const uid = userId;

    async function checkActivity() {
      try {
        const lastVisit = await getCommunityLastVisit();
        if (!lastVisit) return;
        const activity = await getNewCommunityActivity(uid, lastVisit);
        setConnectHasNew(activity.newReplyCount > 0);
      } catch {
        // Non-critical
      }
    }

    checkActivity();
  }, [userId]);

  // Clear badge when Connect tab is focused
  useEffect(() => {
    if (state.routes[state.index]?.name === 'connect') {
      setConnectHasNew(false);
      setCommunityLastVisit();
    }
  }, [state.index]);

  return (
    <View
      style={[styles.wrapper, { paddingBottom: bottomPadding }]}
      pointerEvents="box-none"
    >
      <View style={styles.floatingBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const label = options.title ?? route.name;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: 'tabLongPress', target: route.key });
          };

          return (
            <TabItem
              key={route.key}
              isFocused={isFocused}
              routeName={route.name}
              label={label}
              onPress={onPress}
              onLongPress={onLongPress}
              showBadge={route.name === 'connect' && connectHasNew && !isFocused}
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
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  floatingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.floatingNavBg,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.floatingNavBorder,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: spacing.sm,
    // Exception to flat-design rule: floating elements need subtle depth
    // to separate from scrollable content beneath them
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: spacing.lg,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: ACTIVE_CIRCLE_SIZE,
    height: ACTIVE_CIRCLE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeCircle: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: ACTIVE_CIRCLE_SIZE / 2,
    backgroundColor: colors.orangeFill,
  },
  badge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: spacing.sm,
    height: spacing.sm,
    borderRadius: spacing.xs,
    backgroundColor: colors.orange,
  },
});
