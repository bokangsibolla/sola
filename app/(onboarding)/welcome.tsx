import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AnimatedBackground from '@/components/onboarding/AnimatedBackground';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { colors, fonts, spacing } from '@/constants/design';

const heroImages = [
  require('@/assets/images/pexels-driving.png'),
  require('@/assets/images/pexels-hiking.png'),
  require('@/assets/images/pexels-mountain-cliff.png'),
  require('@/assets/images/pexels-mountain-hiking.png'),
  require('@/assets/images/pexels-paddleboarding.png'),
  require('@/assets/images/pexels-sailing.png'),
  require('@/assets/images/welcome-background.png'),
];

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <AnimatedBackground images={heroImages} delay={2500} />

      <View style={[styles.content, { paddingTop: insets.top }]}>
        <View style={styles.logoBlock}>
          <Image
            source={require('@/assets/images/sola-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.tagline}>Because women travel differently.</Text>
        </View>

        <View style={[styles.bottomBlock, { paddingBottom: insets.bottom + 24 }]}>
          <Pressable onPress={() => router.push('/(onboarding)/create-account')}>
            <Text style={styles.loginText}>Log in</Text>
          </Pressable>
          <PrimaryButton
            label="Create account"
            onPress={() => router.push('/(onboarding)/create-account')}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    zIndex: 1,
  },
  logoBlock: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
  },
  logo: {
    width: 180,
    height: 80,
    tintColor: '#FFFFFF',
  },
  tagline: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 12,
  },
  bottomBlock: {
    paddingHorizontal: spacing.screenX,
    gap: 16,
    alignItems: 'center',
  },
  loginText: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: '#FFFFFF',
  },
});
