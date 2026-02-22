import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, radius, spacing } from '@/constants/design';

interface CountryHeroCardProps {
  name: string;
  heroImageUrl: string | null;
  soloLevel: string | null;
  avgDailyBudgetUsd: number | null;
  bestMonths: string | null;
}

const CARD_HEIGHT = 280;

export function CountryHeroCard({
  name,
  heroImageUrl,
  soloLevel,
  avgDailyBudgetUsd,
  bestMonths,
}: CountryHeroCardProps) {
  const signals: string[] = [];
  if (soloLevel) {
    const label =
      soloLevel === 'beginner'
        ? 'First-timers welcome'
        : soloLevel === 'intermediate'
          ? 'Some experience helpful'
          : 'Confident travelers';
    signals.push(label);
  }
  if (avgDailyBudgetUsd) signals.push(`$${avgDailyBudgetUsd}/day avg`);
  if (bestMonths) signals.push(bestMonths);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {heroImageUrl ? (
          <Image
            source={{ uri: heroImageUrl }}
            style={styles.image}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]} />
        )}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)']}
          style={styles.gradient}
        />
        <View style={styles.overlay}>
          <Text style={styles.name}>{name}</Text>
          {signals.length > 0 && (
            <Text style={styles.signals}>{signals.join(' \u00B7 ')}</Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.screenX,
  },
  card: {
    height: CARD_HEIGHT,
    borderRadius: radius.module,
    overflow: 'hidden',
    backgroundColor: colors.neutralFill,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  imagePlaceholder: {
    backgroundColor: colors.neutralFill,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.xl,
  },
  name: {
    fontFamily: fonts.semiBold,
    fontSize: 28,
    color: '#FFFFFF',
  },
  signals: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginTop: spacing.xs,
  },
});
