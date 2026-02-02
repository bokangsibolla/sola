import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import OnboardingScreen from '@/components/onboarding/OnboardingScreen';
import OptionCard from '@/components/onboarding/OptionCard';
import { onboardingStore } from '@/state/onboardingStore';

const OPTIONS = [
  { title: 'Budget', subtitle: 'I stretch every dollar', value: 'budget' },
  { title: 'Mid-range', subtitle: 'Comfortable but not flashy', value: 'mid-range' },
  { title: 'Luxury', subtitle: 'I treat myself', value: 'luxury' },
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
      headline="What's your travel budget?"
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
