import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View, ActivityIndicator } from 'react-native';
import { SolaText } from '@/components/ui/SolaText';
import { colors, fonts, spacing } from '@/constants/design';
import { useData } from '@/hooks/useData';
import { getEventsByCity } from '@/data/api';
import { MonthPicker } from '@/components/explore/MonthPicker';
import { EventCard } from '@/components/explore/EventCard';
import type { CityEvent } from '@/data/types';

interface EventsTabProps {
  cityId: string;
  /** Pre-set month from a trip, or default to current */
  defaultMonth?: number;
}

export function EventsTab({ cityId, defaultMonth }: EventsTabProps) {
  const [selectedMonth, setSelectedMonth] = useState(
    defaultMonth ?? new Date().getMonth() + 1,
  );

  // Fetch all events, filter client-side by month for instant switching
  const { data: allEvents, loading } = useData(
    () => getEventsByCity(cityId),
    ['cityEvents', cityId],
  );

  // Filter by selected month (handles wrapping ranges)
  const filteredEvents = useMemo(() => {
    if (!allEvents) return [];
    return allEvents.filter((e) => {
      if (e.startMonth <= e.endMonth) {
        return selectedMonth >= e.startMonth && selectedMonth <= e.endMonth;
      }
      return selectedMonth >= e.startMonth || selectedMonth <= e.endMonth;
    });
  }, [allEvents, selectedMonth]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.orange} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Month picker */}
      <View style={styles.monthPickerWrap}>
        <MonthPicker selectedMonth={selectedMonth} onSelect={setSelectedMonth} />
      </View>

      {/* Events list */}
      {filteredEvents.length > 0 ? (
        filteredEvents.map((event) => (
          <EventCard key={event.id} event={event} />
        ))
      ) : (
        <View style={styles.emptyContainer}>
          <SolaText style={styles.emptyTitle}>No events this month</SolaText>
          <SolaText style={styles.emptySubtitle}>Try selecting a different month to see what's happening</SolaText>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxxl,
  },
  monthPickerWrap: {
    marginBottom: spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xxxl,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: spacing.xxxl,
  },
  emptyTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 17,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
});
