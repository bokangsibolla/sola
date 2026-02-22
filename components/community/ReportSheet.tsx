import React, { useState } from 'react';
import {
  View,
  Pressable,
  TextInput,
  Modal,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, spacing, radius } from '@/constants/design';
import { SolaText } from '@/components/ui/SolaText';
import { reportContent } from '@/data/community/communityApi';
import type { CommunityEntityType } from '@/data/community/types';

const REASONS = [
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'inappropriate', label: 'Inappropriate' },
  { value: 'misinformation', label: 'Misinformation' },
  { value: 'other', label: 'Other' },
];

interface ReportSheetProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
  entityType: CommunityEntityType;
  entityId: string;
  onReported?: () => void;
}

export default function ReportSheet({
  visible,
  onClose,
  userId,
  entityType,
  entityId,
  onReported,
}: ReportSheetProps) {
  const insets = useSafeAreaInsets();
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason) return;
    setSubmitting(true);
    try {
      await reportContent(userId, entityType, entityId, selectedReason, details.trim() || undefined);
      Alert.alert('Report submitted', 'Thank you for helping keep our community safe.');
      onReported?.();
      onClose();
      setSelectedReason(null);
      setDetails('');
    } catch {
      Alert.alert('Error', 'Could not submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.container, { paddingBottom: insets.bottom + spacing.lg }]}>
          <View style={styles.handle} />
          <SolaText style={styles.title}>Report content</SolaText>
          <SolaText style={styles.subtitle}>Why are you reporting this?</SolaText>

          <View style={styles.reasonRow}>
            {REASONS.map((r) => (
              <Pressable
                key={r.value}
                onPress={() => setSelectedReason(r.value)}
                style={[styles.pill, selectedReason === r.value && styles.pillActive]}
              >
                <SolaText style={[styles.pillText, selectedReason === r.value && styles.pillTextActive]}>
                  {r.label}
                </SolaText>
              </Pressable>
            ))}
          </View>

          <TextInput
            style={styles.detailsInput}
            placeholder="Additional details (optional)"
            placeholderTextColor={colors.textMuted}
            value={details}
            onChangeText={setDetails}
            multiline
            maxLength={500}
          />

          <Pressable
            onPress={handleSubmit}
            disabled={!selectedReason || submitting}
            style={[styles.submitButton, (!selectedReason || submitting) && styles.submitButtonDisabled]}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <SolaText variant="button" color="#FFFFFF">Submit report</SolaText>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  container: {
    backgroundColor: colors.background,
    borderTopLeftRadius: spacing.xl,
    borderTopRightRadius: spacing.xl,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.screenX,
  },
  handle: { width: 36, height: 4, borderRadius: radius.xs, backgroundColor: colors.borderDefault, alignSelf: 'center', marginBottom: spacing.xl },
  title: { fontFamily: fonts.semiBold, fontSize: 20, color: colors.textPrimary, marginBottom: spacing.xs },
  subtitle: { fontFamily: fonts.regular, fontSize: 14, color: colors.textSecondary, marginBottom: spacing.lg },

  reasonRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  pill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  pillActive: {
    borderColor: colors.orange,
    backgroundColor: colors.orangeFill,
  },
  pillText: { fontFamily: fonts.medium, fontSize: 13, color: colors.textSecondary },
  pillTextActive: { color: colors.orange },

  detailsInput: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textPrimary,
    backgroundColor: colors.neutralFill,
    borderRadius: radius.input,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 80,
    marginBottom: spacing.lg,
    textAlignVertical: 'top',
  },

  submitButton: {
    alignItems: 'center',
    backgroundColor: colors.orange,
    borderRadius: radius.button,
    paddingVertical: spacing.md,
  },
  submitButtonDisabled: { opacity: 0.4 },
});
