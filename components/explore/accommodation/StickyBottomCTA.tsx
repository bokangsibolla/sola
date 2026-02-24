import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, elevation, fonts, radius, spacing } from '@/constants/design';

interface StickyBottomCTAProps {
  saved: boolean;
  canSave: boolean;
  onSave: () => void;
  onOpenMaps: () => void;
}

const StickyBottomCTA: React.FC<StickyBottomCTAProps> = ({
  saved,
  canSave,
  onSave,
  onOpenMaps,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: insets.bottom + spacing.sm },
      ]}
    >
      <Pressable
        onPress={onSave}
        disabled={!canSave}
        style={[
          styles.button,
          styles.saveButton,
          saved && styles.saveButtonSaved,
          !canSave && styles.buttonDisabled,
        ]}
      >
        <Ionicons
          name={saved ? 'checkmark-circle' : 'add-circle-outline'}
          size={20}
          color={colors.background}
        />
        <Text style={styles.saveText}>
          {!canSave ? 'Sign in to save' : saved ? 'Saved' : 'Add to Trip'}
        </Text>
      </Pressable>

      <Pressable onPress={onOpenMaps} style={[styles.button, styles.mapsButton]}>
        <Ionicons name="map-outline" size={20} color={colors.textPrimary} />
        <Text style={styles.mapsText}>View on Maps</Text>
      </Pressable>
    </View>
  );
};

export { StickyBottomCTA };

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    ...elevation.md,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
  },
  saveButton: {
    backgroundColor: colors.orange,
  },
  saveButtonSaved: {
    backgroundColor: colors.greenSoft,
  },
  buttonDisabled: {
    backgroundColor: colors.textMuted,
  },
  saveText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.background,
  },
  mapsButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  mapsText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
});
