import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radius, fonts } from '@/constants/design';
import { useAuth } from '@/state/AuthContext';
import { createTogetherPost } from '@/data/together/togetherApi';
import type { ActivityCategory } from '@/data/together/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface QuickPostSheetProps {
  visible: boolean;
  onClose: () => void;
  defaultCityId: string | null;
  defaultCityName: string | null;
  onPostCreated: () => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CATEGORIES: { label: string; value: ActivityCategory }[] = [
  { label: 'Food', value: 'food' },
  { label: 'Culture', value: 'culture' },
  { label: 'Adventure', value: 'adventure' },
  { label: 'Nightlife', value: 'nightlife' },
  { label: 'Day trip', value: 'day_trip' },
  { label: 'Wellness', value: 'wellness' },
  { label: 'Shopping', value: 'shopping' },
  { label: 'Other', value: 'other' },
];

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  food: ['cooking', 'dinner', 'lunch', 'breakfast', 'restaurant', 'eat', 'food', 'brunch', 'cafe', 'coffee'],
  culture: ['temple', 'museum', 'gallery', 'market', 'workshop', 'class', 'art'],
  adventure: ['hike', 'surf', 'dive', 'climb', 'kayak', 'trek', 'snorkel', 'bike', 'sunrise'],
  nightlife: ['drinks', 'bar', 'club', 'rooftop', 'sunset drinks', 'party', 'night out'],
  day_trip: ['day trip', 'excursion', 'island', 'road trip', 'waterfall'],
  wellness: ['yoga', 'spa', 'massage', 'meditation', 'retreat'],
  shopping: ['shopping', 'market', 'thrift', 'vintage', 'souvenir'],
  other: [],
};

