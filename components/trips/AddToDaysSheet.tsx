import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { TYPE_DOT_COLOR, TYPE_LABEL } from '@/components/trips/blockTypeColors';
import { colors, fonts, spacing, radius } from '@/constants/design';

// ── Types ────────────────────────────────────────────────────────────────────

export interface DayOption {
  index: number;
  id?: string;
  label: string;
  sublabel?: string;
}

interface AddToDaysSheetProps {
  visible: boolean;
  placeName: string;
  placeType: string;
  days: DayOption[];
  currentDayIndex: number;
  isAccommodation: boolean;
  onConfirm: (selectedDayIndices: number[]) => void;
  onClose: () => void;
}

// ── Component ────────────────────────────────────────────────────────────────

export function AddToDaysSheet({
  visible,
  placeName,
  placeType,
  days,
  currentDayIndex,
  isAccommodation,
  onConfirm,
  onClose,
}: AddToDaysSheetProps) {
  const insets = useSafeAreaInsets();

  // Smart defaults: accommodation → all city days, otherwise → current day only
  const [selected, setSelected] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (visible) {
      if (isAccommodation) {
        setSelected(new Set(days.map((d) => d.index)));
      } else {
        setSelected(new Set([currentDayIndex]));
      }
    }
  }, [visible, isAccommodation, days, currentDayIndex]);

  const toggleDay = (index: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(days.map((d) => d.index)));
  const selectNone = () => setSelected(new Set([currentDayIndex]));

  const count = selected.size;
  const allSelected = count === days.length;

  const handleConfirm = () => {
    if (count === 0) return;
    const indices = Array.from(selected);
    indices.sort((a, b) => a - b);
    onConfirm(indices);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
        {/* Handle */}
        <View style={styles.handle} />

        {/* Place info */}
        <View style={styles.placeInfo}>
          <View style={[
            styles.typeDot,
            { backgroundColor: (TYPE_DOT_COLOR as Record<string, string>)[placeType] ?? colors.textMuted },
          ]} />
          <View style={styles.placeText}>
            <Text style={styles.placeName} numberOfLines={1}>{placeName}</Text>
            <Text style={styles.placeType}>
              {(TYPE_LABEL as Record<string, string>)[placeType] ?? placeType}
            </Text>
          </View>
        </View>

        {/* Section label + select all/reset */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionLabel}>Add to days</Text>
          <Pressable onPress={allSelected ? selectNone : selectAll} hitSlop={8}>
            <Text style={styles.selectAllText}>
              {allSelected ? 'Reset' : 'Select all'}
            </Text>
          </Pressable>
        </View>

        {/* Day pills */}
        <ScrollView
          horizontal={days.length > 5}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={days.length > 5 ? styles.pillsScrollRow : styles.pillsWrapRow}
        >
          {days.map((day) => {
            const isSelected = selected.has(day.index);
            return (
              <Pressable
                key={day.index}
                style={[styles.dayPill, isSelected && styles.dayPillSelected]}
                onPress={() => toggleDay(day.index)}
              >
                <Text style={[styles.dayPillText, isSelected && styles.dayPillTextSelected]}>
                  {day.label}
                </Text>
                {day.sublabel && (
                  <Text style={[styles.dayPillSub, isSelected && styles.dayPillSubSelected]}>
                    {day.sublabel}
                  </Text>
                )}
                {isSelected && (
                  <Ionicons name="checkmark" size={14} color={colors.orange} style={styles.dayPillCheck} />
                )}
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Confirm */}
        <Pressable
          style={[styles.confirmButton, count === 0 && styles.confirmDisabled]}
          onPress={handleConfirm}
          disabled={count === 0}
        >
          <Text style={styles.confirmText}>
            {count === 0
              ? 'Select at least one day'
              : count === 1
                ? 'Add to 1 day'
                : `Add to ${count} days`}
          </Text>
        </Pressable>
      </View>
    </Modal>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.module,
    borderTopRightRadius: radius.module,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.screenX,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderDefault,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },

  // Place info
  placeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  typeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.md,
  },
  placeText: {
    flex: 1,
  },
  placeName: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  placeType: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 1,
  },

  // Section
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  selectAllText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.orange,
  },

  // Day pills
  pillsScrollRow: {
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
  pillsWrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
  dayPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    backgroundColor: colors.background,
  },
  dayPillSelected: {
    borderColor: colors.orange,
    backgroundColor: colors.orangeFill,
  },
  dayPillText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  dayPillTextSelected: {
    color: colors.orange,
  },
  dayPillSub: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textMuted,
    marginLeft: spacing.xs,
  },
  dayPillSubSelected: {
    color: colors.orange,
  },
  dayPillCheck: {
    marginLeft: spacing.xs,
  },

  // Confirm
  confirmButton: {
    backgroundColor: colors.orange,
    paddingVertical: spacing.lg,
    borderRadius: radius.button,
    alignItems: 'center',
  },
  confirmDisabled: {
    opacity: 0.4,
  },
  confirmText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: '#FFFFFF',
  },
});
