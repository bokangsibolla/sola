import React from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { theme } from '@/constants/theme';

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
        placeholderTextColor={theme.colors.muted}
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
    height: 52,
    borderRadius: theme.radii.input,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    paddingHorizontal: 16,
    ...theme.typography.body,
    color: theme.colors.text,
    fontFamily: 'Inter-Regular',
  },
  inputWithAccessory: {
    paddingLeft: 48,
  },
});
