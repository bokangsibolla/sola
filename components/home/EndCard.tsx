import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { colors, fonts, spacing, radius, pressedState } from '@/constants/design';

interface EndCardProps {
  onExplore: () => void;
}

export function EndCard({ onExplore }: EndCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.pressed,
      ]}
      onPress={onExplore}
      accessibilityRole="button"
      accessibilityLabel="Explore destinations"
    >
      <Image
        source={require('@/assets/images/solo-sand-dunes.jpg')}
        style={styles.image}
        contentFit="cover"
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.6)']}
        style={styles.gradient}
      />
      <View style={styles.overlay}>
        <Text style={styles.heading}>Where will you go next?</Text>
        <View style={styles.ctaRow}>
          <Text style={styles.cta}>Explore destinations</Text>
          <Feather name="arrow-right" size={14} color="rgba(255,255,255,0.8)" />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 180,
    borderRadius: radius.card,
    overflow: 'hidden',
    marginHorizontal: spacing.screenX,
    marginBottom: spacing.xl,
  },
  pressed: {
    opacity: pressedState.opacity,
    transform: pressedState.transform,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
  },
  heading: {
    fontFamily: fonts.semiBold,
    fontSize: 22,
    lineHeight: 28,
    color: '#FFFFFF',
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  cta: {
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.8)',
  },
});
