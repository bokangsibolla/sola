import { StyleSheet, Text, View } from 'react-native';
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
      <Text style={styles.heading}>Women should know</Text>
      <View style={styles.card}>
        {bullets.map((bullet, i) => (
          <View key={i} style={[styles.bulletRow, i < bullets.length - 1 && styles.bulletBorder]}>
            <View style={styles.bulletBadge}>
              <Text style={styles.bulletNumber}>{i + 1}</Text>
            </View>
            <Text style={styles.bulletText}>{bullet}</Text>
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
  card: {
    backgroundColor: colors.orangeFill,
    borderRadius: radius.card,
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
    borderBottomColor: 'rgba(229,101,58,0.08)',
  },
  bulletBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(229,101,58,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    marginTop: 1,
  },
  bulletNumber: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    color: colors.orange,
    lineHeight: 14,
  },
  bulletText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 22,
    flex: 1,
  },
});
