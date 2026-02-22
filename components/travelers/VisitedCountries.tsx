import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fonts, spacing, radius } from '@/constants/design';
import { SolaText } from '@/components/ui/SolaText';
import { getFlag } from '@/data/trips/helpers';
import type { VisitedCountry } from '@/data/trips/tripApi';

interface VisitedCountriesProps {
  countries: VisitedCountry[];
}

const COLLAPSED_COUNT = 5;

export default function VisitedCountries({ countries }: VisitedCountriesProps) {
  const [expanded, setExpanded] = useState(false);

  if (countries.length === 0) return null;

  const visible = expanded ? countries : countries.slice(0, COLLAPSED_COUNT);
  const hasMore = countries.length > COLLAPSED_COUNT;
  const countLabel = countries.length === 1 ? '1 country visited' : `${countries.length} countries visited`;

  return (
    <View style={styles.container}>
      <SolaText style={styles.headline}>{countLabel}</SolaText>

      {visible.map((c) => (
        <View key={c.countryIso2} style={styles.row}>
          <SolaText style={styles.flag}>{getFlag(c.countryIso2)}</SolaText>
          <SolaText style={styles.countryName}>{c.countryName}</SolaText>
          <SolaText style={styles.tripCount}>
            {c.tripCount} {c.tripCount === 1 ? 'trip' : 'trips'}
          </SolaText>
        </View>
      ))}

      {hasMore && !expanded && (
        <Pressable
          style={styles.showMore}
          onPress={() => setExpanded(true)}
          hitSlop={8}
        >
          <SolaText style={styles.showMoreText}>
            Show all {countries.length} countries
          </SolaText>
          <Feather name="chevron-down" size={14} color={colors.orange} />
        </Pressable>
      )}

      {hasMore && expanded && (
        <Pressable
          style={styles.showMore}
          onPress={() => setExpanded(false)}
          hitSlop={8}
        >
          <SolaText style={styles.showMoreText}>Show less</SolaText>
          <Feather name="chevron-up" size={14} color={colors.orange} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  headline: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  flag: {
    fontSize: 20,
    marginRight: spacing.md,
  },
  countryName: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textPrimary,
  },
  tripCount: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
  showMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
  },
  showMoreText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.orange,
  },
});
