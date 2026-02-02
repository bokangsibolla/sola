import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import OnboardingScreen from '@/components/onboarding/OnboardingScreen';
import OptionCard from '@/components/onboarding/OptionCard';
import { onboardingStore } from '@/state/onboardingStore';

export default function IntentScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<'planning' | 'exploring' | ''>('');

  const handleContinue = () => {
    if (!selected) return;
    onboardingStore.set('tripIntent', selected);
    if (selected === 'planning') {
      router.push('/(onboarding)/trip-details');
    } else {
      router.push('/(onboarding)/day-style');
    }
  };

  return (
    <OnboardingScreen
      stage={3}
      headline="What brings you to Sola?"
      ctaLabel="Continue"
      ctaDisabled={!selected}
      onCtaPress={handleContinue}
    >
      <View style={styles.cards}>
        <OptionCard
          title="I'm planning a trip"
          selected={selected === 'planning'}
          onPress={() => setSelected('planning')}
        />
        <OptionCard
          title="Just exploring for now"
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
