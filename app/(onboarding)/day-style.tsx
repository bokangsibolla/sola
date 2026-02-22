import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SolaText } from '@/components/ui/SolaText';
import { useRouter } from 'expo-router';
import OnboardingScreen from '@/components/onboarding/OnboardingScreen';
import Pill from '@/components/onboarding/Pill';
import { onboardingStore } from '@/state/onboardingStore';
import { useOnboardingNavigation } from '@/hooks/useOnboardingNavigation';
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
  const { navigateToNextScreen, skipCurrentScreen, checkScreenAccess, trackScreenView } =
    useOnboardingNavigation();
  const [interests, setInterests] = useState<string[]>([]);
  const [priorities, setPriorities] = useState<string[]>([]);

  // Check if this screen should be shown (A/B testing)
  useEffect(() => {
    const shouldShow = checkScreenAccess('day-style');
    if (shouldShow) {
      trackScreenView('day-style');
    }
  }, [checkScreenAccess, trackScreenView]);

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

    const answered: string[] = [];
    const skipped: string[] = [];

    if (interests.length > 0) {
      answered.push('day_style');
    } else {
      skipped.push('day_style');
    }

    if (priorities.length > 0) {
      answered.push('priorities');
    } else {
      skipped.push('priorities');
    }

    navigateToNextScreen('day-style', {
      answeredQuestions: answered,
      skippedQuestions: skipped,
    });
  };

  const handleSkip = () => {
    skipCurrentScreen('day-style', ['day_style', 'priorities']);
  };

  return (
    <OnboardingScreen
      stage={4}
      screenName="day-style"
      headline="What gets you excited about a new place?"
      ctaLabel="Continue"
      ctaDisabled={interests.length === 0 || priorities.length === 0}
      onCtaPress={handleContinue}
      onSkip={handleSkip}
    >
      <View style={styles.section}>
        <SolaText style={styles.sectionLabel}>Pick up to 2</SolaText>
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
        <SolaText style={styles.sectionHeadline}>What would make this trip feel right?</SolaText>
        <SolaText style={styles.sectionLabel}>Pick up to 2</SolaText>
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
