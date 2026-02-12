import React, { useState, useEffect } from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { colors, fonts } from '@/constants/design';
import { useAuth } from '@/state/AuthContext';
import { getCommunityLastVisit, setCommunityLastVisit } from '@/data/community/lastVisit';
import { getNewCommunityActivity } from '@/data/community/communityApi';

// Feather icon names per route — 4 tabs
const TAB_ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  home: 'home',
  discover: 'compass',
  connect: 'users',
  trips: 'map',
};

const TAB_ICON_SIZE = 24;
const TAB_BAR_HEIGHT = 50;

export default function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 8);
  const { userId } = useAuth();
  const [connectHasNew, setConnectHasNew] = useState(false);

  // Check for new community activity on mount (badge shows on Connect tab)
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
    <View style={[styles.container, { paddingBottom: bottomPadding }]}>
      <View style={styles.border} />
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];

        const isFocused = state.index === index;
        const label = options.title ?? route.name;
        const icon = TAB_ICONS[route.name];
        const tintColor = isFocused ? colors.orange : colors.tabBarInactive;

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
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tab}
          >
            {icon && (
              <View>
                <Feather name={icon} size={TAB_ICON_SIZE} color={tintColor} />
                {route.name === 'connect' && connectHasNew && !isFocused && (
                  <View style={styles.badge} />
                )}
              </View>
            )}
            <Text
              style={[
                styles.label,
                { color: tintColor },
                isFocused && styles.labelActive,
              ]}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.tabBarBackground,
    paddingTop: 8,
  },
  border: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.tabBarBorder,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    minHeight: TAB_BAR_HEIGHT,
  },
  // icon size is handled by Feather's size prop
  label: {
    fontFamily: fonts.medium,
    fontSize: 10,
    lineHeight: 12,
  },
  labelActive: {
    fontFamily: fonts.semiBold,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.orange,
  },
});
