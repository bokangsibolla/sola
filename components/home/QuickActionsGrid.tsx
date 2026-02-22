import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SolaText } from '@/components/ui/SolaText';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  colors,
  elevation,
  fonts,
  radius,
  spacing,
  pressedState,
} from '@/constants/design';

interface QuickActionsGridProps {
  activeTripId?: string | null;
}

interface ActionItem {
  label: string;
  subtitle: string;
  route: string;
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
}

export function QuickActionsGrid({ activeTripId }: QuickActionsGridProps) {
  const router = useRouter();

  const items: ActionItem[] = [
    {
      label: 'Safety Info',
      subtitle: 'Emergency help\n& local numbers',
      route: activeTripId
        ? `/(tabs)/home/trips/${activeTripId}`
        : '/(tabs)/trips',
      iconName: 'shield-checkmark-outline',
      iconColor: colors.greenSoft,
      iconBg: colors.greenFill,
    },
    {
      label: 'Browse',
      subtitle: 'Explore cities\n& destinations',
      route: '/(tabs)/discover',
      iconName: 'search-outline',
      iconColor: colors.blueSoft,
      iconBg: colors.blueFill,
    },
    {
      label: 'Community',
      subtitle: 'Questions from\nsolo travelers',
      route: '/(tabs)/connect',
      iconName: 'chatbubbles-outline',
      iconColor: colors.orange,
      iconBg: colors.orangeFill,
    },
    {
      label: 'My Trips',
      subtitle: 'Plan & organize\nyour travels',
      route: '/(tabs)/trips',
      iconName: 'airplane-outline',
      iconColor: colors.textSecondary,
      iconBg: colors.neutralFill,
    },
  ];

  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <Pressable
          key={item.label}
          style={({ pressed }) => [
            styles.tile,
            pressed && { opacity: pressedState.opacity, transform: pressedState.transform },
          ]}
          onPress={() => router.push(item.route as any)}
        >
          <View style={[styles.iconCircle, { backgroundColor: item.iconBg }]}>
            <Ionicons name={item.iconName} size={18} color={item.iconColor} />
          </View>
          <SolaText style={styles.label}>{item.label}</SolaText>
          <SolaText style={styles.subtitle}>{item.subtitle}</SolaText>
        </Pressable>
      ))}
    </View>
  );
}

const ICON_SIZE = 32;

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.screenX,
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  tile: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.module,
    padding: spacing.moduleInset,
    minHeight: 100,
    ...elevation.sm,
  },
  iconCircle: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    lineHeight: 20,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
