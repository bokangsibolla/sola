import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import OnboardingScreen from '@/components/onboarding/OnboardingScreen';
import OptionCard from '@/components/onboarding/OptionCard';
import { onboardingStore } from '@/state/onboardingStore';

const OPTIONS = [
  'Hostels & social stays',
  'Boutique hotels & B&Bs',
  'Apartments & homestays',
  'Luxury hotels & resorts',
];

export default function StayPreferenceScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState('');

  const handleContinue = () => {
    onboardingStore.set('stayPreference', selected);
    router.push('/(onboarding)/spending-style');
  };

  return (
    <OnboardingScreen
      stage={4}
      headline="Where do you like to stay?"
      ctaLabel="Continue"
      ctaDisabled={!selected}
      onCtaPress={handleContinue}
    >
      <View style={styles.cards}>
        {OPTIONS.map((option) => (
          <OptionCard
            key={option}
            title={option}
            selected={selected === option}
            onPress={() => setSelected(option)}
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
