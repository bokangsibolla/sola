import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, fonts, radius, spacing, pressedState } from '@/constants/design';

interface DashboardItem {
  label: string;
  subtitle: string;
  route: string;
  bg: string;
  accentColor: string;
}

const ITEMS: DashboardItem[] = [
  {
    label: 'Safety',
    subtitle: 'SOS & emergency info',
    route: '/(tabs)/sos',
    bg: colors.greenFill,
    accentColor: colors.greenSoft,
  },
  {
    label: 'Browse destinations',
    subtitle: 'Explore countries and cities',
    route: '/discover/browse',
    bg: colors.blueFill,
    accentColor: colors.blueSoft,
  },
  {
    label: 'Community',
    subtitle: 'Ask real solo travelers',
    route: '/(tabs)/connect',
    bg: colors.orangeFill,
    accentColor: colors.orange,
  },
];

export function QuickLinksRow() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {ITEMS.map((item) => (
        <Pressable
          key={item.label}
          style={({ pressed }) => [
            styles.row,
            { backgroundColor: item.bg, borderLeftColor: item.accentColor },
            pressed && styles.pressed,
          ]}
          onPress={() => router.push(item.route as any)}
        >
          <View style={styles.textWrap}>
            <Text style={[styles.label, { color: item.accentColor }]}>
              {item.label}
            </Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
          <Feather name="chevron-right" size={18} color={item.accentColor} />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.screenX,
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.card,
    borderLeftWidth: 3,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  textWrap: {
    flex: 1,
  },
  label: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    lineHeight: 20,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSecondary,
    marginTop: 2,
  },
  pressed: {
    opacity: pressedState.opacity,
    transform: pressedState.transform,
  },
});