const MIN_COMPANIONS = 1;
const MAX_COMPANIONS = 10;
const DEFAULT_COMPANIONS = 3;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function QuickPostSheet({
  visible,
  onClose,
  defaultCityId,
  defaultCityName,
  onPostCreated,
}: QuickPostSheetProps) {
  const insets = useSafeAreaInsets();
  const { userId } = useAuth();

  // Form state
  const [text, setText] = useState('');
  const [category, setCategory] = useState<ActivityCategory | null>(null);
  const [companions, setCompanions] = useState(DEFAULT_COMPANIONS);
  const [submitting, setSubmitting] = useState(false);
  const [manualCategory, setManualCategory] = useState(false);

  // Debounce ref for text parsing
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset state when sheet closes
  const handleClose = useCallback(() => {
    setText('');
    setCategory(null);
    setCompanions(DEFAULT_COMPANIONS);
    setSubmitting(false);
    setManualCategory(false);
    onClose();
  }, [onClose]);

  // Auto-detect category from text (debounced)
  const handleTextChange = useCallback(
    (value: string) => {
      setText(value);

      if (manualCategory) return;

      if (debounceRef.current) clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(() => {
        const lower = value.toLowerCase();
        let detected: ActivityCategory | null = null;

        for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
          if (keywords.length === 0) continue;
          for (const keyword of keywords) {
            if (lower.includes(keyword)) {
              detected = cat as ActivityCategory;
              break;
            }
          }
          if (detected) break;
        }

        setCategory(detected);
      }, 500);
    },
    [manualCategory],
  );

  // Clean up debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Manual category selection
  const handleCategoryPress = useCallback((value: ActivityCategory) => {
    setManualCategory(true);
    setCategory((prev) => (prev === value ? null : value));
  }, []);

  // Companion stepper
  const incrementCompanions = useCallback(() => {
    setCompanions((prev) => Math.min(prev + 1, MAX_COMPANIONS));
  }, []);

  const decrementCompanions = useCallback(() => {
    setCompanions((prev) => Math.max(prev - 1, MIN_COMPANIONS));
  }, []);

  // Submit
  const canSubmit = text.trim().length > 0 && category !== null && !submitting;

  const handleSubmit = useCallback(async () => {
    if (!canSubmit || !userId) return;
    setSubmitting(true);
    try {
      await createTogetherPost(userId, {
        postType: 'looking_for',
        title: text.trim(),
        activityCategory: category!,
        cityId: defaultCityId ?? undefined,
        isFlexible: true,
        maxCompanions: companions,
      });
      onPostCreated();
    } catch {
      Alert.alert('Error', 'Could not create post');
    } finally {
      setSubmitting(false);
    }
  }, [canSubmit, userId, text, category, defaultCityId, companions, onPostCreated]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.backdrop} onPress={handleClose} />
        <View style={[styles.container, { paddingBottom: insets.bottom + spacing.lg }]}>
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>What are you up to?</Text>
            <Pressable
              onPress={handleClose}
              hitSlop={12}
              style={({ pressed }) => pressed && styles.pressed}
            >
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Text input */}
            <TextInput
              style={styles.textInput}
              placeholder="Cooking class tomorrow, who's in?"
              placeholderTextColor={colors.textMuted}
              multiline
              value={text}
              onChangeText={handleTextChange}
              textAlignVertical="top"
            />

            {/* Smart defaults */}
            <View style={styles.defaultsSection}>
              {/* Location row */}
              <View style={styles.defaultRow}>
                <Ionicons name="location-outline" size={16} color={colors.orange} />
                <Text style={styles.defaultLabel}>Location</Text>
                <Text style={styles.defaultValue}>
                  {defaultCityName ?? 'Set location'}
                </Text>
              </View>

              {/* Date row */}
              <View style={styles.defaultRow}>
                <Ionicons name="calendar-outline" size={16} color={colors.orange} />
                <Text style={styles.defaultLabel}>When</Text>
                <Text style={styles.defaultValue}>Flexible</Text>
              </View>

              {/* Companions row */}
              <View style={styles.defaultRow}>
                <Ionicons name="people-outline" size={16} color={colors.orange} />
                <Text style={styles.defaultLabel}>Companions</Text>
                <View style={styles.stepper}>
                  <Pressable
                    onPress={decrementCompanions}
                    hitSlop={8}
                    style={({ pressed }) => [
                      styles.stepperButton,
                      pressed && styles.pressed,
                      companions <= MIN_COMPANIONS && styles.stepperDisabled,
                    ]}
                    disabled={companions <= MIN_COMPANIONS}
                  >
                    <Ionicons
                      name="remove"
                      size={14}
                      color={companions <= MIN_COMPANIONS ? colors.textMuted : colors.textPrimary}
                    />
                  </Pressable>
                  <Text style={styles.stepperValue}>Up to {companions}</Text>
                  <Pressable
                    onPress={incrementCompanions}
                    hitSlop={8}
                    style={({ pressed }) => [
                      styles.stepperButton,
                      pressed && styles.pressed,
                      companions >= MAX_COMPANIONS && styles.stepperDisabled,
                    ]}
                    disabled={companions >= MAX_COMPANIONS}
                  >
                    <Ionicons
                      name="add"
                      size={14}
                      color={companions >= MAX_COMPANIONS ? colors.textMuted : colors.textPrimary}
                    />
                  </Pressable>
                </View>
              </View>
            </View>

            {/* Category pills */}
            <View style={styles.categorySection}>
              {CATEGORIES.map((cat) => {
                const selected = category === cat.value;
                return (
                  <Pressable
                    key={cat.value}
                    onPress={() => handleCategoryPress(cat.value)}
                    style={[
                      styles.categoryPill,
                      selected ? styles.categoryPillSelected : styles.categoryPillUnselected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryLabel,
                        selected ? styles.categoryLabelSelected : styles.categoryLabelUnselected,
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          {/* Post button */}
          <Pressable
            onPress={handleSubmit}
            disabled={!canSubmit}
            style={({ pressed }) => [
              styles.postButton,
              !canSubmit && styles.postButtonDisabled,
              pressed && canSubmit && styles.pressed,
            ]}
          >
            {submitting ? (
              <ActivityIndicator color={colors.background} size="small" />
            ) : (
              <Text style={styles.postButtonText}>Post</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

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
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: radius.xs,
    backgroundColor: colors.borderDefault,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  headerTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.textPrimary,
  },
  pressed: {
    opacity: 0.7,
  },

  // Text input
  textInput: {
    backgroundColor: colors.neutralFill,
    borderRadius: radius.input,
    padding: spacing.md,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.textPrimary,
    minHeight: 72, // ~3 lines
    marginBottom: spacing.xl,
  },

  // Smart defaults
  defaultsSection: {
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  defaultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  defaultLabel: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textPrimary,
    flex: 1,
  },
  defaultValue: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
  },

  // Stepper
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  stepperButton: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.neutralFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperDisabled: {
    opacity: 0.4,
  },
  stepperValue: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    minWidth: 48,
    textAlign: 'center',
  },

  // Category pills
  categorySection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  categoryPill: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  categoryPillSelected: {
    backgroundColor: colors.orangeFill,
    borderWidth: 1,
    borderColor: colors.orange,
  },
  categoryPillUnselected: {
    backgroundColor: colors.neutralFill,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryLabel: {
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  categoryLabelSelected: {
    color: colors.orange,
  },
  categoryLabelUnselected: {
    color: colors.textSecondary,
  },

  // Post button
  postButton: {
    backgroundColor: colors.orange,
    borderRadius: radius.button,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  postButtonDisabled: {
    opacity: 0.5,
  },
  postButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.background,
  },
});
