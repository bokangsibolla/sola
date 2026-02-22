import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SolaText } from '@/components/ui/SolaText';
import { colors, fonts, radius, spacing } from '@/constants/design';

interface TripMetaPillsProps {
  dateRange: string;
  dayCount: number;
  placeCount: number;
  budget: number | null;
  currency: string;
}

interface PillData {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}

export const TripMetaPills: React.FC<TripMetaPillsProps> = ({
  dateRange,
  dayCount,
  placeCount,
  budget,
  currency,
}) => {
  const pills: PillData[] = [
    { icon: 'calendar-outline', label: dateRange },
    { icon: 'layers-outline', label: `${dayCount} day${dayCount !== 1 ? 's' : ''}` },
    { icon: 'location-outline', label: `${placeCount} place${placeCount !== 1 ? 's' : ''}` },
  ];

  if (budget != null) {
    pills.push({
      icon: 'wallet-outline',
      label: `${budget.toLocaleString()} ${currency}`,
    });
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {pills.map((pill, index) => (
        <View
          key={pill.icon}
          style={[styles.pill, index < pills.length - 1 && styles.pillSpacing]}
        >
          <Ionicons
            name={pill.icon}
            size={14}
            color={colors.textSecondary}
            style={styles.pillIcon}
          />
          <SolaText style={styles.pillText}>{pill.label}</SolaText>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.screenX,
    paddingVertical: spacing.md,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutralFill,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  pillSpacing: {
    marginRight: spacing.sm,
  },
  pillIcon: {
    marginRight: spacing.xs,
  },
  pillText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textSecondary,
  },
});
