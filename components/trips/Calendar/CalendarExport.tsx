/**
 * CalendarExport — exports trip itinerary blocks to the device's native calendar.
 *
 * IMPORTANT: expo-calendar is NOT currently installed in this project.
 * Install it before using this component:
 *
 *   npx expo install expo-calendar
 *
 * Once installed, set HAS_EXPO_CALENDAR to true below. The module is loaded
 * dynamically at runtime so the file compiles cleanly without the dependency.
 */

import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, spacing } from '@/constants/design';

// ---------- expo-calendar availability ----------
// Flip to true once expo-calendar is installed via `npx expo install expo-calendar`
const HAS_EXPO_CALENDAR = false;

// The calendar module is loaded lazily so this file compiles without the package.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let calendarModule: any = null;

async function loadCalendarModule(): Promise<any | null> {
  if (!HAS_EXPO_CALENDAR) return null;
  if (calendarModule) return calendarModule;
  try {
    // Dynamic require avoids compile-time resolution
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    calendarModule = require('expo-calendar');
    return calendarModule;
  } catch {
    return null;
  }
}

// ---------- Types ----------

export interface CalendarBlock {
  title: string;
  startTime: string | null; // HH:MM or HH:MM:SS
  endTime: string | null;   // HH:MM or HH:MM:SS
  placeName: string | null;
  notes: string | null;
}

export interface CalendarDay {
  dayDate: string; // YYYY-MM-DD
  blocks: CalendarBlock[];
}

export interface CalendarExportProps {
  tripTitle: string;
  days: CalendarDay[];
}

export interface ExportResult {
  eventsCreated: number;
  skipped: number;
}

// ---------- Helpers ----------

/** Parse "HH:MM" or "HH:MM:SS" into hours and minutes. */
function parseTime(time: string): { hours: number; minutes: number } {
  const parts = time.split(':');
  return {
    hours: parseInt(parts[0], 10),
    minutes: parseInt(parts[1], 10),
  };
}

/** Build a Date from "YYYY-MM-DD" and "HH:MM" strings. */
function buildDate(dayDate: string, time: string): Date {
  const { hours, minutes } = parseTime(time);
  const date = new Date(`${dayDate}T00:00:00`);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

/**
 * Get or create a "Sola Trips" calendar on the device.
 * Falls back to the default calendar if creation is not possible.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getOrCreateSolaCalendar(Cal: any): Promise<string> {
  const calendars = await Cal.getCalendarsAsync(Cal.EntityTypes.EVENT);

  // Reuse existing Sola calendar if present
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const existing = calendars.find((c: any) => c.title === 'Sola Trips');
  if (existing) return existing.id;

  // On iOS we can create a dedicated calendar
  if (Platform.OS === 'ios') {
    const defaultSource = calendars.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (c: any) => c.source && c.source.name === 'iCloud',
    )?.source;
    const fallbackSource = calendars.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (c: any) => c.source && c.source.isLocalAccount,
    )?.source;
    const source = defaultSource ?? fallbackSource;

    if (source) {
      const newCalendarId = await Cal.createCalendarAsync({
        title: 'Sola Trips',
        color: colors.orange,
        entityType: Cal.EntityTypes.EVENT,
        sourceId: source.id,
        source: {
          isLocalAccount: source.isLocalAccount,
          name: source.name,
          type: source.type,
        },
        name: 'Sola Trips',
        accessLevel: Cal.CalendarAccessLevel.OWNER,
        ownerAccount: 'personal',
      });
      return newCalendarId;
    }
  }

  // Fallback: use the device default calendar
  const defaultCalendar = await Cal.getDefaultCalendarAsync();
  return defaultCalendar.id;
}

// ---------- Core export function ----------

/**
 * Export trip itinerary blocks to the device calendar.
 *
 * Only blocks that have a startTime are exported. Blocks without times are
 * skipped since they have no meaningful calendar representation.
 *
 * Returns the count of events created and blocks skipped.
 */
export async function exportTripToCalendar(
  props: CalendarExportProps,
): Promise<ExportResult> {
  const Cal = await loadCalendarModule();
  if (!Cal) {
    Alert.alert(
      'Calendar not available',
      'Calendar export requires the expo-calendar package. Please contact the developer.',
    );
    return { eventsCreated: 0, skipped: 0 };
  }

  // 1. Request permissions
  const { status } = await Cal.requestCalendarPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert(
      'Calendar access needed',
      'Sola needs calendar access to add your trip events. You can enable this in Settings.',
    );
    return { eventsCreated: 0, skipped: 0 };
  }

  // 2. Get or create a calendar
  const calendarId = await getOrCreateSolaCalendar(Cal);

  // 3. Create events for each block with times
  let eventsCreated = 0;
  let skipped = 0;

  for (const day of props.days) {
    if (!day.dayDate) {
      skipped += day.blocks.length;
      continue;
    }

    for (const block of day.blocks) {
      if (!block.startTime) {
        skipped += 1;
        continue;
      }

      const startDate = buildDate(day.dayDate, block.startTime);

      // If no endTime, default to startTime + 1 hour
      const endDate = block.endTime
        ? buildDate(day.dayDate, block.endTime)
        : new Date(startDate.getTime() + 60 * 60 * 1000);

      const noteParts: string[] = [];
      if (block.notes) noteParts.push(block.notes);
      noteParts.push('Exported from Sola');

      await Cal.createEventAsync(calendarId, {
        title: block.title,
        startDate,
        endDate,
        location: block.placeName ?? undefined,
        notes: noteParts.join('\n\n'),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });

      eventsCreated += 1;
    }
  }

  return { eventsCreated, skipped };
}

