import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing } from '@/constants/design';
import type { City } from '@/data/types';

interface Props {
  city: City;
}

interface Pillar {
  title: string;
  descriptor: string;
}

export function ExperiencePillars({ city }: Props) {
  let pillars: Pillar[] = [];

  if (city.experiencePillars && city.experiencePillars.length > 0) {
    pillars = city.experiencePillars.slice(0, 4);
  } else {
    const items = city.topThingsToDo ?? city.highlights ?? [];
    pillars = items.slice(0, 4).map((item) => ({
      title: item,
      descriptor: '',
    }));
  }

  if (pillars.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>What brings women here</Text>
      <View style={styles.grid}>
        {pillars.map((pillar, i) => (
          <View key={i} style={styles.cell}>
            <Text style={styles.cellTitle}>{pillar.title}</Text>
            {pillar.descriptor ? (
              <Text style={styles.cellDescriptor}>{pillar.descriptor}</Text>
            ) : null}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.xl,
  },
  heading: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  cell: {
    width: '48%',
    backgroundColor: colors.orangeFill,
    borderRadius: radius.card,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  cellTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  cellDescriptor: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: spacing.xs,
  },
});
