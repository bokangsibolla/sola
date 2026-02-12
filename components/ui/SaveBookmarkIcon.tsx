import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/constants/design';

interface SaveBookmarkIconProps {
  isSaved: boolean;
  onPress: () => void;
  size?: number;
  color?: string;
}

export default function SaveBookmarkIcon({
  isSaved,
  onPress,
  size = 18,
  color,
}: SaveBookmarkIconProps) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
    >
      <Feather
        name={isSaved ? 'bookmark' : 'bookmark'}
        size={size}
        color={isSaved ? colors.orange : (color ?? colors.textMuted)}
        style={isSaved ? styles.filled : undefined}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 4,
  },
  pressed: {
    opacity: 0.6,
  },
  filled: {
    // Feather doesn't have a filled bookmark, so we use color to indicate state
  },
});
