import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import OnboardingScreen from '@/components/onboarding/OnboardingScreen';
import OptionCard from '@/components/onboarding/OptionCard';
import { onboardingStore } from '@/state/onboardingStore';

const OPTIONS = [
  { title: 'Around other people', subtitle: 'Common rooms, shared energy', value: 'hostels' },
  { title: 'Something with character', subtitle: 'Small hotels, unique stays', value: 'boutique' },
  { title: 'My own space', subtitle: 'A kitchen, a couch, a front door', value: 'apartments' },
  { title: 'Fully taken care of', subtitle: 'Someone else handles the details', value: 'luxury' },
];

export default function StayPreferenceScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState('');

  const handleContinue = () => {
    const option = OPTIONS.find((o) => o.value === selected);
    onboardingStore.set('stayPreference', option?.title ?? selected);
    router.push('/(onboarding)/spending-style');
  };

  return (
    <OnboardingScreen
      stage={4}
      headline="What makes you feel at home away from home?"
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
