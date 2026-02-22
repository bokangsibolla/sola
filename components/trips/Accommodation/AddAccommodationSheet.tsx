import React, { useState, useEffect, useMemo } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { colors, fonts, spacing, radius } from '@/constants/design';
import {
  createAccommodation,
  updateAccommodation,
  deleteAccommodation,
} from '@/data/trips/tripApi';
import { nightsCount, ACCOMMODATION_STATUS_COLORS } from '@/data/trips/helpers';
import type {
  TripAccommodation,
  AccommodationStatus,
  CreateAccommodationInput,
} from '@/data/trips/types';

// ── Types ────────────────────────────────────────────────────────────────────

interface AddAccommodationSheetProps {
  visible: boolean;
  tripId: string;
  onClose: () => void;
  onSaved: () => void;
  editAccommodation?: TripAccommodation | null;
  defaultCheckIn?: string;
  defaultCheckOut?: string;
}

// ── Constants ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS: { value: AccommodationStatus; label: string }[] = [
  { value: 'planned', label: 'Planned' },
  { value: 'booked', label: 'Booked' },
  { value: 'confirmed', label: 'Confirmed' },
];

/** Parse "YYYY-MM-DD" into a local Date (avoids timezone shift from new Date(str)). */
function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Format a Date to "YYYY-MM-DD" using local values. */
function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/** Format a Date to "Mon, 24 Feb 2026" for the date display. */
function formatDisplayDate(date: Date): string {
  const day = date.getDate();
  const month = MONTHS[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

// ── Component ────────────────────────────────────────────────────────────────

export const AddAccommodationSheet: React.FC<AddAccommodationSheetProps> = ({
  visible,
  tripId,
  onClose,
  onSaved,
  editAccommodation,
  defaultCheckIn,
  defaultCheckOut,
}) => {
  const insets = useSafeAreaInsets();
  const isEdit = !!editAccommodation;

  // ── Form state ──────────────────────────────────────────────────────────
  const [name, setName] = useState('');
  const [checkIn, setCheckIn] = useState<Date>(new Date());
  const [checkOut, setCheckOut] = useState<Date>(new Date());
  const [status, setStatus] = useState<AccommodationStatus>('planned');
  const [bookingUrl, setBookingUrl] = useState('');
  const [bookingRef, setBookingRef] = useState('');
  const [cost, setCost] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // ── Date picker state ───────────────────────────────────────────────────
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);

  // ── Reset / pre-fill on open ────────────────────────────────────────────
  useEffect(() => {
    if (!visible) return;

    if (editAccommodation) {
      setName(editAccommodation.name);
      setCheckIn(parseLocalDate(editAccommodation.checkIn));
      setCheckOut(parseLocalDate(editAccommodation.checkOut));
      setStatus(editAccommodation.status);
      setBookingUrl(editAccommodation.bookingUrl ?? '');
      setBookingRef(editAccommodation.bookingRef ?? '');
      setCost(editAccommodation.cost != null ? String(editAccommodation.cost) : '');
      setCurrency(editAccommodation.currency || 'USD');
      setNotes(editAccommodation.notes ?? '');
    } else {
      setName('');
      setCheckIn(defaultCheckIn ? parseLocalDate(defaultCheckIn) : new Date());
      setCheckOut(defaultCheckOut ? parseLocalDate(defaultCheckOut) : new Date());
      setStatus('planned');
      setBookingUrl('');
      setBookingRef('');
      setCost('');
      setCurrency('USD');
      setNotes('');
    }

    setShowCheckInPicker(false);
    setShowCheckOutPicker(false);
    setSaving(false);
  }, [visible, editAccommodation, defaultCheckIn, defaultCheckOut]);

  // ── Derived values ──────────────────────────────────────────────────────
  const nights = useMemo(
    () => nightsCount(toISODate(checkIn), toISODate(checkOut)),
    [checkIn, checkOut],
  );

  const canSave = name.trim().length > 0;

  // ── Date handlers ───────────────────────────────────────────────────────
  const handleCheckInChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowCheckInPicker(false);
    }
    if (date) {
      setCheckIn(date);
      // Auto-adjust check-out if it's before check-in
      if (date > checkOut) {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        setCheckOut(nextDay);
      }
    }
  };

  const handleCheckOutChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowCheckOutPicker(false);
    }
    if (date) {
      setCheckOut(date);
    }
  };

  // ── Save handler ────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!canSave || saving) return;
    setSaving(true);

    try {
      const parsedCost = cost.trim() ? parseFloat(cost.trim()) : undefined;

      if (isEdit && editAccommodation) {
        await updateAccommodation(editAccommodation.id, {
          name: name.trim(),
          checkIn: toISODate(checkIn),
          checkOut: toISODate(checkOut),
          status,
          bookingUrl: bookingUrl.trim() || null,
          bookingRef: bookingRef.trim() || null,
          cost: parsedCost != null && !isNaN(parsedCost) ? parsedCost : null,
          currency,
          notes: notes.trim() || null,
        });
      } else {
        const input: CreateAccommodationInput = {
          tripId,
          name: name.trim(),
          checkIn: toISODate(checkIn),
          checkOut: toISODate(checkOut),
          status,
          ...(bookingUrl.trim() && { bookingUrl: bookingUrl.trim() }),
          ...(bookingRef.trim() && { bookingRef: bookingRef.trim() }),
          ...(parsedCost != null && !isNaN(parsedCost) && { cost: parsedCost }),
          currency,
          ...(notes.trim() && { notes: notes.trim() }),
        };
        await createAccommodation(input);
      }

      onSaved();
      onClose();
    } catch {
      // Error handled silently for MVP
    } finally {
      setSaving(false);
    }
  };

  // ── Delete handler ──────────────────────────────────────────────────────
  const handleDelete = () => {
    if (!editAccommodation) return;
    Alert.alert(
      'Delete accommodation',
      `Are you sure you want to remove "${editAccommodation.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccommodation(editAccommodation.id);
              onSaved();
              onClose();
            } catch {
              // Error handled silently for MVP
            }
          },
        },
      ],
    );
  };

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <View
            style={[
              styles.sheet,
              { paddingBottom: Math.max(insets.bottom, spacing.xl) },
            ]}
          >
            {/* ── Header ──────────────────────────────────────────── */}
            <View style={styles.header}>
              <Pressable
                onPress={onClose}
                hitSlop={12}
                style={styles.headerButton}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </Pressable>
              <Text style={styles.headerTitle}>
                {isEdit ? 'Edit Accommodation' : 'Add Accommodation'}
              </Text>
              <View style={styles.headerButton} />
            </View>

            <ScrollView
              style={styles.scrollContent}
              contentContainerStyle={styles.scrollContentContainer}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* ── Name ────────────────────────────────────────── */}
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Hotel, hostel, Airbnb..."
                placeholderTextColor={colors.textMuted}
                value={name}
                onChangeText={setName}
                maxLength={200}
                autoCapitalize="words"
                returnKeyType="next"
              />

              {/* ── Check-in date ──────────────────────────────── */}
              <Text style={styles.label}>Check-in</Text>
              <Pressable
                style={styles.dateButton}
                onPress={() => {
                  setShowCheckInPicker(!showCheckInPicker);
                  setShowCheckOutPicker(false);
                }}
                accessibilityRole="button"
              >
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color={colors.textSecondary}
                />
                <Text style={styles.dateButtonText}>
                  {formatDisplayDate(checkIn)}
                </Text>
              </Pressable>
              {showCheckInPicker && (
                <DateTimePicker
                  value={checkIn}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'inline' : 'default'}
                  onChange={handleCheckInChange}
                  style={styles.datePicker}
                />
              )}

              {/* ── Check-out date ─────────────────────────────── */}
              <Text style={styles.label}>Check-out</Text>
              <Pressable
                style={styles.dateButton}
                onPress={() => {
                  setShowCheckOutPicker(!showCheckOutPicker);
                  setShowCheckInPicker(false);
                }}
                accessibilityRole="button"
              >
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color={colors.textSecondary}
                />
                <Text style={styles.dateButtonText}>
                  {formatDisplayDate(checkOut)}
                </Text>
              </Pressable>
              {showCheckOutPicker && (
                <DateTimePicker
                  value={checkOut}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'inline' : 'default'}
                  minimumDate={checkIn}
                  onChange={handleCheckOutChange}
                  style={styles.datePicker}
                />
              )}

              {/* ── Night count ─────────────────────────────────── */}
              {nights > 0 && (
                <View style={styles.nightsRow}>
                  <Ionicons
                    name="moon-outline"
                    size={16}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.nightsText}>
                    {nights} {nights === 1 ? 'night' : 'nights'}
                  </Text>
                </View>
              )}

              {/* ── Status ──────────────────────────────────────── */}
              <Text style={styles.label}>Status</Text>
              <View style={styles.statusRow}>
                {STATUS_OPTIONS.map((option) => {
                  const isActive = option.value === status;
                  const statusColor = ACCOMMODATION_STATUS_COLORS[option.value];
                  return (
                    <Pressable
                      key={option.value}
                      style={[
                        styles.statusPill,
                        isActive && {
                          backgroundColor: statusColor.bg,
                          borderColor: statusColor.text,
                        },
                      ]}
                      onPress={() => setStatus(option.value)}
                      accessibilityRole="button"
                    >
                      <Text
                        style={[
                          styles.statusPillText,
                          isActive && { color: statusColor.text },
                        ]}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* ── Booking URL ──────────────────────────────────── */}
              <Text style={styles.label}>Booking URL</Text>
              <TextInput
                style={styles.input}
                placeholder="https://..."
                placeholderTextColor={colors.textMuted}
                value={bookingUrl}
                onChangeText={setBookingUrl}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                returnKeyType="next"
              />

              {/* ── Booking reference ──────────────────────────── */}
              <Text style={styles.label}>Booking reference</Text>
              <TextInput
                style={styles.input}
                placeholder="Confirmation number"
                placeholderTextColor={colors.textMuted}
                value={bookingRef}
                onChangeText={setBookingRef}
                autoCapitalize="characters"
                returnKeyType="next"
              />

              {/* ── Cost + Currency ──────────────────────────────── */}
              <Text style={styles.label}>Cost</Text>
              <View style={styles.costRow}>
                <TextInput
                  style={[styles.input, styles.costInput]}
                  placeholder="0.00"
                  placeholderTextColor={colors.textMuted}
                  value={cost}
                  onChangeText={setCost}
                  keyboardType="numeric"
                  returnKeyType="next"
                />
                <View style={styles.currencyContainer}>
                  <Text style={styles.currencyText}>{currency}</Text>
                </View>
              </View>

              {/* ── Notes ────────────────────────────────────────── */}
              <Text style={styles.label}>Notes</Text>
              <TextInput
                style={[styles.input, styles.notesInput]}
                placeholder="Check-in instructions, address details..."
                placeholderTextColor={colors.textMuted}
                value={notes}
                onChangeText={setNotes}
                multiline
                maxLength={1000}
                textAlignVertical="top"
              />

              {/* ── Save button ──────────────────────────────────── */}
              <Pressable
                style={[
                  styles.saveButton,
                  (!canSave || saving) && styles.saveButtonDisabled,
                ]}
                onPress={handleSave}
                disabled={!canSave || saving}
                accessibilityRole="button"
              >
                <Text style={styles.saveButtonText}>
                  {saving
                    ? 'Saving...'
                    : isEdit
                      ? 'Save changes'
                      : 'Add accommodation'}
                </Text>
              </Pressable>

              {/* ── Delete button (edit mode only) ────────────── */}
              {isEdit && (
                <Pressable
                  style={styles.deleteButton}
                  onPress={handleDelete}
                  accessibilityRole="button"
                >
                  <Ionicons
                    name="trash-outline"
                    size={18}
                    color={colors.emergency}
                  />
                  <Text style={styles.deleteButtonText}>
                    Delete accommodation
                  </Text>
                </Pressable>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

// ── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  keyboardView: {
    justifyContent: 'flex-end',
    maxHeight: '92%',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '100%',
  },

  // ── Header ──────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 17,
    color: colors.textPrimary,
    textAlign: 'center',
    flex: 1,
  },

  // ── Scroll content ──────────────────────────────────────────────────────
  scrollContent: {
    flexGrow: 0,
  },
  scrollContentContainer: {
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },

  // ── Labels ──────────────────────────────────────────────────────────────
  label: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },

  // ── Inputs ──────────────────────────────────────────────────────────────
  input: {
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.input,
    paddingHorizontal: spacing.lg,
    height: 48,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
  },

  // ── Date buttons ────────────────────────────────────────────────────────
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.input,
    paddingHorizontal: spacing.lg,
    height: 48,
  },
  dateButtonText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
  },
  datePicker: {
    marginTop: spacing.sm,
  },

  // ── Night count ─────────────────────────────────────────────────────────
  nightsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  nightsText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textSecondary,
  },

  // ── Status pills ────────────────────────────────────────────────────────
  statusRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statusPill: {
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusPillText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textSecondary,
  },

  // ── Cost row ────────────────────────────────────────────────────────────
  costRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  costInput: {
    flex: 1,
  },
  currencyContainer: {
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.input,
    paddingHorizontal: spacing.lg,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  currencyText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textSecondary,
  },

  // ── Notes ───────────────────────────────────────────────────────────────
  notesInput: {
    height: 100,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },

  // ── Buttons ─────────────────────────────────────────────────────────────
  saveButton: {
    backgroundColor: colors.orange,
    borderRadius: radius.button,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xxl,
  },
  saveButtonDisabled: {
    opacity: 0.4,
  },
  saveButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    height: 48,
  },
  deleteButtonText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.emergency,
  },
});
