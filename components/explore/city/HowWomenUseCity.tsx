import { StyleSheet, View } from 'react-native';
import { SolaText } from '@/components/ui/SolaText';
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
      <View style={styles.headerRow}>
        <SolaText style={styles.headerEmoji}>🧭</SolaText>
        <SolaText style={styles.heading}>Solo in {city.name}</SolaText>
      </View>

      {summary && (
        <SolaText style={styles.summaryText}>{summary}</SolaText>
      )}

      {bullets.length > 0 && (
        <View style={styles.bulletList}>
          {bullets.map((bullet, i) => (
            <View key={i} style={styles.bulletRow}>
              <View style={styles.bulletDot} />
              <SolaText style={styles.bulletText}>{bullet}</SolaText>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.xxl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerEmoji: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  heading: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    color: colors.textPrimary,
    flex: 1,
  },
  summaryText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: spacing.md,
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
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.orange,
    marginRight: spacing.sm,
    marginTop: 8,
  },
  bulletText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 22,
    flex: 1,
  },
});
