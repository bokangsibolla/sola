import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, radius, spacing } from '@/constants/design';
import { updateBlock } from '@/data/trips/itineraryApi';
import type { ItineraryBlockWithTags } from '@/data/trips/itineraryTypes';
import {
  TimePickerField,
  dateToTimeString,
  timeStringToDate,
} from '@/components/trips/TimePickerField';

// ── Types ────────────────────────────────────────────────────────────────────

interface EditTimeSheetProps {
  visible: boolean;
  block: ItineraryBlockWithTags | null;
  onClose: () => void;
  onSaved: () => void;
}

// ── Label helpers ────────────────────────────────────────────────────────────

const BLOCK_TYPE_LABELS: Record<string, string> = {
  place: 'Place',
  accommodation: 'Stay',
  activity: 'Activity',
  transport: 'Transport',
  meal: 'Meal',
  free_time: 'Free time',
  note: 'Note',
  safety_check: 'Check-in',
};

// ── Component ────────────────────────────────────────────────────────────────

export const EditTimeSheet: React.FC<EditTimeSheetProps> = ({
  visible,
  block,
  onClose,
  onSaved,
}) => {
  const insets = useSafeAreaInsets();
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);

  // Sync state when block changes
  useEffect(() => {
    if (block) {
      setStartTime(block.startTime ? timeStringToDate(block.startTime) : null);
      setEndTime(block.endTime ? timeStringToDate(block.endTime) : null);
    }
  }, [block]);

  if (!block) return null;

  const title = block.titleOverride ?? block.place?.name ?? 'Block';
  const typeLabel = BLOCK_TYPE_LABELS[block.blockType] ?? block.blockType;

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await updateBlock(block.id, {
        startTime: startTime ? dateToTimeString(startTime) : null,
        endTime: endTime ? dateToTimeString(endTime) : null,
      });
      onSaved();
    } catch {
      // Silently ignore for MVP
    } finally {
      setSaving(false);
    }
  };

  const handleClearAll = () => {
    setStartTime(null);
    setEndTime(null);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.sheet, { paddingTop: insets.top || spacing.lg }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {title}
            </Text>
            <View style={styles.typePill}>
              <Text style={styles.typePillText}>{typeLabel}</Text>
            </View>
          </View>
          <Pressable onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={24} color={colors.textMuted} />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Time pickers */}
          <Text style={styles.sectionTitle}>Set time</Text>
          <View style={styles.timeRow}>
            <TimePickerField
              label="Start"
              value={startTime}
              placeholder="Start time"
              onChange={setStartTime}
              onClear={() => setStartTime(null)}
            />
            <TimePickerField
              label="End"
              value={endTime}
              placeholder="End time"
              onChange={setEndTime}
              onClear={() => setEndTime(null)}
              minimumDate={startTime ?? undefined}
            />
          </View>

          {/* Clear times */}
          {(startTime || endTime) && (
            <Pressable style={styles.clearRow} onPress={handleClearAll}>
              <Ionicons name="trash-outline" size={16} color={colors.textMuted} />
              <Text style={styles.clearText}>Clear times</Text>
            </Pressable>
          )}

          {/* Save button */}
          <Pressable
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>
              {saving ? 'Saving...' : 'Save'}
            </Text>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
};

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.screenX,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginRight: spacing.md,
  },
  headerTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 17,
    color: colors.textPrimary,
    flexShrink: 1,
  },
  typePill: {
    backgroundColor: colors.neutralFill,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  typePillText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  content: {
    padding: spacing.screenX,
    paddingTop: spacing.xl,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  timeRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  clearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    alignSelf: 'center',
  },
  clearText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textMuted,
  },

  saveButton: {
    backgroundColor: colors.orange,
    borderRadius: radius.button,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xxl,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: '#FFFFFF',
  },
});
