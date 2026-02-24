import React, { useEffect, useState } from 'react';
import { Alert, Platform, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PrimaryButton from '@/components/ui/PrimaryButton';
import ProgressBar from '@/components/onboarding/ProgressIndicator';
import { onboardingStore } from '@/state/onboardingStore';
import { getGreeting } from '@/data/greetings';
import { supabase } from '@/lib/supabase';
import { uploadAvatar } from '@/lib/uploadAvatar';
import { submitVerificationSelfie, setProfileTags } from '@/data/api';
import { ALL_INTERESTS } from '@/constants/interests';
import { completeOnboardingSession } from '@/lib/onboardingConfig';
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
  const totalStages = screens.length || 2;
  const currentStage = screens.length > 0 ? screens.indexOf('youre-in') + 1 : 2;

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

    // Check for an active session — try recovering from storage if context is stale
    let activeUserId = userId;
    if (!activeUserId) {
      try {
        const { data: { session: recoveredSession } } = await supabase.auth.getSession();
        activeUserId = recoveredSession?.user?.id ?? null;
      } catch {
        // Storage/network error — continue with null
      }
    }

    if (!activeUserId) {
      setSaving(false);
      Alert.alert(
        'Session expired',
        'Your sign-in session was lost. Please sign in again to save your profile.',
        [{ text: 'OK', onPress: () => {
          onboardingStore.reset();
          router.replace('/(onboarding)/welcome' as any);
        }}],
      );
      return;
    }

    const data = onboardingStore.getData();
    const avatarUrl = await uploadAvatar(activeUserId, data.photoUri).catch(() => null);

    const { error: profileError } = await supabase.from('profiles').upsert({
      id: activeUserId,
      first_name: data.firstName,
      username: data.username || null,
      avatar_url: avatarUrl,
      home_country_iso2: data.countryIso2 || null,
      home_country_name: data.countryName || null,
      nationality: data.countryName || null,
      date_of_birth: data.dateOfBirth || null,
      onboarding_completed_at: new Date().toISOString(),
    });

    if (profileError) {
      setSaving(false);
      Alert.alert('Could not save profile', profileError.message ?? 'Please try again.');
      return;
    }

    // Save interests to profile_tags
    const dayStyleSlugs: string[] = data.dayStyle ?? [];
    if (dayStyleSlugs.length > 0 && activeUserId) {
      const tags = dayStyleSlugs.map((slug: string) => {
        const option = ALL_INTERESTS.find((o) => o.slug === slug);
        return {
          tagSlug: slug,
          tagLabel: option?.label ?? slug,
          tagGroup: option?.group ?? '',
        };
      });
      await setProfileTags(activeUserId, tags).catch(() => {
        // Don't block onboarding if tags fail to save
      });
    }

    // Upload verification selfie if taken during onboarding
    const verificationSelfieUri = data.verificationSelfieUri;
    if (verificationSelfieUri) {
      try {
        await submitVerificationSelfie(activeUserId, verificationSelfieUri);
      } catch {
        // Don't block onboarding if selfie upload fails — they can retry from settings
      }
    }

    onboardingStore.set('onboardingCompleted', true);

    // Complete the A/B testing session
    const sessionId = onboardingStore.get('abTestSessionId');
    const questionsAnswered = onboardingStore.get('questionsAnswered');
    const questionsSkipped = onboardingStore.get('questionsSkipped');

    if (sessionId) {
      await completeOnboardingSession(sessionId, questionsAnswered, questionsSkipped);
    }

    // Track completion
    posthog.capture('onboarding_completed', {
      session_id: sessionId,
      questions_answered: questionsAnswered,
      questions_skipped: questionsSkipped,
      screens_shown: onboardingStore.get('screensToShow'),
    });

    setSaving(false);

    console.log('[Sola youre-in] Navigating to tabs/home...');
    // On Android, defer navigation to next event loop tick to work around
    // Expo Router bug where router.replace across route groups can fail
    // when called from within an async handler.
    if (Platform.OS === 'android') {
      setTimeout(() => {
        console.log('[Sola youre-in] setTimeout navigation firing');
        router.replace('/(tabs)/home' as any);
      }, 50);
    } else {
      router.replace('/(tabs)/home' as any);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/solo-golden-field.jpg')}
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
