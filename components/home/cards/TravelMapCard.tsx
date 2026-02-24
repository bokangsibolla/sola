import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/state/AuthContext';
import { useData } from '@/hooks/useData';
import { getVisitedCountries } from '@/data/trips/tripApi';
import { getUserVisitedCountries } from '@/data/api';
import { groupByContinent } from '@/constants/continents';
import { getFlag } from '@/data/trips/helpers';
import { colors, fonts, radius, spacing, pressedState } from '@/constants/design';

export function TravelMapCard() {
  const router = useRouter();
  const { userId } = useAuth();

  const { data: tripCountries } = useData(
    () => (userId ? getVisitedCountries(userId) : Promise.resolve([])),
    [userId, 'home-travel-map-trips'],
  );

  const { data: userCountries } = useData(
    () => (userId ? getUserVisitedCountries(userId) : Promise.resolve([])),
    [userId, 'home-travel-map-user'],
  );

  // Merge and deduplicate
  const allIso2s = React.useMemo(() => {
    const set = new Set<string>();
    for (const vc of tripCountries ?? []) set.add(vc.countryIso2);
    for (const uc of userCountries ?? []) {
      if (uc.countryIso2) set.add(uc.countryIso2);
    }
    return Array.from(set);
  }, [tripCountries, userCountries]);

  if (allIso2s.length === 0) return null;

  const grouped = groupByContinent(allIso2s);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={() => router.push(`/(tabs)/home/edit-profile` as any)}
    >
      <View style={styles.flagRow}>
        {allIso2s.slice(0, 6).map((iso) => (
          <Text key={iso} style={styles.flag}>
            {getFlag(iso)}
          </Text>
        ))}
        {allIso2s.length > 6 && (
          <Text style={styles.more}>+{allIso2s.length - 6}</Text>
        )}
      </View>
      <Text style={styles.stat}>
        {allIso2s.length} {allIso2s.length === 1 ? 'country' : 'countries'} ·{' '}
        {grouped.length} {grouped.length === 1 ? 'continent' : 'continents'}
      </Text>
      <Text style={styles.subtitle}>Your travel footprint</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.neutralFill,
    borderRadius: radius.cardLg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  pressed: pressedState,
  flagRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  flag: {
    fontSize: 24,
  },
  more: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textMuted,
  },
  stat: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textMuted,
  },
});
