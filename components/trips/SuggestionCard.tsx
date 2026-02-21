import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, spacing } from '@/constants/design';
import type { ItinerarySuggestion } from '@/data/trips/itineraryTypes';

interface SuggestionCardProps {
  suggestion: ItinerarySuggestion;
  onApply: () => void;
  onDismiss: () => void;
}

const MIN_TOUCH_TARGET = 44;

export const SuggestionCard: React.FC<SuggestionCardProps> = ({
  suggestion,
  onApply,
  onDismiss,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Ionicons name="sparkles" size={18} color={colors.orange} />
        <Text style={styles.reasonText}>{suggestion.reason}</Text>
      </View>

      <View style={styles.actionRow}>
        <Pressable
          onPress={onDismiss}
          style={styles.dismissButton}
          hitSlop={0}
        >
          <Text style={styles.dismissText}>Dismiss</Text>
        </Pressable>
        <Pressable
          onPress={onApply}
          style={styles.applyButton}
          hitSlop={0}
        >
          <Text style={styles.applyText}>Apply</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.textPrimary,
    borderRadius: radius.cardLg,
    padding: spacing.lg,
    marginHorizontal: spacing.screenX,
    marginTop: spacing.lg,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  reasonText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: '#FFFFFF',
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  dismissButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
  },
  dismissText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textMuted,
  },
  applyButton: {
    backgroundColor: colors.orange,
    borderRadius: radius.button,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
  },
  applyText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: '#FFFFFF',
  },
});
