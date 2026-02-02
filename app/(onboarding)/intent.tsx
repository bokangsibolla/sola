import PolarstepsShell from '@/components/onboarding/PolarstepsShell';
import ProgressIndicator from '@/components/onboarding/ProgressIndicator';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { Body } from '@/components/ui/SolaText';
import { theme } from '@/constants/theme';
import { onboardingStore } from '@/state/onboardingStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MAP_PLACEHOLDER = require('@/assets/images/orange-gradient.png');

const options = [
  { id: 'traveling-now', label: "I'm currently traveling", icon: '🌎' },
  { id: 'traveling-soon', label: "I'm leaving on a trip soon", icon: '🎒' },
  { id: 'browsing-planning', label: "I'm planning a future trip", icon: '✏️' },
  { id: 'following', label: "I'm here to follow friends or family", icon: '🔭' },
  { id: 'something-else', label: 'Something else', icon: '🙋‍♀️' },
];

export default function IntentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const stored = onboardingStore.getIntent();
  const [selected, setSelected] = useState<string | null>(stored);

  const handleContinue = () => {
    if (selected) {
      onboardingStore.setIntent(selected);
      if (selected === 'traveling-now' || selected === 'traveling-soon') {
        router.push('/(onboarding)/destination');
      } else {
        onboardingStore.setOnboardingCompleted(true);
        router.replace('/(tabs)/explore');
      }
    }
  };

  return (
    <PolarstepsShell backgroundImage={MAP_PLACEHOLDER}>
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <ProgressIndicator currentStep={2} totalSteps={5} />
      </View>

      <View style={styles.card}>
        <Body style={styles.title}>What are you up to?</Body>

        <View style={styles.options}>
          {options.map((option) => (
            <Pressable
              key={option.id}
              style={({ pressed }) => [
                styles.optionRow,
                selected === option.id && styles.optionRowSelected,
                pressed && styles.optionRowPressed,
              ]}
              onPress={() => setSelected(option.id)}
            >
              <View style={styles.optionContent}>
                <View style={[styles.checkbox, selected === option.id && styles.checkboxSelected]}>
                  {selected === option.id && (
                    <Ionicons name="checkmark" size={14} color={theme.colors.card} />
                  )}
                </View>
                <Body style={styles.optionEmoji}>{option.icon}</Body>
                <Body style={[styles.optionLabel, selected === option.id && styles.optionLabelSelected]}>
                  {option.label}
                </Body>
              </View>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <PrimaryButton
          label="Continue"
          onPress={handleContinue}
          disabled={!selected}
        />
      </View>
    </PolarstepsShell>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    zIndex: 10,
  },
  headerSpacer: {
    width: 40,
  },
  card: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '75%', // Taller card to fit all options
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 100, // Space for button
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0,0.2)',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 1,
        shadowRadius: 24,
      },
      android: {
        elevation: 20,
      },
    }),
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 24,
  },
  options: {
    gap: 12,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
  },
  optionRowSelected: {
    backgroundColor: theme.colors.brand,
    borderColor: theme.colors.brand,
  },
  optionRowPressed: {
    opacity: 0.8,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.card,
  },
  optionEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  optionLabel: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Inter-Regular',
    color: theme.colors.text,
    flex: 1,
  },
  optionLabelSelected: {
    color: theme.colors.card,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 20,
    backgroundColor: theme.colors.card,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
});
