import { StyleSheet, View } from 'react-native';
import { SolaText } from '@/components/ui/SolaText';
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
      <SolaText style={styles.heading}>What brings women here</SolaText>
      <View style={styles.grid}>
        {pillars.map((pillar, i) => (
          <View key={i} style={styles.cell}>
            <View style={styles.accentDot} />
            <SolaText style={styles.cellTitle}>{pillar.title}</SolaText>
            {pillar.descriptor ? (
              <SolaText style={styles.cellDescriptor}>{pillar.descriptor}</SolaText>
            ) : null}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.xxl,
  },
  heading: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
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
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  accentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.orange,
    marginBottom: spacing.sm,
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
