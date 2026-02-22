import { StyleSheet, View } from 'react-native';
import { SolaText } from '@/components/ui/SolaText';
import { colors, fonts, radius, spacing } from '@/constants/design';
import type { City } from '@/data/types';

interface Props {
  city: City;
}

function extractBulletsFromMd(md: string): string[] {
  return md
    .split('\n')
    .map((line) => line.replace(/^[-*]\s*/, '').replace(/\*\*/g, '').trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'))
    .slice(0, 5);
}

export function WomenShouldKnow({ city }: Props) {
  const bullets: string[] =
    city.womenShouldKnow && city.womenShouldKnow.length > 0
      ? city.womenShouldKnow
      : city.safetyWomenMd
        ? extractBulletsFromMd(city.safetyWomenMd)
        : [];

  if (bullets.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <SolaText style={styles.headerEmoji}>💡</SolaText>
        <SolaText style={styles.heading}>Women should know</SolaText>
      </View>
      <View style={styles.card}>
        {bullets.map((bullet, i) => (
          <View key={i} style={[styles.bulletRow, i < bullets.length - 1 && styles.bulletBorder]}>
            <SolaText style={styles.bulletNumber}>{i + 1}</SolaText>
            <SolaText style={styles.bulletText}>{bullet}</SolaText>
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
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    overflow: 'hidden',
  },
  bulletRow: {
    flexDirection: 'row',
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.lg,
    alignItems: 'flex-start',
  },
  bulletBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  bulletNumber: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.orange,
    width: 22,
    lineHeight: 22,
  },
  bulletText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    flex: 1,
  },
});
