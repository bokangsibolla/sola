import { ScrollView, StyleSheet, View } from 'react-native';
import { SolaText } from '@/components/ui/SolaText';
import type { Country } from '@/data/types';
import { colors, fonts, spacing } from '@/constants/design';
import { mapSoloLevel } from './mappings';

interface Props {
  country: Country;
}

/** Build compact text signals from structured country data. */
function buildSignals(country: Country): string[] {
  const signals: string[] = [];

  if (country.soloLevel) {
    signals.push(mapSoloLevel(country.soloLevel));
  }

  if (country.avgDailyBudgetUsd != null) {
    signals.push(`~$${country.avgDailyBudgetUsd}/day`);
  }

  if (country.bestMonths) {
    signals.push(country.bestMonths);
  }

  if (country.vibeSummary) {
    signals.push(country.vibeSummary);
  }

  if (country.transportSummary) {
    // Take just the first phrase before the comma for the compact view
    const short = country.transportSummary.split(',')[0].split(':')[0].trim();
    if (short.length <= 30) {
      signals.push(short);
    }
  }

  return signals;
}

export function SignalsRow({ country }: Props) {
  const signals = buildSignals(country);

  if (signals.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      style={styles.scroll}
    >
      {signals.map((signal, index) => (
        <View key={signal} style={styles.item}>
          <SolaText style={styles.text}>{signal}</SolaText>
          {index < signals.length - 1 && (
            <SolaText style={styles.separator}>{'\u00B7'}</SolaText>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    marginBottom: spacing.xl,
  },
  container: {
    paddingHorizontal: spacing.screenX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  separator: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    marginHorizontal: spacing.sm,
  },
});
