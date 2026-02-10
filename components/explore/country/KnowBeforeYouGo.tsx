import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Country } from '@/data/types';
import { colors, fonts, radius, spacing } from '@/constants/design';
import { mapSoloLevel, mapComfortLevel, mapGettingAround } from './mappings';

interface Props {
  country: Country;
}

interface SignalItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}

function buildSignals(country: Country): SignalItem[] {
  const signals: SignalItem[] = [];

  if (country.soloLevel) {
    signals.push({
      icon: 'compass-outline',
      label: 'Solo level',
      value: mapSoloLevel(country.soloLevel),
    });
  }

  if (country.safetyRating) {
    signals.push({
      icon: 'shield-checkmark-outline',
      label: 'Comfort',
      value: mapComfortLevel(country.safetyRating),
    });
  }

  if (country.avgDailyBudgetUsd != null) {
    signals.push({
      icon: 'wallet-outline',
      label: 'Daily budget',
      value: `~$${country.avgDailyBudgetUsd}/day`,
    });
  }

  if (country.englishFriendliness || country.internetQuality) {
    signals.push({
      icon: 'navigate-outline',
      label: 'Getting around',
      value: mapGettingAround(country.englishFriendliness, country.internetQuality),
    });
  }

  if (country.bestMonths) {
    signals.push({
      icon: 'calendar-outline',
      label: 'Best time',
      value: country.bestMonths,
    });
  }

  if (country.currency) {
    signals.push({
      icon: 'cash-outline',
      label: 'Currency',
      value: country.currency,
    });
  }

  return signals;
}

export function KnowBeforeYouGo({ country }: Props) {
  const signals = buildSignals(country);

  if (signals.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {signals.map((signal) => (
          <View key={signal.label} style={styles.cell}>
            <Ionicons
              name={signal.icon}
              size={16}
              color={colors.textMuted}
              style={styles.icon}
            />
            <View style={styles.textGroup}>
              <Text style={styles.label}>{signal.label}</Text>
              <Text style={styles.value} numberOfLines={2}>{signal.value}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutralFill,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
    paddingRight: spacing.sm,
  },
  icon: {
    marginTop: 2,
    marginRight: spacing.sm,
  },
  textGroup: {
    flex: 1,
  },
  label: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 16,
  },
  value: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
    marginTop: 2,
  },
});
