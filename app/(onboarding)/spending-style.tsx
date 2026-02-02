import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import OnboardingScreen from '@/components/onboarding/OnboardingScreen';
import OptionCard from '@/components/onboarding/OptionCard';
import { onboardingStore } from '@/state/onboardingStore';

const OPTIONS = [
  { title: 'Keep it simple', subtitle: 'More money for the actual experience', value: 'budget' },
  { title: 'Somewhere in the middle', subtitle: "Nice enough without stressing about it", value: 'mid-range' },
  { title: 'Go all out', subtitle: "If it feels amazing, it's worth it", value: 'luxury' },
];

export default function SpendingStyleScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState('');

  const handleContinue = () => {
    onboardingStore.set('spendingStyle', selected);
    router.push('/(onboarding)/youre-in');
  };

  return (
    <OnboardingScreen
      stage={4}
      headline="How do you like to spend on a trip?"
      ctaLabel="Continue"
      ctaDisabled={!selected}
      onCtaPress={handleContinue}
    >
      <View style={styles.cards}>
        {OPTIONS.map((opt) => (
          <OptionCard
            key={opt.value}
            title={opt.title}
            subtitle={opt.subtitle}
            selected={selected === opt.value}
            onPress={() => setSelected(opt.value)}
          />
        ))}
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  cards: {
    gap: 12,
  },
});
