import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing } from '@/constants/design';
import type { City } from '@/data/types';

interface Props {
  city: City;
}

export function HowWomenUseCity({ city }: Props) {
  const summary = city.howWomenUse?.summary ?? city.summary ?? null;
  const bullets = city.howWomenUse?.bullets ?? [];

  if (!summary && bullets.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>Solo in {city.name}</Text>

      {summary && (
        <Text style={styles.summaryText}>{summary}</Text>
      )}

      {bullets.length > 0 && (
        <View style={styles.bulletList}>
          {bullets.map((bullet, i) => (
            <View key={i} style={[styles.bulletRow, i < bullets.length - 1 && styles.bulletBorder]}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>{bullet}</Text>
            </View>
          ))}
        </View>
      )}
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
  summaryText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: spacing.sm,
  },
  bulletList: {
    backgroundColor: colors.orangeFill,
    borderRadius: radius.card,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
  },
  bulletBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229,101,58,0.08)',
  },
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.orange,
    marginRight: spacing.sm,
    marginTop: 7,
  },
  bulletText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 22,
    flex: 1,
  },
});
