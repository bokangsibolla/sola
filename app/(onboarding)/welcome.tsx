import React, { useEffect } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
// Note: FadeIn kept for logo animation, bottomBlock uses plain View to avoid Android text clipping
import { usePostHog } from 'posthog-react-native';
import AnimatedBackground from '@/components/onboarding/AnimatedBackground';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { colors, fonts, radius, spacing } from '@/constants/design';

const heroImages = [
  require('@/assets/images/solo-golden-field.jpg'),
  require('@/assets/images/solo-cliff-fjord.jpg'),
  require('@/assets/images/solo-canyon-mist.jpg'),
  require('@/assets/images/solo-sand-dunes.jpg'),
  require('@/assets/images/solo-canyon-relax.jpg'),
  require('@/assets/images/solo-bali-palms.jpg'),
  require('@/assets/images/pexels-driving.jpg'),
];

const TAGLINE = 'Because women travel differently.';

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const posthog = usePostHog();

  // Track screen view
  useEffect(() => {
    posthog.capture('welcome_screen_viewed');
  }, [posthog]);

  // Animate tagline: width reveal (typewriter feel)
  const revealWidth = useSharedValue(0);

  useEffect(() => {
    revealWidth.value = withDelay(
      600,
      withTiming(1, { duration: 1200, easing: Easing.out(Easing.cubic) }),
    );
  }, []);

  const taglineStyle = useAnimatedStyle(() => ({
    width: `${revealWidth.value * 100}%`,
    overflow: 'hidden',
  }));

  return (
    <View style={styles.container}>
      <AnimatedBackground images={heroImages} delay={4000} />

      <View style={[styles.content, { paddingTop: insets.top }]}>
        <Animated.View
          entering={FadeIn.duration(800)}
          style={styles.logoBlock}
        >
          <Image
            source={require('@/assets/images/sola-logo.png')}
            style={styles.logo}
            contentFit="contain"
          />
          <View style={styles.taglineContainer}>
            <Animated.View style={taglineStyle}>
              <Text style={styles.tagline} numberOfLines={1}>
                {TAGLINE}
              </Text>
            </Animated.View>
          </View>
        </Animated.View>

        <View style={[styles.bottomBlock, { paddingBottom: Math.max(insets.bottom, Platform.OS === 'android' ? 64 : 0) + 24 }]}>
          <PrimaryButton
            label="Create account"
            onPress={() => {
              posthog.capture('create_account_tapped', { source: 'welcome' });
              router.push('/(onboarding)/create-account');
            }}
          />
          <Pressable
            style={styles.loginButton}
            onPress={() => {
              posthog.capture('login_tapped', { source: 'welcome' });
              router.push('/(onboarding)/login');
            }}
          >
            <Text style={styles.loginText} numberOfLines={1}>Log in</Text>
          </Pressable>
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
  taglineContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  tagline: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  bottomBlock: {
    paddingHorizontal: spacing.screenX,
    gap: 12,
  },
  loginButton: {
    minHeight: 48,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  loginText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 22,
    color: '#FFFFFF',
    ...(Platform.OS === 'android' && { includeFontPadding: false }),
  },
});
