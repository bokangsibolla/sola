import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SolaText } from '@/components/ui/SolaText';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { colors, fonts, radius, spacing, pressedState } from '@/constants/design';

const COMMUNITY_IMAGE = require('@/assets/images/pexels-paddleboarding.jpg');
const CARD_HEIGHT = 160;

export function CommunityBannerCard() {
  const router = useRouter();

  return (
    <View style={styles.wrapper}>
      <Pressable
        style={({ pressed }) => [
          styles.card,
          pressed && { opacity: pressedState.opacity, transform: pressedState.transform },
        ]}
        onPress={() => router.push('/(tabs)/connect' as any)}
        accessibilityRole="button"
        accessibilityLabel="Go to community"
      >
        <Image
          source={COMMUNITY_IMAGE}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          transition={200}
        />
        <LinearGradient
          colors={['transparent', colors.overlaySoft]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.content}>
          <SolaText style={styles.title}>Real stories from solo women</SolaText>
          <SolaText style={styles.subtitle}>{'Join the conversation  \u2192'}</SolaText>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: spacing.screenX,
    marginTop: spacing.xxl,
  },
  card: {
    height: CARD_HEIGHT,
    borderRadius: radius.module,
    overflow: 'hidden',
  },
  content: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    lineHeight: 24,
    color: colors.textOnImage,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textOnImageMuted,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
