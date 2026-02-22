import React from 'react';
import { StyleSheet, View } from 'react-native';
import { formatDayDate } from '@/data/trips/helpers';
import { SolaText } from '@/components/ui/SolaText';
import { colors, fonts, spacing } from '@/constants/design';

interface TripStopHeaderProps {
  cityName: string;
  startDate: string | null;
  endDate: string | null;
}

/** Format "YYYY-MM-DD" → "Feb 24" (short, no weekday) */
function formatShortDate(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const [, m, d] = dateStr.split('-').map(Number);
  return `${MONTHS[m - 1]} ${d}`;
}

export const TripStopHeader: React.FC<TripStopHeaderProps> = ({
  cityName,
  startDate,
  endDate,
}) => {
  const start = formatShortDate(startDate);
  const end = formatShortDate(endDate);
  const dateRange = start && end ? `${start} \u2013 ${end}` : null;

  return (
    <View style={styles.container}>
      <SolaText style={styles.text}>
        {cityName.toUpperCase()}
        {dateRange != null && (
          <SolaText style={styles.dateRange}> {'\u00B7'} {dateRange}</SolaText>
        )}
      </SolaText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
  },
  text: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  dateRange: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
});
