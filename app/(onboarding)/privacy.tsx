import PolarstepsCard from '@/components/onboarding/PolarstepsCard';
import PolarstepsShell from '@/components/onboarding/PolarstepsShell';
import ProgressIndicator from '@/components/onboarding/ProgressIndicator';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { Body, Label } from '@/components/ui/SolaText';
import { theme } from '@/constants/theme';
import { onboardingStore } from '@/state/onboardingStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

const MAP_PLACEHOLDER = require('@/assets/images/orange-gradient.png');

const privacyOptions = [
  {
    id: 'only-me',
    label: 'Only me',
    description: 'Only you can see this trip',
    icon: 'lock-closed' as const,
  },
  {
    id: 'followers',
    label: 'Followers',
    description: 'Anyone who follows you will be able to see this trip',
    icon: 'people' as const,
  },
  {
    id: 'everyone',
    label: 'Everyone',
    description: 'Anyone can see this trip',
    icon: 'globe' as const,
  },
];

export default function PrivacyScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string>('followers');

  const handleContinue = () => {
    onboardingStore.setOnboardingCompleted(true);
    router.replace('/(tabs)/explore');
  };

  return (
    <PolarstepsShell backgroundImage={MAP_PLACEHOLDER}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>
        <ProgressIndicator currentStep={4} totalSteps={5} />
      </View>

      <PolarstepsCard scrollable>
        <Body style={styles.title}>Who can see your trip?</Body>
        <Body style={styles.subtitle}>
          You control the privacy for each trip. Decide who can see this one.
        </Body>

        <View style={styles.options}>
          {privacyOptions.map((option) => (
            <Pressable
              key={option.id}
              style={({ pressed }) => [
                styles.optionCard,
                selected === option.id && styles.optionCardSelected,
                pressed && styles.optionCardPressed,
              ]}
              onPress={() => setSelected(option.id)}
            >
              <View style={styles.optionContent}>
                <View style={[styles.radioButton, selected === option.id && styles.radioButtonSelected]}>
                  {selected === option.id && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
                <Ionicons
                  name={option.icon}
                  size={20}
                  color={selected === option.id ? theme.colors.brand : theme.colors.text}
                  style={styles.optionIcon}
                />
                <View style={styles.optionText}>
                  <Body style={[styles.optionLabel, selected === option.id && styles.optionLabelSelected]}>
                    {option.label}
                  </Body>
                  {option.description && (
                    <Label style={[styles.optionDescription, selected === option.id && styles.optionDescriptionSelected]}>
                      {option.description}
                    </Label>
                  )}
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      </PolarstepsCard>

      <View style={styles.footer}>
        <PrimaryButton
          label="Create your trip"
          onPress={handleContinue}
        />
      </View>
    </PolarstepsShell>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 28,
    lineHeight: 36,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Inter-Regular',
    color: theme.colors.muted,
    marginBottom: 32,
    textAlign: 'center',
  },
  options: {
    gap: 12,
  },
  optionCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    padding: 16,
  },
  optionCardSelected: {
    borderColor: theme.colors.brand,
    borderWidth: 2,
  },
  optionCardPressed: {
    opacity: 0.8,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.border,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: theme.colors.brand,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.brand,
  },
  optionIcon: {
    marginRight: 12,
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  optionLabelSelected: {
    color: theme.colors.text,
  },
  optionDescription: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Inter-Regular',
    color: theme.colors.muted,
  },
  optionDescriptionSelected: {
    color: theme.colors.muted,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 24,
    zIndex: 10,
    backgroundColor: 'transparent',
  },
});
