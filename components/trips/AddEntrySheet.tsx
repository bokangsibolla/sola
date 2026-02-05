import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, spacing, radius } from '@/constants/design';
import { useAuth } from '@/state/AuthContext';
import { createTripEntry } from '@/data/trips/tripApi';
import { ENTRY_ICONS, ENTRY_LABELS, MOOD_COLORS } from '@/data/trips/helpers';
import type { EntryType, MoodTag } from '@/data/trips/types';

const ENTRY_TYPES: EntryType[] = ['note', 'arrival', 'stay', 'tip', 'highlight', 'comfort_check'];
const MOOD_OPTIONS: MoodTag[] = ['calm', 'happy', 'uneasy', 'unsafe'];

interface AddEntrySheetProps {
  tripId: string;
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function AddEntrySheet({ tripId, visible, onClose, onSaved }: AddEntrySheetProps) {
  const insets = useSafeAreaInsets();
  const { userId } = useAuth();
  const [entryType, setEntryType] = useState<EntryType>('note');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [location, setLocation] = useState('');
  const [mood, setMood] = useState<MoodTag | null>(null);
  const [saving, setSaving] = useState(false);

  const isComfortCheck = entryType === 'comfort_check';

  const handleSave = async () => {
    if (!userId) return;
    if (isComfortCheck && !mood) return;
    if (!isComfortCheck && !body.trim() && !title.trim()) return;

    setSaving(true);
    try {
      await createTripEntry(userId, {
        tripId,
        entryType,
        title: title.trim() || undefined,
        body: body.trim() || undefined,
        locationName: location.trim() || undefined,
        moodTag: mood ?? undefined,
        visibility: 'private',
      });
      resetForm();
      onSaved();
      onClose();
    } catch {
      // Error handled silently for MVP
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setEntryType('note');
    setTitle('');
    setBody('');
    setLocation('');
    setMood(null);
  };

  const canSave = isComfortCheck ? !!mood : !!(body.trim() || title.trim());

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.sheet, { paddingTop: insets.top || spacing.lg }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Add entry</Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </Pressable>
        </View>

        <ScrollView
          style={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Entry type selector */}
          <Text style={styles.label}>What happened?</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.typesScroll}
            contentContainerStyle={styles.typesContainer}
          >
            {ENTRY_TYPES.map((type) => {
              const isActive = type === entryType;
              return (
                <Pressable
                  key={type}
                  style={[styles.typePill, isActive && styles.typePillActive]}
                  onPress={() => {
                    setEntryType(type);
                    if (type !== 'comfort_check') setMood(null);
                  }}
                >
                  <Text style={styles.typeIcon}>{ENTRY_ICONS[type]}</Text>
                  <Text style={[styles.typeLabel, isActive && styles.typeLabelActive]}>
                    {ENTRY_LABELS[type]}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {isComfortCheck ? (
            <>
              <Text style={styles.label}>How are you feeling?</Text>
              <View style={styles.moodRow}>
                {MOOD_OPTIONS.map((m) => {
                  const mc = MOOD_COLORS[m];
                  const isActive = mood === m;
                  return (
                    <Pressable
                      key={m}
                      style={[
                        styles.moodPill,
                        { borderColor: isActive ? mc.text : colors.borderDefault },
                        isActive && { backgroundColor: mc.bg },
                      ]}
                      onPress={() => setMood(m)}
                    >
                      <View style={[styles.moodDot, { backgroundColor: mc.text }]} />
                      <Text style={[styles.moodLabel, isActive && { color: mc.text }]}>
                        {mc.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          ) : (
            <>
              <TextInput
                style={styles.titleInput}
                placeholder="Give it a title (optional)"
                placeholderTextColor={colors.textMuted}
                value={title}
                onChangeText={setTitle}
                maxLength={100}
              />
              <TextInput
                style={styles.bodyInput}
                placeholder="What's on your mind?"
                placeholderTextColor={colors.textMuted}
                value={body}
                onChangeText={setBody}
                multiline
                maxLength={1000}
              />
            </>
          )}

          {/* Location */}
          <View style={styles.locationInput}>
            <Ionicons name="location-outline" size={18} color={colors.textMuted} />
            <TextInput
              style={styles.locationField}
              placeholder="Where are you? (optional)"
              placeholderTextColor={colors.textMuted}
              value={location}
              onChangeText={setLocation}
              maxLength={100}
            />
          </View>

          {/* Privacy reassurance */}
          <View style={styles.privacyRow}>
            <Ionicons name="lock-closed" size={14} color={colors.textMuted} />
            <Text style={styles.privacyText}>Private — only you can see this</Text>
          </View>

          {/* Save button */}
          <Pressable
            style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={!canSave || saving}
          >
            <Text style={styles.saveButtonText}>
              {saving ? 'Saving...' : 'Save entry'}
            </Text>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  headerTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 17,
    color: colors.textPrimary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  typesScroll: {
    marginBottom: spacing.xl,
    marginHorizontal: -spacing.lg,
  },
  typesContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  typePillActive: {
    borderColor: colors.orange,
    backgroundColor: colors.orangeFill,
  },
  typeIcon: {
    fontSize: 14,
  },
  typeLabel: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  typeLabelActive: {
    color: colors.orange,
  },
  moodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  moodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  moodDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  moodLabel: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  titleInput: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.textPrimary,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
    paddingBottom: spacing.md,
    marginBottom: spacing.lg,
  },
  bodyInput: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
    minHeight: 120,
    textAlignVertical: 'top',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  locationInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.input,
    paddingHorizontal: spacing.md,
    height: 44,
    marginBottom: spacing.lg,
  },
  locationField: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textPrimary,
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  privacyText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
  saveButton: {
    backgroundColor: colors.orange,
    borderRadius: radius.button,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  saveButtonDisabled: {
    opacity: 0.4,
  },
  saveButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: '#FFFFFF',
  },
});
