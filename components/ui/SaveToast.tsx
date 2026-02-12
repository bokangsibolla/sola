import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, spacing, radius } from '@/constants/design';

interface SaveToastProps {
  visible: boolean;
  message?: string;
  onAddToCollection?: () => void;
  onDismiss: () => void;
  /** Auto-dismiss after this many ms. Default 3000. */
  duration?: number;
}

export default function SaveToast({
  visible,
  message = 'Saved',
  onAddToCollection,
  onDismiss,
  duration = 3000,
}: SaveToastProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        dismiss();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      opacity.setValue(0);
      translateY.setValue(20);
    }
  }, [visible]);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 20,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => onDismiss());
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity, transform: [{ translateY }] },
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.message}>{message}</Text>
        {onAddToCollection && (
          <Pressable onPress={onAddToCollection} hitSlop={8}>
            <Text style={styles.action}>Add to Collection</Text>
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: spacing.screenX,
    right: spacing.screenX,
    zIndex: 100,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.textPrimary,
    borderRadius: radius.card,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  message: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: '#FFFFFF',
  },
  action: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.orange,
  },
});
