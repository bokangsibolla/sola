import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import OnboardingScreen from '@/components/onboarding/OnboardingScreen';
import Pill from '@/components/onboarding/Pill';
import { onboardingStore } from '@/state/onboardingStore';
import { useOnboardingNavigation } from '@/hooks/useOnboardingNavigation';
import { INTEREST_GROUPS } from '@/constants/interests';
import { colors, fonts } from '@/constants/design';

export default function DayStyleScreen() {
  const router = useRouter();
  const { navigateToNextScreen, skipCurrentScreen, checkScreenAccess, trackScreenView } =
    useOnboardingNavigation();
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);

  // Check if this screen should be shown (A/B testing)
  useEffect(() => {
    const shouldShow = checkScreenAccess('day-style');
    if (shouldShow) {
      trackScreenView('day-style');
    }
  }, [checkScreenAccess, trackScreenView]);

  const toggleSlug = (slug: string) => {
    setSelectedSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  };

  const handleContinue = () => {
    onboardingStore.set('dayStyle', selectedSlugs);

    const answered: string[] = [];
    const skipped: string[] = [];

    if (selectedSlugs.length > 0) {
      answered.push('day_style');
    } else {
      skipped.push('day_style');
    }

    navigateToNextScreen('day-style', {
      answeredQuestions: answered,
      skippedQuestions: skipped,
    });
  };

  const handleSkip = () => {
    skipCurrentScreen('day-style', ['day_style']);
  };

  return (
    <OnboardingScreen
      stage={4}
      screenName="day-style"
      headline="What gets you excited about a new place?"
      ctaLabel="Continue"
      ctaDisabled={selectedSlugs.length === 0}
      onCtaPress={handleContinue}
      onSkip={handleSkip}
    >
      {INTEREST_GROUPS.map((group) => (
        <View key={group.key} style={styles.section}>
          <Text style={styles.sectionHeadline}>{group.question}</Text>
          <View style={styles.pillGrid}>
            {group.options.map((option) => (
              <Pill
                key={option.slug}
                label={option.label}
                selected={selectedSlugs.includes(option.slug)}
                onPress={() => toggleSlug(option.slug)}
              />
            ))}
          </View>
        </View>
      ))}
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
    marginBottom: 10,
  },
  pillGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
  },
});
