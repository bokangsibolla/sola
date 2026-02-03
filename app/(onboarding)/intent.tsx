import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import OnboardingScreen from '@/components/onboarding/OnboardingScreen';
import OptionCard from '@/components/onboarding/OptionCard';
import { onboardingStore } from '@/state/onboardingStore';
import { useOnboardingNavigation } from '@/hooks/useOnboardingNavigation';

export default function IntentScreen() {
  const router = useRouter();
  const { navigateToNextScreen, checkScreenAccess, trackScreenView } = useOnboardingNavigation();
  const [selected, setSelected] = useState<'planning' | 'exploring' | ''>('');

  // Check if this screen should be shown (A/B testing)
  useEffect(() => {
    const shouldShow = checkScreenAccess('intent');
    if (shouldShow) {
      trackScreenView('intent');
    }
  }, [checkScreenAccess, trackScreenView]);

  const handleContinue = () => {
    if (!selected) return;
    onboardingStore.set('tripIntent', selected);

    navigateToNextScreen('intent', {
      tripIntent: selected,
      answeredQuestions: ['trip_intent'],
    });
  };

  return (
    <OnboardingScreen
      stage={3}
      screenName="intent"
      headline="So, what's the plan?"
      ctaLabel="Continue"
      ctaDisabled={!selected}
      onCtaPress={handleContinue}
    >
      <View style={styles.cards}>
        <OptionCard
          title="I've got a trip coming up"
          selected={selected === 'planning'}
          onPress={() => setSelected('planning')}
        />
        <OptionCard
          title="Just dreaming for now"
          selected={selected === 'exploring'}
          onPress={() => setSelected('exploring')}
        />
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  cards: {
    gap: 12,
  },
});
