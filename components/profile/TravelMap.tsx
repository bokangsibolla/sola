import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { groupByContinent } from '@/constants/continents';
import { getFlag } from '@/data/trips/helpers';
import { colors, fonts, radius, spacing } from '@/constants/design';

interface TravelMapProps {
  /** ISO2 country codes */
  countries: string[];
  /** Show "Add a country" link at bottom */
  onAddCountry?: () => void;
}

export function TravelMap({ countries, onAddCountry }: TravelMapProps) {
  const [expanded, setExpanded] = useState(false);

  if (countries.length === 0) return null;

  const grouped = groupByContinent(countries);
  const continentCount = grouped.length;

  return (
    <View>
      {/* Summary card — always visible */}
      <Pressable
        style={styles.summaryCard}
        onPress={() => setExpanded(!expanded)}
      >
        {/* Flag preview row */}
        <View style={styles.flagPreview}>
          {countries.slice(0, 8).map((iso) => (
            <Text key={iso} style={styles.previewFlag}>{getFlag(iso)}</Text>
          ))}
          {countries.length > 8 && (
            <Text style={styles.moreCount}>+{countries.length - 8}</Text>
          )}
        </View>
        <Text style={styles.statLine}>
          {countries.length} {countries.length === 1 ? 'country' : 'countries'} · {continentCount} {continentCount === 1 ? 'continent' : 'continents'}
        </Text>
      </Pressable>

      {/* Expanded continent list */}
      {expanded && (
        <View style={styles.expandedList}>
          {grouped.map(({ continent, countries: codes }) => (
            <View key={continent} style={styles.continentSection}>
              <Text style={styles.continentTitle}>
                {continent} ({codes.length})
              </Text>
              <View style={styles.countryRow}>
                {codes.map((iso, i) => (
                  <Text key={iso} style={styles.countryItem}>
                    {getFlag(iso)}{i < codes.length - 1 ? '  \u00B7  ' : ''}
                  </Text>
                ))}
              </View>
            </View>
          ))}

          {onAddCountry && (
            <Pressable onPress={onAddCountry} style={styles.addLink}>
              <Text style={styles.addLinkText}>+ Add a country</Text>
            </Pressable>
          )}

          <Pressable onPress={() => setExpanded(false)}>
            <Text style={styles.collapseText}>Show less</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    backgroundColor: colors.neutralFill,
    borderRadius: radius.cardLg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  flagPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    alignItems: 'center',
  },
  previewFlag: {
    fontSize: 28,
  },
  moreCount: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textMuted,
  },
  statLine: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  expandedList: {
    marginTop: spacing.md,
    gap: spacing.lg,
  },
  continentSection: {
    gap: spacing.xs,
  },
  continentTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  countryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  countryItem: {
    fontSize: 22,
    lineHeight: 32,
  },
  addLink: {
    paddingVertical: spacing.sm,
  },
  addLinkText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.orange,
  },
  collapseText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.orange,
  },
});