// ---------- Button component ----------

type ButtonState = 'idle' | 'loading' | 'success';

interface CalendarExportButtonProps extends CalendarExportProps {
  /** Optional style override for the outer container. */
  style?: object;
}

export function CalendarExportButton({
  tripTitle,
  days,
  style,
}: CalendarExportButtonProps) {
  const [state, setState] = useState<ButtonState>('idle');
  const [eventCount, setEventCount] = useState(0);
  const successTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePress = useCallback(async () => {
    if (state === 'loading') return;

    // Check module availability before starting the export flow
    const Cal = await loadCalendarModule();
    if (!Cal) {
      Alert.alert(
        'Calendar not available',
        'Calendar export requires the expo-calendar package to be installed.',
      );
      return;
    }

    setState('loading');

    try {
      const result = await exportTripToCalendar({ tripTitle, days });

      if (result.eventsCreated > 0) {
        setEventCount(result.eventsCreated);
        setState('success');

        Alert.alert(
          'Events added',
          `Added ${result.eventsCreated} event${result.eventsCreated !== 1 ? 's' : ''} to your calendar.${
            result.skipped > 0
              ? ` ${result.skipped} block${result.skipped !== 1 ? 's' : ''} without times were skipped.`
              : ''
          }`,
        );

        // Reset to idle after 3 seconds
        if (successTimeout.current) clearTimeout(successTimeout.current);
        successTimeout.current = setTimeout(() => {
          setState('idle');
        }, 3000);
      } else {
        setState('idle');
        Alert.alert(
          'Nothing to export',
          'No itinerary blocks have times set. Add start times to your blocks first.',
        );
      }
    } catch {
      setState('idle');
      Alert.alert(
        'Export failed',
        'Something went wrong while adding events to your calendar. Please try again.',
      );
    }
  }, [state, tripTitle, days]);

  const renderContent = () => {
    switch (state) {
      case 'loading':
        return (
          <>
            <ActivityIndicator
              size="small"
              color={colors.orange}
              style={styles.icon}
            />
            <Text style={styles.buttonText}>Exporting...</Text>
          </>
        );
      case 'success':
        return (
          <>
            <Ionicons
              name="checkmark-circle"
              size={20}
              color={colors.greenSoft}
              style={styles.icon}
            />
            <Text style={[styles.buttonText, styles.successText]}>
              Added {eventCount} event{eventCount !== 1 ? 's' : ''}
            </Text>
          </>
        );
      default:
        return (
          <>
            <Ionicons
              name="calendar-outline"
              size={20}
              color={colors.orange}
              style={styles.icon}
            />
            <Text style={styles.buttonText}>Add to calendar</Text>
          </>
        );
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={state === 'loading'}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.buttonPressed,
        state === 'success' && styles.buttonSuccess,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel="Add trip events to device calendar"
    >
      <View style={styles.buttonInner}>{renderContent()}</View>
    </Pressable>
  );
}

// ---------- Styles ----------

const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.button,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  buttonSuccess: {
    borderColor: colors.greenSoft,
    backgroundColor: colors.greenFill,
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: spacing.sm,
  },
  buttonText: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  successText: {
    color: colors.greenSoft,
  },
});
