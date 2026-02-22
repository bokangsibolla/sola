import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { SolaText } from '@/components/ui/SolaText';
import { colors, fonts, radius, spacing } from '@/constants/design';

// ── Time Utilities ───────────────────────────────────────────────────────────

/** Convert a Date to "HH:MM:00" string for Postgres time column. */
export function dateToTimeString(d: Date): string {
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}:00`;
}

/** Convert "HH:MM:SS" or "HH:MM" to a Date (today, at that time). */
export function timeStringToDate(time: string): Date {
  const parts = time.split(':');
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

/** Format "HH:MM:SS" or "HH:MM" to "9:00 AM" for display. */
export function formatTimeDisplay(time: string): string {
  const parts = time.split(':');
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  const mStr = m.toString().padStart(2, '0');
  return `${h12}:${mStr} ${ampm}`;
}

// ── TimePickerField Component ────────────────────────────────────────────────

interface TimePickerFieldProps {
  label: string;
  value: Date | null;
  placeholder: string;
  onChange: (date: Date) => void;
  onClear?: () => void;
  minimumDate?: Date;
}

export const TimePickerField: React.FC<TimePickerFieldProps> = ({
  label,
  value,
  placeholder,
  onChange,
  onClear,
  minimumDate,
}) => {
  const [showPicker, setShowPicker] = useState(false);

  const handlePress = () => {
    setShowPicker(true);
  };

  const handleChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (event.type === 'dismissed') {
      setShowPicker(false);
      return;
    }
    if (date) {
      onChange(date);
    }
  };

  const displayText = value
    ? formatTimeDisplay(dateToTimeString(value))
    : null;

  return (
    <View style={styles.container}>
      <SolaText style={styles.label}>{label}</SolaText>

      <Pressable style={styles.field} onPress={handlePress}>
        <Ionicons name="time-outline" size={18} color={colors.textMuted} />
        {displayText ? (
          <SolaText style={styles.valueText}>{displayText}</SolaText>
        ) : (
          <SolaText style={styles.placeholderText}>{placeholder}</SolaText>
        )}
        {value && onClear && (
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              onClear();
              setShowPicker(false);
            }}
            hitSlop={8}
            style={styles.clearButton}
          >
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </Pressable>
        )}
      </Pressable>

      {/* iOS: inline spinner below field */}
      {Platform.OS === 'ios' && showPicker && (
        <View style={styles.pickerContainer}>
          <DateTimePicker
            value={value ?? new Date()}
            mode="time"
            display="spinner"
            onChange={handleChange}
            accentColor={colors.orange}
            minimumDate={minimumDate}
          />
          <Pressable style={styles.doneButton} onPress={() => setShowPicker(false)}>
            <SolaText style={styles.doneButtonText}>Done</SolaText>
          </Pressable>
        </View>
      )}

      {/* Android: modal dialog */}
      {Platform.OS === 'android' && showPicker && (
        <DateTimePicker
          value={value ?? new Date()}
          mode="time"
          display="default"
          onChange={handleChange}
          minimumDate={minimumDate}
        />
      )}
    </View>
  );
};

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.input,
    paddingHorizontal: spacing.md,
    height: 44,
    gap: spacing.sm,
  },
  valueText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textPrimary,
  },
  placeholderText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textMuted,
  },
  clearButton: {
    padding: spacing.xs,
  },
  pickerContainer: {
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.card,
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  doneButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  doneButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.orange,
  },
});
