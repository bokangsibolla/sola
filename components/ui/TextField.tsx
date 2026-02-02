import React from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { colors, fonts, radius, typography } from '@/constants/design';

interface TextFieldProps extends TextInputProps {
  leftAccessory?: React.ReactNode;
}

export default function TextField({
  style,
  leftAccessory,
  ...props
}: TextFieldProps) {
  return (
    <View style={styles.container}>
      {leftAccessory && <View style={styles.leftAccessory}>{leftAccessory}</View>}
      <TextInput
        style={[styles.input, leftAccessory && styles.inputWithAccessory, style]}
        placeholderTextColor={colors.textMuted}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftAccessory: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  input: {
    height: 56,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    ...typography.body,
    color: colors.textPrimary,
  },
  inputWithAccessory: {
    paddingLeft: 48,
  },
});
