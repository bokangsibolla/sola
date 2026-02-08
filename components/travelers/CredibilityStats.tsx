import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fonts, spacing } from '@/constants/design';

interface CredibilityStatsProps {
  countriesCount: number;
  tripCount: number;
  memberSince: string;
}

export default function CredibilityStats({
  countriesCount,
  tripCount,
  memberSince,
}: CredibilityStatsProps) {
  const year = new Date(memberSince).getFullYear();

  if (countriesCount === 0 && tripCount === 0) return null;

  const stats: { icon: React.ComponentProps<typeof Feather>['name']; value: string; label: string }[] = [];

  if (countriesCount > 0) {
    stats.push({
      icon: 'globe',
      value: String(countriesCount),
      label: countriesCount === 1 ? 'country' : 'countries',
    });
  }

  if (tripCount > 0) {
    stats.push({
      icon: 'map',
      value: String(tripCount),
      label: tripCount === 1 ? 'trip' : 'trips',
    });
  }

  stats.push({
    icon: 'calendar',
    value: `Since ${year}`,
    label: '',
  });

  return (
    <View style={styles.container}>
      {stats.map((stat, i) => (
        <View key={i} style={styles.stat}>
          <Feather name={stat.icon} size={14} color={colors.textMuted} />
          <Text style={styles.value}>
            {stat.value}
            {stat.label ? <Text style={styles.label}> {stat.label}</Text> : null}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xl,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.borderSubtle,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  value: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  label: {
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
});
