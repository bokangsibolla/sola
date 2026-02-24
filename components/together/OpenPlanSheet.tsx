/**
 * OpenPlanSheet — bottom sheet pre-filled from an itinerary block.
 * Creates a Together post with postType: 'open_plan'.
 *
 * Pattern follows components/community/ReportSheet.tsx (Modal + overlay + backdrop).
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, spacing, radius, typography, pressedState } from '@/constants/design';
import { useAuth } from '@/state/AuthContext';
import { createTogetherPost } from '@/data/together/togetherApi';
import type { ActivityCategory, CreateTogetherPostInput } from '@/data/together/types';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface OpenPlanSheetProps {
  visible: boolean;
  onClose: () => void;
  block: {
    id: string;
    title: string;
    blockType: string;
    startTime: string | null;
    endTime: string | null;
  };
  tripId: string;
  date: string | null;
  cityId: string | null;
  cityName: string | null;
  countryIso2: string | null;
  onPosted?: () => void;
}

// ---------------------------------------------------------------------------
// Block type -> category mapping
// ---------------------------------------------------------------------------

function mapBlockTypeToCategory(blockType: string): ActivityCategory {
  switch (blockType) {
    case 'meal':
      return 'food';
    case 'activity':
      return 'adventure';
    case 'place':
      return 'culture';
    case 'wellness':
      return 'wellness';
    default:
      return 'other';
  }
}

// ---------------------------------------------------------------------------
// Category pills
// ---------------------------------------------------------------------------

const CATEGORIES: { key: ActivityCategory; label: string }[] = [
  { key: 'food', label: 'Food' },
  { key: 'culture', label: 'Culture' },
  { key: 'adventure', label: 'Adventure' },
  { key: 'nightlife', label: 'Nightlife' },
  { key: 'day_trip', label: 'Day trip' },
  { key: 'wellness', label: 'Wellness' },
  { key: 'shopping', label: 'Shopping' },
  { key: 'other', label: 'Other' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':');
  const h = parseInt(hours, 10);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${minutes} ${suffix}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const OpenPlanSheet: React.FC<OpenPlanSheetProps> = ({
  visible,
  onClose,
  block,
  tripId,
  date,
  cityId,
  cityName,
  countryIso2,
  onPosted,
}) => {
  const insets = useSafeAreaInsets();
  const { userId } = useAuth();

  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ActivityCategory>(
    mapBlockTypeToCategory(block.blockType),
  );
  const [maxCompanions, setMaxCompanions] = useState(2);
  const [submitting, setSubmitting] = useState(false);

  // Reset form when block changes
  const blockId = block.id;
  const prevBlockIdRef = React.useRef(blockId);
  if (prevBlockIdRef.current !== blockId) {
    prevBlockIdRef.current = blockId;
    setDescription('');
    setCategory(mapBlockTypeToCategory(block.blockType));
    setMaxCompanions(2);
  }

  // Formatted pre-filled info
  const dateDisplay = date ? formatDate(date) : null;
  const timeDisplay = useMemo(() => {
    const parts: string[] = [];
    if (block.startTime) parts.push(formatTime(block.startTime));
    if (block.endTime) parts.push(formatTime(block.endTime));
    return parts.length > 0 ? parts.join(' - ') : null;
  }, [block.startTime, block.endTime]);

  const handleSubmit = useCallback(async () => {
    if (!userId) return;
    setSubmitting(true);
    try {
      const input: CreateTogetherPostInput = {
        postType: 'open_plan',
        title: block.title,
        activityCategory: category,
        maxCompanions,
        itineraryBlockId: block.id,
        tripId,
      };

      if (description.trim()) {
        input.description = description.trim();
      }
      if (cityId) {
        input.cityId = cityId;
      }
      if (countryIso2) {
        input.countryIso2 = countryIso2;
      }
      if (date) {
        input.activityDate = date;
      }
      if (block.startTime) {
        input.startTime = block.startTime;
      }
      if (block.endTime) {
        input.endTime = block.endTime;
      }

      await createTogetherPost(userId, input);
      onPosted?.();
      onClose();
      setDescription('');
    } catch {
      Alert.alert('Error', 'Could not create post. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [
    userId,
    block,
    description,
    category,
    maxCompanions,
    tripId,
    cityId,
    countryIso2,
    date,
    onPosted,
    onClose,
  ]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={handleClose} />
        <View
          style={[
            styles.container,
            { paddingBottom: insets.bottom + spacing.lg },
          ]}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            {/* Handle bar */}
            <View style={styles.handle} />

            {/* Title */}
            <Text style={styles.title}>Share as Activity</Text>

            {/* Pre-filled info (read-only) */}
            <View style={styles.prefilledSection}>
              <View style={styles.prefilledRow}>
                <Ionicons
                  name="flag-outline"
                  size={16}
                  color={colors.textSecondary}
                />
                <Text style={styles.prefilledText} numberOfLines={1}>
                  {block.title}
                </Text>
              </View>

              {dateDisplay && (
                <View style={styles.prefilledRow}>
                  <Ionicons
                    name="calendar-outline"
                    size={16}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.prefilledText}>{dateDisplay}</Text>
                </View>
              )}

              {timeDisplay && (
                <View style={styles.prefilledRow}>
                  <Ionicons
                    name="time-outline"
                    size={16}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.prefilledText}>{timeDisplay}</Text>
                </View>
              )}

              {cityName && (
                <View style={styles.prefilledRow}>
                  <Ionicons
                    name="location-outline"
                    size={16}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.prefilledText}>{cityName}</Text>
                </View>
              )}
            </View>

            {/* Description input */}
            <Text style={styles.label}>Add a note</Text>
            <TextInput
              style={styles.descriptionInput}
              placeholder="Add a note for potential companions..."
              placeholderTextColor={colors.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              maxLength={500}
              textAlignVertical="top"
            />

            {/* Category pills */}
            <Text style={styles.label}>Category</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.pillScroll}
              contentContainerStyle={styles.pillRow}
            >
              {CATEGORIES.map((c) => {
                const active = category === c.key;
                return (
                  <Pressable
                    key={c.key}
                    onPress={() => setCategory(c.key)}
                    style={[styles.pill, active && styles.pillActive]}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        active && styles.pillTextActive,
                      ]}
                    >
                      {c.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Max companions stepper */}
            <Text style={styles.label}>Max companions</Text>
            <View style={styles.stepper}>
              <Pressable
                onPress={() =>
                  setMaxCompanions((v) => Math.max(1, v - 1))
                }
                style={[
                  styles.stepperButton,
                  maxCompanions <= 1 && styles.stepperButtonDisabled,
                ]}
                disabled={maxCompanions <= 1}
              >
                <Ionicons
                  name="remove"
                  size={20}
                  color={
                    maxCompanions <= 1
                      ? colors.textMuted
                      : colors.textPrimary
                  }
                />
              </Pressable>
              <Text style={styles.stepperValue}>{maxCompanions}</Text>
              <Pressable
                onPress={() =>
                  setMaxCompanions((v) => Math.min(5, v + 1))
                }
                style={[
                  styles.stepperButton,
                  maxCompanions >= 5 && styles.stepperButtonDisabled,
                ]}
                disabled={maxCompanions >= 5}
              >
                <Ionicons
                  name="add"
                  size={20}
                  color={
                    maxCompanions >= 5
                      ? colors.textMuted
                      : colors.textPrimary
                  }
                />
              </Pressable>
            </View>

            {/* Submit button */}
            <Pressable
              onPress={handleSubmit}
              disabled={submitting}
              style={[
                styles.submitButton,
                submitting && styles.submitButtonDisabled,
              ]}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>
                  Post Activity
                </Text>
              )}
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  container: {
    backgroundColor: colors.background,
    borderTopLeftRadius: spacing.xl,
    borderTopRightRadius: spacing.xl,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.screenX,
    maxHeight: '85%',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: radius.xs,
    backgroundColor: colors.borderDefault,
    alignSelf: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.sectionTitle,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },

  // Pre-filled info
  prefilledSection: {
    backgroundColor: colors.neutralFill,
    borderRadius: radius.input,
    padding: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  prefilledRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  prefilledText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textPrimary,
    flexShrink: 1,
  },

  // Labels
  label: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },

  // Description
  descriptionInput: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: colors.neutralFill,
    borderRadius: radius.input,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 80,
    marginBottom: spacing.xl,
    textAlignVertical: 'top',
  },

  // Category pills
  pillScroll: {
    marginBottom: spacing.xl,
    marginHorizontal: -spacing.screenX,
  },
  pillRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.screenX,
  },
  pill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    backgroundColor: colors.neutralFill,
  },
  pillActive: {
    borderColor: colors.orange,
    backgroundColor: colors.orangeFill,
  },
  pillText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textSecondary,
  },
  pillTextActive: {
    color: colors.orange,
  },

  // Stepper
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.input,
    alignSelf: 'flex-start',
    marginBottom: spacing.xxl,
  },
  stepperButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButtonDisabled: {
    opacity: 0.4,
  },
  stepperValue: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.textPrimary,
    minWidth: 40,
    textAlign: 'center',
  },

  // Submit
  submitButton: {
    alignItems: 'center',
    backgroundColor: colors.orange,
    borderRadius: radius.button,
    paddingVertical: 14,
    minHeight: 48,
  },
  submitButtonDisabled: {
    opacity: 0.4,
  },
  submitButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: '#FFFFFF',
  },
});
