import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import OnboardingScreen from '@/components/onboarding/OnboardingScreen';
import Pill from '@/components/onboarding/Pill';
import { onboardingStore } from '@/state/onboardingStore';

const OPTIONS = [
  '🛡️ Feeling safe & at ease',
  '🤝 Connecting with locals',
  '🗺️ Finding hidden gems',
  '📸 Great photo spots',
  '💰 Getting more for less',
  '✨ Treating myself',
  '🚶‍♀️ Easy to do alone',
  '👩 Welcoming spaces',
];

export default function PrioritiesScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (option: string) => {
    setSelected((prev) => {
      if (prev.includes(option)) return prev.filter((o) => o !== option);
      if (prev.length >= 2) return prev;
      return [...prev, option];
    });
  };

  const handleContinue = () => {
    onboardingStore.set('priorities', selected);
    router.push('/(onboarding)/stay-preference');
  };

  return (
    <OnboardingScreen
      stage={3}
      headline="What matters most when you're there?"
      subtitle="Pick up to 2"
      ctaLabel="Continue"
      ctaDisabled={selected.length === 0}
      onCtaPress={handleContinue}
    >
      <View style={styles.pillGrid}>
        {OPTIONS.map((option) => (
          <Pill
            key={option}
            label={option}
            selected={selected.includes(option)}
            onPress={() => toggle(option)}
          />
        ))}
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  pillGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
  },
});
