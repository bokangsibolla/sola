import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import OnboardingScreen from '@/components/onboarding/OnboardingScreen';
import OptionCard from '@/components/onboarding/OptionCard';
import { onboardingStore } from '@/state/onboardingStore';

const OPTIONS = [
  { title: 'Hostels & social stays', subtitle: 'Meet people, share stories', value: 'hostels' },
  { title: 'Boutique hotels & B&Bs', subtitle: 'Charming spots with character', value: 'boutique' },
  { title: 'Apartments & homestays', subtitle: 'Live like a local', value: 'apartments' },
  { title: 'Luxury hotels & resorts', subtitle: 'Robes and room service', value: 'luxury' },
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
      headline="Where do you usually crash?"
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
