import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { colors } from '@/constants/design';

interface LoadingScreenProps {
  /** Full-screen orange splash with white Sola logo (used for initial app load) */
  branded?: boolean;
}

export default function LoadingScreen({ branded = false }: LoadingScreenProps) {
  if (branded) {
    return (
      <View style={styles.brandedContainer}>
        <Image
          source={require('@/assets/images/sola-logo-white.png')}
          style={styles.logo}
          contentFit="contain"
        />
        <ActivityIndicator
          size="small"
          color="rgba(255,255,255,0.5)"
          style={styles.brandedSpinner}
        />
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <View style={styles.simpleContainer}>
      <ActivityIndicator size="large" color={colors.orange} />
    </View>
  );
}

const styles = StyleSheet.create({
  brandedContainer: {
    flex: 1,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 120,
    height: 40,
  },
  brandedSpinner: {
    position: 'absolute',
    bottom: 80,
  },
  simpleContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
