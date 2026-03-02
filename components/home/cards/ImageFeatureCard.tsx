import React from 'react';
import { Pressable, StyleSheet, Text, View, ImageSourcePropType } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { colors, fonts, radius, spacing, pressedState } from '@/constants/design';

interface ImageFeatureCardProps {
  imageSource: ImageSourcePropType;
  headline: string;
  description: string;
  route: string;
}

export function ImageFeatureCard({ imageSource, headline, description, route }: ImageFeatureCardProps) {
  const router = useRouter();

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={() => router.push(route as any)}
    >
      <Image
        source={imageSource}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
        transition={200}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.65)']}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />
      <View style={styles.content}>
        <Text style={styles.headline}>{headline}</Text>
        <Text style={styles.description} numberOfLines={2}>{description}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 160,
    borderRadius: radius.cardLg,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  pressed: pressedState,
  content: {
    padding: spacing.lg,
    gap: 4,
  },
  headline: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    lineHeight: 24,
    color: '#FFFFFF',
  },
  description: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.85)',
  },
});
