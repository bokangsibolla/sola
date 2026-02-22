import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SolaText } from '@/components/ui/SolaText';
import { useRouter } from 'expo-router';
import OnboardingScreen from '@/components/onboarding/OnboardingScreen';
import { onboardingStore } from '@/state/onboardingStore';
import { useOnboardingNavigation } from '@/hooks/useOnboardingNavigation';
import { colors, fonts, radius } from '@/constants/design';

const STAY_OPTIONS = [
  { icon: '🏠', label: 'Around others', value: 'hostels' },
  { icon: '🏨', label: 'Unique stays', value: 'boutique' },
  { icon: '🛋️', label: 'My own space', value: 'apartments' },
  { icon: '✨', label: 'Taken care of', value: 'luxury' },
];

const SPEND_OPTIONS = [
  { icon: '🎒', label: 'Keep it simple', value: 'budget' },
  { icon: '⚖️', label: 'In the middle', value: 'mid-range' },
  { icon: '💎', label: 'Go all out', value: 'luxury' },
];

interface TileProps {
  icon: string;
  label: string;
  selected: boolean;
  onPress: () => void;
}

function Tile({ icon, label, selected, onPress }: TileProps) {
  return (
    <Pressable
      style={[styles.tile, selected && styles.tileSelected]}
      onPress={onPress}
    >
      <SolaText style={styles.tileIcon}>{icon}</SolaText>
      <SolaText style={[styles.tileLabel, selected && styles.tileLabelSelected]}>{label}</SolaText>
    </Pressable>
  );
}

export default function StayPreferenceScreen() {
  const router = useRouter();
  const { navigateToNextScreen, skipCurrentScreen, checkScreenAccess, trackScreenView } =
    useOnboardingNavigation();
  const [stay, setStay] = useState('');
  const [spend, setSpend] = useState('');

  // Check if this screen should be shown (A/B testing)
  useEffect(() => {
    const shouldShow = checkScreenAccess('stay-preference');
    if (shouldShow) {
      trackScreenView('stay-preference');
    }
  }, [checkScreenAccess, trackScreenView]);

  const handleContinue = () => {
    const stayOption = STAY_OPTIONS.find((o) => o.value === stay);
    onboardingStore.set('stayPreference', stayOption?.label ?? stay);
    onboardingStore.set('spendingStyle', spend);

    const answered: string[] = [];
    const skipped: string[] = [];

    if (stay) {
      answered.push('stay_preference');
    } else {
      skipped.push('stay_preference');
    }

    if (spend) {
      answered.push('spending_style');
    } else {
      skipped.push('spending_style');
    }

    navigateToNextScreen('stay-preference', {
      answeredQuestions: answered,
      skippedQuestions: skipped,
    });
  };

  const handleSkip = () => {
    skipCurrentScreen('stay-preference', ['stay_preference', 'spending_style']);
  };

  return (
    <OnboardingScreen
      stage={5}
      screenName="stay-preference"
      headline="Almost done"
      subtitle="Two quick ones"
      ctaLabel="Continue"
      ctaDisabled={!stay || !spend}
      onCtaPress={handleContinue}
      onSkip={handleSkip}
    >
      <View style={styles.section}>
        <SolaText style={styles.question}>Where do you feel most at home?</SolaText>
        <View style={styles.grid}>
          {STAY_OPTIONS.map((opt) => (
            <Tile
              key={opt.value}
              icon={opt.icon}
              label={opt.label}
              selected={stay === opt.value}
              onPress={() => setStay(opt.value)}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <SolaText style={styles.question}>How do you like to spend?</SolaText>
        <View style={styles.grid}>
          {SPEND_OPTIONS.map((opt) => (
            <Tile
              key={opt.value}
              icon={opt.icon}
              label={opt.label}
              selected={spend === opt.value}
              onPress={() => setSpend(opt.value)}
            />
          ))}
        </View>
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  question: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tile: {
    width: '48%',
    flexGrow: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tileSelected: {
    borderWidth: 2,
    borderColor: colors.orange,
    backgroundColor: colors.orangeFill,
  },
  tileIcon: {
    fontSize: 20,
  },
  tileLabel: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textPrimary,
    flexShrink: 1,
  },
  tileLabelSelected: {
    color: colors.orange,
  },
});
