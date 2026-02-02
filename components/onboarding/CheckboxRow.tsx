import { Body, Label } from '@/components/ui/SolaText';
import { theme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

interface CheckboxRowProps {
  label: string | React.ReactNode;
  checked: boolean;
  onToggle: () => void;
  helperText?: string;
}

export default function CheckboxRow({ label, checked, onToggle, helperText }: CheckboxRowProps) {
  return (
    <View style={styles.container}>
      <Pressable
        style={styles.row}
        onPress={onToggle}
      >
        <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
          {checked && (
            <Ionicons name="checkmark" size={16} color={theme.colors.card} />
          )}
        </View>
        {typeof label === 'string' ? (
          <Body style={styles.label}>{label}</Body>
        ) : (
          <View style={styles.labelContainer}>
            {label}
          </View>
        )}
      </Pressable>
      {helperText && (
        <Label style={styles.helperText}>{helperText}</Label>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: theme.colors.brand,
    borderColor: theme.colors.brand,
  },
  labelContainer: {
    flex: 1,
  },
  label: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: 'Inter-Regular',
    color: theme.colors.text,
    flex: 1,
  },
  helperText: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'Inter-Regular',
    color: theme.colors.muted,
    marginLeft: 40,
  },
});
