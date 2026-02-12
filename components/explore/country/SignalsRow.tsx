import { StyleSheet, Text, View } from 'react-native';
import type { Country } from '@/data/types';
import { colors, fonts, spacing, radius } from '@/constants/design';
import { mapSoloLevel, mapComfortLevel } from './mappings';

interface Props {
  country: Country;
}

interface Signal {
  label: string;
  /** Semantic color category for the pill */
  tone: 'green' | 'orange' | 'blue' | 'neutral' | 'warm';
}

const PILL_COLORS: Record<Signal['tone'], { bg: string; text: string }> = {
  green: { bg: colors.greenFill, text: colors.greenSoft },
  orange: { bg: colors.orangeFill, text: colors.orange },
  blue: { bg: colors.blueFill, text: colors.blueSoft },
  neutral: { bg: colors.neutralFill, text: colors.textSecondary },
  warm: { bg: colors.warningFill, text: colors.warning },
};

/** Build semantic signal pills from structured country data. */
function buildSignals(country: Country): Signal[] {
  const signals: Signal[] = [];

  // Solo level → green (comfort / safety)
  if (country.soloLevel) {
    signals.push({ label: mapSoloLevel(country.soloLevel), tone: 'green' });
  }

  // Safety rating → green
  if (country.safetyRating) {
    signals.push({ label: mapComfortLevel(country.safetyRating), tone: 'green' });
  }

  // Budget → blue (practical info)
  if (country.avgDailyBudgetUsd != null) {
    signals.push({ label: `~$${country.avgDailyBudgetUsd}/day`, tone: 'blue' });
  }

  // Best months → warm (timing)
  if (country.bestMonths) {
    signals.push({ label: country.bestMonths, tone: 'warm' });
  }

  // Vibe → orange (character)
  if (country.vibeSummary) {
    signals.push({ label: country.vibeSummary, tone: 'orange' });
  }

  // Transport → neutral (logistics)
  if (country.transportSummary) {
    const short = country.transportSummary.split(',')[0].split(':')[0].trim();
    if (short.length <= 30) {
      signals.push({ label: short, tone: 'neutral' });
    }
  }

  return signals;
}

export function SignalsRow({ country }: Props) {
  const signals = buildSignals(country);

  if (signals.length === 0) return null;

  return (
    <View style={styles.container}>
      {signals.map((signal) => {
        const pillColor = PILL_COLORS[signal.tone];
        return (
          <View
            key={signal.label}
            style={[styles.pill, { backgroundColor: pillColor.bg }]}
          >
            <Text style={[styles.pillText, { color: pillColor.text }]}>
              {signal.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.screenX,
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  pillText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
  },
});
