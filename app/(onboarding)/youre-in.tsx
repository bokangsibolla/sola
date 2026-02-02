import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PrimaryButton from '@/components/ui/PrimaryButton';
import ProgressBar from '@/components/onboarding/ProgressIndicator';
import { onboardingStore } from '@/state/onboardingStore';
import { getGreeting } from '@/data/greetings';
import { supabase } from '@/lib/supabase';
import { uploadAvatar } from '@/lib/uploadAvatar';
import { useAuth } from '@/state/AuthContext';
import { usePostHog } from 'posthog-react-native';
import { colors, fonts, spacing } from '@/constants/design';

export default function YoureInScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const firstName = onboardingStore.get('firstName') || '';
  const countryIso2 = onboardingStore.get('countryIso2');
  const greeting = countryIso2 ? getGreeting(countryIso2) : null;

  const { userId } = useAuth();
  const posthog = usePostHog();
  const [saving, setSaving] = useState(false);

  const handleFinish = async () => {
    setSaving(true);

    // Persist profile data to Supabase
    if (userId) {
      const data = onboardingStore.getData();
      const avatarUrl = await uploadAvatar(userId, data.photoUri).catch(() => null);
      await supabase.from('profiles').upsert({
        id: userId,
        first_name: data.firstName,
        bio: data.bio || null,
        avatar_url: avatarUrl,
        home_country_iso2: data.countryIso2 || null,
        home_country_name: data.countryName || null,
        travel_style: data.spendingStyle || null,
        interests: data.dayStyle,
      });
    }

    onboardingStore.set('onboardingCompleted', true);
    posthog.capture('onboarding_completed');
    setSaving(false);
    router.replace('/(tabs)/home');
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/pexels-sailing.png')}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />
      <View style={[StyleSheet.absoluteFillObject, styles.overlay]} />

      <View style={[styles.content, { paddingTop: insets.top }]}>
        <View style={styles.progressRow}>
          <View style={styles.progressPadding}>
            <ProgressBar stage={5} />
          </View>
        </View>

        <View style={styles.center}>
          <Text style={styles.headline}>You're in, {firstName}.</Text>
          {greeting && <Text style={styles.greeting}>{greeting}</Text>}
          <Text style={styles.subtitle}>Your travel world starts here.</Text>
        </View>

        <View style={[styles.bottomBlock, { paddingBottom: insets.bottom + 24 }]}>
          <PrimaryButton label="Let's go" onPress={handleFinish} />
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
  overlay: {
    backgroundColor: colors.overlayDark,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  progressRow: {
    paddingTop: 16,
  },
  progressPadding: {
    paddingHorizontal: spacing.screenX,
  },
  center: {
    alignItems: 'center',
    paddingHorizontal: spacing.screenX,
  },
  headline: {
    fontFamily: fonts.semiBold,
    fontSize: 32,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  greeting: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginTop: 8,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 16,
  },
  bottomBlock: {
    paddingHorizontal: spacing.screenX,
  },
});
