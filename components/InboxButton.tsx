import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/design';

export default function InboxButton() {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push('/(tabs)/travelers/dm' as any)}
      hitSlop={12}
      style={styles.container}
      accessibilityRole="button"
      accessibilityLabel="Messages"
    >
      <Image
        source={require('@/assets/images/icons/icon-inbox.png')}
        style={styles.icon}
        contentFit="contain"
        tintColor={colors.orange}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 22,
    height: 22,
  },
});
