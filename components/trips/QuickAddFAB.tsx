import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, fonts } from '@/constants/design';
import { createTripEntry } from '@/data/trips/tripApi';
import { useAuth } from '@/state/AuthContext';
import type { EntryType } from '@/data/trips/types';

const QUICK_ACTIONS: { type: EntryType; icon: string; label: string }[] = [
  { type: 'tip', icon: 'bulb-outline', label: 'Travel tip' },
  { type: 'highlight', icon: 'sparkles-outline', label: 'Highlight' },
  { type: 'note', icon: 'create-outline', label: 'Note' },
];

interface QuickAddFABProps {
  tripId: string;
  onEntryAdded: () => void;
  /** Override wrapper positioning (e.g. bottom offset) */
  style?: ViewStyle;
}

export const QuickAddFAB: React.FC<QuickAddFABProps> = ({ tripId, onEntryAdded, style }) => {
  const { userId } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleAction = async (type: EntryType) => {
    if (!userId || saving) return;
    setSaving(true);
    try {
      await createTripEntry(userId, {
        tripId,
        entryType: type,
        title: '',
        visibility: 'private',
      });
      setExpanded(false);
      onEntryAdded();
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.wrapper, style]}>
      {expanded && (
        <View style={styles.menu}>
          {QUICK_ACTIONS.map(({ type, icon, label }) => (
            <Pressable
              key={type}
              onPress={() => handleAction(type)}
              style={({ pressed }) => [
                styles.menuItem,
                pressed && { opacity: 0.8 },
              ]}
            >
              <Ionicons name={icon as any} size={18} color={colors.textPrimary} />
              <Text style={styles.menuLabel}>{label}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <Pressable
        onPress={() => setExpanded(!expanded)}
        style={({ pressed }) => [
          styles.fab,
          pressed && { transform: [{ scale: 0.95 }] },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Quick add entry"
      >
        <Ionicons
          name={expanded ? 'close' : 'add'}
          size={24}
          color="#FFFFFF"
        />
      </Pressable>
    </View>
  );
};

const FAB_SIZE = 56;

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.screenX,
    alignItems: 'flex-end',
  },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menu: {
    backgroundColor: colors.background,
    borderRadius: radius.module,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  menuLabel: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textPrimary,
  },
});
