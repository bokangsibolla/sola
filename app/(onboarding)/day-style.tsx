import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import OnboardingScreen from '@/components/onboarding/OnboardingScreen';
import Pill from '@/components/onboarding/Pill';
import { onboardingStore } from '@/state/onboardingStore';
import { colors, fonts } from '@/constants/design';

const INTERESTS = [
  '🏛️ History & culture',
  '🌿 Being outdoors',
  '🍜 Trying the food',
  '🌙 Going out at night',
  '🧘 Rest & wellness',
  '🧗 Adventure & sports',
  '🛍️ Shopping & markets',
  '🎨 Art & creativity',
];

const PRIORITIES = [
  '🛡️ Feeling safe',
  '🤝 Meeting locals',
  '🗺️ Hidden gems',
  '📸 Photo spots',
  '💰 Good value',
  '✨ Treating myself',
  '🚶‍♀️ Solo-friendly',
  '👩 Welcoming spaces',
];

export default function DayStyleScreen() {
  const router = useRouter();
  const [interests, setInterests] = useState<string[]>([]);
  const [priorities, setPriorities] = useState<string[]>([]);

  const toggleInterest = (option: string) => {
    setInterests((prev) => {
      if (prev.includes(option)) return prev.filter((o) => o !== option);
      if (prev.length >= 2) return prev;
      return [...prev, option];
    });
  };

  const togglePriority = (option: string) => {
    setPriorities((prev) => {
      if (prev.includes(option)) return prev.filter((o) => o !== option);
      if (prev.length >= 2) return prev;
      return [...prev, option];
    });
  };

  const handleContinue = () => {
    onboardingStore.set('dayStyle', interests);
    onboardingStore.set('priorities', priorities);
    router.push('/(onboarding)/stay-preference');
  };

  return (
    <OnboardingScreen
      stage={4}
      headline="What gets you excited about a new place?"
      ctaLabel="Continue"
      ctaDisabled={interests.length === 0 || priorities.length === 0}
      onCtaPress={handleContinue}
      onSkip={() => router.push('/(onboarding)/stay-preference')}
    >
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Pick up to 2</Text>
        <View style={styles.pillGrid}>
          {INTERESTS.map((option) => (
            <Pill
              key={option}
              label={option}
              selected={interests.includes(option)}
              onPress={() => toggleInterest(option)}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeadline}>What would make this trip feel right?</Text>
        <Text style={styles.sectionLabel}>Pick up to 2</Text>
        <View style={styles.pillGrid}>
          {PRIORITIES.map((option) => (
            <Pill
              key={option}
              label={option}
              selected={priorities.includes(option)}
              onPress={() => togglePriority(option)}
            />
          ))}
        </View>
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 8,
  },
  sectionHeadline: {
    fontFamily: fonts.semiBold,
    fontSize: 17,
    lineHeight: 22,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  sectionLabel: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 10,
  },
  pillGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
  },
});
