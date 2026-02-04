import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PrimaryButton from '@/components/ui/PrimaryButton';
import ProgressBar from '@/components/onboarding/ProgressIndicator';
import { onboardingStore } from '@/state/onboardingStore';
import { getGreeting } from '@/data/greetings';
import { supabase } from '@/lib/supabase';
import { uploadAvatar } from '@/lib/uploadAvatar';
import { completeOnboardingSession } from '@/lib/onboardingConfig';
import { getCityByName } from '@/data/api';
import { useAuth } from '@/state/AuthContext';
import { usePostHog } from 'posthog-react-native';
import { colors, fonts, spacing } from '@/constants/design';

export default function YoureInScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const firstName = onboardingStore.get('firstName') || '';
  const countryIso2 = onboardingStore.get('countryIso2');
  const greeting = countryIso2 ? getGreeting(countryIso2) : null;

  // Calculate dynamic progress for youre-in screen
  const screens = onboardingStore.get('screensToShow');
  const totalStages = screens.length || 5;
  const currentStage = screens.length > 0 ? screens.indexOf('youre-in') + 1 : 5;

  const { userId } = useAuth();
  const posthog = usePostHog();
  const [saving, setSaving] = useState(false);

  // Track screen view
  useEffect(() => {
    const sessionId = onboardingStore.get('abTestSessionId');
    posthog.capture('onboarding_screen_viewed', {
      screen: 'youre-in',
      session_id: sessionId,
    });
  }, [posthog]);

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

      // Create trip record if destination was selected during onboarding
      const { tripDestination, tripArriving, tripLeaving, tripNights } = data;
      if (tripDestination) {
        try {
          // Try to find the city by name to link destination_city_id
          const city = await getCityByName(tripDestination);

          await supabase.from('trips').insert({
            user_id: userId,
            destination_city_id: city?.id || null,
            destination_name: tripDestination,
            arriving: tripArriving || null,
            leaving: tripLeaving || null,
            nights: tripNights || null,
            status: 'planned',
          });
        } catch (tripError) {
          // Don't block onboarding completion if trip creation fails
          console.warn('Failed to create trip during onboarding:', tripError);
        }
      }
    }

    onboardingStore.set('onboardingCompleted', true);

    // Complete the A/B testing session
    const sessionId = onboardingStore.get('abTestSessionId');
    const questionsShown = onboardingStore.get('questionsToShow');
    const questionsAnswered = onboardingStore.get('questionsAnswered');
    const questionsSkipped = onboardingStore.get('questionsSkipped');

    if (sessionId) {
      await completeOnboardingSession(sessionId, questionsAnswered, questionsSkipped);
    }

    // Track completion with full breakdown
    posthog.capture('onboarding_completed', {
      session_id: sessionId,
      questions_shown: questionsShown,
      questions_answered: questionsAnswered,
      questions_skipped: questionsSkipped,
      screens_shown: onboardingStore.get('screensToShow'),
    });

    setSaving(false);
    router.replace('/(tabs)/explore');
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/pexels-sailing.png')}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
      />
      <View style={[StyleSheet.absoluteFillObject, styles.overlay]} />

      <View style={[styles.content, { paddingTop: insets.top }]}>
        <View style={styles.progressRow}>
          <View style={styles.progressPadding}>
            <ProgressBar stage={currentStage} totalStages={totalStages} />
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
