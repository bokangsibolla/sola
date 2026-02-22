import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SolaText } from '@/components/ui/SolaText';
import { colors, fonts, radius, spacing } from '@/constants/design';
import type { Place } from '@/data/types';

interface AtAGlanceProps {
  activity: Place;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const AtAGlance: React.FC<AtAGlanceProps> = ({ activity }) => {
  const rows: Array<{ label: string; value: string }> = [];

  if (activity.estimatedDuration) {
    rows.push({ label: 'Duration', value: activity.estimatedDuration });
  }
  if (activity.bestTimeOfDay && activity.bestTimeOfDay !== 'any') {
    rows.push({ label: 'Best time', value: capitalize(activity.bestTimeOfDay) });
  }
  if (activity.physicalLevel) {
    rows.push({ label: 'Physical level', value: capitalize(activity.physicalLevel) });
  }
  if (activity.pickupIncluded != null) {
    rows.push({
      label: 'Pickup',
      value: activity.pickupIncluded ? 'Included' : 'Not included',
    });
  }
  if (activity.bookAheadText) {
    rows.push({ label: 'Book ahead', value: activity.bookAheadText });
  }

  if (rows.length === 0) return null;

  return (
    <View style={styles.container}>
      <SolaText style={styles.sectionLabel}>AT A GLANCE</SolaText>
      <View style={styles.card}>
        {rows.map((row, index) => (
          <View
            key={row.label}
            style={[styles.row, index < rows.length - 1 && styles.rowBorder]}
          >
            <SolaText style={styles.rowLabel}>{row.label}</SolaText>
            <SolaText style={styles.rowValue}>{row.value}</SolaText>
          </View>
        ))}
      </View>
    </View>
  );
};

export { AtAGlance };

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xxl,
  },
  sectionLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.neutralFill,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  rowLabel: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textMuted,
  },
  rowValue: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
});
