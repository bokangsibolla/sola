import React, { useState } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, fonts } from '@/constants/design';
import { useTripForCity } from '@/data/trips/useTripForCity';
import { FLOATING_TAB_BAR_HEIGHT } from '@/components/TabBar';

interface TripContextPillProps {
  cityId: string;
  cityName: string;
  savedCount?: number;
}

export const TripContextPill: React.FC<TripContextPillProps> = ({
  cityId,
  cityName,
  savedCount = 0,
}) => {
  const trip = useTripForCity(cityId);
  const [dismissed, setDismissed] = useState(false);

  if (!trip || dismissed) return null;

  return (
    <View style={styles.wrapper}>
      <Pressable
        onPress={() => router.push(`/(tabs)/trips/${trip.id}`)}
        style={({ pressed }) => [
          styles.pill,
          pressed && { opacity: 0.9 },
        ]}
      >
        <Ionicons name="airplane" size={14} color={colors.orange} />
        <Text style={styles.text} numberOfLines={1}>
          Planning {cityName}
          {savedCount > 0 ? ` · ${savedCount} places saved` : ''}
        </Text>
        <Pressable onPress={() => setDismissed(true)} hitSlop={12}>
          <Ionicons name="close" size={14} color={colors.textMuted} />
        </Pressable>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: FLOATING_TAB_BAR_HEIGHT + spacing.lg,
    left: spacing.screenX,
    right: spacing.screenX,
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  text: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textPrimary,
    flex: 1,
  },
});
